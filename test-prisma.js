import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  try {
    // Testar se o modelo Temperatura existe
    const count = await prisma.temperatura.count()
    console.log('Temperaturas no banco:', count)
    
    // Criar temperatura teste
    const temp = await prisma.temperatura.create({
      data: { temperatura: 25.5 }
    })
    console.log('Temperatura criada:', temp)
    
    // Listar todas
    const all = await prisma.temperatura.findMany()
    console.log('Todas temperaturas:', all)
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()
