import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { COLUMNS } from '../constants'
import Column from './Column'

// Tablero: contiene el contexto de drag & drop y renderiza las 5 columnas PDCA.
// Recibe las tareas ya agrupadas por columna (`grouped`) y los callbacks.
export default function Board({ grouped, onDragEnd, onAddTask, onEditTask }) {
  // Pequeña distancia de activación: así un click simple no se interpreta
  // como arrastre y sigue funcionando el doble-click / botón editar.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={onDragEnd}
    >
      <div className="board">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={grouped[column.id] || []}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
          />
        ))}
      </div>
    </DndContext>
  )
}
