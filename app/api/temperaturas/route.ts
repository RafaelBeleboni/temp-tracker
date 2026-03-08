import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import jwt from 'jsonwebtoken'
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    const start = searchParams.get("start")
    const end = searchParams.get("end")

    const where = start && end ? {
      createdAt: {
        gte: new Date(start),
        lte: new Date(end)
      }
    } : {}

    const temperaturas = await prisma.temperatura.findMany({
      where,
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json(temperaturas)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação (session ou token)
    const authHeader = req.headers.get('authorization')
    
    let authenticated = false
    let deviceId = null
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        // Verificar se é token de hardware (ESP32)
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any
        
        if (decoded.type === 'hardware' && decoded.permissions.includes('temperatura:write')) {
          authenticated = true
          deviceId = decoded.deviceId
        }
      } catch (jwtError) {
        // Token inválido
      }
    } else {
      // Fallback para autenticação normal (session via browser)
      const session = await auth()
      authenticated = !!session
    }
    
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    console.log('🔍 Body recebido:', body)
    console.log('🔍 DeviceId:', deviceId)

    // Extrair informações do dispositivo se enviadas
    const deviceInfo = body.deviceInfo || {}
    console.log('📱 Device Info:', deviceInfo)

    if (!body.temperatura) {
      return NextResponse.json({ error: "Temperatura é obrigatória" }, { status: 400 })
    }

    // Criar registro no banco com informações adicionais
    const nova = await prisma.temperatura.create({
      data: {
        temperatura: parseFloat(body.temperatura),
        deviceId: deviceId || 'web-dashboard'
      }
    })

    console.log(`✅ Temperatura recebida: ${body.temperatura}°C | Device: ${deviceId || 'web-dashboard'}`)
    console.log('✅ Registro salvo no banco:', nova)

    // Verificar se salvou corretamente
    if (!nova || !nova.id) {
      throw new Error('Falha ao salvar registro no banco')
    }

    // Resposta com informações do dispositivo
    return NextResponse.json({
      success: true,
      data: nova,
      deviceInfo: deviceInfo,
      message: 'Temperatura registrada com sucesso'
    })
  } catch (error) {
    console.error('❌ Erro ao salvar no banco:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}