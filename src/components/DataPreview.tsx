'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database } from 'lucide-react'

interface DataPreviewProps {
  data: any[]
  columns: string[]
  fileName?: string
}

export default function DataPreview({ data, columns, fileName }: DataPreviewProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Vista Previa de Datos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay datos cargados
          </p>
        </CardContent>
      </Card>
    )
  }

  const previewData = data.slice(0, 5) // Mostrar solo las primeras 5 filas

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Vista Previa de Datos</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {data.length} filas totales
            </Badge>
            {fileName && (
              <Badge variant="outline">
                {fileName}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className="font-medium">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="max-w-xs truncate">
                      {row[column]?.toString() || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > 5 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Mostrando primeras 5 filas de {data.length} totales
          </p>
        )}
      </CardContent>
    </Card>
  )
}