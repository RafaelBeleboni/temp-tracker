import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@meditemp.com' },
    update: {},
    create: {
      email: 'admin@meditemp.com',
      name: 'Admin',
      password: hashedPassword,
    },
  })

  console.log('✅ Usuário admin criado:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
