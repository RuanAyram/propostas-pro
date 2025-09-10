"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link,
  ImageIcon,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  Save,
  FolderOpen,
  Trash2,
} from "lucide-react"

interface Template {
  id: number
  name: string
  content: string
  description: string
  created_at: string
  updated_at: string
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState("14")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [textColor, setTextColor] = useState("#000000")
  const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false)

  const [templates, setTemplates] = useState<Template[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const { toast } = useToast()

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

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do template é obrigatório",
        variant: "destructive",
      })
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
          content: value,
          description: templateDescription,
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Template salvo com sucesso!",
        })
        setShowSaveDialog(false)
        setTemplateName("")
        setTemplateDescription("")
        loadTemplates()
      } else {
        throw new Error("Failed to save template")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive",
      })
    }
  }

  const loadTemplate = (template: Template) => {
    onChange(template.content)
    setShowLoadDialog(false)
    toast({
      title: "Sucesso",
      description: `Template "${template.name}" carregado!`,
    })
  }

  const deleteTemplate = async (id: number) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Template excluído com sucesso!",
        })
        loadTemplates()
      } else {
        throw new Error("Failed to delete template")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir template",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (editorRef.current && value && !isUpdatingFromProps) {
      const currentContent = editorRef.current.innerHTML
      if (currentContent !== value) {
        setIsUpdatingFromProps(true)
        editorRef.current.innerHTML = value
        setIsUpdatingFromProps(false)
      }
    }
  }, [value, isUpdatingFromProps])

  const executeCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value)
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
    },
    [onChange],
  )

  const handleContentChange = useCallback(() => {
    if (editorRef.current && !isUpdatingFromProps) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }, [onChange, isUpdatingFromProps])

  const applyFontStyle = useCallback(
    (property: string, value: string) => {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const span = document.createElement("span")
        span.style.setProperty(property, value)

        try {
          range.surroundContents(span)
          handleContentChange()
        } catch (e) {
          executeCommand("styleWithCSS", "true")
          if (property === "font-size") {
            executeCommand("fontSize", "7")
            const fontElements = editorRef.current?.querySelectorAll('font[size="7"]')
            fontElements?.forEach((el) => {
              el.removeAttribute("size")
              ;(el as HTMLElement).style.fontSize = value + "px"
            })
          } else if (property === "font-family") {
            executeCommand("fontName", value)
          } else if (property === "color") {
            executeCommand("foreColor", value)
          }
        }
      }
    },
    [executeCommand, handleContentChange],
  )

  const insertLink = useCallback(() => {
    const url = prompt("Digite a URL do link:")
    if (url) {
      executeCommand("createLink", url)
    }
  }, [executeCommand])

  const insertImage = useCallback(() => {
    const url = prompt("Digite a URL da imagem:")
    if (url) {
      executeCommand("insertImage", url)
    }
  }, [executeCommand])

  return (
    <div className="border rounded-lg bg-background">
      <div className="border-b p-2 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Salvar Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Nome do Template</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Proposta Básica"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Descrição (opcional)</Label>
                  <Textarea
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Descrição do template..."
                  />
                </div>
                <Button onClick={saveTemplate} className="w-full">
                  Salvar Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-1" />
                Carregar Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Carregar Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {templates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhum template encontrado</p>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          {template.description && (
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Criado em: {new Date(template.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => loadTemplate(template)}>
                            Carregar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteTemplate(template.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <Select
            value={fontFamily}
            onValueChange={(value) => {
              setFontFamily(value)
              applyFontStyle("font-family", value)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Times New Roman">Times</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={fontSize}
            onValueChange={(value) => {
              setFontSize(value)
              applyFontStyle("font-size", value)
            }}
          >
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="14">14</SelectItem>
              <SelectItem value="16">16</SelectItem>
              <SelectItem value="18">18</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="28">28</SelectItem>
              <SelectItem value="32">32</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <Label>Cor do Texto</Label>
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value)
                    applyFontStyle("color", e.target.value)
                  }}
                />
                <div className="grid grid-cols-6 gap-1">
                  {[
                    "#000000",
                    "#FF0000",
                    "#00FF00",
                    "#0000FF",
                    "#FFFF00",
                    "#FF00FF",
                    "#00FFFF",
                    "#FFA500",
                    "#800080",
                    "#008000",
                    "#000080",
                    "#808080",
                  ].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setTextColor(color)
                        applyFontStyle("color", color)
                      }}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="outline" size="sm" onClick={() => executeCommand("bold")}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => executeCommand("italic")}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => executeCommand("underline")}>
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => executeCommand("formatBlock", "h1")}>
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => executeCommand("formatBlock", "h2")}>
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => executeCommand("formatBlock", "h3")}>
            <Heading3 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="outline" size="sm" onClick={() => executeCommand("justifyLeft")}>
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => executeCommand("justifyCenter")}>
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => executeCommand("justifyRight")}>
            <AlignRight className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="outline" size="sm" onClick={() => executeCommand("insertUnorderedList")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => executeCommand("insertOrderedList")}>
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="outline" size="sm" onClick={() => executeCommand("formatBlock", "blockquote")}>
            <Quote className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={insertLink}>
            <Link className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={insertImage}>
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none"
        style={{
          fontFamily: fontFamily,
          fontSize: fontSize + "px",
          color: textColor,
        }}
        onInput={handleContentChange}
        onPaste={handleContentChange}
        onKeyUp={handleContentChange}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        
        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        [contenteditable] blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 3px solid #e5e7eb;
          font-style: italic;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
