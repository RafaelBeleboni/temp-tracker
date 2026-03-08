"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function Login() {
  // ESTADO: Guarda os dados do formulário (email e senha)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  // ESTADOS DE UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // FUNÇÃO: Chamada sempre que usuário digita algo nos inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Limpa erro quando usuário começa a digitar
    if (error) setError('')
  }

  // FUNÇÃO: Chamada quando usuário clica no botão "Entrar"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setError('')
    
    try {
      // Usar NextAuth.js signIn
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false // Não redirecionar automaticamente
      })
      
      // Melhorar tratamento de erros
      if (result?.error) {
        setError('Email ou senha incorretos')
      } else if (result?.ok) {
        // Sucesso - redirecionar manualmente
        window.location.href = '/dashboard'
      } else {
        // Caso não seja ok nem error (fallback)
        setError('Ocorreu um erro inesperado. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro no signIn:', error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-transparent to-emerald-400/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239CA3AF' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">🌡️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao <span className="text-blue-600">MediTemp</span>
          </h1>
          <p className="text-gray-600">
            Faça login para acessar o sistema de monitoramento
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-8">
          {/* Título do Card */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Acessar Sistema</h2>
            <p className="text-gray-600 mt-2">Digite suas credenciais abaixo</p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">📧</span>
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          
            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔒</span>
                </div>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botão de Submit */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🚀 Entrar no Sistema
                </span>
              )}
            </button>
          </form>

          {/* Links Úteis */}

        </div>

        {/* Link para Voltar */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>←</span>
            Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
