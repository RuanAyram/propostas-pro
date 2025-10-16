"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, QrCode, Loader2, Check, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useStackApp } from "@stackframe/stack"
import { toast } from "sonner"
import { usePayment } from "@/hooks/use-payment"

interface PaymentModalPrintProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentComplete?: () => void
}

export function PaymentModalPrint({ open, onOpenChange, onPaymentComplete }: PaymentModalPrintProps) {
  const app = useStackApp()
  const user = app.useUser()
  const { createPayment, checkPaymentStatus: checkStatus, loading, payment, resetPayment } = usePayment()
  
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual" | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)

  const plans = {
    monthly: {
      value: 49.90,
      label: "Mensal",
      description: "Renovação automática mensal"
    },
    annual: {
      value: 499.00,
      label: "Anual",
      description: "Economize 2 meses pagando anualmente"
    }
  }

  const handlePixPayment = async (plan: "monthly" | "annual") => {
    if (!user?.primaryEmail || !user?.id) {
      toast.error('Usuário não autenticado ou sem dados completos')
      return
    }

    setSelectedPlan(plan)

    try {
      const amount = plan === 'monthly' ? 49.90 : 499.00
      const description = plan === 'monthly' 
        ? 'Assinatura Mensal - Gerador de Propostas'
        : 'Assinatura Anual - Gerador de Propostas'
      
      // Buscar dados do perfil do usuário para CPF e telefone
      const profileResponse = await fetch(`/api/user/profile?userId=${user.id}`)
      let userProfile = null
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        userProfile = profileData.profile
      }
      
      const paymentData = await createPayment({
        amount,
        description,
        expiresIn: 3600, // 1 hora
        customer: {
          name: user.displayName || user.primaryEmail,
          userId: user.id,
          email: user.primaryEmail,
          cellphone: userProfile?.phone || '00000000000',
          taxId: userProfile?.cpf || '00000000000',
        },
        externalId: user.id,
        plan,
      })
      
      setPaymentMethod("pix")
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error)
      // O erro já é tratado pelo hook
    }
  }

  const handleCopyPixCode = async () => {
    if (!payment?.brCode) return
    
    try {
      await navigator.clipboard.writeText(payment.brCode)
      toast.success('Código PIX copiado para área de transferência!')
    } catch (error) {
      console.error("Erro ao copiar:", error)
      toast.error('Erro ao copiar código PIX')
    }
  }

  const handleCheckPaymentStatus = useCallback(async () => {
    if (!payment?.id) return

    setIsCheckingPayment(true)
    try {
      const updatedPayment = await checkStatus(payment.id)

      if (updatedPayment.status === 'PAID') {
        toast.success('Pagamento confirmado!')
        if (onPaymentComplete) {
          onPaymentComplete()
        }
      } else if (updatedPayment.status === 'EXPIRED') {
        toast.error('Pagamento expirado. Gere um novo QR Code.')
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error)
    } finally {
      setIsCheckingPayment(false)
    }
  }, [payment?.id, checkStatus, onPaymentComplete])

  // Verificar status do pagamento a cada 5 segundos
  useEffect(() => {
    if (paymentMethod === 'pix' && payment?.id && payment.status === 'PENDING') {
      const interval = setInterval(() => {
        handleCheckPaymentStatus()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [paymentMethod, payment?.id, payment?.status, handleCheckPaymentStatus])

  const handleReset = () => {
    setPaymentMethod(null)
    setSelectedPlan(null)
    resetPayment()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen)
      if (!isOpen) {
        handleReset()
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Escolha a forma de pagamento</DialogTitle>
          <DialogDescription>
            Para imprimir sua proposta, escolha uma das opções de pagamento abaixo
          </DialogDescription>
        </DialogHeader>

        {!paymentMethod && (
          <div className="grid gap-4 py-4">
            {/* Opção PIX */}
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Pagar com PIX</CardTitle>
                    <CardDescription>Pagamento instantâneo via QR Code</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4 hover:border-primary hover:bg-primary/5"
                    onClick={() => handlePixPayment("monthly")}
                    disabled={loading}
                  >
                    {loading && selectedPlan === "monthly" ? (
                      <Loader2 className="h-5 w-5 animate-spin mb-2" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-primary">R$ 49,90</div>
                        <div className="text-sm text-muted-foreground">Mensal</div>
                        <Badge variant="secondary" className="mt-2">Renovação automática</Badge>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4 hover:border-primary hover:bg-primary/5 relative"
                    onClick={() => handlePixPayment("annual")}
                    disabled={loading}
                  >
                    {loading && selectedPlan === "annual" ? (
                      <Loader2 className="h-5 w-5 animate-spin mb-2" />
                    ) : (
                      <>
                        <Badge className="absolute -top-2 -right-2 bg-green-500">Economize 17%</Badge>
                        <div className="text-2xl font-bold text-primary">R$ 499,00</div>
                        <div className="text-sm text-muted-foreground">Anual</div>
                        <Badge variant="secondary" className="mt-2">12 meses</Badge>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Opção Cartão */}
            <Card className="opacity-50 cursor-not-allowed">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-muted-foreground">Pagar com Cartão</CardTitle>
                    <CardDescription>Em breve - Cartão de crédito ou débito</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Em desenvolvimento</Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {paymentMethod === "pix" && payment && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Pagamento {selectedPlan === "monthly" ? "Mensal" : "Anual"}
              </h3>
              <p className="text-3xl font-bold text-primary mb-1">
                R$ {selectedPlan === "monthly" ? "49,90" : "499,00"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedPlan === "monthly" ? "Renovação mensal" : "Pagamento único anual"}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-primary/20">
                    <Image
                      src={`${payment.brCodeBase64}`}
                      alt="QR Code PIX"
                      width={250}
                      height={250}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="w-full space-y-2">
                    <p className="text-sm font-medium text-center">Código PIX Copia e Cola:</p>
                    <div className="flex gap-2">
                      <code className="flex-1 p-3 bg-muted rounded text-xs break-all">
                        {payment.brCode}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPixCode}
                        className="shrink-0"
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>

                  <div className="w-full space-y-2 pt-4 border-t">
                    {payment.status === 'PAID' ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                          <Check className="h-5 w-5" />
                          <span>Pagamento Confirmado!</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">Seu acesso foi liberado.</p>
                      </div>
                    ) : payment.status === 'EXPIRED' ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 font-semibold">
                          <AlertCircle className="h-5 w-5" />
                          <span>Pagamento Expirado</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">Gere um novo QR Code para continuar.</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Pagamento seguro via PIX</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Confirmação instantânea</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {isCheckingPayment ? (
                            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          <span>Verificando pagamento...</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Voltar
              </Button>
              <Button variant="default" onClick={() => onOpenChange(false)} className="flex-1">
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
