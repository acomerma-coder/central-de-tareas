# Central de Tareas: Freedom - The Twin Factory

Tablero de tareas tipo Kanban basado en el ciclo Deming (PDCA). La interfaz está
en español y permite organizar el trabajo de la startup en cinco columnas:
**Backlog → Plan → Do → Check → Act**.

## Funcionalidades

- Tarjetas tipo post-it con título, descripción, responsable, fecha límite,
  prioridad (alta/media/baja) y color de etiqueta.
- Arrastrar y soltar tarjetas entre columnas (drag & drop).
- Crear y editar tarjetas desde un modal.
- Adjuntar archivos a cada tarjeta.
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

Las credenciales se leen desde el archivo `.env` (variables con prefijo `VITE_`):

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Antes de usar la app por primera vez hay que crear la tabla y el bucket de
archivos en Supabase. Para ello, abre el **SQL Editor** del proyecto en el panel
de Supabase y ejecuta el contenido de [`supabase_setup.sql`](./supabase_setup.sql).
Ese script crea:

- La tabla `tasks` (con los campos de cada tarjeta).
- Las políticas de acceso (RLS).
- El bucket `attachments` de Storage para los archivos adjuntos.
