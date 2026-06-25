import { useEffect, useState } from 'react'
import { PRIORITIES, LABEL_COLORS, COLUMNS } from '../constants'
import { uploadAttachment, removeAttachment, getAttachmentUrl } from '../api/tasks'

// Modal para crear o editar una tarjeta.
// Si recibe `task` con id => modo edición; si no => modo creación.
export default function TaskModal({ task, defaultColumn, onClose, onSave, onDelete }) {
  const isEditing = Boolean(task?.id)

  const [form, setForm] = useState({
    title: '',
    description: '',
    assignee: '',
    due_date: '',
    priority: 'media',
    color: LABEL_COLORS[0],
    column_id: defaultColumn || 'backlog',
    attachments: [],
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Cargamos los datos de la tarjeta al abrir en modo edición.
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        assignee: task.assignee || '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        priority: task.priority || 'media',
        color: task.color || LABEL_COLORS[0],
        column_id: task.column_id || defaultColumn || 'backlog',
        attachments: Array.isArray(task.attachments) ? task.attachments : [],
      })
    }
  }, [task, defaultColumn])

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  // Subida de archivos a Supabase Storage.
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const taskIdHint = task?.id || 'nuevas'
      const uploaded = []
      for (const file of files) {
        uploaded.push(await uploadAttachment(file, taskIdHint))
      }
      update('attachments', [...form.attachments, ...uploaded])
    } catch (err) {
      setError(`No se pudo subir el archivo: ${err.message}`)
    } finally {
      setUploading(false)
      e.target.value = '' // permite re-subir el mismo archivo
    }
  }

  // Abre un adjunto generando una URL firmada al vuelo (bucket privado).
  const openAttachment = async (att) => {
    try {
      const url = await getAttachmentUrl(att.path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(`No se pudo abrir el adjunto: ${err.message}`)
    }
  }

  const handleRemoveAttachment = async (att) => {
    try {
      await removeAttachment(att.path)
    } catch {
      // Si falla el borrado en Storage igual lo quitamos de la tarjeta.
    }
    update(
      'attachments',
      form.attachments.filter((a) => a.path !== att.path)
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('El título es obligatorio.')
      return
    }
    onSave({
      ...form,
      title: form.title.trim(),
      due_date: form.due_date || null,
    })
  }

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{isEditing ? 'Editar tarjeta' : 'Nueva tarjeta'}</h2>
          <button className="modal__close" onClick={onClose} title="Cerrar">
            ✕
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Título *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Ej: Definir métricas del trimestre"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Descripción</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Detalles de la tarea…"
            />
          </label>

          <div className="field__row">
            <label className="field">
              <span>Responsable</span>
              <input
                type="text"
                value={form.assignee}
                onChange={(e) => update('assignee', e.target.value)}
                placeholder="Nombre"
              />
            </label>

            <label className="field">
              <span>Fecha límite</span>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => update('due_date', e.target.value)}
              />
            </label>
          </div>

          <div className="field__row">
            <label className="field">
              <span>Prioridad</span>
              <select
                value={form.priority}
                onChange={(e) => update('priority', e.target.value)}
              >
                {Object.entries(PRIORITIES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Columna</span>
              <select
                value={form.column_id}
                onChange={(e) => update('column_id', e.target.value)}
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field">
            <span>Color de etiqueta</span>
            <div className="swatches">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`swatch ${form.color === c ? 'swatch--active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => update('color', c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="field">
            <span>Adjuntos</span>
            <input type="file" multiple onChange={handleFiles} disabled={uploading} />
            {uploading && <small className="muted">Subiendo…</small>}
            <ul className="attachments">
              {form.attachments.map((att) => (
                <li key={att.path}>
                  <button
                    type="button"
                    className="attachments__open"
                    onClick={() => openAttachment(att)}
                    title="Abrir adjunto"
                  >
                    📎 {att.name}
                  </button>
                  <button
                    type="button"
                    className="attachments__remove"
                    onClick={() => handleRemoveAttachment(att)}
                    title="Quitar adjunto"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__actions">
            {isEditing && (
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => onDelete(task.id)}
              >
                Eliminar
              </button>
            )}
            <div className="modal__actions-right">
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary" disabled={uploading}>
                {isEditing ? 'Guardar cambios' : 'Crear tarjeta'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
