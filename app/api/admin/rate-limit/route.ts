import { NextRequest, NextResponse } from "next/server"
import { getRateLimitStats } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma requisição de administração (opcional: adicionar autenticação)
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = getRateLimitStats()
    
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching rate limit stats:", error)
    return NextResponse.json({ error: "Failed to fetch rate limit stats" }, { status: 500 })
  }
}
