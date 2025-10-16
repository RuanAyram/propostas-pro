import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar cliente pelo userId
    const customer = await prisma.customer.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!customer) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        needsPayment: true,
        message: 'Nenhum pagamento encontrado',
      });
    }

    // Buscar último pagamento pago do cliente
    const lastPaidPayment = await prisma.payment.findFirst({
      where: {
        customerId: customer.id,
        status: 'PAID',
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    if (!lastPaidPayment) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        needsPayment: true,
        message: 'Nenhum pagamento confirmado encontrado',
      });
    }

    // Verificar se o acesso ainda está válido
    const now = new Date();
    const hasAccess = lastPaidPayment.accessExpiresAt 
      ? new Date(lastPaidPayment.accessExpiresAt) > now
      : false;

    return NextResponse.json({
      success: true,
      hasAccess,
      needsPayment: !hasAccess,
      payment: hasAccess ? {
        id: lastPaidPayment.id,
        plan: lastPaidPayment.plan,
        paidAt: lastPaidPayment.paidAt,
        accessExpiresAt: lastPaidPayment.accessExpiresAt,
      } : null,
      message: hasAccess 
        ? 'Acesso válido' 
        : 'Acesso expirado, necessário novo pagamento',
    });
  } catch (error: any) {
    console.error('Erro ao verificar acesso:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao verificar acesso' },
      { status: 500 }
    );
  }
}
