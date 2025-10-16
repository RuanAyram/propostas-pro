import { type NextRequest, NextResponse } from "next/server"
import { getAbacatePayClient } from "@/lib/abacatepay"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  // Aplicar rate limiting
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId é obrigatório" },
        { status: 400 }
      )
    }

    const abacatePay = getAbacatePayClient()
    const statusResponse = await abacatePay.getPaymentStatus(paymentId)

    if (!statusResponse.data) {
      throw new Error('Erro ao consultar status do pagamento')
    }

    return NextResponse.json({
      success: true,
      paymentId: statusResponse.data.id,
      status: statusResponse.data.status,
      amount: statusResponse.data.amount,
      paidAt: statusResponse.data.paidAt,
      expiresAt: statusResponse.data.expiresAt
    })
  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error)
    return NextResponse.json(
      { 
        error: "Erro ao verificar status do pagamento",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
