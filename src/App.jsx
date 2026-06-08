import { useEffect, useMemo, useState } from 'react'
import { COLUMNS } from './constants'
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  persistPositions,
} from './api/tasks'
import { supabase } from './supabaseClient'
import Board from './components/Board'
import Filters from './components/Filters'
import TaskModal from './components/TaskModal'
import Login from './components/Login'

const isColumnId = (id) => COLUMNS.some((c) => c.id === id)

// Agrupa un array de tareas por columna, ordenadas por `position`.
function groupByColumn(tasks) {
  const map = {}
  for (const col of COLUMNS) map[col.id] = []
  for (const t of tasks) {
    if (!map[t.column_id]) map[t.column_id] = []
    map[t.column_id].push(t)
  }
  for (const id of Object.keys(map)) {
    map[id].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  }
  return map
}

export default function App() {
  // Sesión de Supabase Auth. Sin sesión, se muestra el login.
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filtros
  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  // Estado del modal: { open, task, defaultColumn }
  const [modal, setModal] = useState({ open: false, task: null, defaultColumn: null })

  // Sesión: leemos la actual y nos suscribimos a los cambios (login/logout).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Carga de tareas desde Supabase. Solo cuando hay sesión iniciada.
  useEffect(() => {
    if (!session) return
    setLoading(true)
    ;(async () => {
      try {
        const data = await fetchTasks()
        setTasks(data)
      } catch (err) {
        setError(
          `No se pudieron cargar las tareas desde Supabase: ${err.message}. ` +
            'Revisa que la tabla "tasks" exista (ver README / supabase_setup.sql).'
        )
      } finally {
        setLoading(false)
      }
    })()
  }, [session])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setTasks([])
  }

  // Lista de responsables únicos para el filtro.
  const assignees = useMemo(() => {
    const set = new Set(tasks.map((t) => t.assignee).filter(Boolean))
    return [...set].sort()
  }, [tasks])

  // Tareas visibles según filtros activos.
  const visibleTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterAssignee && t.assignee !== filterAssignee) return false
      if (filterPriority && t.priority !== filterPriority) return false
      return true
    })
  }, [tasks, filterAssignee, filterPriority])

  const grouped = useMemo(() => groupByColumn(visibleTasks), [visibleTasks])

  // ---------------- Drag & Drop ----------------
  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    const targetCol = isColumnId(overId)
      ? overId
      : tasks.find((t) => t.id === overId)?.column_id
    if (!targetCol) return

    // Trabajamos sobre el set completo para no perder el orden de tarjetas ocultas.
    const byCol = groupByColumn(tasks)
    const source = byCol[activeTask.column_id].filter((t) => t.id !== activeId)
    const target =
      activeTask.column_id === targetCol
        ? source
        : byCol[targetCol].filter((t) => t.id !== activeId)

    let insertIndex
    if (isColumnId(overId)) {
      insertIndex = target.length // soltar en zona vacía => al final
    } else {
      insertIndex = target.findIndex((t) => t.id === overId)
      if (insertIndex === -1) insertIndex = target.length
    }

    const moved = { ...activeTask, column_id: targetCol }
    target.splice(insertIndex, 0, moved)

    // Reasignamos posiciones secuenciales en las columnas afectadas.
    const updatedById = {}
    const reindex = (arr, colId) =>
      arr.forEach((t, i) => {
        updatedById[t.id] = { ...t, column_id: colId, position: i }
      })

    if (activeTask.column_id === targetCol) {
      reindex(target, targetCol)
    } else {
      reindex(source, activeTask.column_id)
      reindex(target, targetCol)
    }

    // Actualización optimista del estado.
    const next = tasks.map((t) => updatedById[t.id] || t)
    setTasks(next)

    // Persistir en Supabase solo lo que cambió.
    try {
      await persistPositions(Object.values(updatedById))
    } catch (err) {
      setError(`No se pudo guardar el movimiento: ${err.message}`)
    }
  }

  // ---------------- CRUD ----------------
  const openCreate = (columnId) =>
    setModal({ open: true, task: null, defaultColumn: columnId })

  const openEdit = (task) =>
    setModal({ open: true, task, defaultColumn: task.column_id })

  const closeModal = () =>
    setModal({ open: false, task: null, defaultColumn: null })

  const handleSave = async (form) => {
    try {
      if (modal.task?.id) {
        // Editar
        const updated = await updateTask(modal.task.id, form)
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      } else {
        // Crear: lo ponemos al final de su columna.
        const colTasks = tasks.filter((t) => t.column_id === form.column_id)
        const position = colTasks.length
        const created = await createTask({
          ...form,
          position,
          created_at: new Date().toISOString(),
        })
        setTasks((prev) => [...prev, created])
      }
      closeModal()
    } catch (err) {
      setError(`No se pudo guardar la tarjeta: ${err.message}`)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
      closeModal()
    } catch (err) {
      setError(`No se pudo eliminar la tarjeta: ${err.message}`)
    }
  }

  // --- Gate de autenticación ---
  if (!authReady) {
    return <div className="loading">Cargando…</div>
  }
  if (!session) {
    return <Login />
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__heading">
          <h1 className="app__title">
            Central de Tareas: Freedom - The Twin Factory
          </h1>
          <div className="app__session">
            <span className="app__user" title="Sesión iniciada">
              {session.user?.email}
            </span>
            <button className="btn btn--ghost btn--sm" onClick={handleSignOut}>
              Salir
            </button>
          </div>
        </div>
        <Filters
          assignees={assignees}
          filterAssignee={filterAssignee}
          filterPriority={filterPriority}
          onAssigneeChange={setFilterAssignee}
          onPriorityChange={setFilterPriority}
          onClear={() => {
            setFilterAssignee('')
            setFilterPriority('')
          }}
        />
      </header>

      {error && (
        <div className="banner banner--error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando tablero…</div>
      ) : (
        <Board
          grouped={grouped}
          onDragEnd={handleDragEnd}
          onAddTask={openCreate}
          onEditTask={openEdit}
        />
      )}

      {modal.open && (
        <TaskModal
          task={modal.task}
          defaultColumn={modal.defaultColumn}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
