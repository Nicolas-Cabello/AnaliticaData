import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Logout exitoso' },
      { status: 200 }
    )

    // Eliminar la cookie de autenticación
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expirar inmediatamente
    })

    return response

  } catch (error) {
    console.error('Error en logout:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}