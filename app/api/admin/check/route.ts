import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack/server'
import { UserRoleManager } from '@/lib/user-roles'

export async function GET(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json(
        { isAdmin: false, userRole: 'user', error: 'User not authenticated' },
        { status: 200 }
      )
    }
    // Verifica se o usuário é admin
    const userRole = await UserRoleManager.getUserRole(user.id)
    const isAdmin = await UserRoleManager.isUserAdmin(user.id)
    
    return NextResponse.json({ isAdmin, userRole, error: null })
  } catch (error) { 
    // Serializar o erro de forma mais detalhada
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: typeof error,
      constructor: error?.constructor?.name,
      stack: error instanceof Error ? error.stack : undefined,
      raw: JSON.stringify(error)
    }
    return NextResponse.json(
      { 
        isAdmin: false, 
        userRole: 'user', 
        error: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
