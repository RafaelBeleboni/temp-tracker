"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface AdminClientProps {
  session: any
}

export default function AdminClient({ session }: AdminClientProps) {
  const [token, setToken] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const generateToken = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/generate-token', {
        method: 'POST'
      })
      const data = await res.json()
      setToken(data.token)
    } catch (error) {
      console.error('Erro ao gerar token:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToken = () => {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                🔐 Painel Administrativo
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                MediTemp - Gerenciamento de Tokens
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Logado como: {session.user?.email}
              </p>
            </div>
            <button
              onClick={goToDashboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              📊 Ir para Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gerar Token */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl text-blue-600">🔑</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Gerar Token</h2>
                <p className="text-sm text-slate-600">Crie tokens para seus ESP32</p>
              </div>
            </div>

            <button
              onClick={generateToken}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8 8 8 0 01-8 8 8 0 018 8 8 0 014.586l4.293 4.293a4 4 0 015.657 0-6-1.657-11.314 11.314 0 016-1.657-6-6-1.657-11.314 11.314 0 016 1.657 6 6 1.657 11.314 11.314 0 01-1.657 6-6 1.657-11.314 11.314 0 011.314-4.686-4.686-4.686-11.314 0-014.586-4.686-4.686-11.314" />
                  </svg>
                  Gerando Token...
                </span>
              ) : (
                '🔑 Gerar Novo Token'
              )}
            </button>

            <div className="mt-4 text-xs text-slate-500">
              <p>⚠️ Cada token é válido por 10 anos</p>
              <p>📱 Copie e cole no código do ESP32</p>
            </div>
          </div>

          {/* Token Gerado */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xl text-green-600">🔐</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Token Atual</h2>
                <p className="text-sm text-slate-600">Token para configuração do ESP32</p>
              </div>
            </div>

            {token ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    🔑 Seu Token ESP32:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={token}
                      readOnly
                      className="flex-1 p-3 border border-yellow-300 rounded-lg font-mono text-sm bg-white"
                      placeholder="Token aparecerá aqui..."
                    />
                    <button
                      onClick={copyToken}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      {copied ? '✅ Copiado!' : '📋 Copiar'}
                    </button>
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    {copied ? '✅ Token copiado com sucesso!' : 'Clique para copiar o token'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">📅 Validade:</p>
                    <p>10 anos</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium mb-1">🔒 Tipo:</p>
                    <p>Hardware ESP32</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-slate-400">🔐</span>
                </div>
                <p className="text-slate-500">
                  Nenhum token gerado ainda
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Clique em "Gerar Novo Token" para criar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">📋 Como Usar no ESP32</h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-medium">1️⃣</span>
              <p>Copie o token gerado acima</p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-medium">2️⃣</span>
              <p>Cole no código do ESP32 na variável AUTH_TOKEN</p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-medium">3️⃣</span>
              <p>Compile e faça o upload no ESP32</p>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-medium">4️⃣</span>
              <p>O ESP32 enviará dados automaticamente a cada 1 minuto</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">
              📄 Exemplo de Código ESP32:
            </p>
            <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
{`const char* AUTH_TOKEN = "SEU_TOKEN_AQUI";

http.addHeader("Authorization", "Bearer " + String(AUTH_TOKEN));`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
