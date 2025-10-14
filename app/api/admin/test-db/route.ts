import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Testa conexão básica
    await prisma.$connect()
    // Testa se a tabela user_roles existe
    const userRolesCount = await prisma.userRole.count()
    // Lista todos os user_roles
    const allUserRoles = await prisma.userRole.findMany()
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      userRolesCount,
      userRoles: allUserRoles,
      message: 'Banco de dados funcionando corretamente'
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
      database: 'error',
      error: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}
