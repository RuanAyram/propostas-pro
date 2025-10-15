'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/payment-modal';
import { usePayment, CreatePaymentData, Payment } from '@/hooks/use-payment';
import { DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePaymentButtonProps {
  proposalData: {
    contratado: {
      nome: string;
      email: string;
      documento: string;
    };
  };
  amount: number; // Valor em centavos
  description: string;
  externalId?: string;
  onPaymentComplete?: () => void;
}

export function CreatePaymentButton({
  proposalData,
  amount,
  description,
  externalId,
  onPaymentComplete,
}: CreatePaymentButtonProps) {
  const { createPayment, loading } = usePayment();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreatePayment = async () => {
    // Validar dados do cliente
    if (!proposalData.contratado.nome || !proposalData.contratado.email || !proposalData.contratado.documento) {
      toast.error('Preencha todos os dados do contratado antes de gerar o pagamento');
      return;
    }

    try {
      const paymentData: CreatePaymentData = {
        amount,
        description,
        expiresIn: 3600, // 1 hora
        customer: {
          name: proposalData.contratado.nome,
          email: proposalData.contratado.email,
          cellphone: '(00) 00000-0000', // Você pode adicionar campo de telefone na proposta
          taxId: proposalData.contratado.documento,
        },
        externalId,
      };

      const newPayment = await createPayment(paymentData);
      setPayment(newPayment);
      setModalOpen(true);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
    }
  };

  return (
    <>
      <Button
        onClick={handleCreatePayment}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <DollarSign className="mr-2 h-4 w-4" />
        )}
        Gerar Cobrança PIX
      </Button>

      {payment && (
        <PaymentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          payment={payment}
          onPaymentComplete={() => {
            toast.success('Pagamento confirmado!');
            onPaymentComplete?.();
          }}
        />
      )}
    </>
  );
}