"use client"

import { ForgotPassword } from "@stackframe/stack"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReturnHome } from "@/components/return-home"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <ReturnHome />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Esqueci minha senha</CardTitle>
            <CardDescription>
              Digite seu e-mail para receber instruções de recuperação de senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPassword />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
