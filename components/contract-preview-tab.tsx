"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, ZoomIn, ZoomOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { printDocument } from "@/lib/pdf-utils"
import { PaymentModalPrint } from "@/components/payment-modal-print"
import { useAdmin } from "@/hooks/use-admin"
import { toast } from "sonner"

interface ContractData {
  contratante: {
    nome: string
    documento: string
    endereco: string
  }
  contratado: {
    nome: string
    documento: string
    endereco: string
  }
  objeto: string
  valor: string
  prazo: string
  clausulas: string
}

interface ContractPreviewTabProps {
  contractData?: ContractData
  user?: any
}

export function ContractPreviewTab({ contractData, user }: ContractPreviewTabProps) {
  const [zoomLevel, setZoomLevel] = useState(0.7)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const previewRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { isAdmin } = useAdmin()

  // Altura de uma página A4 em pixels (1123px) menos header (120px) e footer (48px)
  const PAGE_CONTENT_HEIGHT = 1123 - 120 - 48 // 955px de conteúdo por página

  // Calcular número de páginas baseado na altura do conteúdo
  useEffect(() => {
    if (contentRef.current && contractData) {
      const contentHeight = contentRef.current.scrollHeight
      const calculatedPages = Math.ceil(contentHeight / PAGE_CONTENT_HEIGHT)
      setTotalPages(Math.max(1, calculatedPages))
    } else {
      setTotalPages(1)
    }
  }, [contractData, PAGE_CONTENT_HEIGHT])

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5))
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.3))

  const hasData =
    contractData && (contractData.contratante.nome || contractData.contratado.nome || contractData.objeto)

  const handlePrint = async () => {
    // Se for admin, imprime diretamente sem pagar
    if (isAdmin) {
      if (!previewRef.current) return

      try {
        printDocument(previewRef.current)
        toast.success('Impressão iniciada!')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Falha ao imprimir')
      }
      return
    }

    // Verificar se usuário tem acesso ativo
    if (user?.id) {
      try {
        const response = await fetch(`/api/payments/check-access?userId=${user.id}`)
        const data = await response.json()

        if (data.success && data.hasAccess && !data.needsPayment) {
          // Usuário tem acesso ativo, imprime diretamente
          if (!previewRef.current) return

          try {
            printDocument(previewRef.current)
            toast.success('Impressão iniciada!')
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Falha ao imprimir')
          }
          return
        }
      } catch (error) {
        console.error('Erro ao verificar acesso:', error)
      }
    }

    // Se não tem acesso ativo, abre modal de pagamento
    setIsPaymentModalOpen(true)
  }

  const handlePaymentComplete = () => {
    // Após pagamento confirmado, permitir impressão
    if (!previewRef.current) return

    try {
      printDocument(previewRef.current)
      toast.success('Janela de impressão aberta!')
      setIsPaymentModalOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao imprimir')
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Ações do Contrato</CardTitle>
          <CardDescription>Imprima seu contrato</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              variant="default"
              className="flex items-center gap-2"
              disabled={!hasData}
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Badge variant="secondary">{Math.round(zoomLevel * 100)}%</Badge>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!hasData && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Configure os dados na aba "Configuração" para visualizar o contrato.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* A4 Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Visualização A4</CardTitle>
          <CardDescription>Prévia de como seu contrato será exibido no formato A4</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center bg-gray-100 p-8 rounded-lg">
            <div
              className="bg-white shadow-2xl transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
              }}
            >
              <div ref={previewRef} className="w-[794px] bg-white" id="contract-preview">
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="w-[794px] h-[1123px] bg-white flex flex-col relative"
                    style={{
                      pageBreakAfter: pageIndex < totalPages - 1 ? 'always' : 'auto',
                      breakAfter: pageIndex < totalPages - 1 ? 'page' : 'auto',
                    }}
                  >
                    {/* Header - apenas na primeira página */}
                    {pageIndex === 0 && (
                      <div className="px-12 py-8 border-b-2 border-primary/20 flex-shrink-0">
                  <h1 className="text-3xl font-bold text-center text-primary mb-2">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
                        <p className="text-center text-sm text-muted-foreground">
                          Contrato Nº: {String(Date.now()).slice(-6)}/{new Date().toLocaleDateString("pt-BR", { year: 'numeric' })}
                        </p>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 px-12 py-8 overflow-hidden">
                      {pageIndex === 0 && (
                        <div ref={contentRef} className="space-y-6">
                  {/* Partes */}
                  <div>
                    <h2 className="text-lg font-bold text-primary mb-3">DAS PARTES</h2>
                    
                    <div className="mb-4">
                      <p className="font-semibold">CONTRATANTE:</p>
                      <p className="text-sm">{contractData?.contratante.nome || "[Nome do Contratante]"}</p>
                      <p className="text-sm text-muted-foreground">
                        CNPJ/CPF: {contractData?.contratante.documento || "[Documento]"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Endereço: {contractData?.contratante.endereco || "[Endereço]"}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold">CONTRATADO:</p>
                      <p className="text-sm">{contractData?.contratado.nome || "[Nome do Contratado]"}</p>
                      <p className="text-sm text-muted-foreground">
                        CNPJ/CPF: {contractData?.contratado.documento || "[Documento]"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Endereço: {contractData?.contratado.endereco || "[Endereço]"}
                      </p>
                    </div>
                  </div>

                  {/* Objeto */}
                  <div>
                    <h2 className="text-lg font-bold text-primary mb-3">DO OBJETO</h2>
                    <p className="text-sm text-justify whitespace-pre-wrap">
                      {contractData?.objeto || "[Descrição do objeto do contrato]"}
                    </p>
                  </div>

                  {/* Valor */}
                  <div>
                    <h2 className="text-lg font-bold text-primary mb-3">DO VALOR</h2>
                    <p className="text-sm text-justify whitespace-pre-wrap">
                      {contractData?.valor || "[Valor e forma de pagamento]"}
                    </p>
                  </div>

                  {/* Prazo */}
                  <div>
                    <h2 className="text-lg font-bold text-primary mb-3">DO PRAZO</h2>
                    <p className="text-sm text-justify whitespace-pre-wrap">
                      {contractData?.prazo || "[Prazo de vigência do contrato]"}
                    </p>
                  </div>

                  {/* Cláusulas */}
                  <div>
                    <h2 className="text-lg font-bold text-primary mb-3">DAS CLÁUSULAS GERAIS</h2>
                    <div className="text-sm text-justify whitespace-pre-wrap space-y-2">
                      {contractData?.clausulas || "[Cláusulas contratuais]"}
                    </div>
                  </div>

                  {/* Assinaturas */}
                  <div className="mt-12 pt-8">
                    <p className="text-sm text-center mb-12">
                      {new Date().toLocaleDateString("pt-BR", { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>

                    <div className="grid grid-cols-2 gap-8 mt-16">
                      <div className="text-center">
                        <div className="border-t border-foreground/30 pt-2">
                          <p className="text-sm font-semibold">{contractData?.contratante.nome || "CONTRATANTE"}</p>
                          <p className="text-xs text-muted-foreground">
                            {contractData?.contratante.documento || "CPF/CNPJ"}
                          </p>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="border-t border-foreground/30 pt-2">
                          <p className="text-sm font-semibold">{contractData?.contratado.nome || "CONTRATADO"}</p>
                          <p className="text-xs text-muted-foreground">
                            {contractData?.contratado.documento || "CPF/CNPJ"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                        </div>
                      )}
                    </div>

                    {/* Footer - em todas as páginas */}
                    <div className="px-12 py-4 border-t border-primary/20 bg-muted/10 flex-shrink-0 mt-auto">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <p>Contrato de Prestação de Serviços</p>
                        <p>Página {pageIndex + 1} de {totalPages}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="outline">Formato A4</Badge>
                <Badge variant="outline">210mm × 297mm</Badge>
                <Badge variant="outline">Zoom: {Math.round(zoomLevel * 100)}%</Badge>
              </div>
              <p className="text-muted-foreground">Use os controles de zoom para ajustar a visualização</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Pagamento */}
      <PaymentModalPrint
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  )
}
