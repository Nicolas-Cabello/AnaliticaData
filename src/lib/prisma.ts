import { PrismaClient } from '@prisma/client'

// Declaración para evitar problemas con el hot-reload
declare global {
  var prisma: PrismaClient | undefined
}

// Crear cliente de Prisma con configuración por defecto para SQLite
const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma