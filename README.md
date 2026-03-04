# Nanosilhouette Shop 🛒

Tienda online de e-books con Next.js 14, PostgreSQL, MercadoPago y PayPal.

## 🚀 Quick Start

### 1. Clonar el repositorio
```bash
git clone https://github.com/haroldfabla2-hue/nanosilhouette-shop.git
cd nanosilhouette-shop
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Generar Prisma Client
```bash
npx prisma generate
```

### 5. Ejecutar migraciones de DB
```bash
npx prisma db push
# O si tienes una URL de DB: DATABASE_URL="..." npx prisma db push
```

### 6. Sembrar datos de ejemplo
```bash
npx tsx prisma/seed.ts
```

### 7. Ejecutar en desarrollo
```bash
npm run dev
```

## 📝 Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# MercadoPago
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY="APP_USR-..."

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID="..."

# App
NEXT_PUBLIC_APP_URL="https://shop.nanosilhouette.com"
```

## 🎨 Estructura del Proyecto

```
├── app/
│   ├── api/              # API Routes
│   │   ├── products/     # CRUD productos
│   │   ├── orders/       # Órdenes
│   │   └── checkout/     # Checkout
│   ├── admin/            # Dashboard admin
│   ├── cart/             # Carrito
│   ├── product/[id]/     # Página producto
│   └── page.tsx          # Homepage
├── lib/
│   ├── prisma.ts         # Cliente Prisma
│   └── payments.ts       # Integración pagos
└── prisma/
    ├── schema.prisma     # Schema DB
    └── seed.ts           # Datos ejemplo
```

## 🛠️ Deployment Coolify

1. **Crear nuevo servicio** → "Git Repository"
2. **URL**: `https://github.com/haroldfabla2-hue/nanosilhouette-shop`
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Puerto**: 3000
6. **Variables de entorno**: Agregar todas las del .env

## 📦 Stack

- **Frontend**: Next.js 14 (React)
- **Backend**: API Routes
- **Database**: PostgreSQL + Prisma
- **Pagos**: MercadoPago + PayPal

## 🔐 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Homepage con catálogo |
| `/product/[id]` | Detalle de producto |
| `/cart` | Carrito de compras |
| `/admin` | Dashboard admin |
| `/api/products` | API productos |
| `/api/orders` | API órdenes |
| `/api/checkout` | API checkout |

## 📄 Licencia

MIT
