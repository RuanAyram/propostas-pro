"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Settings, Eye, LogIn } from "lucide-react"
import { ConfigTab } from "@/components/config-tab"
import { PreviewTab } from "@/components/preview-tab"
import { ClientComponent } from "../hooks/user-current-user"
import Link from "next/link"
import { useStackApp } from "@stackframe/stack" 

interface CompanyData {
  nome: string
  documento: string
  endereco: string
  telefone: string
  email: string
  logo?: File | null
}

interface ProposalData {
  contratante: CompanyData
  contratado: CompanyData
  conteudo: string
}

export default function ProposalGenerator() {
  const [activeTab, setActiveTab] = useState("config")
  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState(false)
  
  // Stack authentication
  const app = useStackApp()
  const user = app.useUser()
  
  // Dados globais do contratante (configurações globais)
  const [globalContratanteData, setGlobalContratanteData] = useState<CompanyData>({
    nome: "",
    documento: "",
    endereco: "",
    telefone: "",
    email: "",
    logo: null,
  })

  const [proposalData, setProposalData] = useState<ProposalData>({
    contratante: {
      nome: "",
      documento: "",
      endereco: "",
      telefone: "",
      email: "",
      logo: null,
    },
    contratado: {
      nome: "",
      documento: "",
      endereco: "",
      telefone: "",
      email: "",
      logo: null,
    },
    conteudo: "",
  })

  // Função para salvar configurações globais
  const handleSaveGlobalConfig = () => {
    setProposalData(prev => ({
      ...prev,
      contratante: { ...globalContratanteData }
    }))
    setIsGlobalConfigOpen(false)
  }

  // Função para aplicar dados globais aos dados da proposta
  const handleApplyGlobalData = () => {
    setProposalData(prev => ({
      ...prev,
      contratante: { ...globalContratanteData }
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gerador de Propostas Comerciais</h1>
                <p className="text-sm text-muted-foreground">Crie propostas profissionais online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isGlobalConfigOpen} onOpenChange={setIsGlobalConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações Globais
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Configurações Globais</DialogTitle>
                    <DialogDescription>
                      Configure os dados padrão do contratante que serão aplicados automaticamente nas propostas.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="global-nome">Nome da Empresa</Label>
                      <Input
                        id="global-nome"
                        value={globalContratanteData.nome}
                        onChange={(e) => setGlobalContratanteData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Digite o nome da empresa"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="global-documento">CNPJ/CPF</Label>
                      <Input
                        id="global-documento"
                        value={globalContratanteData.documento}
                        onChange={(e) => setGlobalContratanteData(prev => ({ ...prev, documento: e.target.value }))}
                        placeholder="Digite o CNPJ ou CPF"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="global-endereco">Endereço</Label>
                      <Input
                        id="global-endereco"
                        value={globalContratanteData.endereco}
                        onChange={(e) => setGlobalContratanteData(prev => ({ ...prev, endereco: e.target.value }))}
                        placeholder="Digite o endereço completo"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="global-telefone">Telefone</Label>
                      <Input
                        id="global-telefone"
                        value={globalContratanteData.telefone}
                        onChange={(e) => setGlobalContratanteData(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="Digite o telefone"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="global-email">E-mail</Label>
                      <Input
                        id="global-email"
                        type="email"
                        value={globalContratanteData.email}
                        onChange={(e) => setGlobalContratanteData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Digite o e-mail"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGlobalConfigOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveGlobalConfig}>
                      Salvar e Aplicar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {user ? (
                <ClientComponent />
              ) : (
                <Link href="/auth/sign-in">
                  <Button variant="default" size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
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
            <ConfigTab proposalData={proposalData} onDataChange={setProposalData} />
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <PreviewTab proposalData={proposalData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
