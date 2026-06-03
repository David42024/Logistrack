# API Documentation

Base URL: `http://localhost:3001/api`

Interactive Swagger UI: `http://localhost:3001/api/docs`

## Authentication

All endpoints (except login and public track) require a Bearer token.

```
Authorization: Bearer <token>
```

## Endpoints

### Auth
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | /auth/login | Login | Public |
| POST | /auth/register | Create user | Admin |
| GET | /auth/me | Get current user | All |

### Orders
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | /orders | List orders (paginated) | Admin, Coordinator, Driver |
| POST | /orders | Create order | Admin, Coordinator |
| GET | /orders/stats | Get KPI stats | Admin, Coordinator |
| GET | /orders/track/:orderNumber | Track by number | All |
| GET | /orders/:id | Get order detail | Admin, Coordinator, Driver |
| PATCH | /orders/:id/status | Update status | Admin, Coordinator, Driver |
| PATCH | /orders/:id/assign | Assign driver | Admin, Coordinator |
| GET | /orders/driver/:driverId | Driver's orders | Admin, Coordinator, Driver |

### Drivers
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | /drivers | All drivers | Admin, Coordinator |
| GET | /drivers/available | Available drivers | Admin, Coordinator |
| GET | /drivers/suggested | Suggested driver | Admin, Coordinator |
| POST | /drivers | Create driver | Admin |
| PATCH | /drivers/:id | Update driver | Admin, Coordinator |
| PATCH | /drivers/:id/status | Update driver status | Admin, Coordinator, Driver |

### Customers
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | /customers | List (search param) | Admin, Coordinator |
| POST | /customers | Create | Admin, Coordinator |
| PATCH | /customers/:id | Update | Admin, Coordinator |

### Reports
| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | /reports/kpis | KPI summary | Admin, Coordinator |
| GET | /reports/deliveries-by-day | Last 7 days chart data | Admin, Coordinator |
| GET | /reports/top-drivers | Top 3 drivers | Admin, Coordinator |
| GET | /reports/export/pdf | Download PDF | Admin, Coordinator |
| GET | /reports/export/excel | Download Excel | Admin, Coordinator |

## WebSocket Events

Connect to `ws://localhost:3001`

### Client → Server
- `join-room` (room: string): Join a room (e.g. `driver-{driverId}`)

### Server → Client
- `order-created` (order): New order created
- `order-status-updated` (order): Order status changed
- `order-assigned` (order): Driver assigned to order
