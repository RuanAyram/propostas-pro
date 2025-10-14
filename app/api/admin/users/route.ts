import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack/server'
import { UserRoleManager } from '@/lib/user-roles'

export async function GET(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Lista todos os usuários com roles
    const users = await UserRoleManager.getAllUsersWithRoles(user.id)
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    
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
