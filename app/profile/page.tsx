"use client"

import { useState, useEffect } from "react"
import { useStackApp } from "@stackframe/stack"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Save, User } from "lucide-react"
import { DocumentLayout } from "@/components/document-layout"

export default function ProfilePage() {
  const app = useStackApp()
  const user = app.useUser()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    cpf: "",
    phone: "",
  })

  // Carregar perfil do usuário
  useEffect(() => {
    if (!user?.id) return

    const loadProfile = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/user/profile?userId=${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setProfile({
              cpf: data.profile.cpf || "",
              phone: data.profile.phone || "",
            })
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user?.id])

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado')
      return
    }

    // Validações
    if (!profile.cpf || profile.cpf.length < 11) {
      toast.error('CPF inválido. Digite apenas números (11 dígitos)')
      return
    }

    if (!profile.phone || profile.phone.length < 10) {
      toast.error('Telefone inválido. Digite apenas números (mínimo 10 dígitos)')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          cpf: profile.cpf,
          phone: profile.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar perfil')
      }

      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    return numbers.slice(0, 11) // Limita a 11 dígitos
  }

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    return numbers.slice(0, 11) // Limita a 11 dígitos
  }

  if (loading) {
    return (
      <DocumentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DocumentLayout>
    )
  }

  return (
    <DocumentLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações do Stack Auth (somente leitura) */}
            <div className="space-y-4 pb-6 border-b">
              <h3 className="font-semibold text-sm text-muted-foreground">Informações da Conta</h3>
              
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input 
                  value={user?.displayName || user?.primaryEmail || ''} 
                  disabled 
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  value={user?.primaryEmail || ''} 
                  disabled 
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Informações editáveis */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Informações Adicionais</h3>
              
              <div className="space-y-2">
                <Label htmlFor="cpf">
                  CPF <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cpf"
                  placeholder="Digite apenas números (11 dígitos)"
                  value={profile.cpf}
                  onChange={(e) => setProfile({ ...profile, cpf: formatCPF(e.target.value) })}
                  maxLength={11}
                />
                <p className="text-xs text-muted-foreground">
                  {profile.cpf.length}/11 dígitos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="Digite apenas números (DDD + número)"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: formatPhone(e.target.value) })}
                  maxLength={11}
                />
                <p className="text-xs text-muted-foreground">
                  {profile.phone.length}/11 dígitos
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || !profile.cpf || !profile.phone}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DocumentLayout>
  )
}
