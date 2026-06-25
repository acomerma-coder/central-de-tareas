import { supabase, ATTACHMENTS_BUCKET } from '../supabaseClient'

// =============================================================
//  Capa de acceso a datos: todo lo que toca Supabase vive aquí.
//  Tabla: `tasks`  |  Storage bucket: `attachments`
// =============================================================

const TABLE = 'tasks'

// Trae todas las tareas ordenadas por columna y posición.
export async function fetchTasks() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('position', { ascending: true })

  if (error) throw error
  return data || []
}

// Crea una tarea nueva. `position` la calculamos como "al final" de su columna.
export async function createTask(task) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([task])
    .select()
    .single()

  if (error) throw error
  return data
}

// Actualiza campos arbitrarios de una tarea por id.
export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Elimina una tarea por id.
export async function deleteTask(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

// Persiste cambios de columna/posición en lote (tras un drag & drop).
// Recibe un array de { id, column_id, position }.
export async function persistPositions(items) {
  const updates = items.map(({ id, column_id, position }) =>
    supabase.from(TABLE).update({ column_id, position }).eq('id', id)
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed) throw failed.error
}

// -------------------------------------------------------------
//  Adjuntos (Supabase Storage, bucket "attachments")
// -------------------------------------------------------------

// Sube un archivo y devuelve { name, path } para guardar en la tarjeta.
// El bucket es PRIVADO, así que NO guardamos una URL pública: la URL se
// genera firmada y caducable en el momento de abrir el adjunto.
export async function uploadAttachment(file, taskIdHint = 'tmp') {
  // Ruta única: <taskId>/<timestamp>-<nombre saneado>
  const safeName = file.name.replace(/[^\w.\-]/g, '_')
  const stamp = `${performance.now()}`.replace('.', '')
  const path = `${taskIdHint}/${stamp}-${safeName}`

  const { error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  return { name: file.name, path }
}

// Genera una URL firmada (temporal) para abrir/descargar un adjunto.
// Por defecto caduca en 1 hora. Solo funciona si el usuario está autenticado
// y cumple la política RLS del bucket.
export async function getAttachmentUrl(path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}

// Borra un archivo del bucket dado su path.
export async function removeAttachment(path) {
  const { error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .remove([path])
  if (error) throw error
}
