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
  attachments jsonb not null default '[]'::jsonb, -- [{name, path, url}]
  created_at  timestamptz not null default now()
);

-- Índices para acelerar el ordenamiento por columna.
create index if not exists tasks_column_position_idx
  on public.tasks (column_id, position);

-- 2) Row Level Security --------------------------------------
-- El proyecto NO tiene autenticación todavía, así que abrimos el
-- acceso al rol anónimo. (Cuando agregues login, reemplaza estas
-- políticas por unas basadas en auth.uid()).
alter table public.tasks enable row level security;

drop policy if exists "acceso_publico_tasks" on public.tasks;
create policy "acceso_publico_tasks"
  on public.tasks
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 3) Storage: bucket de adjuntos -----------------------------
-- Crea el bucket "attachments" (público para poder mostrar los
-- archivos con getPublicUrl). Si ya existe, no hace nada.
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

-- Políticas de Storage: permitir subir/leer/borrar al rol anónimo.
drop policy if exists "attachments_lectura" on storage.objects;
create policy "attachments_lectura"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'attachments');

drop policy if exists "attachments_subida" on storage.objects;
create policy "attachments_subida"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'attachments');

drop policy if exists "attachments_borrado" on storage.objects;
create policy "attachments_borrado"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'attachments');

-- ¡Listo! Ya puedes correr la app con `npm run dev`.
