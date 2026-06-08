import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PRIORITIES } from '../constants'

// Tarjeta tipo post-it. Es "sortable" (arrastrable y ordenable) vía dnd-kit.
export default function TaskCard({ task, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { columnId: task.column_id } })

  const priority = PRIORITIES[task.priority] || PRIORITIES.media

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    // Color de etiqueta como fondo y borde según prioridad.
    backgroundColor: task.color || '#fde68a',
    borderLeft: `6px solid ${priority.color}`,
  }

  const overdue =
    task.due_date &&
    task.column_id !== 'act' &&
    new Date(task.due_date) < new Date(new Date().toDateString())

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="card"
      {...attributes}
      {...listeners}
      onDoubleClick={() => onEdit(task)}
    >
      <div className="card__top">
        <span
          className="card__priority"
          style={{ backgroundColor: priority.color }}
        >
          {priority.label}
        </span>
        <button
          className="card__edit"
          // Evitamos que el click inicie un arrastre.
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task)
          }}
          title="Editar tarjeta"
        >
          ✎
        </button>
      </div>

      <h3 className="card__title">{task.title}</h3>

      {task.description && (
        <p className="card__desc">{task.description}</p>
      )}

      <div className="card__meta">
        {task.assignee && (
          <span className="card__assignee" title="Responsable">
            👤 {task.assignee}
          </span>
        )}
        {task.due_date && (
          <span
            className={`card__due ${overdue ? 'card__due--overdue' : ''}`}
            title="Fecha límite"
          >
            📅 {formatDate(task.due_date)}
          </span>
        )}
      </div>

      {Array.isArray(task.attachments) && task.attachments.length > 0 && (
        <div className="card__attachments" title="Adjuntos">
          📎 {task.attachments.length} adjunto
          {task.attachments.length > 1 ? 's' : ''}
        </div>
      )}
    </article>
  )
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return iso
  }
}
