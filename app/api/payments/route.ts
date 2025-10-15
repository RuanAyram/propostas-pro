import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleManager } from '@/lib/user-roles';

export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário é admin
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const roleManager = new UserRoleManager();
    const isAdmin = await roleManager.isAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      );
    }

    // Parâmetros de filtro
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtro
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Buscar pagamentos
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where }),
    ]);

    // Estatísticas
    const stats = await prisma.payment.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      payments,
      total,
      stats: stats.map(s => ({
        status: s.status,
        count: s._count,
        totalAmount: s._sum.amount || 0,
      })),
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar pagamentos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar pagamentos' },
      { status: 500 }
    );
  }
}