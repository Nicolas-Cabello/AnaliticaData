'use client'

import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ComposedChart,
  Area,
  AreaChart,
  Rectangle
} from 'recharts'
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, ScatterChart as ScatterChartIcon, TrendingUp, Users, DollarSign, Calendar, Activity, Grid3X3 } from 'lucide-react'
import ChartCustomization from './ChartCustomization'

interface DataPoint {
  [key: string]: any
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'histogram' | 'boxplot'
  title: string
  description: string
  xKey?: string
  yKey?: string
  data: any[]
  colors: string[]
  category: 'distribucion' | 'tendencias' | 'correlaciones' | 'comparacion' | 'estadistico'
}

interface AutoChartsProps {
  data: DataPoint[]
  fileName: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

// Funciones auxiliares movidas fuera del componente para evitar recreación y mejorar legibilidad
const calculateCorrelation = (data: any[], col1: string, col2: string) => {
  try {
    const values1 = data.map(row => Number(row[col1])).filter(val => !isNaN(val) && isFinite(val))
    const values2 = data.map(row => Number(row[col2])).filter(val => !isNaN(val) && isFinite(val))
    
    if (values1.length !== values2.length || values1.length === 0) return 0
    
    const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length
    const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length
    
    let numerator = 0
    let sumSq1 = 0
    let sumSq2 = 0
    
    for (let i = 0; i < values1.length; i++) {
      const diff1 = values1[i] - mean1
      const diff2 = values2[i] - mean2
      numerator += diff1 * diff2
      sumSq1 += diff1 * diff1
      sumSq2 += diff2 * diff2
    }
    
    const denominator = Math.sqrt(sumSq1 * sumSq2)
    return denominator === 0 ? 0 : numerator / denominator
  } catch (error) {
    console.error('Error calculando correlación:', error)
    return 0
  }
}

const calculateCorrelationMatrix = (data: any[], numericColumns: string[]) => {
  const matrix: number[][] = []
  
  numericColumns.forEach((col1, i) => {
    matrix[i] = []
    numericColumns.forEach((col2, j) => {
      if (i === j) {
        matrix[i][j] = 1
      } else {
        const correlation = calculateCorrelation(data, col1, col2)
        matrix[i][j] = correlation
      }
    })
  })
  
  return matrix
}

const createHeatmapData = (data: any[], numericColumns: string[]) => {
  try {
    if (numericColumns.length < 2) return []
    
    const correlationMatrix = calculateCorrelationMatrix(data, numericColumns)
    const heatmapData: any[] = []
    
    numericColumns.forEach((col1, i) => {
      numericColumns.forEach((col2, j) => {
        heatmapData.push({
          x: j,
          y: i,
          xLabel: col2,
          yLabel: col1,
          correlation: correlationMatrix[i][j]
        })
      })
    })
    
    return heatmapData
  } catch (error) {
    console.error('Error creando datos para heatmap:', error)
    return []
  }
}

const createHistogram = (data: any[], column: string, bins: number = 10) => {
  try {
    const values = data.map(row => Number(row[column])).filter(val => !isNaN(val) && isFinite(val))
    
    if (values.length === 0) {
      console.warn(`No hay valores numéricos válidos para la columna ${column}`)
      return []
    }
    
    if (values.length === 1) {
      return [{
        range: `${values[0]}-${values[0]}`,
        count: 1,
        frequency: 1
      }]
    }
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    if (min === max) {
      return [{
        range: `${min}`,
        count: values.length,
        frequency: 1
      }]
    }
    
    const binWidth = (max - min) / bins
    
    const histogram = []
    for (let i = 0; i < bins; i++) {
      const binMin = min + i * binWidth
      const binMax = i === bins - 1 ? max : binMin + binWidth
      const count = values.filter(val => val >= binMin && (i === bins - 1 ? val <= binMax : val < binMax)).length
      
      histogram.push({
        range: `${binMin.toFixed(1)}${i === bins - 1 ? '' : '-' + binMax.toFixed(1)}`,
        count: count,
        frequency: count / values.length
      })
    }
    
    return histogram.filter(bin => bin.count > 0)
  } catch (error) {
    console.error(`Error creando histograma para ${column}:`, error)
    return []
  }
}

const createBoxplot = (data: any[], column: string) => {
  try {
    const values = data.map(row => Number(row[column])).filter(val => !isNaN(val) && isFinite(val))
    
    if (values.length === 0) {
      console.warn(`No hay valores numéricos válidos para la columna ${column}`)
      return []
    }
    
    values.sort((a, b) => a - b)
    
    const q1Index = Math.floor(values.length * 0.25)
    const q3Index = Math.floor(values.length * 0.75)
    const medianIndex = Math.floor(values.length * 0.5)
    
    const q1 = values[q1Index]
    const q3 = values[q3Index]
    const median = values[medianIndex]
    
    const iqr = q3 - q1
    const lowerFence = q1 - 1.5 * iqr
    const upperFence = q3 + 1.5 * iqr
    
    const outliers = values.filter(val => val < lowerFence || val > upperFence)
    const nonOutliers = values.filter(val => val >= lowerFence && val <= upperFence)
    
    const whiskerMin = nonOutliers.length > 0 ? nonOutliers[0] : q1
    const whiskerMax = nonOutliers.length > 0 ? nonOutliers[nonOutliers.length - 1] : q3
    
    const absoluteMin = values[0]
    const absoluteMax = values[values.length - 1]
    
    return [{
      name: column,
      absoluteMin,
      whiskerMin,
      q1,
      median,
      q3,
      whiskerMax,
      absoluteMax,
      boxRange: [absoluteMin, absoluteMax],
      outliers
    }]
  } catch (error) {
    console.error(`Error creando boxplot para ${column}:`, error)
    return []
  }
}

const getColorPalette = (scheme: string) => {
  const schemes: { [key: string]: string[] } = {
    default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
    warm: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#fbbf24', '#fcd34d'],
    cool: ['#3b82f6', '#06b6d4', '#14b8a6', '#10b981', '#22d3ee', '#67e8f9'],
    purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'],
    monochrome: ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6']
  }
  return schemes[scheme] || schemes.default
}

const calculateTrendLine = (data: any[]) => {
  if (data.length < 2) return null
  
  const n = data.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  
  data.forEach(point => {
    sumX += point.x
    sumY += point.y
    sumXY += point.x * point.y
    sumX2 += point.x * point.x
  })
  
  const denominator = n * sumX2 - sumX * sumX
  if (Math.abs(denominator) < 0.0001) return null 
  
  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n
  
  const minX = Math.min(...data.map(d => d.x))
  const maxX = Math.max(...data.map(d => d.x))
  
  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept }
  ]
}

