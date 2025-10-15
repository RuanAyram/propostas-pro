'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeDisplay } from '@/components/qr-code-display';
import { PaymentStatusBadge } from '@/components/payment-status-badge';
import { usePayment, Payment } from '@/hooks/use-payment';
import { Loader2, RefreshCw } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  onPaymentComplete?: () => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  payment: initialPayment,
  onPaymentComplete,
}: PaymentModalProps) {
  const { checkPaymentStatus, loading } = usePayment();
  const [payment, setPayment] = useState(initialPayment);
  const [autoCheckInterval, setAutoCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Atualizar payment quando initialPayment mudar
  useEffect(() => {
    setPayment(initialPayment);
  }, [initialPayment]);

  // Auto-verificar status a cada 5 segundos se estiver pendente
  useEffect(() => {
    if (open && payment.status === 'PENDING') {
      const interval = setInterval(async () => {
        try {
          const updatedPayment = await checkPaymentStatus(payment.id);
          setPayment(updatedPayment);

          if (updatedPayment.status === 'PAID') {
            onPaymentComplete?.();
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 5000);

      setAutoCheckInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (autoCheckInterval) {
        clearInterval(autoCheckInterval);
        setAutoCheckInterval(null);
      }
    }
  }, [open, payment.status, payment.id]);

  const handleCheckStatus = async () => {
    try {
      const updatedPayment = await checkPaymentStatus(payment.id);
      setPayment(updatedPayment);

      if (updatedPayment.status === 'PAID') {
        onPaymentComplete?.();
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pagamento PIX</span>
            <PaymentStatusBadge status={payment.status} />
          </DialogTitle>
          <DialogDescription>
            {payment.description || 'Complete o pagamento para continuar'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {payment.status === 'PENDING' && (
            <>
              <QRCodeDisplay
                brCode={payment.brCode}
                brCodeBase64={payment.brCodeBase64}
                amount={payment.amount}
                expiresAt={payment.expiresAt}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCheckStatus}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Verificar Pagamento
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                O status será atualizado automaticamente
              </p>
            </>
          )}

          {payment.status === 'PAID' && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pagamento Confirmado!</h3>
                <p className="text-sm text-muted-foreground">
                  Seu pagamento foi processado com sucesso.
                </p>
              </div>
              <Button onClick={() => onOpenChange(false)} className="w-full">
                Fechar
              </Button>
            </div>
          )}

          {(payment.status === 'EXPIRED' || payment.status === 'CANCELLED') && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {payment.status === 'EXPIRED' ? 'Pagamento Expirado' : 'Pagamento Cancelado'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {payment.status === 'EXPIRED'
                    ? 'O prazo para pagamento expirou.'
                    : 'Este pagamento foi cancelado.'}
                </p>
              </div>
              <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}