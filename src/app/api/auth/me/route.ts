import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    // Verificar que Prisma esté disponible
    if (!prisma) {
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      )
    }

    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    try {
      // Verificar JWT
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }

      // Obtener datos del usuario
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true
        }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 401 }
        )
      }

      return NextResponse.json({ user }, { status: 200 })

    } catch (jwtError) {
      console.error('Error verificando JWT:', jwtError)
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Error verificando autenticación:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Error interno del servidor' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}