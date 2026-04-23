'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, FileSpreadsheet, Code } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  isProcessing?: boolean
}

const FILE_TYPES = {
  csv: {
    icon: FileText,
    color: 'text-green-600',
    label: 'CSV',
    accept: { 'text/csv': ['.csv'] }
  },
  json: {
    icon: Code,
    color: 'text-blue-600',
    label: 'JSON',
    accept: { 'application/json': ['.json'] }
  },
  xlsx: {
    icon: FileSpreadsheet,
    color: 'text-orange-600',
    label: 'XLSX',
    accept: { 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    }
  }
}

export default function FileUploader({ onFileUpload, isProcessing = false }: FileUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const getFileType = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    return extension as keyof typeof FILE_TYPES
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const fileType = getFileType(file)
      if (FILE_TYPES[fileType]) {
        setUploadedFile(file)
        onFileUpload(file)
      } else {
        alert('Por favor, sube un archivo válido (CSV, JSON o XLSX)')
      }
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      ...FILE_TYPES.csv.accept,
      ...FILE_TYPES.json.accept,
      ...FILE_TYPES.xlsx.accept
    },
    multiple: false,
    disabled: isProcessing
  })

  const clearFile = () => {
    setUploadedFile(null)
  }

  if (uploadedFile) {
    const fileType = getFileType(uploadedFile)
    const FileTypeIcon = FILE_TYPES[fileType]?.icon || FileText
    const fileTypeColor = FILE_TYPES[fileType]?.color || 'text-gray-600'
    const fileTypeLabel = FILE_TYPES[fileType]?.label || 'Archivo'

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileTypeIcon className={`h-8 w-8 ${fileTypeColor}`} />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Badge variant="secondary">{fileTypeLabel}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isProcessing && (
            <div className="mt-4 text-sm text-muted-foreground">
              Procesando archivo...
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            o haz clic para seleccionarlo
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="outline" className="text-green-600 border-green-600">
              CSV
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              JSON
            </Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              XLSX/XLS
            </Badge>
          </div>
          
          <Button type="button" disabled={isProcessing}>
            Seleccionar Archivo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}