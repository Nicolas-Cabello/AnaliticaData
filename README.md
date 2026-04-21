# AnaliticaData

Una aplicación web full-stack para análisis de datos CSV con capacidades de chat asistido por IA. AnaliticaData permite a los usuarios cargar archivos CSV, visualizar datos, generar gráficos dinámicos y obtener insights mediante conversaciones con IA.

## 🌟 Características

### 📊 Análisis de Datos
- **Carga de archivos CSV** con interfaz drag-and-drop
- **Vista previa de datos** en formato tabular
- **Visualizaciones dinámicas** (gráficos de barras, líneas y tartas)
- **Análisis estadístico** automático
- **Resúmenes ejecutivos** generados por IA

### 🤖 Chat con IA
- **Conversaciones naturales** sobre tus datos
- **Preguntas en lenguaje natural** ("¿Cuál es el promedio de ventas?")
- **Generación de insights** automáticamente
- **Soporte para Google Gemini API**

### 👥 Gestión de Usuarios
- **Sistema de autenticación completo**
- **Registro y login de usuarios**
- **Sesiones seguras con JWT**
- **Base de datos SQLite para persistencia**
- **Datos de CSV asociados a cada usuario**

### 🎨 Interfaz Moderna
- **Diseño responsive** con Tailwind CSS
- **Componentes Shadcn/UI**
- **Experiencia de usuario intuitiva**
- **Dark/Light mode ready**

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** con App Router
- **TypeScript** para tipado seguro
- **Tailwind CSS** para estilos
- **Shadcn/UI** para componentes
- **Recharts** para visualizaciones
- **React Dropzone** para carga de archivos

### Backend
- **Next.js API Routes**
- **Prisma ORM** para base de datos
- **SQLite** como base de datos
- **JWT** para autenticación
- **bcryptjs** para hashing de contraseñas

### IA y APIs
- **Google Gemini API** para análisis de datos
- **Papa Parse** para procesamiento CSV

## 📋 Requisitos Previos

- **Node.js** 18+ 
- **npm** o **yarn**
- **Cuenta de Google Cloud** con Gemini API (opcional para producción)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd insightflow
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   # Base de datos
   DATABASE_URL="file:./dev.db"
   
   # JWT Secret (genera uno seguro para producción)
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   
   # Google Gemini API Key
   NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Configurar base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Iniciar aplicación**
   ```bash
   npm run dev
   ```

6. **Abrir en navegador**
   ```
   http://localhost:3000
   ```

## 🔧 Configuración de Google Gemini API

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Añádela a tu archivo `.env`:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY="tu-api-key-aquí"
   ```

## 📖 Uso de la Aplicación

### 1. Registro y Autenticación
- Abre la aplicación y verás el formulario de registro/login
- Crea una cuenta con username, email y contraseña
- Inicia sesión para acceder al dashboard

### 2. Carga de Datos CSV
- Haz clic en el área de carga o arrastra tu archivo CSV
- La aplicación mostrará una vista previa de los primeros 5 registros
- Los datos quedarán asociados a tu usuario

### 3. Análisis y Visualización
- La aplicación genera automáticamente visualizaciones
- Usa los controles para cambiar entre tipos de gráficos
- Explora diferentes perspectivas de tus datos

### 4. Chat con IA
- Escribe preguntas sobre tus datos en el chat
- La IA responderá con análisis e insights
- Pide resúmenes ejecutivos o análisis específicos

## 🏗️ Estructura del Proyecto

```
insightflow/
├── src/
│   ├── app/                 # Rutas de Next.js App Router
│   │   ├── api/            # API Routes
│   │   │   └── auth/       # Endpoints de autenticación
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Página principal
│   ├── components/         # Componentes React
│   │   ├── AuthForm.tsx    # Formulario de auth
│   │   ├── CSVUploader.tsx # Carga de CSV
│   │   ├── DataPreview.tsx # Vista previa de datos
│   │   └── ChartVisualization.tsx # Gráficos
│   ├── contexts/           # Contextos de React
│   │   └── AuthContext.tsx # Contexto de autenticación
│   ├── hooks/              # Hooks personalizados
│   │   └── useCSVParser.ts # Hook para parsear CSV
│   ├── lib/                # Utilidades
│   │   ├── prisma.ts       # Cliente de Prisma
│   │   └── auth.ts         # Funciones de auth
│   └── services/           # Servicios
│       └── chatAI.ts       # Servicio de IA
├── prisma/
│   ├── schema.prisma       # Schema de base de datos
│   └── prisma.config.ts    # Configuración de Prisma
├── public/                 # Archivos estáticos
├── .env                    # Variables de entorno
├── .env.local             # Variables locales
└── README.md              # Este archivo
```

## 🗄️ Base de Datos

La aplicación usa **SQLite** con **Prisma ORM**. El esquema incluye:

### Modelo User
- `id`: Identificador único
- `username`: Nombre de usuario (único)
- `email`: Email (único)
- `password`: Contraseña hasheada
- `createdAt/updatedAt`: Timestamps

### Modelo CSVData
- `id`: Identificador único
- `fileName`: Nombre del archivo
- `columns`: Columnas (JSON)
- `data`: Datos (JSON)
- `totalRows`: Número total de filas
- `userId`: Relación con usuario
- `createdAt/updatedAt`: Timestamps

## 🔒 Seguridad

- **Contraseñas hasheadas** con bcryptjs (12 rounds)
- **Tokens JWT** con expiración de 7 días
- **Cookies httpOnly** para mayor seguridad
- **Validación de inputs** en frontend y backend
- **Protección de rutas** con middleware

## 🧪 Testing

La aplicación incluye validaciones en:

- **Formato de email**
- **Complejidad de contraseña** (mayúscula, minúscula, número, 6+ caracteres)
- **Username** (3+ caracteres, alfanumérico)
- **Unicidad** de username y email

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega automáticamente

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Entorno de Producción
```env
DATABASE_URL="tu-url-de-base-de_datos"
JWT_SECRET="tu-jwt-secret-muy-seguro"
NEXT_PUBLIC_GEMINI_API_KEY="tu-gemini-api-key"
NODE_ENV="production"
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Troubleshooting

### Problemas Comunes

**Error: "PrismaClient needs to be constructed with non-empty options"**
- Asegúrate de tener `DATABASE_URL` configurada en `.env`
- Ejecuta `npx prisma generate` y `npx prisma db push`

**Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"**
- Esto indica un error en las API routes
- Revisa los logs del servidor para más detalles
- Asegúrate de que Prisma esté correctamente configurado

**Error: "Google Gemini API key not found"**
- Asegúrate de tener `NEXT_PUBLIC_GEMINI_API_KEY` en `.env`
- Verifica que tu API key sea válida

**Error: "Database connection failed"**
- Verifica que `dev.db` exista en la raíz del proyecto
- Ejecuta `npx prisma db push` para crear las tablas

### Comandos Útiles
```bash
# Resetear base de datos
npx prisma db push --force-reset

# Ver logs de Prisma
npx prisma studio

# Limpiar cache de Next.js
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

1. Abre un **Issue** en el repositorio
2. Describe el problema con detalles
3. Incluye screenshots si es posible
4. Menciona tu entorno (SO, Node.js version, etc.)

---

**Desarrollado con ❤️ usando Next.js, Prisma y Google Gemini**