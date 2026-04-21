import { GoogleGenerativeAI } from '@google/generative-ai'

// Tu API key
const API_KEY = 'AIzaSyA5UEsLfyhqHyQuoB1K_3wt5EsvGf09LWg'

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    
    // Para listar modelos, necesitamos hacer una llamada directa a la API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`)
    const data = await response.json()
    
    console.log('Modelos disponibles:')
    if (data.models) {
      data.models.forEach(model => {
        console.log(`- ${model.name} (displayName: ${model.displayName})`)
        console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`)
        console.log('')
      })
    } else {
      console.log('No se encontraron modelos o error:', data)
    }
  } catch (error) {
    console.error('Error al listar modelos:', error)
  }
}

listModels()