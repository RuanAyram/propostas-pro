import { NextRequest, NextResponse } from 'next/server';
import { getAbacatePayClient } from '@/lib/abacatepay';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPaymentSchema = z.object({
  amount: z.number().positive().int(),
  description: z.string().min(1).max(140),
  expiresIn: z.number().positive().int().default(3600), // 1 hora padrão
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    cellphone: z.string().min(10),
    taxId: z.string().min(11),
  }),
  externalId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // 1. Criar ou buscar cliente no banco de dados
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: validatedData.customer.email },
          { taxId: validatedData.customer.taxId },
        ],
      },
    });

    if (!customer) {
      // Criar cliente no AbacatePay
      const abacatePay = getAbacatePayClient();
      const abacatePayCustomer = await abacatePay.createCustomer(validatedData.customer);

      // Salvar cliente no banco
      customer = await prisma.customer.create({
        data: {
          abacatePayId: abacatePayCustomer.data.id,
          name: validatedData.customer.name,
          email: validatedData.customer.email,
          cellphone: validatedData.customer.cellphone,
          taxId: validatedData.customer.taxId,
        },
      });
    }

    // 2. Criar cobrança PIX no AbacatePay
    const abacatePay = getAbacatePayClient();
    const pixQRCode = await abacatePay.createPixQRCode({
      amount: validatedData.amount,
      expiresIn: validatedData.expiresIn,
      description: validatedData.description,
      customer: validatedData.customer,
      metadata: {
        externalId: validatedData.externalId,
      },
    });

    // 3. Salvar pagamento no banco
    const payment = await prisma.payment.create({
      data: {
        abacatePayId: pixQRCode.data.id,
        customerId: customer.id,
        amount: pixQRCode.data.amount,
        status: pixQRCode.data.status,
        description: validatedData.description,
        brCode: pixQRCode.data.brCode,
        brCodeBase64: pixQRCode.data.brCodeBase64,
        platformFee: pixQRCode.data.platformFee,
        devMode: pixQRCode.data.devMode,
        externalId: validatedData.externalId,
        expiresAt: new Date(pixQRCode.data.expiresAt),
      },
      include: {
        customer: true,
      },
    });

    // 4. Registrar transação
    await prisma.transaction.create({
      data: {
        paymentId: payment.id,
        type: 'CREATED',
        status: payment.status,
        metadata: JSON.stringify(pixQRCode.data),
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        abacatePayId: payment.abacatePayId,
        amount: payment.amount,
        status: payment.status,
        brCode: payment.brCode,
        brCodeBase64: payment.brCodeBase64,
        expiresAt: payment.expiresAt,
        customer: {
          name: payment.customer.name,
          email: payment.customer.email,
        },
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar pagamento' },
      { status: 500 }
    );
  }
}