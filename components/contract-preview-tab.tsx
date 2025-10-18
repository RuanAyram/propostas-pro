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
import { PDFViewer, Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer"

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
  const [totalPages1, setTotalPages1] = useState(1)
  const previewRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { isAdmin } = useAdmin()

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      paddingBottom: 20,
      fontSize: 11,
      fontFamily: "Helvetica",
      lineHeight: 1.5,
    },
    header: {
      textAlign: "center",
      borderBottom: "1pt solid #999",
      paddingBottom: 8,
      marginBottom: 12,
    },
    section: {
      marginBottom: 12,
    },
    title: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#1E40AF", // equivalente a text-primary
      marginBottom: 6,
    },
    label: {
      fontWeight: "bold",
      fontSize: 11,
    },
    text: {
      fontSize: 10,
      textAlign: "justify",
      marginBottom: 3,
    },
    muted: {
      color: "#555",
      fontSize: 9,
    },
    dividerTop: {
      borderTopWidth: 1,
      borderTopColor: "#aaa",
      marginTop: 16,
      paddingTop: 4,
    },
    signatureBlock: {
      marginTop: 40,
    },
    date: {
      textAlign: "center",
      marginBottom: 24,
      fontSize: 10,
    },
    signatureGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 48,
    },
    signature: {
      width: "45%",
      alignItems: "center",
    },
    signatureLine: {
      borderTopWidth: 1,
      borderTopColor: "#999",
      width: "100%",
      marginBottom: 4,
    },
    signatureLabel: {
      fontSize: 10,
      fontWeight: "bold",
    },
    signatureDoc: {
      fontSize: 9,
      color: "#666",
    },
    footer: {
      fontSize: 12,
      bottom: -100,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'grey',
    },
  })

  // Calcular número de páginas baseado na altura do conteúdo
  useEffect(() => {
    if (contentRef.current && contractData) {
      setTotalPages1(1)
    } else {
      setTotalPages1(1)
    }
  }, [contractData])

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5))
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.3))

  const hasData =
    contractData && (contractData.contratante.nome || contractData.contratado.nome || contractData.objeto)

  const ContractPDF = ({ data }: any) => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
          <Text>Contrato Nº: {String(Date.now()).slice(-6)}/{new Date().getFullYear()}</Text>
        </View>

        {/* DAS PARTES */}
        <View style={styles.section}>
          <Text style={styles.title}>DAS PARTES</Text>

          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>CONTRATANTE:</Text>
            <Text style={styles.text}>{data?.contratante?.nome || "[Nome do Contratante]"}</Text>
            <Text style={styles.muted}>
              CNPJ/CPF: {data?.contratante?.documento || "[Documento]"}
            </Text>
            <Text style={styles.muted}>
              Endereço: {data?.contratante?.endereco || "[Endereço]"}
            </Text>
          </View>

          <View>
            <Text style={styles.label}>CONTRATADO:</Text>
            <Text style={styles.text}>{data?.contratado?.nome || "[Nome do Contratado]"}</Text>
            <Text style={styles.muted}>
              CNPJ/CPF: {data?.contratado?.documento || "[Documento]"}
            </Text>
            <Text style={styles.muted}>
              Endereço: {data?.contratado?.endereco || "[Endereço]"}
            </Text>
          </View>
        </View>

        {/* DO OBJETO */}
        <View style={styles.section}>
          <Text style={styles.title}>DO OBJETO</Text>
          <Text style={styles.text}>
            {data?.objeto || "[Descrição do objeto do contrato]"}
          </Text>
        </View>

        {/* DO VALOR */}
        <View style={styles.section}>
          <Text style={styles.title}>DO VALOR</Text>
          <Text style={styles.text}>
            {data?.valor || "[Valor e forma de pagamento]"}
          </Text>
        </View>

        {/* DO PRAZO */}
        <View style={styles.section}>
          <Text style={styles.title}>DO PRAZO</Text>
          <Text style={styles.text}>
            {data?.prazo || "[Prazo de vigência do contrato]"}
          </Text>
        </View>

        {/* DAS CLÁUSULAS GERAIS */}
        <View style={styles.section}>
          <Text style={styles.title}>DAS CLÁUSULAS GERAIS</Text>
          <Text style={styles.text}>
            {data?.clausulas || "[Cláusulas contratuais]"}
          </Text>
        </View>

        {/* ASSINATURAS */}
        <View style={[styles.signatureBlock]}>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>

          <View style={styles.signatureGrid}>
            {/* Contratante */}
            <View style={styles.signature}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>
                {data?.contratante?.nome || "CONTRATANTE"}
              </Text>
              <Text style={styles.signatureDoc}>
                {data?.contratante?.documento || "CPF/CNPJ"}
              </Text>
            </View>

            {/* Contratado */}
            <View style={styles.signature}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>
                {data?.contratado?.nome || "CONTRATADO"}
              </Text>
              <Text style={styles.signatureDoc}>
                {data?.contratado?.documento || "CPF/CNPJ"}
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER FIXO */}
        <View style={styles.footer} fixed>
          <Text>Contrato de Prestação de Serviços</Text>
          <Text render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Página ${pageNumber} de ${totalPages}`
          } fixed />
        </View>
      </Page>
    </Document>
  )

  const handlePrint = async () => {
    // Se for admin, imprime diretamente sem pagar
    if (isAdmin) {

      try {
        // printDocument(previewRef.current)
        toast.success('Impressão iniciada!')
        const blob = await pdf(<ContractPDF data={contractData} />).toBlob()
        const fileURL = URL.createObjectURL(blob)
        console.log("fileURL")
        const printWindow = window.open(fileURL)
        if (!printWindow) {
          toast.error("Falha ao abrir janela de impressão")
          return
        }
        printWindow.onload = () => {
          printWindow.focus()
          printWindow.print()
        }
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
          // if (!previewRef.current) return

          try {
            // printDocument(previewRef.current)
            const blob = await pdf(<ContractPDF data={contractData} />).toBlob()
            const fileURL = URL.createObjectURL(blob)
            const printWindow = window.open(fileURL)
            if (!printWindow) {
              toast.error("Falha ao abrir janela de impressão")
              return
            }
            printWindow.onload = () => {
              printWindow.focus()
              printWindow.print()
            }
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

  const handlePaymentComplete = async () => {
    // Após pagamento confirmado, permitir impressão
    // if (!previewRef.current) return

    try {
      // printDocument(previewRef.current)
      const blob = await pdf(<ContractPDF data={contractData} />).toBlob()
      const fileURL = URL.createObjectURL(blob)
      const printWindow = window.open(fileURL)
      if (!printWindow) {
        toast.error("Falha ao abrir janela de impressão")
        return
      }
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
      }
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
          <div className="w-full bg-gray-100 p-4 rounded-lg overflow-auto">
            <div className="flex justify-center w-full">
              <div style={{ 
                width: '100%', 
                maxWidth: '220mm',
                height: '300mm',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                <PDFViewer 
                  width="100%"
                  height="100%"
                  showToolbar={false}
                >
                  <ContractPDF data={contractData} />
                </PDFViewer>
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
