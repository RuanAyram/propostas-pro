'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, Ban } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      label: 'Pendente',
      variant: 'secondary' as const,
      icon: Clock,
      color: 'text-yellow-600',
    },
    PAID: {
      label: 'Pago',
      variant: 'default' as const,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    EXPIRED: {
      label: 'Expirado',
      variant: 'destructive' as const,
      icon: XCircle,
      color: 'text-red-600',
    },
    CANCELLED: {
      label: 'Cancelado',
      variant: 'outline' as const,
      icon: Ban,
      color: 'text-gray-600',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className={`mr-1 h-3 w-3 ${config.color}`} />
      {config.label}
    </Badge>
  );
}