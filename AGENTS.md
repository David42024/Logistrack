# 📋 AGENTS.md - Distribución de Responsabilidades y Coordinación

## 🎯 Objetivo

Este documento establece la distribución clara de responsabilidades entre los integrantes del equipo, los componentes compartidos que deben implementarse previamente, y el estado actual de implementación para evitar conflictos y asegurar un desarrollo fluido.

---

## 👥 Distribución de Responsabilidades (Fase 1)

El sistema se distribuye entre los integrantes según el alcance establecido en los requerimientos técnicos:

| Responsable | Módulos / Vistas Asignadas | Componentes / Entregables Técnicos |
|-------------|---------------------------|-----------------------------------|
| **David** | • Pantalla de Login (B1)<br>• Dashboard Principal (B2)<br>• Gestión de Flota (B8) | • Sistema de autenticación web<br>• Componentes de métricas globales y paneles de incidencias<br>• Monitor de estado de vehículos y mantenimiento |
| **Takeshy** | • Gestión de Pedidos (B3)<br>• Gestión de Clientes (B6)<br>• Gestión de Rutas (B10) | • Formulario de registro de pedidos/clientes con autocompletado<br>• Tablas paginadas con filtros avanzados<br>• Optimización y planificación de rutas |
| **Bilton** | • Asignación de Transportistas (B4)<br>• Seguimiento de Entregas (B5) | • Panel de emparejamiento visual de carga de trabajo<br>• Línea de tiempo de estados de pedidos en tiempo real |
| **Adrian** | • Reportes y Métricas (B7)<br>• Administración de Usuarios y Roles (B9) | • Gráficos estadísticos y exportación de documentos (PDF/Excel)<br>• Tabla de auditoría y asignación granular de permisos |
| **Roberto** | • Servidor y Despliegue<br>• App Móvil PWA (Pantalla Principal de Pedidos) | • Infraestructura en la nube (PostgreSQL, NestJS API, React Frontend)<br>• URL Pública operativa para todo el equipo<br>• PWA para repartidores (Fase 1) |

---

## ⚠️ Notas Críticas para el Equipo

### Datos Reales Obligatorios
- **Queda completamente prohibido** dejar datos quemados (hardcoded) o textos de ejemplo simulados en el código de las ramas principales de producción.
- Toda cifra en pantalla debe responder a un mapeo directo de la base de datos.

### Prioridad Número Uno
- **Roberto debe liberar en primer término** el despliegue del servidor base y su dirección IP/dominio público con la base de datos expuesta.
- El resto del equipo no puede iniciar el desarrollo de vistas interconectadas sin apuntar sus entornos locales a este entorno unificado de pruebas.

### Reglas de Git
- Cada integrante debe trabajar en su propia rama feature: `feature/david-login`, `feature/takeshy-orders`, etc.
- Los componentes compartidos deben ser desarrollados en ramas separadas y mergeados a `main` antes de que otros los usen.
- Nunca hacer push directo a `main`.

### Scripts de Base de Datos sin psql Local
- Se han migrado los scripts de base de datos (`db:init`, `db:seed`, `db:reset`, `db:drop`) a TypeScript/TypeORM ejecutándose dentro de NestJS.
- **Ya no es necesario tener la herramienta `psql` instalada localmente** ni quemar credenciales en el `package.json`.
- Los scripts cargan las credenciales automáticamente desde el archivo `.env.local` en el backend.
- Se pueden ejecutar desde la raíz del proyecto usando `pnpm db:init`, `pnpm db:seed`, `pnpm db:reset` o `pnpm db:drop` (o con `npm run`).

---

## � Requerimientos Técnicos del Sistema

### Arquitectura General
- **Backend:** NestJS + TypeScript + TypeORM + PostgreSQL
- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite + PWA
- **Comunicación en tiempo real:** Socket.io (WebSocket)
- **Autenticación:** JWT (JSON Web Tokens)
- **Infraestructura:** Docker + Docker Compose + Nginx

### Requerimientos Funcionales por Módulo

#### B1 - Pantalla de Login
- Formulario de autenticación con email y contraseña
- Validación de credenciales contra backend
- Generación y almacenamiento de token JWT
- Redirección automática según rol del usuario
- Recuperación de contraseña (opcional Fase 2)
- Soporte para modo oscuro/claro

#### B2 - Dashboard Principal
- Panel de KPIs en tiempo real (pedidos activos, eficiencia, flota)
- Gráficos de tendencias (últimos 7/30 días)
- Lista de incidencias activas ordenadas por prioridad
- Accesos rápidos a módulos principales
- Notificaciones en tiempo real
- Buscador global multiplataforma

#### B3 - Gestión de Pedidos
- Listado paginado de pedidos con filtros avanzados
- Filtros por: estado, cliente, fecha, búsqueda libre
- Creación de nuevos pedidos con generación automática de ID (ORD-YYYYMMDD-XXXX)
- Detalle de pedido con historial de transiciones
- Actualización de estados con validaciones
- Registro de incidencias de campo con adjuntos
- Exportación a PDF/Excel

#### B4 - Asignación de Transportistas
- Directorio de transportistas con estado (online/offline)
- Filtrado por zona geográfica y capacidad de carga
- Panel de emparejamiento visual de carga de trabajo
- Asignación automática/manual de pedidos
- Notificación push al transportista asignado
- Cambio automático de estado a "Preparando"

