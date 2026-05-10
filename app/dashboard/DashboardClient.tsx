"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"

type Temp = {
  id: number
  temperatura: number
  createdAt: string
}

const LIMITE_MIN = 2
const LIMITE_MAX = 8

interface DashboardClientProps {
  session: any
}

export function DashboardClient({ session }: DashboardClientProps) {
  const [data, setData] = useState<Temp[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [alarmEnabled, setAlarmEnabled] = useState(false)
  const [filterType, setFilterType] = useState<"24h" | "7d" | "30d" | "custom">("24h")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const alarmRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()

  // 🔁 Polling a cada 30 segundos (mais frequente para ANVISA)
  useEffect(() => {
    const fetchData = async () => {
      let url = "/api/temperaturas"

      // Aplicar filtros baseados no tipo
      const now = new Date()
      let filterStart = ""
      let filterEnd = ""

      switch (filterType) {
        case "24h":
          filterStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
          filterEnd = now.toISOString()
          break
        case "7d":
          filterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
          filterEnd = now.toISOString()
          break
        case "30d":
          filterStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
          filterEnd = now.toISOString()
          break
        case "custom":
          filterStart = startDate
          filterEnd = endDate
          break
      }

      if (filterStart && filterEnd) {
        url += `?start=${filterStart}&end=${filterEnd}`
      }

      const res = await fetch(url)
      const json = await res.json()

      setData(json)
      setLoading(false)
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // 30 segundos
    return () => clearInterval(interval)
  }, [filterType, startDate, endDate])

  // 📊 Cálculos para ANVISA
  const stats = useMemo(() => {
    if (data.length === 0) return {
      current: null,
      min: null,
      max: null,
      avg: null,
      outOfRange: false,
      tempoForaFaixa: "0.00"
    }

    const temperaturas = data.map(d => d.temperatura)
    const current = temperaturas.at(-1)
    const min = Math.min(...temperaturas)
    const max = Math.max(...temperaturas)
    const avg = temperaturas.reduce((a, b) => a + b, 0) / temperaturas.length
    const outOfRange = current !== undefined && (current < LIMITE_MIN || current > LIMITE_MAX)

    // 🧠 Tempo fora da faixa (método melhorado)
    let totalForaFaixa = 0
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1]
      const curr = data[i]

      if (
        prev.temperatura < LIMITE_MIN ||
        prev.temperatura > LIMITE_MAX
      ) {
        const diff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime()
        totalForaFaixa += diff
      }
    }

    return {
      current,
      min,
      max,
      avg,
      outOfRange,
      tempoForaFaixa: (totalForaFaixa / 1000 / 60).toFixed(2)
    }
  }, [data])

  // 🔔 Alarme sonoro
  useEffect(() => {
    if (stats.outOfRange && alarmEnabled && alarmRef.current) {
      alarmRef.current.play().catch(e => console.log('Alarme bloqueado:', e))
    }
  }, [stats.outOfRange, alarmEnabled])

  // 🚪 Função de Logout
  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.href = "/"
  }

  // 🎵 Habilitar alarme
  const enableAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.play().then(() => {
        alarmRef.current?.pause()
        setAlarmEnabled(true)
      }).catch(e => console.log('Erro ao habilitar alarme:', e))
    }
  }

  // 📅 Formatar data/hora para padrão brasileiro
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Monitoramento ANVISA - Medicamentos
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Faixa segura: {LIMITE_MIN}°C a {LIMITE_MAX}°C | Sensor: ONLINE | Última leitura: há 30s
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                👤 {session?.user?.email || "Usuário"}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAlarmEnabled(!alarmEnabled)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    alarmEnabled 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {alarmEnabled ? '🔔 Alarme Ativado' : '🔕 Ativar Alarme'}
                </button>
                <button
                  onClick={() => router.push('/admin')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  🔐 Admin
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  🚪 Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {stats.outOfRange && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">⚠️ EXCURSÃO DE TEMPERATURA - FORA DA FAIXA ANVISA!</span>
              <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
                Tempo: {stats.tempoForaFaixa} min
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 📊 Cards de Monitoramento Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-2">Temperatura Atual</p>
              <p className={`text-3xl font-bold mb-2 ${
                stats.outOfRange ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {stats.current !== null && stats.current !== undefined ? `${stats.current.toFixed(1)}°C` : "--"}
              </p>
              <p className="text-xs text-slate-500">
                {stats.current !== null && stats.current !== undefined && stats.current < LIMITE_MIN ? "❄️ Risco de congelamento" : ""}
                {stats.current !== null && stats.current !== undefined && stats.current > LIMITE_MAX ? "🌡️ Risco de aquecimento" : ""}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-2">Temperatura Mínima</p>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {stats.min !== null ? `${stats.min.toFixed(1)}°C` : "--"}
              </p>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm text-blue-600">❄️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-2">Temperatura Máxima</p>
              <p className="text-3xl font-bold text-orange-600 mb-2">
                {stats.max !== null ? `${stats.max.toFixed(1)}°C` : "--"}
              </p>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-sm text-orange-600">🌡️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-2">Temperatura Média</p>
              <p className="text-3xl font-bold text-slate-900 mb-2">
                {stats.avg !== null ? `${stats.avg.toFixed(1)}°C` : "--"}
              </p>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-sm text-slate-600">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-slate-600 mb-2">Tempo Fora da Faixa</p>
              <p className="text-3xl font-bold text-red-600 mb-2">
                {stats.tempoForaFaixa} min
              </p>
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-sm text-red-600">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        {/* 📈 Gráfico e Filtros */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Gráfico - 3 colunas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-900">📈 Gráfico de Temperatura</h2>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span>Temperatura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span>Limite ANVISA</span>
                  </div>
                </div>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="createdAt" 
                      tickFormatter={(value) => {
                        if (typeof value === 'string') {
                          return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        }
                        return new Date(value as number).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      yAxisId="left"
                      domain={[-2, 12]}
                      stroke="#64748b"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => {
                        if (typeof value === 'string') {
                          return formatDateTime(value)
                        }
                        return formatDateTime(value as string)
                      }}
                      formatter={(value: any, name?: any) => {
                        if (name === 'Temperatura') {
                          return [`${value}°C`, 'Temperatura']
                        }
                        return [`${value}°C`, name || '']
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="temperatura"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Temperatura"
                    />

                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey={() => LIMITE_MAX}
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Limite Máximo ANVISA"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey={() => LIMITE_MIN}
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Limite Mínimo ANVISA"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filtros - 1 coluna */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">⚙️ Filtros Rápidos</h2>
              
              <div className="space-y-4">
                {/* Filtros Principais */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setFilterType("24h")
                      setShowAdvanced(false)
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === "24h" 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🕐 24h
                  </button>
                  <button
                    onClick={() => {
                      setFilterType("7d")
                      setShowAdvanced(false)
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === "7d" 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📅 7 dias
                  </button>
                  <button
                    onClick={() => {
                      setFilterType("30d")
                      setShowAdvanced(false)
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === "30d" 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📆 30 dias
                  </button>
                  <button
                    onClick={() => {
                      if (filterType === "custom") {
                        setShowAdvanced(!showAdvanced)
                      } else {
                        setFilterType("custom")
                        setShowAdvanced(true)
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === "custom" 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🎯 Personalizado
                  </button>
                </div>

                {/* Filtro Avançado */}
                {showAdvanced && (
                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Data Inicial</label>
                      <input 
                        type="datetime-local"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Data Final</label>
                      <input 
                        type="datetime-local"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="space-y-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      let url = "/api/relatorio"
                      
                      // Aplicar filtros ao relatório
                      const now = new Date()
                      let filterStart = ""
                      let filterEnd = ""

                      switch (filterType) {
                        case "24h":
                          filterStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
                          filterEnd = now.toISOString()
                          break
                        case "7d":
                          filterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
                          filterEnd = now.toISOString()
                          break
                        case "30d":
                          filterStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
                          filterEnd = now.toISOString()
                          break
                        case "custom":
                          filterStart = startDate
                          filterEnd = endDate
                          break
                      }

                      if (filterStart && filterEnd) {
                        url += `?start=${filterStart}&end=${filterEnd}`
                      }
                      
                      window.open(url)
                    }}
                    className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm text-sm"
                  >
                    📄 Relatório ANVISA
                  </button>
                </div>

                {/* 📋 Info ANVISA */}
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">📋 Faixa ANVISA</h3>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex justify-between">
                      <span>Mínimo seguro:</span>
                      <span className="font-bold">{LIMITE_MIN}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Máximo seguro:</span>
                      <span className="font-bold">{LIMITE_MAX}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risco de congelamento:</span>
                      <span className="font-bold text-red-600">&lt; {LIMITE_MIN}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risco de aquecimento:</span>
                      <span className="font-bold text-red-600">&gt; {LIMITE_MAX}°C</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio ref={alarmRef} src="/alarm.mp3" />
    </div>
  )
}
