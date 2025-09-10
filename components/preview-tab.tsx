"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Download, Share2, Printer, ZoomIn, ZoomOut, Copy, Check, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import { generatePDF, printDocument, generateShareableLink } from "@/lib/pdf-utils"

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

interface PreviewTabProps {
  proposalData?: ProposalData
}

export function PreviewTab({ proposalData }: PreviewTabProps) {
  const [zoomLevel, setZoomLevel] = useState(0.7)
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareLink, setShareLink] = useState<string>("")
  const [linkCopied, setLinkCopied] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5))
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.3))

  const hasData =
    proposalData && (proposalData.contratante.nome || proposalData.contratado.nome || proposalData.conteudo)

  const handleExportPDF = async () => {
    console.log("handleExportPDF chamado")
    console.log("previewRef.current:", previewRef.current)
    console.log("proposalData:", proposalData)

    if (!previewRef.current) {
      console.error("previewRef.current é null")
      toast({
        title: "Erro na Exportação",
        description: "Elemento de preview não encontrado",
        variant: "destructive",
      })
      return
    }

    if (!proposalData) {
      console.error("proposalData é null")
      toast({
        title: "Erro na Exportação",
        description: "Dados da proposta não encontrados",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      const filename = `proposta-${proposalData.contratante.nome || "comercial"}-${new Date().toISOString().split("T")[0]}.pdf`
      console.log("Tentando gerar PDF com filename:", filename)
      
      await generatePDF(previewRef.current, filename)

      toast({
        title: "PDF Exportado",
        description: "Sua proposta foi exportada com sucesso!",
      })
    } catch (error) {
      console.error("Erro em handleExportPDF:", error)
      toast({
        title: "Erro na Exportação",
        description: error instanceof Error ? error.message : "Falha ao exportar PDF",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    if (!proposalData) return

    setIsSharing(true)
    try {
      const link = generateShareableLink(proposalData)
      setShareLink(link)

      toast({
        title: "Link Gerado",
        description: "Link compartilhável criado com sucesso!",
      })
    } catch (error) {
      toast({
        title: "Erro ao Compartilhar",
        description: error instanceof Error ? error.message : "Falha ao gerar link",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareLink) return

    try {
      await navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)

      toast({
        title: "Link Copiado",
        description: "Link copiado para a área de transferência!",
      })

      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Erro ao Copiar",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    if (!previewRef.current) return

    try {
      printDocument(previewRef.current)

      toast({
        title: "Impressão Iniciada",
        description: "Janela de impressão aberta!",
      })
    } catch (error) {
      toast({
        title: "Erro na Impressão",
        description: error instanceof Error ? error.message : "Falha ao imprimir",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Ações da Proposta</CardTitle>
          <CardDescription>Exporte, compartilhe ou imprima sua proposta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center">
            {/*
            <Button className="flex items-center gap-2" disabled={!hasData || isExporting} onClick={handleExportPDF}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? "Exportando..." : "Exportar PDF"}
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              disabled={!hasData || isSharing}
              onClick={handleShare}
            >
              {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              {isSharing ? "Gerando..." : "Compartilhar Link"}
            </Button>*/}

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

          {shareLink && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Link Compartilhável:</p>
                  <p className="text-xs text-muted-foreground break-all">{shareLink}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 bg-transparent"
                >
                  {linkCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {linkCopied ? "Copiado" : "Copiar"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Este link permite visualizar a proposta sem possibilidade de edição.
              </p>
            </div>
          )}

          {!hasData && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Configure os dados na aba "Configuração" para visualizar a proposta.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* A4 Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Visualização A4</CardTitle>
          <CardDescription>Prévia de como sua proposta será exibida no formato A4</CardDescription>
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
              <div
                ref={previewRef}
                className="w-[794px] h-[1123px] bg-white relative overflow-hidden"
                id="proposal-preview"
              >
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/5 to-primary/10 border-b-2 border-primary/20">
                  <div className="flex items-center justify-between h-full px-12">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border-2 border-primary/20">
                        {proposalData?.contratante.logo ? (
                          <img
                            src={URL.createObjectURL(proposalData.contratante.logo) || "/placeholder.svg"}
                            alt="Logo"
                            className="w-full h-full object-contain rounded"
                          />
                        ) : (
                          <span className="text-primary/60 text-xs font-bold">LOGO</span>
                        )}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-primary">PROPOSTA COMERCIAL</h1>
                        <p className="text-sm text-muted-foreground">
                          {proposalData?.contratante.nome || "[Nome da Empresa]"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p className="font-medium">Data: {new Date().toLocaleDateString("pt-BR")}</p>
                      <p>Proposta Nº: {String(Date.now()).slice(-6)}/{new Date().toLocaleDateString("pt-BR", { year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-24 left-0 right-0 bottom-16 px-12 py-8 overflow-hidden">
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-primary mb-3 border-b border-primary/20 pb-1">
                      DADOS DO CONTRATANTE
                    </h2>
                    <div className="bg-muted/30 rounded-lg p-4 border border-muted">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-foreground">
                            {proposalData?.contratante.nome || "[Nome/Razão Social]"}
                          </p>
                          <p className="text-muted-foreground">
                            CNPJ/CPF: {proposalData?.contratante.documento || "[Documento]"}
                          </p>
                          <p className="text-muted-foreground mt-2">
                            {proposalData?.contratante.endereco || "[Endereço completo]"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">
                            Tel: {proposalData?.contratante.telefone || "[Telefone]"}
                          </p>
                          <p className="text-muted-foreground">
                            Email: {proposalData?.contratante.email || "[E-mail]"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-primary mb-3 border-b border-primary/20 pb-1">
                      DADOS DO CONTRATADO
                    </h2>
                    <div className="bg-muted/30 rounded-lg p-4 border border-muted">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-foreground">
                            {proposalData?.contratado.nome || "[Nome/Razão Social]"}
                          </p>
                          <p className="text-muted-foreground">
                            CNPJ/CPF: {proposalData?.contratado.documento || "[Documento]"}
                          </p>
                          <p className="text-muted-foreground mt-2">
                            {proposalData?.contratado.endereco || "[Endereço completo]"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">
                            Tel: {proposalData?.contratado.telefone || "[Telefone]"}
                          </p>
                          <p className="text-muted-foreground">Email: {proposalData?.contratado.email || "[E-mail]"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-primary mb-3 border-b border-primary/20 pb-1">PROPOSTA</h2>
                    <div className="bg-white rounded-lg p-4 border border-muted min-h-[300px]">
                      {proposalData?.conteudo ? (
                        <div
                          className="prose prose-sm max-w-none text-foreground"
                          dangerouslySetInnerHTML={{ __html: proposalData.conteudo }}
                          style={{
                            fontSize: "14px",
                            lineHeight: "1.6",
                            color: "inherit",
                          }}
                        />
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <p className="text-lg mb-2">Conteúdo da Proposta</p>
                          <p className="text-sm">
                            O conteúdo editado no "Editor de Texto Rico" será exibido aqui com toda a formatação
                            aplicada.
                          </p>
                          <p className="text-sm mt-2">
                            Configure o conteúdo na aba "Configuração" para visualizar a proposta completa.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {proposalData?.conteudo && (
                    <div className="mb-4">
                      <h3 className="text-md font-semibold text-primary mb-2">TERMOS E CONDIÇÕES</h3>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Esta proposta tem validade de 30 (trinta) dias a partir da data de emissão.</p>
                        <p>• Os valores apresentados são válidos para as condições especificadas nesta proposta.</p>
                        <p>• Eventuais alterações no escopo poderão implicar em revisão dos valores.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-primary/5 to-primary/10 border-t border-primary/20">
                  <div className="flex items-center justify-between h-full px-12">
                    <div className="text-xs text-muted-foreground">
                      <p>{proposalData?.contratante.nome || "Empresa"} - Proposta Comercial</p>
                      <p>{proposalData?.contratante.email || "contato@empresa.com"}</p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <p>Página 1 de 1</p>
                      <p>Gerado em {new Date().toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                </div>
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
    </div>
  )
}
