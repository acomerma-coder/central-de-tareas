import { createClient } from '@supabase/supabase-js'

// Las credenciales se leen SIEMPRE desde el archivo .env (variables con
// prefijo VITE_). No se hardcodean credenciales en el código: el repo es
// público y, aunque la anon key está pensada para el cliente, mantenerla
// fuera del código evita filtrar a qué proyecto apunta la app.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env y rellena las credenciales (ver README).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Nombre del bucket de Storage donde guardamos los adjuntos de las tarjetas.
// El bucket es PRIVADO: los archivos se sirven con URLs firmadas, no públicas.
export const ATTACHMENTS_BUCKET = 'attachments'
