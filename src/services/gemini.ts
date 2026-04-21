import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

interface DataSample {
  columns: string[]
  data: any[]
  totalRows: number
}

interface ChatResponse {
  text: string
  chartData?: {
    type: 'bar' | 'line' | 'pie'
    data: any[]
    xAxis?: string
    yAxis?: string
  }
}

export class GeminiService {
  private model: any

  constructor() {
    // Usamos un modelo más estable como principal
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  }

  // Método de respaldo si el principal falla
  private async tryWithFallbackModel(prompt: string): Promise<any> {
    const models = ['gemini-2.0-flash', 'gemini-pro-latest', 'gemini-flash-latest']
    
    for (const modelName of models) {
      try {
        console.log(`Intentando con modelo: ${modelName}`)
        const fallbackModel = genAI.getGenerativeModel({ model: modelName })
        const result = await fallbackModel.generateContent(prompt)
        const response = await result.response
        return response.text()
      } catch (error) {
        console.log(`Error con ${modelName}:`, error)
        continue
      }
    }
    throw new Error('Todos los modelos fallaron. Por favor, inténtalo más tarde.')
  }

  async analyzeData(userQuery: string, dataSample: DataSample): Promise<ChatResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(dataSample)
      const fullPrompt = `${systemPrompt}\n\nUsuario pregunta: ${userQuery}`

      let text: string
      
      try {
        // Intentar primero con el modelo principal
        const result = await this.model.generateContent(fullPrompt)
        const response = await result.response
        text = response.text()
      } catch (error) {
        console.log('Modelo principal falló, usando fallback:', error)
        // Usar sistema de respaldo
        text = await this.tryWithFallbackModel(fullPrompt)
      }

      // Intentar extraer datos para visualización
      const chartData = this.extractChartData(text)

      return {
        text,
        chartData
      }
    } catch (error) {
      console.error('Error en Gemini API:', error)
      throw new Error('No se pudo procesar tu consulta. Los servidores de IA están experimentando alta demanda. Por favor, inténtalo de nuevo en unos momentos.')
    }
  }

  async generateExecutiveSummary(dataSample: DataSample): Promise<string> {
    try {
      const prompt = `
Analiza el siguiente conjunto de datos y genera un resumen ejecutivo completo:

DATOS:
- Columnas: ${dataSample.columns.join(', ')}
- Total de filas: ${dataSample.totalRows}
- Muestra de datos:
${this.formatDataForPrompt(dataSample.data, dataSample.columns)}

Genera un resumen ejecutivo que incluya:
1. **Descripción General**: ¿Qué tipo de datos son y qué representan?
2. **Estadísticas Clave**: Métricas importantes, promedios, rangos
3. **Tendencias Principales**: Patrones o tendencias evidentes
4. **Insights Destacados**: Hallazgos más importantes
5. **Recomendaciones**: Sugerencias basadas en los datos

Usa formato markdown con negritas para cifras clave y emojis para cada sección.
Responde de forma ejecutiva y concisa.
      `

      let text: string
      
      try {
        // Intentar primero con el modelo principal
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        text = response.text()
      } catch (error) {
        console.log('Modelo principal falló en resumen, usando fallback:', error)
        // Usar sistema de respaldo
        text = await this.tryWithFallbackModel(prompt)
      }

      return text
    } catch (error) {
      console.error('Error generando resumen ejecutivo:', error)
      throw new Error('No se pudo generar el resumen ejecutivo. Los servidores de IA están experimentando alta demanda. Por favor, inténtalo de nuevo en unos momentos.')
    }
  }

  private buildSystemPrompt(dataSample: DataSample): string {
    return `
Eres un analista de datos experto con acceso al siguiente conjunto de datos:

INFORMACIÓN DEL DATASET:
- Columnas disponibles: ${dataSample.columns.join(', ')}
- Total de filas: ${dataSample.totalRows}
- Muestra representativa de datos:
${this.formatDataForPrompt(dataSample.data, dataSample.columns)}

INSTRUCCIONES:
1. Responde de forma ejecutiva y profesional
2. Usa **negritas** para cifras y métricas clave
3. Detecta automáticamente tendencias y patrones
4. Si hay datos numéricos, proporciona estadísticas básicas
5. Si identificas relaciones entre columnas, menciónalas
6. Sé conciso pero completo
7. Usa emojis cuando sea apropiado para hacer la respuesta más amigable

REGLAS IMPORTANTES:
- Solo responde sobre los datos proporcionados
- Si no hay suficiente información para responder, indícalo claramente
- No inventes datos ni suposiciones
- Si pides gráficos, estructura los datos de forma que puedan ser visualizados
    `
  }

  private formatDataForPrompt(data: any[], columns: string[]): string {
    if (data.length === 0) return 'No hay datos disponibles'

    const header = columns.join(' | ')
    const rows = data.slice(0, 10).map(row => 
      columns.map(col => row[col] || 'N/A').join(' | ')
    ).join('\n')

    return `${header}\n${rows}${data.length > 10 ? '\n... (mostrando primeras 10 filas)' : ''}`
  }

  private extractChartData(text: string): ChatResponse['chartData'] {
    // Buscar patrones de datos estructurados en la respuesta
    // Esto es una implementación básica que puede mejorarse
    
    const chartPatterns = [
      // Patrones para datos de barras/líneas
      /(\w+):\s*(\d+(?:\.\d+)?)/g,
      // Patrones para datos tabulares
      /\|\s*(\w+)\s*\|\s*(\d+(?:\.\d+)?)\s*\|/g
    ]

    for (const pattern of chartPatterns) {
      const matches = Array.from(text.matchAll(pattern))
      if (matches.length >= 2) {
        const data = matches.map(match => ({
          name: match[1],
          value: parseFloat(match[2])
        }))

        return {
          type: 'bar',
          data,
          xAxis: 'name',
          yAxis: 'value'
        }
      }
    }

    return undefined
  }
}

export const geminiService = new GeminiService()