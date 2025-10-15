"use client"

import { SignUp } from "@stackframe/stack"
import { Card, CardContent } from "@/components/ui/card"
import { ReturnHome } from "@/components/return-home"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">  
      <Card>
        <CardContent>
          <div className="w-full max-w-md space-y-4 py-6">
            <div className="flex justify-center">
              <ReturnHome />
            </div>
          </div>
          <SignUp automaticRedirect={false} />
        </CardContent>
      </Card>
    </div>
  )
}
