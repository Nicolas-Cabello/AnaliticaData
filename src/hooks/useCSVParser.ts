'use client'

import { useState, useCallback } from 'react'
import Papa from 'papaparse'

interface CSVData {
  data: any[]
  columns: string[]
  fileName: string
}

export function useCSVParser() {
  const [csvData, setCsvData] = useState<CSVData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseCSV = useCallback((file: File) => {
    setIsProcessing(true)
    setError(null)

    Papa.parse(file, {
      complete: (result) => {
        if (result.errors.length > 0) {
          setError(`Error al parsear CSV: ${result.errors[0].message}`)
          setIsProcessing(false)
          return
        }

        const data = result.data as any[]
        
        // Filtrar filas vacías
        const filteredData = data.filter(row => 
          Object.values(row).some(value => value !== null && value !== '')
        )

        if (filteredData.length === 0) {
          setError('El archivo CSV no contiene datos válidos')
          setIsProcessing(false)
          return
        }

        const columns = Object.keys(filteredData[0])
        
        setCsvData({
          data: filteredData,
          columns,
          fileName: file.name
        })
        
        setIsProcessing(false)
      },
      error: (error) => {
        setError(`Error al leer el archivo: ${error.message}`)
        setIsProcessing(false)
      },
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8'
    })
  }, [])

  const clearData = useCallback(() => {
    setCsvData(null)
    setError(null)
    setIsProcessing(false)
  }, [])

  // Obtener una muestra representativa para enviar a la IA
  const getSampleForAI = useCallback((maxRows: number = 30) => {
    if (!csvData) return null

    const { data, columns } = csvData
    
    // Si hay pocos datos, enviar todo
    if (data.length <= maxRows) {
      return {
        columns,
        data,
        totalRows: data.length
      }
    }

    // Si hay muchos datos, enviar una muestra estratificada
    const sampleSize = Math.min(maxRows, data.length)
    const step = Math.floor(data.length / sampleSize)
    const sample = []
    
    for (let i = 0; i < sampleSize; i++) {
      const index = i * step
      sample.push(data[Math.min(index, data.length - 1)])
    }

    return {
      columns,
      data: sample,
      totalRows: data.length
    }
  }, [csvData])

  return {
    csvData,
    isProcessing,
    error,
    parseCSV,
    clearData,
    getSampleForAI
  }
}