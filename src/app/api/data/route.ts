import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Verificar token de autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Obtener datos del archivo
    const { fileName, fileType, columns, data, totalRows } = await request.json()

    // Validar datos
    if (!fileName || !fileType || !columns || !data || !totalRows) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Guardar en base de datos (PostgreSQL soporta JSON directamente)
    const dataFile = await prisma.dataFile.create({
      data: {
        fileName,
        fileType,
        columns, // JSON directamente para PostgreSQL
        data,    // JSON directamente para PostgreSQL
        totalRows,
        userId: decoded.userId
      }
    })

    return NextResponse.json(
      { 
        message: 'Archivo guardado exitosamente',
        dataFile: {
          id: dataFile.id,
          fileName: dataFile.fileName,
          fileType: dataFile.fileType,
          totalRows: dataFile.totalRows,
          createdAt: dataFile.createdAt
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error guardando archivo:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar token de autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Obtener archivos del usuario
    const dataFiles = await prisma.dataFile.findMany({
      where: {
        userId: decoded.userId
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        totalRows: true,
        createdAt: true,
        columns: true,
        data: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // PostgreSQL devuelve JSON directamente, no necesita conversión
    return NextResponse.json(
      { files: dataFiles },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error obteniendo archivos:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}