'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface PaymentCustomer {
  name: string;
  email: string;
  cellphone: string;
  taxId: string;
}

export interface CreatePaymentData {
  amount: number;
  description: string;
  expiresIn?: number;
  customer: PaymentCustomer;
  externalId?: string;
}

export interface Payment {
  id: number;
  abacatePayId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  brCode: string;
  brCodeBase64: string;
  expiresAt: string;
  paidAt?: string;
  description?: string;
  customer: {
    name: string;
    email: string;
    cellphone?: string;
  };
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(async (data: CreatePaymentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar pagamento');
      }

      setPayment(result.payment);
      toast.success('Pagamento criado com sucesso!');
      return result.payment;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar pagamento';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (paymentId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao consultar pagamento');
      }

      setPayment(result.payment);
      return result.payment;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao consultar pagamento';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPayment = useCallback(() => {
    setPayment(null);
    setError(null);
  }, []);

  return {
    loading,
    payment,
    error,
    createPayment,
    checkPaymentStatus,
    resetPayment,
  };
}