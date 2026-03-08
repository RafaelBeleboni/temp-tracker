import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🌡️</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MediTemp</span>
            </div>
            <Link 
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Entrar no Sistema
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <span className="text-4xl">🏥</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Monitoramento de Temperatura para
              <span className="text-blue-600"> Medicamentos</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Sistema profissional para controle rigoroso da temperatura de geladeiras 
              medicamentos. Garanta a segurança e eficácia dos seus medicamentos com 
              monitoramento 24/7 e alertas inteligentes.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚀 Acessar Sistema
            </Link>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors">
              📊 Ver Demonstração
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Monitoramento em Tempo Real</h3>
            <p className="text-gray-600">
              Acompanhe a temperatura das geladeiras em tempo real com gráficos interativos 
              e atualizações automáticas a cada 01 minuto.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🚨</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Alertas Inteligentes</h3>
            <p className="text-gray-600">
              Receba notificações automáticas quando a temperatura sair da faixa segura 
              (2°C - 8°C) com alarmes visuais e sonoros.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Relatórios Detalhados</h3>
            <p className="text-gray-600">
              Gere relatórios completos com histórico de temperaturas, tempo fora da faixa 
              e estatísticas para auditorias e compliance.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Acesso Seguro</h3>
            <p className="text-gray-600">
              Sistema protegido com login de usuário, controle de acesso e dados 
              criptografados para garantir a confidencialidade das informações.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Interface Responsiva</h3>
            <p className="text-gray-600">
              Acesse o sistema de qualquer dispositivo - desktop, tablet ou smartphone 
              com interface adaptativa e moderna.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Filtros Avançados</h3>
            <p className="text-gray-600">
              Analise dados por períodos específicos, identifique padrões e tome 
              decisões baseadas em histórico detalhado.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-12 text-white text-center mb-20">
          <h2 className="text-3xl font-bold mb-8">Por que o Monitoramento é Essencial?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">2°C - 8°C</div>
              <p className="text-blue-100">Faixa segura para medicamentos</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">Monitoramento contínuo</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-blue-100">Compliance regulatório</p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para garantir a segurança dos seus medicamentos?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comece agora mesmo a monitorar suas geladeiras de forma profissional 
            e esteja em conformidade com as normas de segurança.
          </p>
          <Link 
            href="/login"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
          >
            🏥 Acessar Sistema de Monitoramento
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">🌡️</span>
              </div>
              <span className="text-lg font-bold">MediTemp</span>
            </div>
            <p className="text-gray-400 mb-4">
              Sistema de Monitoramento de Temperatura para Medicamentos
            </p>
            <p className="text-gray-500 text-sm">
              © 2026 MediTemp. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
