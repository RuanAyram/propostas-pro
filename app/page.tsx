"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, Settings, Eye } from "lucide-react"
import { ConfigTab } from "@/components/config-tab"
import { PreviewTab } from "@/components/preview-tab"

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
            {/*<Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configurações Globais
            </Button>*/}
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
