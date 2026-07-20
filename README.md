# Sistema de Gestión de Transporte y Seguimiento de Pedidos

Sistema web completo para la gestión de transporte logístico con seguimiento en tiempo real, arquitectura modular y soporte PWA.

## Stack Tecnológico

| Capa | Tecnologías |
|------|------------|
| **Backend** | NestJS + TypeScript + TypeORM + PostgreSQL + JWT + Socket.io + Swagger |
| **Frontend** | React 18 + TypeScript + Tailwind CSS + Recharts + Vite + PWA |
| **Infraestructura** | Docker + Docker Compose + Nginx |

## Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| **Autenticación** | Login JWT, roles (Admin, Coordinador, Operador, Transportista, Cliente), guards |
| **Dashboard** | KPIs en tiempo real, gráficos de tendencias, incidencias activas, accesos rápidos |
| **Pedidos** | CRUD completo, filtros avanzados, historial de estados, generación automática de ID, incidencias con adjuntos |
| **Transportistas** | Directorio con estado online/offline, filtro por zona y capacidad, asignación automática/manual |
| **Seguimiento** | Línea de tiempo visual de estados, actualización en tiempo real (Socket.io), confirmación con evidencia |
| **Clientes** | Registro con validación, autocompletado, historial de pedidos, clasificación por tipo/volumen |
| **Reportes** | KPIs de rendimiento, gráficos por zonas, top transportistas, exportación PDF/Excel |
| **Usuarios y Roles** | CRUD de usuarios, permisos granulares, activación/desactivación lógica, log de auditoría |
| **Flota** | Gestión de vehículos, historial de mantenimiento, alertas, control de documentos, métricas de utilización |
| **Rutas** | Planificación optimizada, visualización en mapa, agrupación por zona, cálculo de tiempos y distancias |

## Inicio Rápido

### Requisitos

- Node.js 18+
- pnpm (recomendado) o npm
- Docker y Docker Compose (opcional, para producción)

### Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone <repo>
cd sistema-transporte

# 2. Instalar dependencias (backend + frontend)
pnpm install:all

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Iniciar base de datos (requiere PostgreSQL corriendo)
pnpm db:init
pnpm db:seed

# 5. Iniciar servidores de desarrollo
pnpm dev
```

### Producción con Docker

```bash
docker-compose up --build
```

### Comandos de Base de Datos

Los scripts utilizan TypeORM dentro de NestJS y cargan credenciales desde `backend/.env.local` (no requieren `psql`):

| Comando | Descripción |
|---------|------------|
| `pnpm db:init` | Inicializa la base de datos (extensión `uuid-ossp`) |
| `pnpm db:seed` | Pobla datos semilla (usuarios, drivers, clientes) |
| `pnpm db:drop` | Elimina todas las tablas |
| `pnpm db:reset` | Limpia, inicializa y siembra datos |

### Acceso

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@transporte.com | Admin123! |
| Coordinador | coord@transporte.com | Coord123! |
| Operador | operator@transporte.com | Operator123! |
| Gerente | manager@transporte.com | Manager123! |
| Transportista | driver1@transporte.com | Driver123! |
| Transportista | driver2@transporte.com | Driver123! |
| Transportista | driver3@transporte.com | Driver123! |
| Cliente | customer@transporte.com | Customer123! |

## Flujo de Trabajo

1. **Admin/Coordinador** crea un pedido (menú → Nuevo Pedido)
2. **Coordinador** asigna un transportista (desde la tabla de pedidos o vista de asignaciones)
3. **Transportista** inicia sesión y ve sus pedidos activos en el Dashboard
4. El transportista actualiza el estado: `Preparando → En Tránsito → Entregado`
5. Los cambios se reflejan **en tiempo real** en todas las pestañas (Socket.io)

## Roles y Permisos

- **Admin**: CRUD usuarios, todos los pedidos, reportes globales
- **Coordinador**: Crear/gestionar pedidos, asignar transportistas, reportes
- **Operador**: Visualización y soporte operativo
- **Gerente**: Reportes y métricas globales
- **Transportista**: Pedidos asignados, actualización de estados, offline (PWA)
- **Cliente**: Rastreo de pedido por número en `/track`

## PWA / Offline

- La app del transportista funciona offline
- Cambios de estado se guardan en IndexedDB (localforage)
- Al recuperar conexión se sincronizan automáticamente
- Instalable desde Chrome → menú → "Instalar aplicación"

## Características Técnicas

- **Comunicación en tiempo real**: Socket.io (WebSocket) para actualizaciones instantáneas
- **Autenticación segura**: JWT con expiración configurable, bcrypt para contraseñas
- **Modo oscuro/claro**: Soporte completo con ThemeContext
- **Responsive**: Interfaz mobile-first adaptativa
- **Exportación**: Reportes en PDF (PDFKit) y Excel (ExcelJS)
- **Documentación API**: Swagger/OpenAPI integrado
- **Dashboard interactivo**: Gráficos con Recharts

## Estructura del Proyecto

```
sistema-transporte/
├── backend/                  # NestJS API
│   └── src/
│       ├── auth/             # Autenticación JWT
│       ├── users/            # Gestión de usuarios y roles
│       ├── orders/           # Pedidos y estados
│       ├── drivers/          # Transportistas
│       ├── customers/        # Clientes
│       ├── fleet/            # Gestión de flota
│       ├── routes/           # Planificación de rutas
│       ├── reports/          # Reportes y exportación
│       ├── metrics/          # Métricas y analytics
│       ├── common/           # Guards, decorators, filtros
│       └── config/           # Configuración centralizada
├── frontend/                 # React + Vite PWA
│   └── src/
│       ├── api/              # Clientes HTTP (axios)
│       ├── components/       # Componentes reutilizables
│       ├── contexts/         # AuthContext, SocketContext, ThemeContext
│       ├── hooks/            # Custom hooks
│       ├── pages/            # Páginas de la aplicación
│       ├── services/         # Servicios de negocio
│       ├── types/            # Definiciones TypeScript
│       └── utils/            # Utilidades
├── docker/                   # Configuración Nginx
├── scripts/                  # SQL y scripts de despliegue
└── docs/                     # Documentación adicional
```

## Variables de Entorno

### Backend (`backend/.env`)

```
DB_HOST=postgres
DB_PORT=5432
DB_USER=transport_user
DB_PASSWORD=transport_pass
DB_NAME=transport_db
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
PORT=3001
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```
