# Lulistrack Dashboard

Panel web administrativo de **Lulistrack**, una plataforma para apoyar la gestion de entregas de ultima milla. Permite consultar pedidos, administrar repartidores, dar seguimiento a entregas y revisar el historial desde una sola interfaz.

## Aplicacion en linea

- **Dashboard:** https://lulistrack-dashboard.vercel.app
- **Backend API:** https://backendlulistrack.onrender.com
- **Repositorio del dashboard:** https://github.com/AngelCuevas123/LulistrackDashboard

## Tecnologias

- React 19
- Vite 8
- React Router DOM
- Supabase JavaScript Client y Supabase Auth
- Lucide React para iconos
- CSS para los estilos de la interfaz
- API REST desarrollada con FastAPI
- Despliegue web en Vercel

## Funcionalidades

- Inicio de sesion mediante Supabase Auth.
- Validacion de acceso administrativo con el backend.
- Vista general del estado de la operacion.
- Consulta y registro de pedidos.
- Administracion y registro de repartidores, incluyendo la creacion de sus cuentas de acceso en Supabase Auth.
- Asignacion de pedidos a repartidores.
- Seguimiento de pedidos.
- Consulta del historial de entregas completadas.
- Consulta de evidencias asociadas a las entregas.
- Seccion de configuracion del panel.

> El acceso a las funciones administrativas requiere una sesion valida y permisos autorizados por el backend.

## Alta y autorizacion de repartidores

El registro de repartidores se realiza desde el Dashboard y no desde la app movil:

1. Un administrador autorizado inicia sesion en el panel.
2. En **Repartidores**, selecciona **Nuevo repartidor** y captura nombre, correo, contraseña inicial y vehiculo.
3. El Dashboard envia los datos al endpoint protegido `POST /drivers/`.
4. El backend comprueba que el usuario que realiza la solicitud sea administrador. Si tiene permiso, crea la cuenta en Supabase Auth, confirma el correo y guarda el perfil vinculado en PostgreSQL.
5. El repartidor ya puede iniciar sesion en la app Flutter con el correo y la contraseña asignados.

La creacion de cuentas esta restringida al administrador validado por el backend. No es un formulario de autorregistro abierto al publico.

## Estructura del proyecto

```text
LulistrackDashboard/
├── public/                 # Recursos publicos de la aplicacion
├── src/
│   ├── assets/             # Imagenes e iconos
│   ├── components/         # Componentes reutilizables
│   │   ├── Header.jsx
│   │   ├── OrderTable.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatCard.jsx
│   ├── pages/              # Vistas principales
│   │   ├── Dashboard.jsx
│   │   ├── Drivers.jsx
│   │   ├── History.jsx
│   │   ├── Login.jsx
│   │   ├── Orders.jsx
│   │   ├── Settings.jsx
│   │   └── Tracking.jsx
│   ├── services/           # Conexion con Supabase y backend
│   │   ├── api.js
│   │   └── supabase.js
│   ├── styles/             # Estilos globales
│   ├── App.jsx             # Rutas y control de sesion
│   └── main.jsx            # Punto de entrada de React
├── .env.example            # Variables necesarias (sin credenciales reales)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## Requisitos

- Node.js y npm compatibles con la version de Vite utilizada.
- Acceso al proyecto de Supabase.
- Backend de Lulistrack disponible.

## Instalacion y ejecucion local

1. Clona el repositorio:

   ```bash
   git clone https://github.com/AngelCuevas123/LulistrackDashboard.git
   ```

2. Entra a la carpeta:

   ```bash
   cd LulistrackDashboard
   ```

3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Crea un archivo `.env` en la raiz del proyecto tomando como referencia `.env.example` y agrega los valores de tu proyecto de Supabase.

5. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Vite mostrara en la terminal la direccion local para abrir el dashboard en el navegador.

## Variables de entorno

El frontend necesita estas variables:

| Variable | Descripcion |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Clave publica anonima (publishable/anon) de Supabase. |

Ejemplo de formato:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_anon
```

La aplicacion web utiliza la clave publica de Supabase. La autorizacion de operaciones administrativas se valida en el backend y el acceso a los datos se controla mediante las politicas RLS de Supabase.

## Scripts disponibles

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia el servidor local de desarrollo. |
| `npm run build` | Genera la version de produccion en `dist/`. |
| `npm run preview` | Previsualiza localmente la compilacion. |
| `npm run lint` | Ejecuta Oxlint. |

## Comunicacion con el backend

El archivo `src/services/api.js` centraliza las solicitudes HTTP a:

```text
https://backendlulistrack.onrender.com
```

Antes de realizar solicitudes protegidas, el dashboard obtiene la sesion actual de Supabase y envia el token de acceso como encabezado:

```http
Authorization: Bearer <access_token>
```

El backend valida la autenticacion y los permisos antes de permitir operaciones administrativas.

## Despliegue

El dashboard esta preparado para desplegarse en Vercel:

1. Importa este repositorio en Vercel.
2. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en las variables de entorno del proyecto.
3. Usa `npm run build` como comando de compilacion.
4. Usa `dist` como directorio de salida.
5. Vuelve a desplegar cuando cambien las variables de entorno.

## Proyecto relacionado

Lulistrack se complementa con un backend independiente que concentra la logica de negocio y la comunicacion con la base de datos. Este repositorio contiene unicamente el dashboard web.

---

**Lulistrack** — Panel web para la gestion y seguimiento de entregas de ultima milla.
