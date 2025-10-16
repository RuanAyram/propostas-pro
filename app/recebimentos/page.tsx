"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Settings, Eye, Download } from "lucide-react"
import { DocumentLayout } from "@/components/document-layout"
import { useStackApp } from "@stackframe/stack"
import { PaymentModalPrint } from "@/components/payment-modal-print"

interface RecebimentoData {
  emitente: {
    nome: string
    documento: string
    endereco: string
  }
  pagador: {
    nome: string
    documento: string
  }
  valor: string
  valorExtenso: string
  referente: string
  formaPagamento: string
  dataRecebimento: string
}

export default function RecebimentosPage() {
  const [activeTab, setActiveTab] = useState("config")
  const app = useStackApp()
  const user = app.useUser()

  const [recebimentoData, setRecebimentoData] = useState<RecebimentoData>({
    emitente: {
      nome: "",
      documento: "",
      endereco: "",
    },
    pagador: {
      nome: "",
      documento: "",
    },
    valor: "",
    valorExtenso: "",
    referente: "",
    formaPagamento: "",
    dataRecebimento: new Date().toISOString().split('T')[0],
  })

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const handleDownload = () => {
    // Abrir modal de pagamento
    setIsPaymentModalOpen(true)
  }

  const handlePaymentComplete = () => {
    // Após pagamento confirmado, permitir download
    console.log("Gerando PDF do recibo...", recebimentoData)
    // TODO: Implementar geração real de PDF
    alert("Gerando PDF do recibo...")
    setIsPaymentModalOpen(false)
  }

  return (
    <DocumentLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Emitente</CardTitle>
              <CardDescription>Informações de quem está emitindo o recibo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="emitente-nome">Nome/Razão Social</Label>
                <Input
                  id="emitente-nome"
                  value={recebimentoData.emitente.nome}
                  onChange={(e) => setRecebimentoData(prev => ({
                    ...prev,
                    emitente: { ...prev.emitente, nome: e.target.value }
                  }))}
                  placeholder="Digite o nome ou razão social"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emitente-documento">CPF/CNPJ</Label>
                <Input
                  id="emitente-documento"
                  value={recebimentoData.emitente.documento}
                  onChange={(e) => setRecebimentoData(prev => ({
                    ...prev,
                    emitente: { ...prev.emitente, documento: e.target.value }
                  }))}
                  placeholder="Digite o CPF ou CNPJ"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emitente-endereco">Endereço</Label>
                <Input
                  id="emitente-endereco"
                  value={recebimentoData.emitente.endereco}
                  onChange={(e) => setRecebimentoData(prev => ({
                    ...prev,
                    emitente: { ...prev.emitente, endereco: e.target.value }
                  }))}
                  placeholder="Digite o endereço completo"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Pagador</CardTitle>
              <CardDescription>Informações de quem está efetuando o pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="pagador-nome">Nome/Razão Social</Label>
                <Input
                  id="pagador-nome"
                  value={recebimentoData.pagador.nome}
                  onChange={(e) => setRecebimentoData(prev => ({
                    ...prev,
                    pagador: { ...prev.pagador, nome: e.target.value }
                  }))}
                  placeholder="Digite o nome ou razão social"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pagador-documento">CPF/CNPJ</Label>
                <Input
                  id="pagador-documento"
                  value={recebimentoData.pagador.documento}
                  onChange={(e) => setRecebimentoData(prev => ({
                    ...prev,
                    pagador: { ...prev.pagador, documento: e.target.value }
                  }))}
                  placeholder="Digite o CPF ou CNPJ"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Recebimento</CardTitle>
              <CardDescription>Informações sobre o valor e motivo do recebimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    value={recebimentoData.valor}
                    onChange={(e) => setRecebimentoData(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="0,00"
                    type="text"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="data">Data do Recebimento</Label>
                  <Input
                    id="data"
                    value={recebimentoData.dataRecebimento}
                    onChange={(e) => setRecebimentoData(prev => ({ ...prev, dataRecebimento: e.target.value }))}
                    type="date"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valorExtenso">Valor por Extenso</Label>
                <Input
                  id="valorExtenso"
                  value={recebimentoData.valorExtenso}
                  onChange={(e) => setRecebimentoData(prev => ({ ...prev, valorExtenso: e.target.value }))}
                  placeholder="Ex: Mil reais"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="referente">Referente a</Label>
                <Textarea
                  id="referente"
                  value={recebimentoData.referente}
                  onChange={(e) => setRecebimentoData(prev => ({ ...prev, referente: e.target.value }))}
                  placeholder="Descreva o motivo do recebimento"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Input
                  id="formaPagamento"
                  value={recebimentoData.formaPagamento}
                  onChange={(e) => setRecebimentoData(prev => ({ ...prev, formaPagamento: e.target.value }))}
                  placeholder="Ex: PIX, Dinheiro, Transferência Bancária"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualização do Recibo</CardTitle>
              <CardDescription>Pré-visualização do documento que será gerado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-8 rounded-lg border">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold">RECIBO</h2>
                  <p className="text-lg mt-2">Nº ___________</p>
                </div>

                <div className="space-y-6 text-sm">
                  <div className="border-b pb-4">
                    <p className="text-lg">
                      <strong>Valor:</strong> R$ {recebimentoData.valor || "0,00"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ({recebimentoData.valorExtenso || "[Valor por extenso]"})
                    </p>
                  </div>

                  <p className="leading-relaxed">
                    Recebi(emos) de <strong>{recebimentoData.pagador.nome || "[Nome do Pagador]"}</strong>, 
                    inscrito(a) no CPF/CNPJ sob o nº <strong>{recebimentoData.pagador.documento || "[Documento]"}</strong>, 
                    a quantia de <strong>R$ {recebimentoData.valor || "0,00"}</strong> ({recebimentoData.valorExtenso || "[valor por extenso]"}), 
                    referente a <strong>{recebimentoData.referente || "[descrição do recebimento]"}</strong>.
                  </p>

                  {recebimentoData.formaPagamento && (
                    <p>
                      <strong>Forma de Pagamento:</strong> {recebimentoData.formaPagamento}
                    </p>
                  )}

                  <div className="mt-8 pt-6 border-t">
                    <p className="mb-6">
                      Para maior clareza, firmo(amos) o presente recibo para que produza os seus efeitos, 
                      dando plena, rasa e irrevogável quitação, pelo valor recebido.
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Local e Data:</strong></p>
                        <p>__________, {new Date(recebimentoData.dataRecebimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t-2 border-black">
                    <div className="space-y-2">
                      <p className="font-semibold text-base">{recebimentoData.emitente.nome || "[Nome do Emitente]"}</p>
                      <p>CPF/CNPJ: {recebimentoData.emitente.documento || "[Documento]"}</p>
                      <p>{recebimentoData.emitente.endereco || "[Endereço]"}</p>
                    </div>
                    <div className="mt-8 text-center">
                      <div className="inline-block border-t-2 border-black pt-2 px-12">
                        <p className="font-semibold">Assinatura do Emitente</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleDownload} disabled={!user}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Recibo (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Pagamento */}
      <PaymentModalPrint
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        onPaymentComplete={handlePaymentComplete}
      />
    </DocumentLayout>
  )
}
