'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BarChart3, Eye, EyeOff, Mail, User, Lock, Sparkles, ShieldCheck, ChevronRight, LayoutDashboard, BrainCircuit, Rocket, Database } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthFormProps {
  onSuccess?: () => void
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const { login, register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Form states
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const result = await login(loginUsername, loginPassword)
    if (result.success) onSuccess?.()
    else setError(result.error || 'Error en el login')
    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (registerPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    const result = await register(registerUsername, registerEmail, registerPassword)
    if (result.success) onSuccess?.()
    else setError(result.error || 'Error en el registro')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo con malla de puntos suave */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-20" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-[120px] opacity-20" />

      <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* PANEL IZQUIERDO - BRANDING & VALUE PROP (Ocupa 5/12) */}
        <div className="lg:col-span-5 space-y-8 pr-0 lg:pr-6 hidden lg:block animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl text-[11px] font-black border border-blue-100/50 shadow-sm uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plataforma Next-Gen</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Tus datos, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">inteligencia pura.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm">
                Convierte archivos complejos en decisiones claras con nuestra IA especializada en análisis de datos.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { 
                icon: BrainCircuit, 
                title: "IA Predictiva", 
                desc: "Identifica patrones y anomalías automáticamente en tus CSV o Excel.",
                color: "bg-blue-500" 
              },
              { 
                icon: Rocket, 
                title: "Velocidad Extrema", 
                desc: "Procesa millones de registros en segundos sin perder precisión.",
                color: "bg-indigo-500" 
              },
              { 
                icon: ShieldCheck, 
                title: "Privacidad Total", 
                desc: "Tus datos están protegidos bajo protocolos de seguridad militar.",
                color: "bg-emerald-500" 
              }
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md hover:bg-white group">
                <div className={`mt-1 p-2.5 ${item.color} rounded-xl shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm tracking-tight">{item.title}</h3>
                  <p className="text-xs text-slate-500 font-bold leading-normal mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-4 pt-4 px-2 opacity-60">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(n => (
                <div key={n} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200" />
              ))}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              +500 analistas ya confían en nosotros
            </p>
          </div>
        </div>

        {/* PANEL DERECHO - EL FORMULARIO (Ocupa 7/12) */}
        <div className="lg:col-span-7 flex justify-center lg:justify-start w-full animate-in fade-in slide-in-from-right-8 duration-700">
          <Card className="w-full max-w-[420px] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden bg-white">
            <div className="p-6 sm:p-10">
              {/* SECCIÓN BIENVENIDA */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-100">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  ¡Hola de nuevo!
                </h2>
                <p className="text-slate-400 font-bold mt-1 text-sm">
                  Accede a tu centro de mando
                </p>
              </div>

              {/* SELECTOR DE ACCIÓN */}
              <Tabs defaultValue="login" className="flex flex-col w-full" orientation="horizontal">
                <TabsList className="grid grid-cols-2 w-full bg-slate-50 p-1 rounded-[1rem] mb-8 border border-slate-100 h-auto gap-1">
                  <TabsTrigger 
                    value="login" 
                    className="py-3 px-2 rounded-[0.75rem] font-black text-slate-400 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all uppercase text-[10px] tracking-widest"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="py-3 px-2 rounded-[0.75rem] font-black text-slate-400 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all uppercase text-[10px] tracking-widest"
                  >
                    Registrarse
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert className="mb-6 border-red-100 bg-red-50 rounded-2xl p-4">
                    <AlertDescription className="text-red-600 font-black flex items-center text-xs uppercase tracking-tighter">
                      <span className="bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] mr-3 shadow-md shadow-red-100">!</span>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* LOGIN */}
                <TabsContent value="login" className="mt-0 outline-none">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2.5">
                      <Label htmlFor="login-username" className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">
                        Usuario de acceso
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="login-username"
                          type="text"
                          placeholder="nombre_usuario"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          className="pl-11 h-14 bg-slate-50/50 border-slate-200 rounded-[1.25rem] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-sm transition-all font-bold text-slate-900 text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="login-password" className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">
                        Contraseña segura
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-11 pr-11 h-14 bg-slate-50/50 border-slate-200 rounded-[1.25rem] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-sm transition-all font-bold text-slate-900 text-sm"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-[1.25rem] shadow-xl shadow-blue-100 transition-all active:scale-[0.98] group mt-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white" />
                      ) : (
                        <span className="flex items-center justify-center tracking-widest">
                          ENTRAR AHORA <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* REGISTER */}
                <TabsContent value="register" className="mt-0 outline-none">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">
                        Usuario
                      </Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Crea tu usuario"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-xs"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">
                        Contraseña
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest">
                        Confirmar
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 transition-all font-bold text-xs"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg transition-all mt-4 tracking-widest"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                      ) : (
                        'CREAR MI CUENTA GRATIS'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">
                Seguridad de grado bancario activa
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}