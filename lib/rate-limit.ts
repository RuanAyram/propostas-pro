import { NextRequest, NextResponse } from 'next/server'

// Interface para armazenar informações de rate limiting
interface RateLimitInfo {
  count: number
  resetTime: number
}

// Map para armazenar informações de rate limiting por IP
const rateLimitMap = new Map<string, RateLimitInfo>()

// Configurações de rate limiting
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 30, // 30 requisições por minuto
  message: 'Muitas requisições. Tente novamente em 1 minuto.',
  statusCode: 429
}

// Função para obter o IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Função para limpar entradas expiradas
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [ip, info] of rateLimitMap.entries()) {
    if (now > info.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}

// Middleware de rate limiting
export function rateLimit(request: NextRequest): NextResponse | null {
  const clientIP = getClientIP(request)
  const now = Date.now()
  
  // Limpar entradas expiradas periodicamente
  if (Math.random() < 0.1) { // 10% de chance de limpar
    cleanupExpiredEntries()
  }
  
  // Obter informações atuais do IP
  const currentInfo = rateLimitMap.get(clientIP)
  
  if (!currentInfo) {
    // Primeira requisição do IP
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    })
    return null
  }
  
  // Verificar se o período de rate limiting expirou
  if (now > currentInfo.resetTime) {
    // Resetar contador
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    })
    return null
  }
  
  // Verificar se excedeu o limite
  if (currentInfo.count >= RATE_LIMIT_CONFIG.maxRequests) {
    const remainingTime = Math.ceil((currentInfo.resetTime - now) / 1000)
    
    return NextResponse.json(
      {
        error: RATE_LIMIT_CONFIG.message,
        retryAfter: remainingTime
      },
      {
        status: RATE_LIMIT_CONFIG.statusCode,
        headers: {
          'Retry-After': remainingTime.toString(),
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': currentInfo.resetTime.toString()
        }
      }
    )
  }
  
  // Incrementar contador
  currentInfo.count++
  rateLimitMap.set(clientIP, currentInfo)
  
  // Adicionar headers informativos
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT_CONFIG.maxRequests - currentInfo.count).toString())
  response.headers.set('X-RateLimit-Reset', currentInfo.resetTime.toString())
  
  return null
}

// Função para obter estatísticas de rate limiting
export function getRateLimitStats() {
  const now = Date.now()
  const activeIPs = Array.from(rateLimitMap.entries())
    .filter(([_, info]) => now <= info.resetTime)
    .map(([ip, info]) => ({
      ip,
      count: info.count,
      resetTime: info.resetTime,
      remaining: RATE_LIMIT_CONFIG.maxRequests - info.count
    }))
  
  return {
    totalActiveIPs: activeIPs.length,
    activeIPs,
    config: RATE_LIMIT_CONFIG
  }
}
