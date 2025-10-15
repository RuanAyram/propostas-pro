'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentStatusBadge } from '@/components/payment-status-badge';
import { QRCodeDisplay } from '@/components/qr-code-display';
import { useAdmin } from '@/hooks/use-admin';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Transaction {
  id: number;
  type: string;
  status: string;
  createdAt: string;
}

interface PaymentDetails {
  id: number;
  abacatePayId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  description: string | null;
  brCode: string;
  brCodeBase64: string;
  externalId: string | null;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    cellphone: string;
  };
  transactions: Transaction[];
}

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setPayment(data.payment);
      } else {
        toast.error(data.error || 'Erro ao carregar pagamento');
      }
    } catch (error) {
      console.error('Erro ao carregar pagamento:', error);
      toast.error('Erro ao carregar pagamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      fetchPayment();
    }
  }, [isAdmin, adminLoading, params.id]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        <Link href="/">
          <Button>Voltar para Home</Button>
        </Link>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Pagamento não encontrado</h1>
        <Link href="/admin/payments">
          <Button>Voltar para Pagamentos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/payments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detalhes do Pagamento #{payment.id}</h1>
            <p className="text-muted-foreground">
              ID AbacatePay: {payment.abacatePayId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <PaymentStatusBadge status={payment.status} />
          <Button onClick={fetchPayment} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor</label>
              <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrição</label>
              <p>{payment.description || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID Externo</label>
              <p className="font-mono text-sm">{payment.externalId || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Criado em</label>
              <p>{formatDate(payment.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expira em</label>
              <p>{formatDate(payment.expiresAt)}</p>
            </div>
            {payment.paidAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pago em</label>
                <p>{formatDate(payment.paidAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="font-medium">{payment.customer.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">E-mail</label>
              <p>{payment.customer.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <p>{payment.customer.cellphone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code (only if pending) */}
      {payment.status === 'PENDING' && (
        <QRCodeDisplay
          brCode={payment.brCode}
          brCodeBase64={payment.brCodeBase64}
          amount={payment.amount}
          expiresAt={payment.expiresAt}
        />
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            Todas as atualizações e eventos relacionados a este pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payment.transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação registrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payment.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.type}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={transaction.status as any} />
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}