import { createClient } from '@supabase/supabase-js'

// Las credenciales se leen desde el archivo .env (variables con prefijo VITE_).
// Si por alguna razón no están definidas, caemos a los valores del proyecto
// de la startup para que la app funcione "out of the box" en desarrollo.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://cwcwgodouciqxchkkusa.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_Fgc97TDmSarebLRepV6SfQ_KmNk7ufi'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Nombre del bucket de Storage donde guardamos los adjuntos de las tarjetas.
export const ATTACHMENTS_BUCKET = 'attachments'
