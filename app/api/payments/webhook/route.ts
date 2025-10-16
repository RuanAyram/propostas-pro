import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook recebido do AbacatePay:', JSON.stringify(body, null, 2));

    // Novo formato do webhook AbacatePay
    const { event, data } = body;

    // Verificar se é um evento de pagamento
    if (event !== 'billing.paid') {
      console.log('Evento ignorado:', event);
      return NextResponse.json({
        success: true,
        message: 'Evento ignorado',
      });
    }

    // Extrair dados do PIX QR Code
    const pixQrCode = data?.pixQrCode;
    if (!pixQrCode || !pixQrCode.id) {
      return NextResponse.json(
        { success: false, error: 'Dados do pagamento não fornecidos' },
        { status: 400 }
      );
    }

    const { id: pixQrCodeId, status } = pixQrCode;

    // Buscar pagamento pelo abacatePayId
    const payment = await prisma.payment.findUnique({
      where: { abacatePayId: pixQrCodeId },
    });

    if (!payment) {
      console.error('Pagamento não encontrado:', pixQrCodeId);
      return NextResponse.json(
        { success: false, error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Calcular data de expiração do acesso se o pagamento foi confirmado
    let accessExpiresAt = payment.accessExpiresAt;
    
    if (status === 'PAID' && !payment.accessExpiresAt && payment.plan) {
      const now = new Date();
      if (payment.plan === 'monthly') {
        accessExpiresAt = new Date(now.setMonth(now.getMonth() + 1));
      } else if (payment.plan === 'annual') {
        accessExpiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
      }
    }

    // Atualizar status do pagamento
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null,
        accessExpiresAt,
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