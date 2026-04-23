# 📋 Guía de Despliegue en Vercel - AnaliticaData

## 🗄️ Configuración de Base de Datos

### Opción 1: Vercel Postgres (Recomendado para Producción)

1. **Crear Base de Datos en Vercel:**
   - Ve a tu dashboard de Vercel
   - Click en "Storage" → "Create Database"
   - Selecciona "Postgres"
   - Configura la región y nombre

2. **Obtener Connection String:**
   - Una vez creada, ve a ".env.local" en el proyecto
   - Copia el `DATABASE_URL`

3. **Actualizar Schema para Producción:**
   ```prisma
   // En prisma/schema.prisma
   datasource db {
     provider = "postgresql"  // Cambiar a postgresql para producción
     url      = env("DATABASE_URL")
   }
   ```

### Opción 2: SQLite para Desarrollo Local

Mantén la configuración actual para desarrollo:
```prisma
datasource db {
  provider = "sqlite"  // Para desarrollo local
  url      = env("DATABASE_URL")
}
```

## 🔧 Variables de Entorno en Vercel

Configura estas variables en el dashboard de Vercel:

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
JWT_SECRET="tu-jwt-secret-muy-seguro-para-produccion"
NEXT_PUBLIC_GEMINI_API_KEY="tu-gemini-api-key"
NODE_ENV="production"
```

## 🚀 Pasos para Despliegue

### 1. Preparar Repositorio

```bash
# Asegurarse de que todo esté limpio
npm run lint:check
npm run build

# Commit final
git add .
git commit -m "Ready for Vercel deployment - optimized for production"
git push origin main
```

### 2. Conectar a Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click "New Project"
3. Conecta tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

### 3. Configurar Build Settings

Vercel usará la configuración de `vercel.json`:
- Build Command: `prisma generate && npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4. Configurar Variables de Entorno

En el dashboard de Vercel:
1. Ve a "Settings" → "Environment Variables"
2. Añade todas las variables mencionadas arriba
3. Marca las que son sensibles como "secret"

### 5. Despliegue Automático

Vercel desplegará automáticamente:
- Ejecutará `prisma generate` para generar el cliente
- Construirá la aplicación
- Desplegará a un URL único

## 🔄 Migración de Base de Datos

Para Vercel Postgres, la migración es automática. Vercel ejecutará:
```bash
prisma db push
```

Si necesitas datos iniciales, crea un seed script:
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Lógica de seed aquí
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## ⚡ Optimizaciones Implementadas

### 1. **Performance**
- ✅ Singleton pattern para Prisma Client
- ✅ Muestreo estratificado para API calls (max 30 filas)
- ✅ Lazy loading de componentes
- ✅ Build optimizado para Vercel

### 2. **Memory Management**
- ✅ Límite de 30 segundos para funciones serverless
- ✅ Procesamiento asíncrono de archivos
- ✅ Cleanup automático de datos temporales

### 3. **Security**
- ✅ Variables de entorno protegidas
- ✅ JWT con expiración
- ✅ Cookies httpOnly
- ✅ Validación de inputs

## 🐛 Troubleshooting

### Error: "Database connection failed"
```bash
# Verificar que DATABASE_URL sea correcta
# Asegurarse de que Prisma esté configurado para PostgreSQL en producción
```

### Error: "PrismaClient needs to be constructed"
```bash
# Asegurarse de que DATABASE_URL esté configurada en Vercel
# Verificar que prisma generate se ejecute en el build
```

### Error: "Function timeout"
```bash
# Las funciones serverless tienen un límite de 30 segundos
# Optimizar queries y reducir tamaño de datos procesados
```

## 📊 Monitoreo

Vercel proporciona:
- **Analytics**: Uso y rendimiento
- **Logs**: Errores y eventos
- **Speed Insights**: Tiempos de carga
- **Webhooks**: Notificaciones de despliegue

## 🔄 CI/CD Automático

Cada push a `main`:
1. ✅ Tests automáticos (si los configuras)
2. ✅ Build automático
3. ✅ Despliegue automático
4. ✅ Actualización de base de datos si es necesario

## 🎯 Checklist Final

- [ ] Base de datos Vercel Postgres creada
- [ ] Variables de entorno configuradas
- [ ] Schema actualizado para PostgreSQL
- [ ] Tests pasando localmente
- [ ] Build exitoso localmente
- [ ] Repositorio limpio y commiteado
- [ ] README actualizado con instrucciones de producción

---

**🚀 Tu aplicación estará lista para producción en Vercel!**