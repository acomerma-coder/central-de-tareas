# Central de Tareas: Freedom - The Twin Factory

Tablero de tareas tipo Kanban basado en el ciclo Deming (PDCA). La interfaz está
en español y permite organizar el trabajo de la startup en cinco columnas:
**Backlog → Plan → Do → Check → Act**.

## Funcionalidades

- **Acceso con login** (Supabase Auth): solo entra el equipo de Freedom.
- Tarjetas tipo post-it con título, descripción, responsable, fecha límite,
  prioridad (alta/media/baja) y color de etiqueta.
- Arrastrar y soltar tarjetas entre columnas (drag & drop).
- Crear y editar tarjetas desde un modal.
- Adjuntar archivos a cada tarjeta (bucket privado, URLs firmadas).
- Contador de tarjetas por columna.
- Filtros por responsable y por prioridad.

## Stack técnico

- **React 18** + **Vite 5**
- **@dnd-kit/core** y **@dnd-kit/sortable** para el drag & drop
- **@supabase/supabase-js** para base de datos y almacenamiento de archivos
- **CSS puro** (`src/index.css`)

## Estructura del proyecto

```
src/
├── main.jsx              # Punto de entrada de React
├── App.jsx               # Estado global, carga de datos, drag & drop, CRUD y filtros
├── index.css             # Estilos
├── constants.js          # Columnas PDCA, prioridades y colores
├── supabaseClient.js     # Cliente de Supabase
├── api/
│   └── tasks.js          # Acceso a datos: leer/crear/actualizar/borrar + adjuntos
└── components/
    ├── Board.jsx         # Contexto de drag & drop y render de las columnas
    ├── Column.jsx        # Una columna (zona donde se sueltan las tarjetas)
    ├── TaskCard.jsx      # Tarjeta tipo post-it
    ├── TaskModal.jsx     # Modal para crear/editar
    └── Filters.jsx       # Filtros por responsable y prioridad
```

`App.jsx` mantiene las tareas en estado, las carga desde Supabase al iniciar y
las pasa agrupadas por columna a `Board`. Toda la comunicación con Supabase está
aislada en `src/api/tasks.js`.

## Cómo correr el proyecto

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Build de producción (genera la carpeta dist/)
npm run build

# Previsualizar la build de producción
npm run preview
```

## Conexión con Supabase

Las credenciales se leen **siempre** desde el archivo `.env` (no hay valores
hardcodeados en el código). Copia `.env.example` a `.env` y rellena:

```bash
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key
```

Antes de usar la app por primera vez hay que crear la tabla y el bucket de
archivos en Supabase. Para ello, abre el **SQL Editor** del proyecto en el panel
de Supabase y ejecuta el contenido de [`supabase_setup.sql`](./supabase_setup.sql).
Ese script crea:

- La tabla `tasks` (con los campos de cada tarjeta).
- Las políticas de acceso (RLS) **restringidas a usuarios autenticados** del
  dominio `@freedomtwin.com`.
- El bucket `attachments` de Storage (**privado**) para los archivos adjuntos.

## Seguridad y acceso

- **No hay acceso anónimo.** La app exige iniciar sesión (Supabase Auth, email +
  contraseña) y el RLS solo permite operar a usuarios autenticados con email
  `@freedomtwin.com`. Aunque la anon key sea pública, sin sesión válida no se
  puede leer ni escribir nada.
- **El registro público está cerrado.** Los usuarios se dan de alta a mano desde
  el panel de Supabase (*Authentication → Users → Add user*), con el email
  confirmado. Pide acceso a Lucas.
- **Adjuntos privados.** El bucket `attachments` es privado; la app genera URLs
  firmadas y caducables al abrir cada archivo (`createSignedUrl`).
- El archivo `.env` está en `.gitignore` y nunca se sube al repo.
