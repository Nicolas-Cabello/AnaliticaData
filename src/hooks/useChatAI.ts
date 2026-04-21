'use client'

import { useState, useCallback } from 'react'
import { geminiService } from '@/services/gemini'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  chartData?: {
    type: 'bar' | 'line' | 'pie'
    data: any[]
    xAxis?: string
    yAxis?: string
  }
}

export function useChatAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (userMessage: string, dataSample: any) => {
    if (!userMessage.trim() || !dataSample) return

    setIsLoading(true)
    setError(null)

    // Agregar mensaje del usuario
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])

    try {
      // Enviar a Gemini
      const response = await geminiService.analyzeData(userMessage, dataSample)
      
      // Agregar respuesta del asistente
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        chartData: response.chartData
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      
      // Agregar mensaje de error
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Lo siento, ha ocurrido un error: ${errorMessage}`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateSummary = useCallback(async (dataSample: any) => {
    if (!dataSample) return

    setIsLoading(true)
    setError(null)

    try {
      const summary = await geminiService.generateExecutiveSummary(dataSample)
      
      const summaryMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: summary,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, summaryMsg])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    generateSummary,
    clearMessages
  }
}