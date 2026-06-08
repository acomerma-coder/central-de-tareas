import { PRIORITIES } from '../constants'

// Barra de filtros por responsable y prioridad.
export default function Filters({
  assignees,
  filterAssignee,
  filterPriority,
  onAssigneeChange,
  onPriorityChange,
  onClear,
}) {
  const hasFilters = filterAssignee || filterPriority

  return (
    <div className="filters">
      <label className="filters__field">
        <span>Responsable</span>
        <select
          value={filterAssignee}
          onChange={(e) => onAssigneeChange(e.target.value)}
        >
          <option value="">Todos</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      <label className="filters__field">
        <span>Prioridad</span>
        <select
          value={filterPriority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="">Todas</option>
          {Object.entries(PRIORITIES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {hasFilters && (
        <button className="filters__clear" onClick={onClear}>
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
