import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com banco...')
    
    // Testar conexão
    await prisma.$connect()
    console.log('✅ Conectado com sucesso!')
    
    // Contar usuários
    const userCount = await prisma.user.count()
    console.log(`📊 Total de usuários: ${userCount}`)
    
    // Criar usuário teste
    if (userCount === 0) {
      const newUser = await prisma.user.create({
        data: {
          name: 'Usuário Teste',
          email: 'teste@example.com',
          password: '123456'
        }
      })
      console.log('👤 Usuário criado:', newUser)
    }
    
    // Listar todos usuários
    const users = await prisma.user.findMany()
    console.log('📋 Todos os usuários:', users)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
