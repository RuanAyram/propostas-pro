"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Eye } from "lucide-react"
import { ConfigTab } from "@/components/config-tab"
import { PreviewTab } from "@/components/preview-tab"
import { useStackApp } from "@stackframe/stack"
import { DocumentLayout } from "@/components/document-layout" 

interface CompanyData {
  nome: string
  documento: string
  endereco: string
  telefone: string
  email: string
  logo?: File | null
  logoUrl?: string | null
}

interface ProposalData {
  contratante: CompanyData
  contratado: CompanyData
  conteudo: string
}

export default function ProposalGenerator() {
  const [activeTab, setActiveTab] = useState("config")
  const app = useStackApp()
  const user = app.useUser()

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
          <ConfigTab proposalData={proposalData} onDataChange={setProposalData} user={user}/>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <PreviewTab proposalData={proposalData} user={user}/>
        </TabsContent>
      </Tabs>
    </DocumentLayout>
  )
}
