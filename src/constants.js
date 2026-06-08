// Definición de las columnas del tablero, en el orden del ciclo Deming (PDCA).
// El `id` se guarda en la columna `column_id` de la tabla `tasks` en Supabase.
export const COLUMNS = [
  {
    id: 'backlog',
    title: 'Backlog',
    description: 'Pendientes o retrasadas',
    color: '#64748b', // slate
    accent: 'rgba(100, 116, 139, 0.15)',
  },
  {
    id: 'plan',
    title: 'Plan',
    description: 'Planificadas',
    color: '#3b82f6', // azul
    accent: 'rgba(59, 130, 246, 0.15)',
  },
  {
    id: 'do',
    title: 'Do',
    description: 'En ejecución',
    color: '#f59e0b', // ámbar
    accent: 'rgba(245, 158, 11, 0.15)',
  },
  {
    id: 'check',
    title: 'Check',
    description: 'En revisión',
    color: '#a855f7', // morado
    accent: 'rgba(168, 85, 247, 0.15)',
  },
  {
    id: 'act',
    title: 'Act',
    description: 'Completadas / implementadas',
    color: '#22c55e', // verde
    accent: 'rgba(34, 197, 94, 0.15)',
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
