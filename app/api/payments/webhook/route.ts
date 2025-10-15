import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook recebido do AbacatePay:', body);

    // Extrair dados do webhook
    const { id, status, paidAt } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do pagamento não fornecido' },
        { status: 400 }
      );
    }

    // Buscar pagamento pelo abacatePayId
    const payment = await prisma.payment.findUnique({
      where: { abacatePayId: id },
    });

    if (!payment) {
      console.error('Pagamento não encontrado:', id);
      return NextResponse.json(
        { success: false, error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar status do pagamento
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        paidAt: paidAt ? new Date(paidAt) : null,
      },
    });

    // Registrar transação do webhook
    await prisma.transaction.create({
      data: {
        paymentId: payment.id,
        type: 'WEBHOOK',
        status,
        metadata: JSON.stringify(body),
      },
    });

    console.log('Pagamento atualizado via webhook:', updatedPayment.id);

    return NextResponse.json({
      success: true,
      message: 'Webhook processado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}