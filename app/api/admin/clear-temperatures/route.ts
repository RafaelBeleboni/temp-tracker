import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(req: NextRequest) {
  try {
    // Verificar autenticação (apenas admin pode apagar)
    const session = await auth()
    
    if (!session || session.user?.email !== 'admin@meditemp.com') {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    // Apagar todos os registros de temperatura
    const result = await prisma.temperatura.deleteMany({})

    console.log(`🗑️ ${result.count} registros de temperatura apagados por: ${session.user?.email}`)

    return NextResponse.json({
      success: true,
      message: `${result.count} registros de temperatura apagados com sucesso`,
      deletedCount: result.count
    })

  } catch (error) {
    console.error('❌ Erro ao apagar temperaturas:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// GET para verificar status
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.email !== 'admin@meditemp.com') {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const count = await prisma.temperatura.count()

    return NextResponse.json({
      success: true,
      totalRecords: count,
      message: `Existem ${count} registros de temperatura no banco`
    })

  } catch (error) {
    console.error('❌ Erro ao contar temperaturas:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
