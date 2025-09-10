"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, Building2, User, FileText, X, Check, Save, FolderOpen } from "lucide-react"
import { RichTextEditor } from "@/components/rich-text-editor"

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

interface Template {
  id: number
  name: string
  content: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface ConfigTabProps {
  proposalData: ProposalData
  onDataChange: (data: ProposalData) => void
}

export function ConfigTab({ proposalData, onDataChange }: ConfigTabProps) {
  const [uploadedFiles, setUploadedFiles] = useState<{
    contratante?: string
    contratado?: string
  }>({})

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateName, setTemplateName] = useState("")

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    }
  }

  const updateContratante = (field: keyof CompanyData, value: string) => {
    onDataChange({
      ...proposalData,
      contratante: { ...proposalData.contratante, [field]: value },
    })
    if (validationErrors[`contratante.${field}`]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`contratante.${field}`]
        return newErrors
      })
    }
  }

  const updateContratado = (field: keyof CompanyData, value: string) => {
    onDataChange({
      ...proposalData,
      contratado: { ...proposalData.contratado, [field]: value },
    })
    if (validationErrors[`contratado.${field}`]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`contratado.${field}`]
        return newErrors
      })
    }
  }

  const handleFileUpload = (type: "contratante" | "contratado", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setValidationErrors((prev) => ({
          ...prev,
          [`${type}.logo`]: "Apenas arquivos de imagem são permitidos",
        }))
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          [`${type}.logo`]: "Arquivo deve ter no máximo 2MB",
        }))
        return
      }

      onDataChange({
        ...proposalData,
        [type]: { ...proposalData[type], logo: file },
      })

      setUploadedFiles((prev) => ({
        ...prev,
        [type]: file.name,
      }))

      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`${type}.logo`]
        return newErrors
      })
    }
  }

  const removeFile = (type: "contratante" | "contratado") => {
    onDataChange({
      ...proposalData,
      [type]: { ...proposalData[type], logo: null },
    })

    setUploadedFiles((prev) => {
      const newFiles = { ...prev }
      delete newFiles[type]
      return newFiles
    })
  }

  const validateSection = (section: "contratante" | "contratado") => {
    const data = proposalData[section]
    const errors: Record<string, string> = {}

    if (!data.nome.trim()) errors[`${section}.nome`] = "Nome é obrigatório"
    if (!data.documento.trim()) errors[`${section}.documento`] = "Documento é obrigatório"
    if (!data.endereco.trim()) errors[`${section}.endereco`] = "Endereço é obrigatório"
    if (!data.telefone.trim()) errors[`${section}.telefone`] = "Telefone é obrigatório"
    if (!data.email.trim()) errors[`${section}.email`] = "E-mail é obrigatório"
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors[`${section}.email`] = "E-mail inválido"

    return errors
  }

  const getSectionCompletionStatus = (section: "contratante" | "contratado") => {
    const data = proposalData[section]
    const requiredFields = ["nome", "documento", "endereco", "telefone", "email"]
    const completedFields = requiredFields.filter((field) => data[field as keyof CompanyData]?.toString().trim())
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      isComplete: completedFields.length === requiredFields.length,
    }
  }

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Digite um nome para o template")
      return
    }

    if (!proposalData.conteudo.trim()) {
      alert("Adicione conteúdo antes de salvar o template")
      return
    }

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: templateName,
          content: proposalData.conteudo,
          description: `Template criado em ${new Date().toLocaleDateString()}`,
        }),
      })

      if (response.ok) {
        const newTemplate = await response.json()
        setTemplates((prev) => [...prev, newTemplate])
        setTemplateName("")
        alert("Template salvo com sucesso!")
        loadTemplates() // Recarregar templates do banco
      } else {
        const errorData = await response.json()
        alert(`Erro ao salvar template: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error("Error saving template:", error)
      alert("Erro ao salvar template. Tente novamente.")
    }
  }

  const loadTemplate = (template: Template) => {
    onDataChange({
      ...proposalData,
      conteudo: template.content,
    })
    alert(`Template "${template.name}" carregado com sucesso!`)
  }

  const deleteTemplate = async (templateId: number) => {
    if (confirm("Tem certeza que deseja excluir este template?")) {
      try {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          alert("Template excluído com sucesso!")
          loadTemplates() // Recarregar templates do banco
        } else {
          const errorData = await response.json()
          alert(`Erro ao excluir template: ${errorData.error || 'Erro desconhecido'}`)
        }
      } catch (error) {
        console.error("Error deleting template:", error)
        alert("Erro ao excluir template. Tente novamente.")
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuração da Proposta
          </CardTitle>
          <CardDescription>Configure as informações do contratante, contratado e conteúdo da proposta</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full" defaultValue="contratante">
            <AccordionItem value="contratante">
              <AccordionTrigger className="flex items-center gap-2 hover:no-underline">
                <div className="flex items-center gap-2 flex-1">
                  <Building2 className="h-4 w-4" />
                  <span>Dados do Contratante</span>
                  {(() => {
                    const status = getSectionCompletionStatus("contratante")
                    return (
                      <Badge variant={status.isComplete ? "default" : "secondary"} className="ml-auto mr-2">
                        {status.isComplete ? <Check className="h-3 w-3 mr-1" /> : null}
                        {status.completed}/{status.total}
                      </Badge>
                    )
                  })()}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4 pl-2" style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contratante-nome">Nome/Razão Social *</Label>
                    <Input
                      id="contratante-nome"
                      placeholder="Digite o nome ou razão social"
                      value={proposalData.contratante.nome}
                      onChange={(e) => updateContratante("nome", e.target.value)}
                      className={validationErrors["contratante.nome"] ? "border-destructive" : ""}
                    />
                    {validationErrors["contratante.nome"] && (
                      <p className="text-sm text-destructive">{validationErrors["contratante.nome"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contratante-documento">CNPJ/CPF *</Label>
                    <Input
                      id="contratante-documento"
                      placeholder="00.000.000/0000-00"
                      value={proposalData.contratante.documento}
                      onChange={(e) => updateContratante("documento", e.target.value)}
                      className={validationErrors["contratante.documento"] ? "border-destructive" : ""}
                    />
                    {validationErrors["contratante.documento"] && (
                      <p className="text-sm text-destructive">{validationErrors["contratante.documento"]}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contratante-endereco">Endereço *</Label>
                  <Textarea
                    id="contratante-endereco"
                    placeholder="Endereço completo"
                    rows={2}
                    value={proposalData.contratante.endereco}
                    onChange={(e) => updateContratante("endereco", e.target.value)}
                    className={validationErrors["contratante.endereco"] ? "border-destructive" : ""}
                  />
                  {validationErrors["contratante.endereco"] && (
                    <p className="text-sm text-destructive">{validationErrors["contratante.endereco"]}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contratante-telefone">Telefone *</Label>
                    <Input
                      id="contratante-telefone"
                      placeholder="(00) 00000-0000"
                      value={proposalData.contratante.telefone}
                      onChange={(e) => updateContratante("telefone", e.target.value)}
                      className={validationErrors["contratante.telefone"] ? "border-destructive" : ""}
                    />
                    {validationErrors["contratante.telefone"] && (
                      <p className="text-sm text-destructive">{validationErrors["contratante.telefone"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contratante-email">E-mail *</Label>
                    <Input
                      id="contratante-email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={proposalData.contratante.email}
                      onChange={(e) => updateContratante("email", e.target.value)}
                      className={validationErrors["contratante.email"] ? "border-destructive" : ""}
                    />
                    {validationErrors["contratante.email"] && (
                      <p className="text-sm text-destructive">{validationErrors["contratante.email"]}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contratante-logo">Logotipo</Label>
                  <div className="flex items-center gap-4">
                    {!uploadedFiles.contratante ? (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <label htmlFor="contratante-logo-input" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Fazer Upload
                          </label>
                        </Button>
                        <input
                          id="contratante-logo-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("contratante", e)}
                        />
                        <span className="text-sm text-muted-foreground">PNG, JPG até 2MB</span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {uploadedFiles.contratante}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => removeFile("contratante")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {validationErrors["contratante.logo"] && (
                    <p className="text-sm text-destructive">{validationErrors["contratante.logo"]}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contratado">
              <AccordionTrigger className="flex items-center gap-2 hover:no-underline">
                <div className="flex items-center gap-2 flex-1">
                  <User className="h-4 w-4" />
                  <span>Dados do Contratado</span>
                  {(() => {
                    const status = getSectionCompletionStatus("contratado")
                    return (
                      <Badge variant={status.isComplete ? "default" : "secondary"} className="ml-auto mr-2">
                        {status.isComplete ? <Check className="h-3 w-3 mr-1" /> : null}
                        {status.completed}/{status.total}
                      </Badge>
                    )
                  })()}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4 pl-2" style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contratado-nome">Nome/Razão Social *</Label>
                    <Input
                      id="contratado-nome"
                      placeholder="Digite o nome ou razão social"
                      value={proposalData.contratado.nome}
                      onChange={(e) => updateContratado("nome", e.target.value)}
                      className={validationErrors["contratado.nome"] ? "border-destructive" : ""}
                    />
                    {validationErrors["contratado.nome"] && (
                      <p className="text-sm text-destructive">{validationErrors["contratado.nome"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contratado-documento">CNPJ/CPF *</Label>
                    <Input
                      id="contratado-documento"
                      placeholder="00.000.000/0000-00"
                      value={proposalData.contratado.documento}
                      onChange={(e) => updateContratado("documento", e.target.value)}
                      className={validationErrors["contratado.documento"] ? "border-destructive" : ""}
                    />
                    {validationErrors["contratado.documento"] && (
                      <p className="text-sm text-destructive">{validationErrors["contratado.documento"]}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contratado-endereco">Endereço *</Label>
                  <Textarea
                    id="contratado-endereco"
                    placeholder="Endereço completo"
                    rows={2}
                    value={proposalData.contratado.endereco}
                    onChange={(e) => updateContratado("endereco", e.target.value)}
                    className={validationErrors["contratado.endereco"] ? "border-destructive" : ""}
                  />
                  {validationErrors["contratado.endereco"] && (
                    <p className="text-sm text-destructive">{validationErrors["contratado.endereco"]}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contratado-telefone">Telefone *</Label>
                    <Input
                      id="contratado-telefone"
                      placeholder="(00) 00000-0000"
                      value={proposalData.contratado.telefone}
                      onChange={(e) => updateContratado("telefone", e.target.value)}
                      className={validationErrors["contratado.telefone"] ? "border-destructive" : ""}
                    />
                    {validationErrors["contratado.telefone"] && (
                      <p className="text-sm text-destructive">{validationErrors["contratado.telefone"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contratado-email">E-mail *</Label>
                    <Input
                      id="contratado-email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={proposalData.contratado.email}
                      onChange={(e) => updateContratado("email", e.target.value)}
                      className={validationErrors["contratado.email"] ? "border-destructive" : ""}
                    />
                    {validationErrors["contratado.email"] && (
                      <p className="text-sm text-destructive">{validationErrors["contratado.email"]}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contratado-logo">Logotipo</Label>
                  <div className="flex items-center gap-4">
                    {!uploadedFiles.contratado ? (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <label htmlFor="contratado-logo-input" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Fazer Upload
                          </label>
                        </Button>
                        <input
                          id="contratado-logo-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("contratado", e)}
                        />
                        <span className="text-sm text-muted-foreground">PNG, JPG até 2MB</span>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {uploadedFiles.contratado}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => removeFile("contratado")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {validationErrors["contratado.logo"] && (
                    <p className="text-sm text-destructive">{validationErrors["contratado.logo"]}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="proposta">
              <AccordionTrigger className="flex items-center gap-2 hover:no-underline">
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="h-4 w-4" />
                  <span>Conteúdo da Proposta</span>
                  <Badge variant={proposalData.conteudo.trim() ? "default" : "secondary"} className="ml-auto mr-2">
                    {proposalData.conteudo.trim() ? <Check className="h-3 w-3 mr-1" /> : null}
                    {proposalData.conteudo.trim() ? "Preenchido" : "Vazio"}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Editor de Texto</Label>
                  <RichTextEditor
                    value={proposalData.conteudo}
                    onChange={(value) => onDataChange({ ...proposalData, conteudo: value })}
                    placeholder="Digite o conteúdo da sua proposta aqui. Use a barra de ferramentas para formatar o texto..."
                  />
                </div>

                <div className="space-y-4 border-t pt-4" style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}>
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nome do Template</Label>
                    <div className="flex gap-2">
                      <Input
                        id="template-name"
                        placeholder="Digite um nome para salvar como template"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                      />
                      <Button onClick={saveTemplate} disabled={!templateName.trim() || !proposalData.conteudo.trim()}>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Template
                      </Button>
                    </div>
                  </div>

                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <Label>Templates Salvos</Label>
                      <div className="grid gap-2">
                        {templates.map((template) => (
                          <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Criado em {new Date(template.createdAt).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => loadTemplate(template)}>
                                <FolderOpen className="mr-1 h-3 w-3" />
                                Carregar
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progresso da Configuração</CardTitle>
          <CardDescription>Salve seu progresso ou valide as informações inseridas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                const contratanteErrors = validateSection("contratante")
                const contratadoErrors = validateSection("contratado")
                const allErrors = { ...contratanteErrors, ...contratadoErrors }

                if (Object.keys(allErrors).length > 0) {
                  setValidationErrors(allErrors)
                } else {
                  setValidationErrors({})
                  console.log("Dados validados com sucesso:", proposalData)
                }
              }}
            >
              Validar Informações
            </Button>
            {/* <Button variant="outline">Salvar Rascunho</Button> */}
            {/* <Button variant="outline">Limpar Formulário</Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
