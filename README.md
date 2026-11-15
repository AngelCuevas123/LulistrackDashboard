# Lulistrack Dashboard — 3.0

Panel web administrativo de **Lulistrack**, una plataforma para la gestión de entregas de última milla. Permite administrar pedidos y repartidores, dar seguimiento a la operación y consultar las entregas completadas.

Este repositorio contiene el dashboard web. La aplicación móvil y el backend se mantienen en repositorios independientes.

## Aplicación en línea

- **Dashboard administrativo:** https://lulistrack-dashboard.vercel.app
- **Seguimiento público para clientes:** https://lulistrack-dashboard.vercel.app/seguimiento
- **Backend API:** https://backendlulistrack.onrender.com
- **Documentación de la API:** https://backendlulistrack.onrender.com/docs

Los clientes pueden entrar al enlace de seguimiento público e ingresar su número de guía para consultar el estado de su pedido. No necesitan iniciar sesión en el dashboard.

## Ecosistema Lulistrack

| Componente | Tecnología | Repositorio |
| --- | --- | --- |
| Aplicación para repartidores | Flutter y Dart | [LulistrackApp](https://github.com/AngelCuevas123/LulistrackApp/tree/lulistrack-3.0) |
| API y lógica de negocio | FastAPI y Python | [BackendLulistrack](https://github.com/AngelCuevas123/BackendLulistrack/tree/lulistrack-3.0) |
| Panel administrativo | React y Vite | Este repositorio |
| Base de datos y autenticación | Supabase Auth y PostgreSQL | Proyecto Supabase |
| Evidencias de entrega | Supabase Storage | Proyecto Supabase |
| Notificaciones push | Firebase Cloud Messaging | Proyecto Firebase |

## Funcionalidades

- Inicio de sesión mediante Supabase Auth.
- Validación de permisos administrativos mediante el backend.
- Vista general de la operación.
- Consulta, registro y administración de pedidos.
- Registro y administración de repartidores.
- Creación de cuentas de acceso para repartidores desde el panel.
- Asignación de pedidos a repartidores.
- Seguimiento público de pedidos mediante número de guía.
- Visualización de la ubicación del repartidor cuando hay datos GPS recientes.
- Historial de entregas completadas.
- Consulta de evidencias de entrega.
- Sección de configuración del panel.

El dashboard utiliza el backend para las operaciones administrativas protegidas. Las notificaciones push se gestionan desde el backend y se reciben en la aplicación móvil.

## Alta de repartidores

El registro de repartidores se realiza desde el panel y no desde la app móvil:

1. Un administrador autorizado inicia sesión.
2. En **Repartidores**, selecciona **Nuevo repartidor** y captura los datos solicitados.
3. El dashboard envía la solicitud a POST /drivers/.
4. El backend valida los permisos, crea la cuenta en Supabase Auth y guarda el perfil relacionado en PostgreSQL.
5. El repartidor inicia sesión en la aplicación móvil con la cuenta creada.

No se deben incluir credenciales de administrador ni contraseñas de evaluación en este repositorio. Los accesos de demostración, si se requieren, se entregan por un canal separado.

## Tecnologías

- React 19
- Vite 8
- React Router DOM
- Supabase JavaScript Client y Supabase Auth
- Lucide React
- CSS
- API REST con FastAPI
- Vercel para el despliegue web

## Estructura del proyecto

~~~text
LulistrackDashboard/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Drivers.jsx
│   │   ├── History.jsx
│   │   ├── Login.jsx
│   │   ├── Orders.jsx
│   │   ├── Settings.jsx
│   │   └── Tracking.jsx
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
└── vite.config.js
~~~

## Requisitos

- Node.js compatible con la versión de Vite del proyecto.
- npm.
- Acceso al proyecto de Supabase.
- Backend de Lulistrack disponible.

## Instalación y ejecución local

Clona la rama 3.0:

~~~bash
git clone --branch lulistrack-3.0 https://github.com/AngelCuevas123/LulistrackDashboard.git
cd LulistrackDashboard
npm install
~~~

Crea un archivo .env en la raíz tomando como referencia .env.example:

~~~env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_anon
~~~

Inicia el servidor de desarrollo:

~~~bash
npm run dev
~~~

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| VITE_SUPABASE_URL | URL del proyecto de Supabase. |
| VITE_SUPABASE_ANON_KEY | Clave pública anon/publishable de Supabase. |

El frontend utiliza únicamente la clave pública. Las operaciones administrativas se validan en el backend. No incluyas claves privadas o contraseñas en el código ni en el repositorio.

## Scripts

| Comando | Descripción |
| --- | --- |
| npm run dev | Inicia Vite en modo desarrollo. |
| npm run build | Genera la compilación de producción en dist/. |
| npm run preview | Previsualiza la compilación localmente. |
| npm run lint | Ejecuta Oxlint. |

## Comunicación con el backend

Las solicitudes HTTP se centralizan en src/services/api.js y se dirigen a:

~~~text
https://backendlulistrack.onrender.com
~~~

Las solicitudes protegidas incluyen el token de acceso de Supabase:

~~~http
Authorization: Bearer <access_token>
~~~

El backend verifica la identidad y los permisos antes de realizar operaciones administrativas.

## Despliegue en Vercel

El dashboard se despliega de forma independiente de la aplicación Flutter:

1. Importa este repositorio en Vercel.
2. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
3. Usa npm run build como comando de compilación.
4. Configura dist como directorio de salida.
5. Despliega la rama que corresponda al entorno.

Los cambios en el repositorio de la app móvil no actualizan automáticamente este dashboard, ya que se mantienen en repositorios separados.

## Repositorios relacionados

- [Aplicación móvil — rama 3.0](https://github.com/AngelCuevas123/LulistrackApp/tree/lulistrack-3.0)
- [Backend — rama 3.0](https://github.com/AngelCuevas123/BackendLulistrack/tree/lulistrack-3.0)
- [Dashboard — rama 3.0](https://github.com/AngelCuevas123/LulistrackDashboard/tree/lulistrack-3.0)

---

**Lulistrack 3.0** — panel web para la gestión y seguimiento de entregas de última milla.
