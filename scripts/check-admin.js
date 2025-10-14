#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdmin() {
  const userId = process.argv[2]
  
  if (!userId) {
    console.error('❌ Erro: ID do usuário é obrigatório')
    console.log('📝 Uso: node scripts/check-admin.js <USER_ID>')
    process.exit(1)
  }

  try {
    console.log(`🔍 Verificando status de admin para usuário: ${userId}`)
    
    // Buscar o usuário na tabela user_roles
    const userRole = await prisma.userRole.findUnique({
      where: { userId }
    })
    
    if (!userRole) {
      console.log('❌ Usuário não encontrado na tabela user_roles')
      console.log('💡 Execute: npm run admin:set-js <USER_ID> para definir como admin')
    } else {
      console.log('✅ Usuário encontrado:')
      console.log('- ID:', userRole.userId)
      console.log('- Role:', userRole.role)
      console.log('- É Admin?', userRole.role === 'admin' ? '✅ SIM' : '❌ NÃO')
      console.log('- Criado em:', userRole.createdAt)
      console.log('- Atualizado em:', userRole.updatedAt)
    }
    
    // Listar todos os admins
    const allAdmins = await prisma.userRole.findMany({
      where: { role: 'admin' }
    })
    
    console.log(`\n👑 Total de administradores: ${allAdmins.length}`)
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.userId} (criado em ${admin.createdAt})`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
