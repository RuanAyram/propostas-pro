import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack/server'
import { UserRoleManager } from '@/lib/user-roles'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verifica se o usuário está autenticado
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { role } = await request.json()
    const targetUserId = params.userId

    if (!role || !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Role inválido. Use "admin" ou "user"' },
        { status: 400 }
      )
    }

    // Altera o role do usuário
    if (role === 'admin') {
      await UserRoleManager.promoteToAdmin(user.id, targetUserId)
    } else {
      await UserRoleManager.demoteFromAdmin(user.id, targetUserId)
    }

    return NextResponse.json({ 
      message: `Usuário ${role === 'admin' ? 'promovido a' : 'rebaixado para'} ${role} com sucesso` 
    })
  } catch (error) {
    console.error('Erro ao alterar role do usuário:', error)
    
    if (error instanceof Error && error.message.includes('Acesso negado')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