const BoxplotShape = (props: any) => {
  const { x, y, width, height, payload, fill } = props;
  const { absoluteMin, whiskerMin, q1, median, q3, whiskerMax, absoluteMax, outliers } = payload;
  
  const totalRange = absoluteMax - absoluteMin;
  if (totalRange === 0) return null;
  
  // En layout horizontal (barras verticales), el eje Y es el de los valores
  const getPixelY = (val: number) => y + height * ((absoluteMax - val) / totalRange);
  
  const wMaxY = getPixelY(whiskerMax);
  const q3Y = getPixelY(q3);
  const medianY = getPixelY(median);
  const q1Y = getPixelY(q1);
  const wMinY = getPixelY(whiskerMin);
  
  const centerX = x + width / 2;
  const whiskerWidth = width * 0.5;
  const whiskerLeft = centerX - whiskerWidth / 2;
  const whiskerRight = centerX + whiskerWidth / 2;
  
  return (
    <g>
      {/* Rango intercuartil (Caja principal) */}
      <rect 
        x={x} 
        y={q3Y} 
        width={width} 
        height={q1Y - q3Y} 
        fill={fill} 
        fillOpacity={0.6}
        stroke={fill} 
        strokeWidth={2}
      />
      
      {/* Línea de la mediana */}
      <line x1={x} y1={medianY} x2={x + width} y2={medianY} stroke="#1f2937" strokeWidth={3} />
      
      {/* Bigote superior (Máximo sin outliers) */}
      <line x1={centerX} y1={q3Y} x2={centerX} y2={wMaxY} stroke={fill} strokeDasharray="5 5" />
      <line x1={whiskerLeft} y1={wMaxY} x2={whiskerRight} y2={wMaxY} stroke={fill} strokeWidth={2} />
      
      {/* Bigote inferior (Mínimo sin outliers) */}
      <line x1={centerX} y1={q1Y} x2={centerX} y2={wMinY} stroke={fill} strokeDasharray="5 5" />
      <line x1={whiskerLeft} y1={wMinY} x2={whiskerRight} y2={wMinY} stroke={fill} strokeWidth={2} />
      
      {/* Valores Atípicos (Outliers) */}
      {outliers && outliers.map((outlier: number, i: number) => (
        <circle key={i} cx={centerX} cy={getPixelY(outlier)} r={3} fill="none" stroke="#ef4444" strokeWidth={1.5} />
      ))}
    </g>
  );
};

