import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import jwt from 'jsonwebtoken'

export async function POST() {
  try {
    const session = await auth()
  
    if (!session || session.user?.email !== 'admin@meditemp.com') {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    // 🔑 Gerar token permanente para ESP32
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    const token = jwt.sign(
      {
        deviceId: 'esp32-sensor-' + Date.now(),
        type: 'hardware',
        permissions: ['temperatura:write'],
        email: session.user?.email
      },
      secret!,
      { expiresIn: '10y' }
    )

    console.log('🔑 Token gerado para ESP32 por:', session.user?.email)

    return NextResponse.json({ 
      success: true,
      token,
      expiresIn: '10y',
      deviceId: 'esp32-sensor-' + Date.now(),
      generatedAt: new Date().toISOString(),
      instructions: {
        step1: "Copie o token",
        step2: "Cole na variável AUTH_TOKEN do ESP32",
        step3: "Compile e faça upload"
      }
    })
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
