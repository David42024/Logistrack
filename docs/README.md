# 🚛 Sistema de Gestión de Transporte y Seguimiento de Pedidos

Sistema web completo para gestión de transporte logístico con seguimiento en tiempo real.

## Tecnologías

| Capa | Stack |
|------|-------|
| Backend | NestJS + TypeScript + TypeORM + PostgreSQL + JWT + Socket.io |
| Frontend | React 18 + TypeScript + Tailwind CSS + Recharts + PWA |
| Infra | Docker + Docker Compose + Nginx |

## Inicio Rápido

### 1. Clonar y configurar

```bash
git clone <repo>
cd sistema-transporte
```

### 2. Levantar con Docker

```bash
docker-compose up --build
```

Espera ~60 segundos para que todo inicie.

### 3. Acceder

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
| Transportista | driver1@transporte.com | Driver123! |
| Transportista | driver2@transporte.com | Driver123! |

## Flujo de Trabajo

1. **Admin/Coordinador** crea un pedido (menú → Nuevo Pedido)
2. **Coordinador** asigna un transportista (desde la tabla de pedidos o vista de asignaciones)
3. **Transportista** inicia sesión y ve sus pedidos activos en el Dashboard
4. El transportista actualiza el estado: `Preparando → En Tránsito → Entregado`
5. Los cambios se reflejan **en tiempo real** en todas las pestañas abiertas (Socket.io)

## Roles y Permisos

- **Admin**: CRUD usuarios, todos los pedidos, reportes globales
- **Coordinador**: Crear/gestionar pedidos, asignar transportistas, ver reportes
- **Transportista**: Ver pedidos asignados, actualizar estados, funcionalidad offline (PWA)
- **Cliente**: Rastrear pedido por número en `/track`

## PWA / Offline

La app del transportista funciona offline:
- Los cambios de estado se guardan en IndexedDB (localforage)
- Al recuperar conexión se sincronizan automáticamente
- Instalar como app desde Chrome → menú → "Instalar aplicación"

## Reportes

Desde el menú **Reportes** (admin/coordinador):
- KPIs en tiempo real
- Gráfico de entregas por día (últimos 7 días)
- Top 3 transportistas por entregas
- Exportar a **PDF** o **Excel**

## Estructura del Proyecto

```
sistema-transporte/
├── backend/          # NestJS API
├── frontend/         # React + Vite PWA
├── docker/           # nginx.conf, docker-compose
├── scripts/          # seed.sql, init-db.sql, deploy.sh
└── docs/             # Documentación
```

## Variables de Entorno

### Backend (.env)
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

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```
