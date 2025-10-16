"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Settings, LogIn, Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { ClientComponent } from "@/hooks/user-current-user"
import { ProfileSetupModal } from "@/components/profile-setup-modal"
import { useState, useEffect } from "react"
import { useStackApp } from "@stackframe/stack"
import { useUserProfile } from "@/hooks/use-user-profile"
import { toast } from "sonner"

interface CompanyData {
  nome: string
  documento: string
  endereco: string
  telefone: string
  email: string
  logo?: File | null
  logoUrl?: string | null
}

interface DocumentLayoutProps {
  children: ReactNode
}

export function DocumentLayout({ children }: DocumentLayoutProps) {
  const [isGlobalConfigOpen, setIsGlobalConfigOpen] = useState(false)
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false)
  
  const app = useStackApp()
  const user = app.useUser()
  const { profile, loading: profileLoading, fetchProfile } = useUserProfile(user?.id)
  
  const [globalContratanteData, setGlobalContratanteData] = useState<CompanyData>({
    nome: "",
    documento: "",
    endereco: "",
    telefone: "",
    email: "",
    logo: null,
    logoUrl: null,
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [contractorLogoUrl, setContractorLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user && isGlobalConfigOpen) {
      loadContractorData()
    }
  }, [user, isGlobalConfigOpen])

  const loadContractorData = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/contractor?userId=${user.id}`)
      if (response.ok) {
        const contractor = await response.json()
        setGlobalContratanteData({
          nome: contractor.nome,
          documento: contractor.documento,
          endereco: contractor.endereco,
          telefone: contractor.telefone,
          email: contractor.email,
          logo: null,
          logoUrl: contractor.logoUrl,
        })
        setContractorLogoUrl(contractor.logoUrl)
        setLogoPreview(contractor.logoUrl)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do contratante:', error)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo deve ter no máximo 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas arquivos de imagem são permitidos')
      return
    }

    setLogoFile(file)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setContractorLogoUrl(null)
  }

  const handleSaveGlobalConfig = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsUploading(true)

    try {
      let logoUrl = contractorLogoUrl
      let logoPublicId = null

      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)
        const folderName = user.id.replace(/[^a-zA-Z0-9]/g, '_')
        formData.append('folderName', folderName)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Erro ao fazer upload da imagem')
        }

        const uploadData = await uploadResponse.json()
        logoUrl = uploadData.url
        logoPublicId = uploadData.publicId
      }

      const response = await fetch('/api/contractor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          nome: globalContratanteData.nome,
          documento: globalContratanteData.documento,
          endereco: globalContratanteData.endereco,
          telefone: globalContratanteData.telefone,
          email: globalContratanteData.email,
          logoUrl,
          logoPublicId,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar dados do contratante')
      }

      const contractor = await response.json()
      
      setGlobalContratanteData(prev => ({
        ...prev,
        logoUrl: contractor.logoUrl,
      }))
      setContractorLogoUrl(contractor.logoUrl)

      toast.success('Configurações salvas com sucesso!')
      setIsGlobalConfigOpen(false)
      setLogoFile(null)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (user && !profileLoading) {
      if (!profile) {
        // Perfil não existe, abrir modal
        setIsProfileSetupOpen(true)
      } else {
        // Perfil existe, fechar modal
        setIsProfileSetupOpen(false)
      }
    }
  }, [user, profile, profileLoading])

  const handleProfileComplete = async () => {
    toast.success('Perfil completado com sucesso!')
    // Recarregar perfil
    if (user?.id) {
      await fetchProfile(user.id)
    }
    setIsProfileSetupOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-foreground">Sistema de Documentos</h1>
                  <p className="text-sm text-muted-foreground">Propostas, Contratos e Recebimentos</p>
                </div>
              </div>
              <MainNav />
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isGlobalConfigOpen} onOpenChange={setIsGlobalConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!user}>
                    <Settings className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Configurações Globais</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Configurações Globais</DialogTitle>
                    <DialogDescription>
                      Configure os dados padrão do contratante que serão aplicados automaticamente.
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
                    <div className="grid gap-2">
                      <Label htmlFor="global-logo">Logotipo</Label>
                      <div className="space-y-3">
                        {logoPreview ? (
                          <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                            <Image
                              src={logoPreview}
                              alt="Preview da logo"
                              fill
                              className="object-contain"
                            />
                            <button
                              onClick={removeLogo}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                              <label htmlFor="global-logo-input" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Fazer Upload
                              </label>
                            </Button>
                            <input
                              id="global-logo-input"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoChange}
                            />
                            <span className="text-sm text-muted-foreground">PNG, JPG até 2MB</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGlobalConfigOpen(false)} disabled={isUploading}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveGlobalConfig} disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar e Aplicar'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {user ? (
                <ClientComponent />
              ) : (
                <Link href="/auth/sign-in">
                  <Button variant="default" size="sm">
                    <LogIn className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Login</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      <MobileNav />

      {user && (
        <ProfileSetupModal
          open={isProfileSetupOpen}
          onOpenChange={setIsProfileSetupOpen}
          userId={user.id}
          onComplete={handleProfileComplete}
        />
      )}
    </div>
  )
}
