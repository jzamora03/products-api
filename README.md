# Products API

API REST de Productos y Categorías con frontend Angular.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | NestJS 10, TypeORM, PostgreSQL |
| Frontend | Angular 17 (Standalone Components) |
| Auth | JWT (passport-jwt) |
| DevOps | Docker, docker-compose, GitHub Actions |

---

## Inicio rápido

### Requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y **corriendo**

### Ejecutar
```bash
git clone https://github.com/jzamora03/products-api
cd products-api

# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env

docker-compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |

### Credenciales demo
- Usuario: `admin`
- Contraseña: `admin123`

---

## Desarrollo local (sin Docker)

**Backend**
```bash
cd back-productos
npm install
# Crear .env con tus credenciales de PostgreSQL
npm run start:dev
```

**Frontend**
```bash
cd frontProductos
npm install
ng serve
```

---

## Cargar 100.000 productos

1. Iniciar sesión en http://localhost:4200 con `admin / admin123`
2. Ir a **Productos** → clic en **⚡ Carga masiva**
3. Seleccionar categoría, ingresar `100000` y clic en **Insertar**

O desde Swagger en http://localhost:3000/api/docs:
```json
POST /Product/bulk
{
  "count": 100000,
  "categoryId": "uuid-de-la-categoria"
}
```

---

## Endpoints principales

### Auth
```
POST /auth/login      → Obtener JWT
POST /auth/register   → Registrar usuario
```

### Categorías (requiere Bearer token)
```
POST   /Category
GET    /Category
PUT    /Category/:id
DELETE /Category/:id
```

### Productos (requiere Bearer token)
```
POST   /Product           → Crear producto
POST   /Product/bulk      → Carga masiva { count, categoryId }
GET    /Product           → Listar con filtros y paginación
GET    /Product/:id       → Detalle con foto de categoría
PUT    /Product/:id       → Actualizar
DELETE /Product/:id       → Eliminar
```

**Filtros disponibles en GET /Product:**
`page`, `limit`, `search`, `categoryId`, `discontinued`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`

---

## Decisiones Arquitectónicas

### 1. Arquitectura en Capas (Layered Architecture)
Se optó por una arquitectura en capas sobre Hexagonal o DDD dado el alcance del proyecto. Cada módulo (`auth`, `categories`, `products`) tiene sus propias capas de controlador, servicio y entidad, logrando separación de responsabilidades sin overhead innecesario.

### 2. DTOs y mapeo explícito
Nunca se expone una entidad TypeORM directamente. Cada respuesta pasa por un DTO con un método estático `fromEntity()` que mapea explícitamente los campos, protegiendo el modelo de datos interno.

### 3. Bulk Insert con QueryBuilder
Para soportar la carga de 100.000 productos se usa `QueryBuilder.insert().values(batch)` en lotes de 1.000 filas dentro de una sola transacción. Esto reduce los roundtrips a la base de datos de 100.000 a ~100, logrando la inserción en 5-10 segundos.

### 4. JWT Stateless
La autenticación es completamente stateless. El token JWT contiene el `sub` (userId) y `username`, permitiendo que cualquier instancia de la API valide el token sin consultar la base de datos.

### 5. Angular Standalone Components
Se usa la API de Standalone Components de Angular 17, eliminando NgModules innecesarios. Las rutas usan `loadComponent` para lazy loading, reduciendo el bundle inicial.

---

## Escalado horizontal en Cloud
```
Internet → CDN/Load Balancer (AWS ALB)
                ↓
   [API Pod] [API Pod] [API Pod]  ← Auto Scaling Group
                ↓
   PostgreSQL RDS Multi-AZ + Redis ElastiCache
```

**Estrategia:**
1. **API stateless** con JWT → cualquier pod atiende cualquier request
2. **Connection pooling** con PgBouncer para optimizar conexiones a PostgreSQL
3. **Cache distribuida** con Redis para reemplazar el cache en memoria
4. **Read replicas** en RDS para consultas GET de alta concurrencia
5. **Cola de mensajes** (BullMQ/SQS) para bulk inserts mayores a 500k
6. **CDN** (S3 + CloudFront) para servir el frontend Angular estático

---

## Pruebas
```bash
cd back-productos
npm test           # 14 tests unitarios
npm run test:cov   # Con cobertura
```

---

## CI/CD

GitHub Actions corre automáticamente en cada push:
- ✅ Backend — Build + 14 tests
- ✅ Frontend — Build de producción
- ✅ Docker — Build de ambas imágenes