#### B5 - Seguimiento de Entregas
- Línea de tiempo visual de estados del pedido
- Seguimiento en tiempo real de ubicación (GPS - Fase 2)
- Actualización de estados por transportista
- Registro de incidencias durante el recorrido
- Confirmación de entrega con evidencia fotográfica
- Cálculo de tiempos de entrega

#### B6 - Gestión de Clientes
- Registro de nuevos clientes con validación
- Autocompletado en tiempo real para formularios
- Historial consolidado de pedidos por cliente
- Actualización de información de contacto
- Clasificación por tipo/volumen de negocio

#### B7 - Reportes y Métricas
- KPIs de rendimiento general
- Tiempos promedio de entrega
- Gráficos de distribución por zonas
- Top transportistas por entregas
- Exportación de reportes en PDF y Excel
- Filtros por rangos de fechas
- Comparativas period-over-period

#### B9 - Administración de Usuarios y Roles
- CRUD completo de usuarios
- Asignación de roles (admin, coordinador, operador, repartidor, gerente)
- Activación/desactivación lógica de cuentas
- Log de auditoría de actividades
- Asignación granular de permisos
- Gestión de contraseñas

#### B8 - Gestión de Flota
- Listado de vehículos con estado (activo, mantenimiento, inactivo)
- Información de vehículos (tipo, placa, capacidad, año)
- Historial de mantenimiento y reparaciones
- Alertas de mantenimiento programado
- Control de documentos (seguro, ITV, licencia)
- Métricas de utilización de flota

#### B10 - Gestión de Rutas
- Planificación de rutas optimizadas para entregas
- Visualización de rutas en mapa
- Agrupación de pedidos por zona geográfica
- Cálculo de tiempos y distancias estimadas
- Asignación de rutas a transportistas
- Seguimiento de rutas en tiempo real

### Requerimientos No Funcionales

#### Seguridad
- Autenticación JWT con expiración configurable
- Encriptación de contraseñas (bcrypt)
- Roles y permisos granulares
- Validación de inputs en backend y frontend
- Protección contra CSRF y XSS
- HTTPS obligatorio en producción

#### Performance
- Tiempo de respuesta < 200ms para endpoints principales
- Soporte para mínimo 100 usuarios concurrentes
- Paginación en todos los listados
- Caching de datos frecuentes
- Optimización de consultas a base de datos

#### Escalabilidad
- Arquitectura modular para fácil expansión
- Separación de concerns (backend/frontend/móvil)
- Base de datos preparada para crecimiento
- Sistema de colas para tareas asíncronas (Fase 2)

#### Usabilidad
- Interfaz responsive (mobile-first)
- Soporte para modo oscuro/claro
- Accesibilidad WCAG 2.1 AA
- Feedback visual en todas las acciones
- Mensajes de error claros y accionables

#### Disponibilidad
- Uptime objetivo: 99.5%
- Backups automáticos diarios
- Sistema de logging centralizado
- Monitoreo de errores y performance

---

##  Estado Actual de Implementación

### Backend (NestJS)
- ✅ **AuthModule:** Login, registro, JWT, guards implementados
- ✅ **UsersModule:** CRUD básico de usuarios, activación/desactivación, log de auditoría
- ✅ **OrdersModule:** CRUD de pedidos, asignación de drivers, WebSocket para tiempo real, incidencias de campo
- ✅ **DriversModule:** Gestión de transportistas, disponibilidad
- ✅ **CustomersModule:** CRUD de clientes, historial de pedidos por cliente
- ✅ **ReportsModule:** KPIs básicos, exportación PDF/Excel, analytics avanzados
- ✅ **MetricsModule:** Métricas públicas, datos históricos
- ✅ **FleetModule:** Gestión de vehículos, mantenimiento, métricas de flota
- ✅ **RoutesModule:** Planificación de rutas, optimización, seguimiento de paradas

### Frontend (React)
- ✅ **Páginas implementadas:**
  - LoginPage.tsx
  - DashboardPage.tsx
  - OrdersPage.tsx
  - CreateOrderPage.tsx
  - OrderDetailPage.tsx
  - DriversPage.tsx
  - DriverDashboardPage.tsx
  - AssignmentsPage.tsx
  - ReportsPage.tsx
  - TrackOrderPage.tsx
- ✅ **Contextos:** AuthContext, SocketContext, ThemeContext
- ✅ **Componentes comunes:** ErrorAlert, LoadingSpinner, ProtectedRoute, StatsCard, CustomTable, OrderStatusTimeline
- ✅ **Layout:** Header global, Sidebar global

### Infraestructura
- ✅ Docker Compose configurado
- ✅ Nginx configurado
- ⏳ **PENDIENTE CRÍTICO:** Despliegue en servidor público por Roberto

---

## 🚀 Próximos Pasos

1. **Roberto:** Desplegar servidor base y proporcionar URL pública (CRÍTICO - bloquea desarrollo conectado)
2. **David:** Integrar ThemeContext y Sidebar/Header en las páginas existentes
3. **Takeshy:** Integrar CustomTable en Gestión de Pedidos y Clientes
4. **Bilton:** Integrar OrderStatusTimeline en Seguimiento de Entregas
5. **Adrian:** Integrar analytics avanzados en Reportes
6. **Roberto:** Desarrollar App Móvil PWA para repartidores

---

## 📞 Coordinación

- **Canal de comunicación:** Discord/Slack del equipo
- **Reuniones diarias:** 15 min stand-up para bloqueos
- **Code review:** Todo PR requiere aprobación de al menos 1 otro integrante
- **Documentación:** Actualizar este documento cuando haya cambios en responsabilidades o estado

---

*Última actualización: 18 de Junio, 2026*
