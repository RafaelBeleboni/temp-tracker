# 🏥 MediTemp - Sistema de Monitoramento de Temperatura

Sistema profissional para monitoramento de temperatura de medicamentos em conformidade com as normas ANVISA, desenvolvido com tecnologia moderna e escalável.

## 🎯 Visão Geral

O MediTemp é uma solução completa para monitoramento contínuo de temperatura, ideal para farmácias, laboratórios, clínicas e hospitais que precisam manter medicamentos em condições ideais de armazenamento.

### ✨ Funcionalidades Principais

- 📊 **Dashboard em Tempo Real**: Monitoramento contínuo com gráficos interativos
- 🌡️ **Alertas Inteligentes**: Notificações automáticas para temperaturas fora da faixa segura (2°C - 8°C)
- 📱 **Dispositivos ESP32**: Integração com sensores IoT para coleta automatizada
- 🔐 **Autenticação Segura**: Sistema de login com tokens JWT para dispositivos
- 📄 **Relatórios ANVISA**: Geração de relatórios em PDF para auditoria
- 🗑️ **Gestão de Dados**: Limpeza e manutenção do banco de dados
- 📈 **Análise Estatística**: Estatísticas detalhadas e tendências

## 🛠️ Stack de Tecnologia

### Frontend
- **Next.js 16.1.6** - Framework React com App Router
- **TypeScript** - Tipagem segura e desenvolvimento robusto
- **Tailwind CSS** - Framework CSS para design moderno
- **Recharts** - Biblioteca para gráficos interativos
- **Lucide React** - Ícones modernos e consistentes

### Backend
- **Next.js API Routes** - Rotas de API serverless
- **Prisma ORM** - Mapeamento objeto-relacional
- **SQLite** - Banco de dados leve e eficiente
- **NextAuth.js** - Autenticação completa com JWT

### Hardware Integration
- **ESP32** - Microcontrolador para sensores IoT
- **JWT Tokens** - Autenticação segura para dispositivos
- **RESTful API** - Comunicação padronizada

### Relatórios
- **jsPDF** - Geração de PDFs no cliente
- **jspdf-autotable** - Tabelas profissionais em PDF

## 🏗️ Arquitetura

```
├── app/
│   ├── api/                    # Rotas da API
│   │   ├── temperatures/       # CRUD de temperaturas
│   │   ├── admin/            # Funções administrativas
│   │   └── auth/            # Autenticação NextAuth
│   ├── dashboard/             # Dashboard principal
│   ├── admin/                # Painel administrativo
│   └── login/                # Página de login
├── lib/
│   ├── auth.ts               # Configuração NextAuth
│   └── prisma.ts            # Cliente Prisma
├── prisma/
│   ├── schema.prisma         # Modelo de dados
│   └── migrations/           # Migrações do banco
└── public/                  # Arquivos estáticos
```

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Git para controle de versão

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd temp-tracker
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

5. **Execute o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
```

6. **Acesse a aplicação**
```
http://localhost:3000
```

## 📱 Configuração do ESP32

### 1. Gerar Token de Acesso

1. Acesse `http://localhost:3000/admin`
2. Faça login com credenciais de administrador
3. Clique em "🔑 Gerar Novo Token"
4. Copie o token gerado

### 2. Código Exemplo para ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Configurações
#define WIFI_SSID "SUA_REDE_WIFI"
#define WIFI_PASSWORD "SUA_SENHA_WIFI"
#define SERVER_URL "http://SEU_IP:3000/api/temperaturas"
#define AUTH_TOKEN "SEU_TOKEN_GERADO"

// Pino do sensor DS18B20
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  
  // Conectar WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao WiFi...");
  }
  Serial.println("WiFi conectado!");
  
  // Iniciar sensor
  sensors.begin();
}

void loop() {
  // Ler temperatura
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);
  
  // Criar JSON com deviceInfo
  DynamicJsonDocument doc(1024);
  doc["temperatura"] = temp;
  
  // Informações do dispositivo
  JsonObject deviceInfo = doc.createNestedObject("deviceInfo");
  deviceInfo["model"] = "ESP32-DevKit";
  deviceInfo["firmware"] = "1.0.2";
  deviceInfo["wifi"] = WiFi.SSID();
  deviceInfo["battery"] = 85; // Simulado
  deviceInfo["signal"] = WiFi.RSSI();
  
  // Enviar para API
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(AUTH_TOKEN));
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    Serial.println("Dados enviados com sucesso!");
  } else {
    Serial.println("Erro ao enviar dados: " + String(httpResponseCode));
  }
  
  http.end();
  
  delay(60000); // 1 minuto
}
```

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/signin` - Login de usuários
- `GET /api/auth/session` - Verificar sessão atual

### Temperaturas
- `GET /api/temperaturas` - Listar temperaturas (requer sessão)
- `POST /api/temperaturas` - Adicionar temperatura (requer token ou sessão)

### Administração
- `POST /api/admin/generate-token` - Gerar token para ESP32
- `GET /api/admin/clear-temperatures` - Verificar status do banco
- `DELETE /api/admin/clear-temperatures` - Limpar todas as temperaturas

### Relatórios
- `GET /api/relatorio` - Gerar relatório CSV (requer sessão)

## 🔐 Credenciais Padrão

- **Email**: `admin@meditemp.com`
- **Senha**: `admin123`

## 📈 Faixas de Temperatura

- **✅ Seguro**: 2°C a 8°C (conforme ANVISA)
- **⚠️ Alerta**: Abaixo de 2°C ou acima de 8°C
- **🚨 Crítico**: Abaixo de 0°C ou acima de 10°C

## 🗃️ Estrutura do Banco de Dados

```sql
-- Tabela de usuários
CREATE TABLE User (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de temperaturas
CREATE TABLE Temperatura (
  id INTEGER PRIMARY KEY,
  temperatura REAL NOT NULL,
  deviceId TEXT DEFAULT 'web-dashboard',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Scripts de Teste

### Testar API com ESP32 Simulado
```bash
node test-api.js
```

### Limpar Banco de Dados
```bash
node clear-temperatures.js
```

## 📱 Ferramentas Úteis

### Prisma Studio
```bash
npx prisma studio
```
Acesse `http://localhost:5555` para visualizar o banco de dados.

### Build de Produção
```bash
npm run build
npm start
```

## 🔧 Desenvolvimento

### Estrutura de Componentes

- **Server Components**: `app/page.tsx`, `app/admin/page.tsx`
- **Client Components**: `app/dashboard/DashboardClient.tsx`, `app/admin/AdminClient.tsx`
- **API Routes**: `app/api/*/route.ts`

### Middleware

Autenticação e proteção de rotas configuradas em `middleware.ts`.

### Estilo

- **Tailwind CSS** para design responsivo
- **Design System** com cores consistentes
- **Dark Mode** planejado para implementação futura

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Licença

Este projeto está licenciado sob a MIT License.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request


