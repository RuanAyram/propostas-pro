'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { validateCPF, validatePhone, formatCPF, formatPhone, unformatCPF, unformatPhone } from '@/lib/validators';
import { useUserProfile } from '@/hooks/use-user-profile';

interface ProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onComplete?: () => void;
}

export function ProfileSetupModal({ open, onOpenChange, userId, onComplete }: ProfileSetupModalProps) {
  const { createProfile, loading } = useUserProfile();
  const [formData, setFormData] = useState({
    cpf: '',
    phone: '',
  });

  const [errors, setErrors] = useState({
    cpf: '',
    phone: '',
  });

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value.length <= 11) {
      if (value.length === 11) {
        value = formatCPF(value);
      }
      setFormData(prev => ({ ...prev, cpf: value }));
      setErrors(prev => ({ ...prev, cpf: '' }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (value.length <= 11) {
      if (value.length >= 10) {
        value = formatPhone(value);
      }
      setFormData(prev => ({ ...prev, phone: value }));
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      cpf: '',
      phone: '',
    };

    let isValid = true;

    // Validar CPF
    const cpfClean = unformatCPF(formData.cpf);
    if (!cpfClean) {
      newErrors.cpf = 'CPF é obrigatório';
      isValid = false;
    } else if (!validateCPF(cpfClean)) {
      newErrors.cpf = 'CPF inválido';
      isValid = false;
    }

    // Validar telefone
    const phoneClean = unformatPhone(formData.phone);
    if (!phoneClean) {
      newErrors.phone = 'Telefone é obrigatório';
      isValid = false;
    } else if (!validatePhone(phoneClean)) {
      newErrors.phone = 'Telefone inválido';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createProfile({
        userId,
        cpf: unformatCPF(formData.cpf),
        phone: unformatPhone(formData.phone),
      });

      onOpenChange(false);
      onComplete?.();
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
    }
  };

  // Resetar formulário quando o modal fechar
  useEffect(() => {
    if (!open) {
      setFormData({ cpf: '', phone: '' });
      setErrors({ cpf: '', phone: '' });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete seu Cadastro</DialogTitle>
          <DialogDescription>
            Para continuar, precisamos de algumas informações adicionais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={handleCPFChange}
              disabled={loading}
              maxLength={14}
            />
            {errors.cpf && (
              <p className="text-sm text-red-600">{errors.cpf}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="text"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handlePhoneChange}
              disabled={loading}
              maxLength={15}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar e Continuar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}