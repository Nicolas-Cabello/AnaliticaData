'use client'

import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface DataFile {
  data: any[]
  columns: string[]
  fileName: string
  fileType: 'csv' | 'json' | 'xlsx'
}

export function useDataFileParser() {
  const [dataFile, setDataFile] = useState<DataFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseCSV = useCallback((file: File) => {
    return new Promise<DataFile>((resolve, reject) => {
      Papa.parse(file, {
        complete: (result) => {
          if (result.errors.length > 0) {
            reject(new Error(`Error al parsear CSV: ${result.errors[0].message}`))
            return
          }

          const data = result.data as any[]
          
          // Filtrar filas vacías
          const filteredData = data.filter(row => 
            Object.values(row).some(value => value !== null && value !== '')
          )

          if (filteredData.length === 0) {
            reject(new Error('El archivo CSV no contiene datos válidos'))
            return
          }

          const columns = Object.keys(filteredData[0])
          
          resolve({
            data: filteredData,
            columns,
            fileName: file.name,
            fileType: 'csv'
          })
        },
        error: (error) => {
          reject(new Error(`Error al leer el archivo: ${error.message}`))
        },
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8'
      })
    })
  }, [])

  const parseJSON = useCallback((file: File) => {
    return new Promise<DataFile>((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const jsonData = JSON.parse(content)
          
          let data: any[]
          
          // Determinar si es un array de objetos o un objeto único
          if (Array.isArray(jsonData)) {
            data = jsonData
          } else if (typeof jsonData === 'object' && jsonData !== null) {
            data = [jsonData]
          } else {
            reject(new Error('El archivo JSON debe contener objetos'))
            return
          }
          
          if (data.length === 0) {
            reject(new Error('El archivo JSON no contiene datos válidos'))
            return
          }
          
          // Filtrar objetos vacíos
          const filteredData = data.filter(item => 
            item && typeof item === 'object' && Object.keys(item).length > 0
          )
          
          if (filteredData.length === 0) {
            reject(new Error('El archivo JSON no contiene objetos válidos'))
            return
          }
          
          // Obtener todas las columnas únicas
          const allKeys = new Set<string>()
          filteredData.forEach(item => {
            Object.keys(item).forEach(key => allKeys.add(key))
          })
          const columns = Array.from(allKeys)
          
          resolve({
            data: filteredData,
            columns,
            fileName: file.name,
            fileType: 'json'
          })
        } catch (error) {
          reject(new Error(`Error al parsear JSON: ${error instanceof Error ? error.message : 'Error desconocido'}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }
      
      reader.readAsText(file)
    })
  }, [])

  const parseXLSX = useCallback((file: File) => {
    return new Promise<DataFile>((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const workbookData = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(workbookData, { type: 'array' })
          
          // Tomar la primera hoja del archivo
          const firstSheetName = workbook.SheetNames[0]
          if (!firstSheetName) {
            reject(new Error('El archivo XLSX no contiene hojas'))
            return
          }
          
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          if (jsonData.length === 0) {
            reject(new Error('La hoja de cálculo está vacía'))
            return
          }
          
          // La primera fila contiene los encabezados
          const headers = jsonData[0] as string[]
          const rows = jsonData.slice(1) as any[][]
          
          // Filtrar filas vacías
          const filteredRows = rows.filter(row => 
            row && row.some(cell => cell !== null && cell !== undefined && cell !== '')
          )
          
          if (filteredRows.length === 0) {
            reject(new Error('La hoja de cálculo no contiene datos válidos'))
            return
          }
          
          // Convertir a array de objetos
          const parsedData = filteredRows.map(row => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header] = row[index] || null
            })
            return obj
          })
          
          resolve({
            data: parsedData,
            columns: headers,
            fileName: file.name,
            fileType: 'xlsx'
          })
        } catch (error) {
          reject(new Error(`Error al parsear XLSX: ${error instanceof Error ? error.message : 'Error desconocido'}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const parseFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      let result: DataFile

      switch (fileExtension) {
        case 'csv':
          result = await parseCSV(file)
          break
        case 'json':
          result = await parseJSON(file)
          break
        case 'xlsx':
        case 'xls':
          result = await parseXLSX(file)
          break
        default:
          throw new Error('Formato de archivo no soportado. Use CSV, JSON o XLSX.')
      }

      setDataFile(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido al procesar el archivo')
    } finally {
      setIsProcessing(false)
    }
  }, [parseCSV, parseJSON, parseXLSX])

  const clearData = useCallback(() => {
    setDataFile(null)
    setError(null)
    setIsProcessing(false)
  }, [])

  // Obtener una muestra representativa para enviar a la IA
  const getSampleForAI = useCallback((maxRows: number = 30) => {
    if (!dataFile) return null

    const { data, columns, fileType } = dataFile
    
    // Si hay pocos datos, enviar todo
    if (data.length <= maxRows) {
      return {
        columns,
        data,
        totalRows: data.length,
        fileType
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
      totalRows: data.length,
      fileType
    }
  }, [dataFile])

  return {
    dataFile,
    isProcessing,
    error,
    parseFile,
    clearData,
    getSampleForAI
  }
}