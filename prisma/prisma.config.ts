import { config } from 'dotenv'

// Cargar variables de entorno desde .env
config()

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}