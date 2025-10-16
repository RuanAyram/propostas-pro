import { type NextRequest, NextResponse } from "next/server"
import { getAbacatePayClient } from "@/lib/abacatepay"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Aplicar rate limiting
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { amount, plan, userId, userEmail } = await request.json()

    if (!amount || !plan || !userId) {
      return NextResponse.json(
        { error: "amount, plan e userId são obrigatórios" },
        { status: 400 }
      )
    }

    // Converter valor para centavos
    const amountInCents = Math.round(amount * 100)

    // Criar QR Code PIX usando AbacatePay
    const abacatePay = getAbacatePayClient()
    
    const pixResponse = await abacatePay.createPixQRCode({
      amount: amountInCents,
      expiresIn: 3600, // 1 hora
      description: `Assinatura ${plan === 'monthly' ? 'Mensal' : 'Anual'} - Sistema de Documentos`,
      metadata: {
        externalId: userId,
        plan: plan,
        userEmail: userEmail || '',
        type: 'subscription'
      }
    })

    if (!pixResponse.data) {
      throw new Error('Erro ao gerar QR Code PIX')
    }

    return NextResponse.json({
      success: true,
      paymentId: pixResponse.data.id,
      qrCode: pixResponse.data.brCodeBase64,
      pixCode: pixResponse.data.brCode,
      amount: pixResponse.data.amount,
      expiresAt: pixResponse.data.expiresAt,
      status: pixResponse.data.status
    })
  } catch (error) {
    console.error("Erro ao criar pagamento PIX:", error)
    return NextResponse.json(
      { 
        error: "Erro ao criar pagamento PIX",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
