// Definición de las columnas del tablero, en el orden del ciclo Deming (PDCA).
// El `id` se guarda en la columna `column_id` de la tabla `tasks` en Supabase.
// Progresión de verdes: de un verde agrisado y apagado en Backlog que va
// ganando intensidad columna a columna hasta el verde más vivo en Act.
export const COLUMNS = [
  {
    id: 'backlog',
    title: 'Backlog',
    description: 'Pendientes o retrasadas',
    color: '#7c8a7c', // verde agrisado / apagado
    accent: 'rgba(124, 138, 124, 0.15)',
  },
  {
    id: 'plan',
    title: 'Plan',
    description: 'Planificadas',
    color: '#6b9e74', // verde suave
    accent: 'rgba(107, 158, 116, 0.15)',
  },
  {
    id: 'do',
    title: 'Do',
    description: 'En ejecución',
    color: '#4fa35f', // verde medio
    accent: 'rgba(79, 163, 95, 0.15)',
  },
  {
    id: 'check',
    title: 'Check',
    description: 'En revisión',
    color: '#2ea35a', // verde más intenso
    accent: 'rgba(46, 163, 90, 0.15)',
  },
  {
    id: 'act',
    title: 'Act',
    description: 'Completadas / implementadas',
    color: '#16a34a', // verde intenso (marca)
    accent: 'rgba(22, 163, 74, 0.15)',
  },
]

// Prioridades disponibles. El color se usa para el borde tipo "post-it".
export const PRIORITIES = {
  alta: { label: 'Alta', color: '#ef4444' },
  media: { label: 'Media', color: '#f59e0b' },
  baja: { label: 'Baja', color: '#22c55e' },
}

// Paleta de colores de etiqueta sugeridos para las tarjetas.
export const LABEL_COLORS = [
  '#fde68a', // amarillo post-it clásico
  '#fca5a5', // rojo suave
  '#a7f3d0', // verde menta
  '#bfdbfe', // azul cielo
  '#ddd6fe', // lila
  '#fbcfe8', // rosa
  '#fed7aa', // naranja
  '#e5e7eb', // gris claro
]
