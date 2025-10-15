import { NextRequest, NextResponse } from 'next/server';
import { getAbacatePayClient } from '@/lib/abacatepay';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = parseInt(params.id);

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Buscar pagamento no banco
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        customer: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar status do pagamento se ainda estiver pendente
    if (payment.status === 'PENDING') {
      try {
        const abacatePay = getAbacatePayClient();
        const statusResponse = await abacatePay.getPaymentStatus(payment.abacatePayId);

        // Atualizar no banco se o status mudou
        if (statusResponse.data.status !== payment.status) {
          const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: statusResponse.data.status,
              paidAt: statusResponse.data.paidAt ? new Date(statusResponse.data.paidAt) : null,
            },
          });

          // Registrar transação de atualização
          await prisma.transaction.create({
            data: {
              paymentId: payment.id,
              type: 'STATUS_CHECK',
              status: statusResponse.data.status,
              metadata: JSON.stringify(statusResponse.data),
            },
          });

          payment.status = updatedPayment.status;
          payment.paidAt = updatedPayment.paidAt;
        }
      } catch (error) {
        console.error('Erro ao atualizar status do pagamento:', error);
        // Continua com os dados do banco mesmo se falhar a atualização
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        abacatePayId: payment.abacatePayId,
        amount: payment.amount,
        status: payment.status,
        description: payment.description,
        brCode: payment.brCode,
        brCodeBase64: payment.brCodeBase64,
        externalId: payment.externalId,
        expiresAt: payment.expiresAt,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        customer: {
          name: payment.customer.name,
          email: payment.customer.email,
          cellphone: payment.customer.cellphone,
        },
        transactions: payment.transactions,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar pagamento:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar pagamento' },
      { status: 500 }
    );
  }
}