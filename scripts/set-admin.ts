#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setAdmin() {
  const userId = process.argv[2]
  
  if (!userId) {
    process.exit(1)
  }

  try {
    // Usar Prisma diretamente para evitar problemas com server-only
    await prisma.userRole.upsert({
      where: { userId },
      update: { role: 'admin' },
      create: { userId, role: 'admin' }
    })
  } catch (error) {
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setAdmin()
