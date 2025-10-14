'use client'

import { useState, useEffect } from 'react'
import { useStackApp } from '@stackframe/stack'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const app = useStackApp()
  const user = app.useUser()

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/admin/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        } else {
          setIsAdmin(false)
          if (response.status !== 403) {
            setError('Erro ao verificar status de administrador')
          }
        }
      } catch (err) {
        setError('Erro ao verificar status de administrador')
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  return { isAdmin, isLoading, error, user }
}
