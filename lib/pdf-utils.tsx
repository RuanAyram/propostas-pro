export const generatePDF = async (element: HTMLElement, filename = "proposta-comercial.pdf") => {
  try {
    console.log("Iniciando geração de PDF...")
    console.log("Elemento:", element)
    console.log("Filename:", filename)

    // Dynamic import to avoid SSR issues
    const html2pdf = (await import("html2pdf.js")).default
    console.log("html2pdf carregado:", !!html2pdf)

    // Verificar se o elemento tem conteúdo
    if (!element || !element.innerHTML.trim()) {
      throw new Error("Elemento vazio ou inválido para exportação")
    }

    // Clonar o elemento para evitar problemas com estilos
    const clonedElement = element.cloneNode(true) as HTMLElement
    
    // Função para remover completamente funções de cor CSS modernas
    const removeModernColorFunctions = (element: HTMLElement) => {
      // Remover todas as classes CSS que podem conter cores modernas
      const allElements = element.querySelectorAll('*')
      allElements.forEach((el) => {
        const htmlElement = el as HTMLElement
        
        // Remover classes problemáticas
        const classList = Array.from(htmlElement.classList)
        classList.forEach(className => {
          if (className.includes('bg-') || className.includes('text-') || className.includes('border-')) {
            htmlElement.classList.remove(className)
          }
        })
        
        // Aplicar estilos inline seguros
        htmlElement.style.color = '#000000'
        htmlElement.style.backgroundColor = 'transparent'
        htmlElement.style.borderColor = '#e5e7eb'
      })
      
      // Remover estilos inline problemáticos
      const styleElements = element.querySelectorAll('style')
      styleElements.forEach(styleEl => {
        styleEl.remove()
      })
      
      // Remover atributos style problemáticos
      const elementsWithStyle = element.querySelectorAll('[style]')
      elementsWithStyle.forEach(el => {
        const htmlElement = el as HTMLElement
        const style = htmlElement.getAttribute('style')
        if (style && (style.includes('oklch') || style.includes('hsl') || style.includes('rgb'))) {
          htmlElement.removeAttribute('style')
        }
      })
    }
    
    // Aplicar a limpeza de cores
    removeModernColorFunctions(clonedElement)
    
    
    // Criar um container temporário completamente isolado
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '0'
    tempContainer.style.width = '794px'
    tempContainer.style.height = '1123px'
    tempContainer.style.backgroundColor = 'white'
    tempContainer.style.fontFamily = 'Arial, sans-serif'
    tempContainer.style.fontSize = '14px'
    tempContainer.style.lineHeight = '1.6'
    tempContainer.style.color = '#000000'
    
    // Aplicar estilos básicos diretamente no container
    tempContainer.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          color: #000000 !important;
          background-color: transparent !important;
          border-color: #e5e7eb !important;
        }
        body, div {
          font-family: Arial, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #000000 !important;
        }
        .bg-white { background-color: #ffffff !important; }
        .bg-muted { background-color: #f3f4f6 !important; }
        .bg-primary { background-color: #2563eb !important; }
        .text-primary { color: #2563eb !important; }
        .text-muted-foreground { color: #6b7280 !important; }
        .text-foreground { color: #000000 !important; }
        .font-bold { font-weight: bold !important; }
        .font-semibold { font-weight: 600 !important; }
        .border { border: 1px solid #e5e7eb !important; }
        .rounded-lg { border-radius: 8px !important; }
        .p-4 { padding: 1rem !important; }
        .mb-8 { margin-bottom: 2rem !important; }
        .grid { display: grid !important; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
        .gap-4 { gap: 1rem !important; }
        .flex { display: flex !important; }
        .items-center { align-items: center !important; }
        .justify-between { justify-content: space-between !important; }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
        .absolute { position: absolute !important; }
        .relative { position: relative !important; }
        .h-24 { height: 6rem !important; }
        .h-16 { height: 4rem !important; }
        .w-16 { width: 4rem !important; }
        .px-12 { padding-left: 3rem !important; padding-right: 3rem !important; }
        .py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
        .overflow-hidden { overflow: hidden !important; }
        .min-h-\\[300px\\] { min-height: 300px !important; }
        .text-2xl { font-size: 1.5rem !important; }
        .text-lg { font-size: 1.125rem !important; }
        .text-sm { font-size: 0.875rem !important; }
        .text-xs { font-size: 0.75rem !important; }
        .leading-none { line-height: 1 !important; }
        .prose { max-width: none !important; }
        .prose-sm { font-size: 0.875rem !important; }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 { 
          font-weight: bold !important; 
          margin-top: 1rem !important; 
          margin-bottom: 0.5rem !important; 
        }
        .prose p { margin-bottom: 0.5rem !important; }
        .prose ul, .prose ol { margin-left: 1rem !important; margin-bottom: 0.5rem !important; }
        .prose li { margin-bottom: 0.25rem !important; }
      </style>
      ${clonedElement.outerHTML}
    `
    
    document.body.appendChild(tempContainer)

    const options = {
      margin: [5, 5, 5, 5], // [top, left, bottom, right] in mm
      filename: filename,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 1.5,
        useCORS: false,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        letterRendering: true,
        width: 794,
        height: 1123,
        ignoreElements: (element: HTMLElement) => {
          // Ignorar elementos que podem causar problemas
          return element.classList.contains('no-print') || 
                 element.tagName === 'SCRIPT' || 
                 element.tagName === 'STYLE' ||
                 element.tagName === 'LINK'
        },
        onclone: (clonedDoc: Document) => {
          // Remover todas as folhas de estilo do documento clonado
          const styleSheets = Array.from(clonedDoc.styleSheets)
          styleSheets.forEach(styleSheet => {
            try {
              if (styleSheet.ownerNode) {
                styleSheet.ownerNode.remove()
              }
            } catch (e) {
              console.warn('Erro ao remover stylesheet:', e)
            }
          })
          
          // Remover elementos link de CSS
          const linkElements = clonedDoc.querySelectorAll('link[rel="stylesheet"]')
          linkElements.forEach(link => link.remove())
          
          // Remover elementos style
          const styleElements = clonedDoc.querySelectorAll('style')
          styleElements.forEach(style => style.remove())
        }
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    }

    console.log("Opções configuradas:", options)
    console.log("Iniciando conversão...")
    
    const result = await html2pdf().set(options).from(tempContainer).save()
    
    // Limpar o container temporário
    document.body.removeChild(tempContainer)
    
    console.log("PDF gerado com sucesso:", result)
    return result
  } catch (error) {
    console.error("Erro detalhado ao gerar PDF:", error)
    
    // Log adicional para debugging
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

export const printDocument = (element: HTMLElement) => {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Não foi possível abrir a janela de impressão")
  }

  const styles = Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join("")
      } catch (e) {
        return ""
      }
    })
    .join("")

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Proposta Comercial</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()

  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

export const generateShareableLink = (proposalData: any): string => {
  try {
    const encodedData = btoa(JSON.stringify(proposalData))
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?shared=${encodedData}`
  } catch (error) {
    console.error("Erro ao gerar link:", error)
    throw new Error("Falha ao gerar link compartilhável")
  }
}

export const parseSharedData = (shareParam: string) => {
  try {
    return JSON.parse(atob(shareParam))
  } catch (error) {
    console.error("Erro ao decodificar dados compartilhados:", error)
    return null
  }
}
