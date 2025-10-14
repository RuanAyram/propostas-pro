import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack/server'

export async function GET(request: NextRequest) {
  try {
    // Testa se consegue obter o usuário atual
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({
        success: false,
        stackAuth: 'not_authenticated',
        user: null,
        message: 'Usuário não está autenticado'
      })
    }    
    return NextResponse.json({
      success: true,
      stackAuth: 'authenticated',
      user: {
        id: user.id,
        email: user.primaryEmail,
        displayName: user.displayName,
        emailVerified: user.primaryEmailVerified
      },
      message: 'Stack Auth funcionando corretamente'
    })
    
  } catch (error) {    
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: typeof error,
      constructor: error?.constructor?.name,
      stack: error instanceof Error ? error.stack : undefined,
      raw: JSON.stringify(error)
    }
    
    return NextResponse.json({
      success: false,
      stackAuth: 'error',
      error: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
