import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCPF, validatePhone, unformatCPF, unformatPhone } from '@/lib/validators';
import { z } from 'zod';

const createProfileSchema = z.object({
  userId: z.string().min(1),
  cpf: z.string().min(11),
  phone: z.string().min(10),
});

const updateProfileSchema = z.object({
  cpf: z.string().min(11).optional(),
  phone: z.string().min(10).optional(),
});

// GET - Buscar perfil do usuário
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário não fornecido' },
        { status: 400 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        userId: profile.userId,
        cpf: profile.cpf,
        phone: profile.phone,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

// POST - Criar perfil do usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProfileSchema.parse(body);

    // Limpar formatação
    const cpf = unformatCPF(validatedData.cpf);
    const phone = unformatPhone(validatedData.phone);

    // Validar CPF
    if (!validateCPF(cpf)) {
      return NextResponse.json(
        { success: false, error: 'CPF inválido' },
        { status: 400 }
      );
    }

    // Validar telefone
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Telefone inválido' },
        { status: 400 }
      );
    }

    // Verificar se já existe perfil para este usuário
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: validatedData.userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Perfil já existe para este usuário' },
        { status: 409 }
      );
    }

    // Verificar se CPF já está em uso
    const existingCPF = await prisma.userProfile.findUnique({
      where: { cpf },
    });

    if (existingCPF) {
      return NextResponse.json(
        { success: false, error: 'CPF já cadastrado' },
        { status: 409 }
      );
    }

    // Criar perfil
    const profile = await prisma.userProfile.create({
      data: {
        userId: validatedData.userId,
        cpf,
        phone,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        userId: profile.userId,
        cpf: profile.cpf,
        phone: profile.phone,
        createdAt: profile.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar perfil:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar perfil' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar perfil do usuário
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const updateData: any = {};

    if (validatedData.cpf) {
      const cpf = unformatCPF(validatedData.cpf);
      if (!validateCPF(cpf)) {
        return NextResponse.json(
          { success: false, error: 'CPF inválido' },
          { status: 400 }
        );
      }

      // Verificar se CPF já está em uso por outro usuário
      const existingCPF = await prisma.userProfile.findFirst({
        where: {
          cpf,
          userId: { not: userId },
        },
      });

      if (existingCPF) {
        return NextResponse.json(
          { success: false, error: 'CPF já cadastrado' },
          { status: 409 }
        );
      }

      updateData.cpf = cpf;
    }

    if (validatedData.phone) {
      const phone = unformatPhone(validatedData.phone);
      if (!validatePhone(phone)) {
        return NextResponse.json(
          { success: false, error: 'Telefone inválido' },
          { status: 400 }
        );
      }
      updateData.phone = phone;
    }

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        userId: profile.userId,
        cpf: profile.cpf,
        phone: profile.phone,
        updatedAt: profile.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}