'use client'

import { useState } from 'react'
import { Settings, Download, RefreshCw, Palette, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ChartCustomizationProps {
  onExportChart: () => void
  onRefreshData: () => void
  onColorSchemeChange: (scheme: string) => void
  currentScheme: string
  chartType: string
}

const COLOR_SCHEMES = {
  default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  warm: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#fbbf24', '#fcd34d'],
  cool: ['#3b82f6', '#06b6d4', '#14b8a6', '#10b981', '#22d3ee', '#67e8f9'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'],
  monochrome: ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6']
}

export default function ChartCustomization({ 
  onExportChart, 
  onRefreshData, 
  onColorSchemeChange, 
  currentScheme,
  chartType 
}: ChartCustomizationProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="relative">
      {/* Botón de configuración */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Personalizar
      </Button>

      {/* Panel de configuración */}
      {showSettings && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Personalizar Gráfico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Esquema de colores */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Esquema de Colores
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(COLOR_SCHEMES).map(([name, colors]) => (
                  <button
                    key={name}
                    onClick={() => onColorSchemeChange(name)}
                    className={`p-2 rounded border-2 transition-all ${
                      currentScheme === name 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={name}
                  >
                    <div className="flex space-x-1">
                      {colors.slice(0, 3).map((color, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs mt-1 capitalize block">{name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Acciones */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshData}
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar Datos
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onExportChart}
                className="w-full flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Gráfico
              </Button>
            </div>

            {/* Información del gráfico */}
            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Tipo:</span>
                <span className="text-gray-600 capitalize">{chartType}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}