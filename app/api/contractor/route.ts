import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar dados do contratante
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID é obrigatório' },
        { status: 400 }
      )
    }

    const contractor = await prisma.contractor.findUnique({
      where: { userId }
    })

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contratante não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(contractor)
  } catch (error) {
    console.error('Erro ao buscar contratante:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do contratante' },
      { status: 500 }
    )
  }
}

// POST - Criar ou atualizar dados do contratante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, nome, documento, endereco, telefone, email, logoUrl, logoPublicId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID é obrigatório' },
        { status: 400 }
      )
    }

    if (!nome || !documento || !endereco || !telefone || !email) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe um contratante para este usuário
    const existingContractor = await prisma.contractor.findUnique({
      where: { userId }
    })

    let contractor

    if (existingContractor) {
      // Atualizar contratante existente
      contractor = await prisma.contractor.update({
        where: { userId },
        data: {
          nome,
          documento,
          endereco,
          telefone,
          email,
          logoUrl: logoUrl || existingContractor.logoUrl,
          logoPublicId: logoPublicId || existingContractor.logoPublicId,
        }
      })
    } else {
      // Criar novo contratante
      contractor = await prisma.contractor.create({
        data: {
          userId,
          nome,
          documento,
          endereco,
          telefone,
          email,
          logoUrl,
          logoPublicId,
        }
      })
    }

    return NextResponse.json(contractor)
  } catch (error) {
    console.error('Erro ao salvar contratante:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar dados do contratante' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar dados do contratante
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.contractor.delete({
      where: { userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar contratante:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar dados do contratante' },
      { status: 500 }
    )
  }
}