export default function AutoCharts({ data, fileName }: AutoChartsProps) {
  const [selectedChart, setSelectedChart] = useState<number>(0)
  const [colorScheme, setColorScheme] = useState<string>('default')
  const [selectedCategory, setSelectedCategory] = useState<string>('todas')
  
  // Variables para depuración - calcular una sola vez
  const debugInfo = useMemo(() => {
    if (!data || data.length === 0) {
      return { numericColumns: [], categoricalColumns: [] }
    }
    
    const numericColumns: string[] = []
    const categoricalColumns: string[] = []
    const firstRow = data[0]
    
    // Analizar tipos de columnas (versión simplificada)
    Object.keys(firstRow).forEach(key => {
      const lowerKey = key.toLowerCase()
      if (lowerKey.includes('id') || lowerKey.includes('nombre') || lowerKey.includes('name')) {
        return
      }

      const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined && val !== '')
      
      // Detección más permisiva de numéricos
      const isNumeric = values.length > 0 && values.every(val => {
        const num = Number(val)
        return !isNaN(num) && isFinite(num)
      })
      
      if (isNumeric) {
        numericColumns.push(key)
      } else {
        categoricalColumns.push(key)
      }
    })
    
    return { numericColumns, categoricalColumns }
  }, [data])



  const handleExportChart = () => {
    console.log('Exportando gráfico...')
  }

  const handleRefreshData = () => {
    console.log('Actualizando datos...')
  }

  const handleColorSchemeChange = (scheme: string) => {
    setColorScheme(scheme)
  }

  const chartConfigs = useMemo(() => {
    if (!data || data.length === 0) return []

    // Mostrar información de depuración en la interfaz
    const firstRow = data[0]
    const totalColumns = Object.keys(firstRow).length
    const totalRows = data.length

    const configs: ChartConfig[] = []
    const numericColumns: string[] = []
    const categoricalColumns: string[] = []
    const dateColumns: string[] = []

    // Analizar tipos de columnas y filtrar campos no deseados
    Object.keys(firstRow).forEach(key => {
      // Excluir campos ID y nombre
      const lowerKey = key.toLowerCase()
      if (lowerKey.includes('id') || lowerKey.includes('nombre') || lowerKey.includes('name')) {
        return
      }

      const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined && val !== '')
      
      // Mejorar detección de variables numéricas - ser más permisivo
      const isNumeric = values.length > 0 && values.every(val => {
        const strVal = String(val).trim()
        // Permitir números con puntos, comas, signos
        const numPattern = /^[+-]?\d*\.?\d+(?:[eE][+-]?\d+)?$/
        return numPattern.test(strVal) && !isNaN(Number(strVal)) && isFinite(Number(strVal))
      })
      
      // Mejorar detección de fechas
      const isDate = values.length > 0 && values.every(val => {
        const date = new Date(val)
        return !isNaN(date.getTime()) && 
               (val.toString().match(/\d{4}-\d{2}-\d{2}/) || 
                val.toString().match(/\d{2}\/\d{2}\/\d{4}/) ||
                val.toString().match(/\d{2}-\d{2}-\d{4}/))
      })

      if (isNumeric) {
        numericColumns.push(key)
      } else if (isDate) {
        dateColumns.push(key)
      } else {
        categoricalColumns.push(key)
      }
    })

    // Si no hay suficientes columnas numéricas, intentar conversión forzada
    if (numericColumns.length < 2) {
      console.log('Intentando conversión forzada de columnas a numéricas...')
      Object.keys(firstRow).forEach(key => {
        const lowerKey = key.toLowerCase()
        if (lowerKey.includes('id') || lowerKey.includes('nombre') || lowerKey.includes('name')) {
          return
        }
        
        if (!numericColumns.includes(key)) {
          const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined && val !== '')
          const numericValues = values.map(val => Number(val)).filter(num => !isNaN(num) && isFinite(num))
          
          // Si más del 80% de los valores son numéricos, considerar la columna como numérica
          if (numericValues.length >= values.length * 0.8 && numericValues.length >= 2) {
            console.log(`Columna ${key} convertida a numérica (${numericValues.length}/${values.length} valores)`)
            numericColumns.push(key)
            // Remover de categóricas si estaba ahí
            const catIndex = categoricalColumns.indexOf(key)
            if (catIndex > -1) {
              categoricalColumns.splice(catIndex, 1)
            }
          }
        }
      })
    }

    console.log('Columnas detectadas:', { numericColumns, categoricalColumns, dateColumns })
    console.log('Datos de muestra:', data.slice(0, 2))
    
    // Verificar valores numéricos por columna
    numericColumns.forEach(col => {
      const values = data.map(row => row[col])
      const numericValues = values.filter(val => !isNaN(Number(val)) && isFinite(Number(val)))
      console.log(`Columna ${col}:`, { 
        totalValues: values.length, 
        numericValues: numericValues.length,
        sampleValues: values.slice(0, 3)
      })
    })

    // Limitar el número de gráficos generados
    const maxChartsPerType = 3

    // 1. Gráfico de barras para datos categóricos vs numéricos (limitado)
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      let chartCount = 0
      categoricalColumns.slice(0, 2).forEach(catCol => {
        numericColumns.slice(0, 2).forEach(numCol => {
          if (chartCount >= maxChartsPerType) return
          
          const aggregatedData = data.reduce((acc: any[], row) => {
            const category = row[catCol]
            const value = Number(row[numCol])
            const existing = acc.find(item => item.category === category)
            
            if (existing) {
              existing.value += value
              existing.count += 1
            } else {
              acc.push({ category, value, count: 1 })
            }
            return acc
          }, [])

          const avgData = aggregatedData.map(item => ({
            category: item.category,
            [numCol]: Math.round(item.value / item.count * 100) / 100
          }))

          configs.push({
            type: 'bar',
            title: `Promedio de ${numCol} por ${catCol}`,
            description: `Análisis de ${numCol} agrupado por ${catCol}`,
            xKey: 'category',
            yKey: numCol,
            data: avgData,
            colors: getColorPalette(colorScheme),
            category: 'comparacion'
          })
          chartCount++
        })
      })
    }

    // 2. Gráfico de líneas para datos temporales (limitado)
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      dateColumns.slice(0, 1).forEach(dateCol => {
        numericColumns.slice(0, 2).forEach(numCol => {
          const timeData = data.map(row => ({
            date: new Date(row[dateCol]).toLocaleDateString(),
            [numCol]: Number(row[numCol])
          })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

          configs.push({
            type: 'line',
            title: `Evolución de ${numCol} en el tiempo`,
            description: `Tendencia de ${numCol} a lo largo del tiempo`,
            xKey: 'date',
            yKey: numCol,
            data: timeData,
            colors: getColorPalette(colorScheme),
            category: 'tendencias'
          })
        })
      })
    }

    // 3. Gráfico de pastel para proporciones categóricas (limitado)
    if (categoricalColumns.length > 0) {
      categoricalColumns.slice(0, 2).forEach(catCol => {
        const countData = data.reduce((acc: any[], row) => {
          const category = row[catCol]
          const existing = acc.find(item => item.name === category)
          
          if (existing) {
            existing.value += 1
          } else {
            acc.push({ name: category, value: 1 })
          }
          return acc
        }, [])

        configs.push({
          type: 'pie',
          title: `Distribución de ${catCol}`,
          description: `Proporción de valores en ${catCol}`,
          data: countData,
          colors: getColorPalette(colorScheme),
          category: 'distribucion'
        })
      })
    }

    // 4. Gráfico de dispersión para correlaciones numéricas (limitado y mejorado)
    if (numericColumns.length >= 2) {
      let scatterCount = 0
      for (let i = 0; i < Math.min(numericColumns.length - 1, 2); i++) {
        for (let j = i + 1; j < Math.min(numericColumns.length, 3); j++) {
          if (scatterCount >= 2) break
          
          const col1 = numericColumns[i]
          const col2 = numericColumns[j]
          
          const scatterData = data.map(row => ({
            x: Number(row[col1]),
            y: Number(row[col2]),
            z: 1
          }))

          configs.push({
            type: 'scatter',
            title: `Correlación: ${col1} vs ${col2}`,
            description: `Relación entre ${col1} y ${col2}`,
            data: scatterData,
            colors: getColorPalette(colorScheme),
            category: 'correlaciones'
          })
          scatterCount++
        }
        if (scatterCount >= 2) break
      }
    }

    // 5. Diagrama de correlación (heatmap) - solo con variables numéricas
    console.log('Intentando generar heatmap con numericColumns:', numericColumns.length)
    if (numericColumns.length >= 2) {
      try {
        const correlationMatrix = calculateCorrelationMatrix(data, numericColumns)
        console.log('Matriz de correlación calculada:', correlationMatrix)
        
        // Transformar datos para heatmap de forma segura
        const heatmapData: any[] = []
        const labels = numericColumns
        
        // Crear matriz para visualización
        for (let i = 0; i < numericColumns.length; i++) {
          for (let j = 0; j < numericColumns.length; j++) {
            const correlation = correlationMatrix[i]?.[j] || 0
            heatmapData.push({
              x: j,
              y: i,
              correlation: isNaN(correlation) ? 0 : Math.round(correlation * 100) / 100,
              xLabel: numericColumns[j],
              yLabel: numericColumns[i]
            })
          }
        }

        console.log('Datos del heatmap:', heatmapData.length, 'celdas')

        if (heatmapData.length > 0) {
          configs.push({
            type: 'heatmap',
            title: 'Matriz de Correlación',
            description: `Mapa de calor de correlaciones entre ${numericColumns.length} variables numéricas`,
            data: heatmapData,
            colors: getColorPalette(colorScheme),
            category: 'correlaciones'
          })
          console.log('Heatmap agregado a configs')
        }
      } catch (error) {
        console.warn('Error al generar matriz de correlación:', error)
      }
    } else {
      console.log('No hay suficientes columnas numéricas para heatmap')
    }

    // 6. Histogramas para variables numéricas
    console.log('Intentando generar histogramas para:', numericColumns.slice(0, 2))
    numericColumns.slice(0, 2).forEach(col => {
      try {
        const histogramData = createHistogram(data, col)
        console.log(`Histograma para ${col}:`, histogramData.length, 'bins')
        
        if (histogramData && histogramData.length > 0) {
          configs.push({
            type: 'histogram',
            title: `Distribución de ${col}`,
            description: `Histograma de frecuencia para ${col} (${histogramData.length} bins)`,
            data: histogramData,
            colors: getColorPalette(colorScheme),
            category: 'distribucion'
          })
          console.log(`Histograma para ${col} agregado`)
        } else {
          console.log(`No se generaron datos para histograma de ${col}`)
        }
      } catch (error) {
        console.warn(`No se pudo crear histograma para ${col}:`, error)
      }
    })

    // 7. Boxplots para variables numéricas
    console.log('Intentando generar boxplots para:', numericColumns.slice(0, 2))
    numericColumns.slice(0, 2).forEach(col => {
      try {
        const boxplotData = createBoxplot(data, col)
        console.log(`Boxplot para ${col}:`, boxplotData ? boxplotData.length : 0, 'elementos')
        
        if (boxplotData && boxplotData.length > 0) {
          configs.push({
            type: 'boxplot',
            title: `Boxplot de ${col}`,
            description: `Análisis estadístico de ${col}`,
            data: boxplotData,
            colors: getColorPalette(colorScheme),
            category: 'estadistico'
          })
          console.log(`Boxplot para ${col} agregado`)
        } else {
          console.log(`No se generaron datos para boxplot de ${col}`)
        }
      } catch (error) {
        console.warn(`No se pudo crear boxplot para ${col}:`, error)
      }
    })

    console.log('Total de configs generados:', configs.length)
    console.log('Categorías generadas:', configs.map(c => ({ type: c.type, category: c.category })))

    return configs
  }, [data, colorScheme])

  // Filtrar gráficos por categoría
  const filteredCharts = useMemo(() => {
    if (selectedCategory === 'todas') {
      return chartConfigs
    }
    return chartConfigs.filter(chart => chart.category === selectedCategory)
  }, [chartConfigs, selectedCategory])

  // Actualizar el índice seleccionado cuando cambian los filtros
  React.useEffect(() => {
    if (filteredCharts.length > 0 && selectedChart >= filteredCharts.length) {
      setSelectedChart(0)
    }
  }, [filteredCharts, selectedChart])



  const renderChart = (config: ChartConfig) => {
    const { type, data, xKey, yKey, colors } = config

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yKey} fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yKey} stroke={colors[0]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        const trendLine = calculateTrendLine(data)
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name={xKey} type="number" domain={['auto', 'auto']} />
              <YAxis dataKey="y" name={yKey} type="number" domain={['auto', 'auto']} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Datos" data={data} fill={colors[0]} />
              {trendLine && (
                <Line 
                  data={trendLine}
                  type="monotone" 
                  dataKey="y" 
                  stroke={colors[1] || "#ef4444"} 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Tendencia"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )

      case 'heatmap':
        const uniqueLabels = [...new Set(data.map(d => d.xLabel))]
        
        return (
          <div className="w-full min-h-[350px] flex flex-col items-center justify-center p-4 bg-white rounded-lg">
            <div className="overflow-auto max-w-full pb-4">
                <div className="flex flex-col gap-1 min-w-max">
                  {/* Cabecera X */}
                  <div className="flex gap-1">
                    <div className="w-24 shrink-0"></div>
                    {uniqueLabels.map((label, i) => (
                      <div key={i} className="w-14 shrink-0 flex items-end justify-center pb-1 text-[10px] font-medium text-gray-500 text-center leading-tight">
                        {label.length > 10 ? label.substring(0, 8) + '..' : label}
                      </div>
                    ))}
                  </div>
                  
                  {/* Filas */}
                  {uniqueLabels.map((yLabel, y) => (
                    <div key={y} className="flex gap-1">
                      {/* Etiqueta Y */}
                      <div className="w-24 shrink-0 flex items-center justify-end pr-2 text-xs font-medium text-gray-500 text-right truncate">
                        {yLabel}
                      </div>
                      
                      {/* Celdas */}
                      {uniqueLabels.map((xLabel, x) => {
                        const cellData = data.find(d => d.xLabel === xLabel && d.yLabel === yLabel)
                        const correlation = cellData?.correlation || 0
                        const intensity = Math.abs(correlation)
                        
                        return (
                          <div
                            key={x}
                            className="w-14 h-14 shrink-0 flex items-center justify-center text-xs font-medium rounded-md transition-all hover:scale-110 hover:shadow-md cursor-pointer"
                            style={{
                              backgroundColor: correlation > 0 
                                ? `rgba(59, 130, 246, ${Math.max(0.05, intensity)})`
                                : correlation < 0
                                  ? `rgba(239, 68, 68, ${Math.max(0.05, intensity)})`
                                  : `rgba(156, 163, 175, 0.1)`,
                              color: intensity > 0.4 ? 'white' : '#374151',
                              border: correlation === 1 ? '1px solid rgba(59, 130, 246, 0.5)' : 'none'
                            }}
                            title={`${yLabel} vs ${xLabel}: ${correlation.toFixed(3)}`}
                          >
                            {intensity < 0.01 ? '0' : correlation.toFixed(2)}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Leyenda Mejorada */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-100"></div>
                  <span>Negativa (-1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></div>
                  <span>Neutra (0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-3 rounded-full bg-gradient-to-r from-blue-100 to-blue-500"></div>
                  <span>Positiva (+1)</span>
                </div>
              </div>
            </div>
        )

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill={colors[0]} name="Frecuencia" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'boxplot':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis type="number" domain={['auto', 'auto']} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 shadow-lg text-sm rounded-lg min-w-[150px]">
                        <p className="font-bold border-b border-gray-100 pb-2 mb-2 text-gray-800">{d.name}</p>
                        <div className="space-y-1">
                          <p className="flex justify-between"><span className="text-gray-500">Máximo:</span> <span className="font-medium">{d.whiskerMax.toFixed(2)}</span></p>
                          <p className="flex justify-between"><span className="text-gray-500">Q3:</span> <span className="font-medium">{d.q3.toFixed(2)}</span></p>
                          <p className="flex justify-between text-blue-600 font-medium"><span className="text-blue-500">Mediana:</span> <span>{d.median.toFixed(2)}</span></p>
                          <p className="flex justify-between"><span className="text-gray-500">Q1:</span> <span className="font-medium">{d.q1.toFixed(2)}</span></p>
                          <p className="flex justify-between"><span className="text-gray-500">Mínimo:</span> <span className="font-medium">{d.whiskerMin.toFixed(2)}</span></p>
                        </div>
                        {d.outliers && d.outliers.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
                            <span className="text-red-500 font-medium">{d.outliers.length} Outliers</span> detectados
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="boxRange" 
                shape={<BoxplotShape />} 
                fill={colors[0] || "#3b82f6"} 
                barSize={40} 
                name="Distribución" 
              />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return <div> Tipo de gráfico no soportado </div>
    }
  }

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChart3 className="w-4 h-4" />
      case 'line': return <LineChartIcon className="w-4 h-4" />
      case 'pie': return <PieChartIcon className="w-4 h-4" />
      case 'scatter': return <ScatterChartIcon className="w-4 h-4" />
      case 'heatmap': return <Grid3X3 className="w-4 h-4" />
      case 'histogram': return <Activity className="w-4 h-4" />
      case 'boxplot': return <BarChart3 className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  const getCategoryInfo = (category: string) => {
    const categories = {
      todas: { name: 'Todas', icon: <BarChart3 className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' },
      distribucion: { name: 'Distribución', icon: <PieChartIcon className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
      tendencias: { name: 'Tendencias', icon: <LineChartIcon className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
      correlaciones: { name: 'Correlaciones', icon: <ScatterChartIcon className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
      comparacion: { name: 'Comparación', icon: <BarChart3 className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700' },
      estadistico: { name: 'Estadístico', icon: <Activity className="w-4 h-4" />, color: 'bg-red-100 text-red-700' }
    }
    return categories[category as keyof typeof categories] || categories.todas
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hay datos disponibles para generar gráficos</p>
      </div>
    )
  }

  if (chartConfigs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No se pudieron generar gráficos con los datos actuales</p>
        <p className="text-sm mt-2">Intenta con datos que contengan valores numéricos o categóricos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Análisis Visual</h3>
          <p className="text-sm text-gray-600">{fileName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {filteredCharts.length} gráficos
          </span>
          <ChartCustomization
            onExportChart={handleExportChart}
            onRefreshData={handleRefreshData}
            onColorSchemeChange={handleColorSchemeChange}
            currentScheme={colorScheme}
            chartType={filteredCharts[selectedChart]?.type || 'bar'}
          />
        </div>
      </div>

      {/* Panel de Información de Depuración */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 Información de Datos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Filas:</span>
            <span className="ml-2 font-medium">{data?.length || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Columnas:</span>
            <span className="ml-2 font-medium">{data?.[0] ? Object.keys(data[0]).length : 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Numéricas:</span>
            <span className="ml-2 font-medium text-green-600">{debugInfo.numericColumns.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Categóricas:</span>
            <span className="ml-2 font-medium text-blue-600">{debugInfo.categoricalColumns.length}</span>
          </div>
        </div>
        {debugInfo.numericColumns.length > 0 && (
          <div className="mt-3">
            <span className="text-gray-600 text-sm">Columnas numéricas:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {debugInfo.numericColumns.map(col => (
                <span key={col} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}
        {debugInfo.categoricalColumns.length > 0 && (
          <div className="mt-3">
            <span className="text-gray-600 text-sm">Columnas categóricas:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {debugInfo.categoricalColumns.slice(0, 5).map(col => (
                <span key={col} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {col}
                </span>
              ))}
              {debugInfo.categoricalColumns.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{debugInfo.categoricalColumns.length - 5} más
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Información de gráficos generados */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">📈 Gráficos Generados</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-medium">{chartConfigs.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Correlaciones:</span>
              <span className="ml-2 font-medium text-purple-600">
                {chartConfigs.filter(c => c.category === 'correlaciones').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Distribución:</span>
              <span className="ml-2 font-medium text-orange-600">
                {chartConfigs.filter(c => c.category === 'distribucion').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Estadístico:</span>
              <span className="ml-2 font-medium text-red-600">
                {chartConfigs.filter(c => c.category === 'estadistico').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Tendencias:</span>
              <span className="ml-2 font-medium text-blue-600">
                {chartConfigs.filter(c => c.category === 'tendencias').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Comparación:</span>
              <span className="ml-2 font-medium text-green-600">
                {chartConfigs.filter(c => c.category === 'comparacion').length}
              </span>
            </div>
          </div>
        </div>
        
        {/* Alertas específicas */}
        {debugInfo.numericColumns.length < 2 && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
            ⚠️ Se necesitan al menos 2 columnas numéricas para generar mapas de correlación
          </div>
        )}
        
        {chartConfigs.length === 0 && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
            ❌ No se pudieron generar gráficos. Verifica que tus datos contengan valores numéricos válidos.
          </div>
        )}
        
        {debugInfo.numericColumns.length >= 2 && chartConfigs.filter(c => c.category === 'correlaciones').length === 0 && (
          <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded text-sm text-orange-800">
            🔍 Hay columnas numéricas pero no se generaron mapas de correlación. Revisa la consola para más detalles.
          </div>
        )}
      </div>

      {/* Navegación por categorías */}
      <div className="flex gap-2 flex-wrap">
        {['todas', 'distribucion', 'tendencias', 'correlaciones', 'comparacion', 'estadistico'].map(category => {
          const categoryInfo = getCategoryInfo(category)
          const count = category === 'todas' 
            ? chartConfigs.length 
            : chartConfigs.filter(chart => chart.category === category).length
          
          if (category !== 'todas' && count === 0) return null
          
          return (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category)
                setSelectedChart(0)
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? categoryInfo.color
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {categoryInfo.icon}
              <span>{categoryInfo.name}</span>
              <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selector de gráficos compacto */}
      {filteredCharts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filteredCharts.map((config, index) => (
            <button
              key={index}
              onClick={() => setSelectedChart(index)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedChart === index
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {getChartIcon(config.type)}
              <span className="truncate max-w-32">{config.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Gráfico principal */}
      {filteredCharts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-base font-semibold text-gray-900">
                {filteredCharts[selectedChart].title}
              </h4>
              <span className={`text-xs px-2 py-1 rounded ${getCategoryInfo(filteredCharts[selectedChart].category).color}`}>
                {getCategoryInfo(filteredCharts[selectedChart].category).name}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {filteredCharts[selectedChart].description}
            </p>
          </div>
          {renderChart(filteredCharts[selectedChart])}
        </div>
      )}

      {/* Insights reducidos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-900">Análisis Automático</h5>
            <p className="text-xs text-blue-800 mt-1">
              Se han generado {chartConfigs.length} visualizaciones organizadas por categorías para analizar patrones, tendencias y correlaciones en tus datos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}