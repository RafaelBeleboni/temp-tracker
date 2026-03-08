import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

    // Criar PDF
    const doc = new jsPDF()

    // Configurações do documento
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('RELATORIO ANVISA - MONITORAMENTO DE TEMPERATURA', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')


    // Informações do período
    const dataInicio = start ? new Date(start).toLocaleString('pt-BR') : 'Início'
    const dataFim = end ? new Date(end).toLocaleString('pt-BR') : 'Fim'
    
    doc.setFontSize(10)
    doc.text(`Período: ${dataInicio} - ${dataFim}`, 105, 40, { align: 'center' })
    doc.text(`Total de Leituras: ${temperaturas.length}`, 105, 47, { align: 'center' })

    // Estatísticas
    if (temperaturas.length > 0) {
      const temps = temperaturas.map(t => t.temperatura)
      const min = Math.min(...temps)
      const max = Math.max(...temps)
      const avg = temps.reduce((a, b) => a + b, 0) / temps.length

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('ESTATISTICAS DO PERIODO:', 14, 60)
      
      doc.setFont('helvetica', 'normal')
      doc.text(`Temperatura Mínima: ${min.toFixed(2)}°C`, 14, 68)
      doc.text(`Temperatura Máxima: ${max.toFixed(2)}°C`, 14, 75)
      doc.text(`Temperatura Média: ${avg.toFixed(2)}°C`, 14, 82)
      doc.text(`Faixa Segura ANVISA: 2°C a 8°C`, 14, 89)

      // Verificar excursões
      const excursao = temps.filter(t => t < 2 || t > 8).length
      doc.setFont('helvetica', 'bold')
      doc.text(`Excursões de Temperatura: ${excursao} leituras fora da faixa`, 14, 96)
    }

    // Tabela de dados
    const tableData = temperaturas.map(temp => [
      new Date(temp.createdAt).toLocaleString('pt-BR'),
      temp.temperatura.toFixed(2) + '°C',
      temp.temperatura < 2 ? '❄️ Risco Congelamento' : 
      temp.temperatura > 8 ? '🌡️ Risco Aquecimento' : '✅ Normal'
    ])

    // Adicionar tabela usando autoTable como função importada
    autoTable(doc, {
      head: [['Data/Hora', 'Temperatura', 'Status ANVISA']],
      body: tableData,
      startY: 110,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: 'center'
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' }
      }
    })

    // Rodapé - usando métodos do jsPDF
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      (doc as any).setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
        105,
        (doc as any).internal.pageSize.height - 10,
        { align: 'center' }
      )
    }

    // Gerar buffer do PDF
    const pdfBuffer = Buffer.from((doc as any).output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-anvisa-temperaturas-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
