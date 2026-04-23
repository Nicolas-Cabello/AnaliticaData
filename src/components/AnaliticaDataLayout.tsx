'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Upload, MessageSquare, BarChart3, FileText, Send, Bot, User, LogOut, FileSpreadsheet, Code, TrendingUp } from 'lucide-react'
import FileUploader from './FileUploader'
import DataPreview from './DataPreview'
import ChartVisualization from './ChartVisualization'
import AutoCharts from './AutoCharts'
import { useDataFileParser } from '@/hooks/useDataFileParser'
import { useChatAI } from '@/hooks/useChatAI'
import { useAuth } from '@/contexts/AuthContext'
import './chat-scrollbar.css'

export default function AnaliticaDataLayout() {
  const [activeSection, setActiveSection] = useState<'upload' | 'chat' | 'analysis'>('upload')
  const [inputMessage, setInputMessage] = useState('')
  const { dataFile, isProcessing, error, parseFile, clearData, getSampleForAI } = useDataFileParser()
  const { messages, isLoading, error: chatError, sendMessage, generateSummary, clearMessages } = useChatAI()
  const { user, logout } = useAuth()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = (file: File) => {
    parseFile(file)
    clearMessages()
    // Una vez procesado, cambiar a la sección de chat
    setTimeout(() => {
      setActiveSection('chat')
    }, 1000)
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !dataFile) return

    const dataSample = getSampleForAI()
    if (dataSample) {
      sendMessage(inputMessage, dataSample)
      setInputMessage('')
    }
  }

  const handleGenerateSummary = () => {
    if (!dataFile) return

    const dataSample = getSampleForAI()
    if (dataSample) {
      generateSummary(dataSample)
      setActiveSection('chat')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLogout = async () => {
    await logout()
    clearData()
    clearMessages()
  }

  const hasData = dataFile !== null

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">AnaliticaData</h1>
              {hasData && (
                <div className="flex items-center space-x-2 ml-4">
                  {dataFile.fileType === 'csv' && <FileText className="h-4 w-4 text-green-600" />}
                  {dataFile.fileType === 'json' && <Code className="h-4 w-4 text-blue-600" />}
                  {dataFile.fileType === 'xlsx' && <FileSpreadsheet className="h-4 w-4 text-orange-600" />}
                  <span className="text-sm text-muted-foreground">
                    {dataFile.fileName} ({dataFile.data.length} filas)
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              
              <button
                onClick={() => setActiveSection('upload')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'upload' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>Subir Archivo</span>
              </button>
              <button
                onClick={() => setActiveSection('chat')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'chat' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                } ${!hasData ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!hasData}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setActiveSection('analysis')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'analysis' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                } ${!hasData ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!hasData}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Gráficos</span>
              </button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area */}
          <div className="lg:col-span-2">
            {activeSection === 'upload' && (
              <div className="space-y-6">
                <FileUploader 
                  onFileUpload={handleFileUpload} 
                  isProcessing={isProcessing}
                />
                
                {error && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <p className="text-red-600 text-sm">{error}</p>
                    </CardContent>
                  </Card>
                )}

                {isProcessing && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Procesando archivo...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeSection === 'chat' && (
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Chat con tus Datos</span>
                    </div>
                    {messages.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearMessages}
                      >
                        Limpiar Chat
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 mb-4 border rounded-lg bg-muted/50 overflow-y-auto chat-scrollbar" ref={scrollAreaRef} style={{ maxHeight: '400px' }}>
                    <div className="space-y-4 p-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="mb-2">¡Hola! Soy tu asistente de análisis de datos.</p>
                          <p className="text-sm">Puedes preguntarme sobre:</p>
                          <ul className="text-sm mt-2 space-y-1">
                            <li>• Tendencias y patrones en tus datos</li>
                            <li>• Resúmenes estadísticos</li>
                            <li>• Relaciones entre columnas</li>
                            <li>• Insights específicos</li>
                          </ul>
                        </div>
                      ) : (
                        <>
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                                  message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  {message.role === 'user' ? (
                                    <User className="h-4 w-4" />
                                  ) : (
                                    <Bot className="h-4 w-4" />
                                  )}
                                  <span className="text-xs opacity-70">
                                    {message.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {isLoading && (
                            <div className="flex justify-start mb-4">
                              <div className="bg-muted rounded-lg p-3 shadow-sm">
                                <div className="flex items-center space-x-2">
                                  <Bot className="h-4 w-4" />
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                  <span className="text-sm text-muted-foreground">Analizando...</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {chatError && (
                            <div className="flex justify-start mb-4">
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
                                <p className="text-sm text-red-600">{chatError}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Espacio adicional para asegurar que el último mensaje sea visible */}
                      <div className="h-4"></div>
                    </div>
                  </div>
                  
                  {/* Renderizar gráficos del último mensaje si existen */}
                  {messages.length > 0 && messages[messages.length - 1].chartData && (
                    <ChartVisualization 
                      chartData={messages[messages.length - 1].chartData!} 
                    />
                  )}

                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={hasData ? "Pregunta algo sobre tus datos..." : "Sube un archivo primero"}
                      disabled={!hasData || isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!hasData || isLoading || !inputMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'analysis' && (
              <div className="space-y-6">
                <AutoCharts 
                  data={dataFile?.data || []} 
                  fileName={dataFile?.fileName || 'archivo'}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Data Preview */}
            <DataPreview 
              data={dataFile?.data || []}
              columns={dataFile?.columns || []}
              fileName={dataFile?.fileName}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button 
                  className="w-full px-3 py-2 text-left text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50" 
                  disabled={!hasData || isLoading}
                  onClick={handleGenerateSummary}
                >
                  📊 Generar Resumen Ejecutivo
                </button>
                <button 
                  className="w-full px-3 py-2 text-left text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50" 
                  disabled={!hasData}
                >
                  📈 Ver Tendencias
                </button>
                <button 
                  className="w-full px-3 py-2 text-left text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50" 
                  disabled={!hasData}
                >
                  🔍 Análisis Detallado
                </button>
                {hasData && (
                  <button 
                    className="w-full px-3 py-2 text-left text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    onClick={() => {
                      clearData()
                      clearMessages()
                      setActiveSection('upload')
                    }}
                  >
                    🗑️ Limpiar Datos
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}