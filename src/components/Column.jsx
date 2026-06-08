import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

// Una columna del tablero (Backlog, Plan, Do, Check o Act).
// Es una zona "droppable" para que se puedan soltar tarjetas incluso si está vacía.
export default function Column({ column, tasks, onAddTask, onEditTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <section className="column" style={{ backgroundColor: column.accent }}>
      <header
        className="column__header"
        style={{ borderTopColor: column.color }}
      >
        <div className="column__titleRow">
          <span
            className="column__dot"
            style={{ backgroundColor: column.color }}
          />
          <h2 className="column__title">{column.title}</h2>
          <span className="column__count">{tasks.length}</span>
        </div>
        <p className="column__subtitle">{column.description}</p>
        <button
          className="column__add"
          style={{ color: column.color }}
          onClick={() => onAddTask(column.id)}
          title={`Agregar tarea en ${column.title}`}
        >
          + Agregar tarea
        </button>
      </header>

      <div
        ref={setNodeRef}
        className={`column__body ${isOver ? 'column__body--over' : ''}`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="column__empty">Sin tarjetas</div>
        )}
      </div>
    </section>
  )
}
