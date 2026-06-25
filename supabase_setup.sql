-- =============================================================
--  CONFIGURACIÓN DE SUPABASE PARA EL TABLERO PDCA
-- -------------------------------------------------------------
--  Cómo usarlo:
--  1. Entra a tu proyecto en https://supabase.com/dashboard
--  2. Menú lateral -> "SQL Editor" -> "New query"
--  3. Pega TODO este archivo y pulsa "Run".
--
--  Nota: las tablas NO se pueden crear con el cliente JavaScript
--  (la anon key no tiene permisos para ejecutar DDL). Por eso este
--  paso se hace una sola vez desde el panel de Supabase. Una vez
--  creada la tabla, la app usa @supabase/supabase-js para leer,
--  insertar, actualizar y borrar registros.
--
--  SEGURIDAD: la app exige LOGIN (Supabase Auth). El acceso a datos
--  y adjuntos está restringido por RLS a usuarios autenticados del
--  dominio @freedomtwin.com. NO hay acceso anónimo.
-- =============================================================

-- 1) Tabla principal de tareas -------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  assignee    text,
  due_date    date,
  priority    text not null default 'media',  -- 'alta' | 'media' | 'baja'
  color       text,                            -- color de etiqueta (hex)
  column_id   text not null default 'backlog', -- backlog | plan | do | check | act
  position    integer not null default 0,      -- orden dentro de la columna
  attachments jsonb not null default '[]'::jsonb, -- [{name, path}]
  created_at  timestamptz not null default now()
);

-- Índices para acelerar el ordenamiento por columna.
create index if not exists tasks_column_position_idx
  on public.tasks (column_id, position);

-- 2) Row Level Security --------------------------------------
-- Solo usuarios AUTENTICADOS del dominio @freedomtwin.com pueden
-- operar sobre las tareas. (No hay acceso anónimo.)
alter table public.tasks enable row level security;

drop policy if exists "acceso_publico_tasks" on public.tasks; -- política antigua insegura
drop policy if exists "tasks_equipo_freedom" on public.tasks;
create policy "tasks_equipo_freedom"
  on public.tasks
  for all
  to authenticated
  using ( lower(auth.jwt() ->> 'email') like '%@freedomtwin.com' )
  with check ( lower(auth.jwt() ->> 'email') like '%@freedomtwin.com' );

-- 3) Storage: bucket de adjuntos (PRIVADO) -------------------
-- Bucket privado: los archivos se sirven con URLs firmadas
-- (createSignedUrl) desde la app, nunca en abierto.
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do update set public = false;

-- Políticas de Storage: solo el equipo autenticado de @freedomtwin.com.
drop policy if exists "attachments_lectura" on storage.objects; -- políticas antiguas
drop policy if exists "attachments_subida"  on storage.objects;
drop policy if exists "attachments_borrado" on storage.objects;

drop policy if exists "attachments_lectura_equipo" on storage.objects;
create policy "attachments_lectura_equipo"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'attachments' and lower(auth.jwt() ->> 'email') like '%@freedomtwin.com' );

drop policy if exists "attachments_subida_equipo" on storage.objects;
create policy "attachments_subida_equipo"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'attachments' and lower(auth.jwt() ->> 'email') like '%@freedomtwin.com' );

drop policy if exists "attachments_borrado_equipo" on storage.objects;
create policy "attachments_borrado_equipo"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'attachments' and lower(auth.jwt() ->> 'email') like '%@freedomtwin.com' );

-- 4) Usuarios del equipo -------------------------------------
-- El registro público está deshabilitado: los usuarios se dan de alta
-- a mano. Crea cada miembro desde el panel:
--   Authentication -> Users -> "Add user" (email @freedomtwin.com)
-- y marca el email como confirmado.
--
-- ¡Listo! Tras dar de alta a tu usuario, corre la app con `npm run dev`
-- e inicia sesión.
