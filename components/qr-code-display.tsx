'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface QRCodeDisplayProps {
  brCode: string;
  brCodeBase64: string;
  amount: number;
  expiresAt: string;
}

export function QRCodeDisplay({ brCode, brCodeBase64, amount, expiresAt }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(brCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar código');
    }
  };

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

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Pagamento via PIX</CardTitle>
        <CardDescription>
          Valor: <span className="font-bold text-lg">{formatCurrency(amount)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg">
            <Image
              src={brCodeBase64}
              alt="QR Code PIX"
              width={256}
              height={256}
              className="w-64 h-64"
            />
          </div>
        </div>

        {/* Código Copia e Cola */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Código PIX (Copia e Cola)</label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-muted rounded-md text-xs font-mono break-all">
              {brCode}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Como pagar:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abra o app do seu banco</li>
            <li>Escolha pagar via PIX</li>
            <li>Escaneie o QR Code ou cole o código</li>
            <li>Confirme o pagamento</li>
          </ol>
        </div>

        {/* Expiração */}
        <div className="text-center text-sm text-muted-foreground">
          Expira em: <span className="font-medium">{formatDate(expiresAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}