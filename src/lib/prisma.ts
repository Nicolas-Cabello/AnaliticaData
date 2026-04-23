import { PrismaClient } from '@prisma/client'

// Declaración para evitar problemas con el hot-reload
declare global {
  var prisma: PrismaClient | undefined
}

// Crear cliente de Prisma con singleton para evitar múltiples conexiones en desarrollo
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma