"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Eye } from "lucide-react"
import { DocumentLayout } from "@/components/document-layout"
import { useStackApp } from "@stackframe/stack"
import { ContractPreviewTab } from "@/components/contract-preview-tab"

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

export default function ContratosPage() {
  const [activeTab, setActiveTab] = useState("config")
  const app = useStackApp()
  const user = app.useUser()

  const [contractData, setContractData] = useState<ContractData>({
    contratante: {
      nome: "",
      documento: "",
      endereco: "",
    },
    contratado: {
      nome: "",
      documento: "",
      endereco: "",
    },
    objeto: "",
    valor: "",
    prazo: "",
    clausulas: "",
  })

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
              <CardTitle>Dados do Contratante</CardTitle>
              <CardDescription>Informações de quem está contratando</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="contratante-nome">Nome/Razão Social</Label>
                <Input
                  id="contratante-nome"
                  value={contractData.contratante.nome}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    contratante: { ...prev.contratante, nome: e.target.value }
                  }))}
                  placeholder="Digite o nome ou razão social"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contratante-documento">CPF/CNPJ</Label>
                <Input
                  id="contratante-documento"
                  value={contractData.contratante.documento}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    contratante: { ...prev.contratante, documento: e.target.value }
                  }))}
                  placeholder="Digite o CPF ou CNPJ"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contratante-endereco">Endereço</Label>
                <Input
                  id="contratante-endereco"
                  value={contractData.contratante.endereco}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    contratante: { ...prev.contratante, endereco: e.target.value }
                  }))}
                  placeholder="Digite o endereço completo"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Contratado</CardTitle>
              <CardDescription>Informações de quem está sendo contratado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="contratado-nome">Nome/Razão Social</Label>
                <Input
                  id="contratado-nome"
                  value={contractData.contratado.nome}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    contratado: { ...prev.contratado, nome: e.target.value }
                  }))}
                  placeholder="Digite o nome ou razão social"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contratado-documento">CPF/CNPJ</Label>
                <Input
                  id="contratado-documento"
                  value={contractData.contratado.documento}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    contratado: { ...prev.contratado, documento: e.target.value }
                  }))}
                  placeholder="Digite o CPF ou CNPJ"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contratado-endereco">Endereço</Label>
                <Input
                  id="contratado-endereco"
                  value={contractData.contratado.endereco}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    contratado: { ...prev.contratado, endereco: e.target.value }
                  }))}
                  placeholder="Digite o endereço completo"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Contrato</CardTitle>
              <CardDescription>Informações sobre o objeto e condições do contrato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="objeto">Objeto do Contrato</Label>
                <Textarea
                  id="objeto"
                  value={contractData.objeto}
                  onChange={(e) => setContractData(prev => ({ ...prev, objeto: e.target.value }))}
                  placeholder="Descreva o objeto do contrato"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
                    value={contractData.valor}
                    onChange={(e) => setContractData(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prazo">Prazo</Label>
                  <Input
                    id="prazo"
                    value={contractData.prazo}
                    onChange={(e) => setContractData(prev => ({ ...prev, prazo: e.target.value }))}
                    placeholder="Ex: 12 meses"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clausulas">Cláusulas Adicionais</Label>
                <Textarea
                  id="clausulas"
                  value={contractData.clausulas}
                  onChange={(e) => setContractData(prev => ({ ...prev, clausulas: e.target.value }))}
                  placeholder="Digite as cláusulas adicionais do contrato"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <ContractPreviewTab contractData={contractData} user={user} />
        </TabsContent>
      </Tabs>

    </DocumentLayout>
  )
}
