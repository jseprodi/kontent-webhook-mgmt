import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getCustomAppContext, CustomAppContext } from '@kontent-ai/custom-app-sdk'

interface KontentContextType {
  context: CustomAppContext | null
  isLoading: boolean
  error: string | null
  environmentId: string | null
  userId: string | null
  userEmail: string | null
  userRoles: Array<{ id: string; codename?: string }> | null
  appConfig: any
}

const KontentContext = createContext<KontentContextType | undefined>(undefined)

export function useKontent() {
  const context = useContext(KontentContext)
  if (context === undefined) {
    throw new Error('useKontent must be used within a KontentProvider')
  }
  return context
}

interface KontentProviderProps {
  children: ReactNode
}

export function KontentProvider({ children }: KontentProviderProps) {
  const [context, setContext] = useState<CustomAppContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeKontent() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await getCustomAppContext()
        
        if (response.isError) {
          setError(`Error ${response.code}: ${response.description}`)
          console.error('Failed to get Kontent.ai context:', response)
        } else {
          setContext(response)
          console.log('Kontent.ai context loaded:', response)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Kontent.ai context'
        setError(errorMessage)
        console.error('Error initializing Kontent.ai context:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeKontent()
  }, [])

  const value: KontentContextType = {
    context,
    isLoading,
    error,
    environmentId: context?.context?.environmentId || null,
    userId: context?.context?.userId || null,
    userEmail: context?.context?.userEmail || null,
    userRoles: context?.context?.userRoles || null,
    appConfig: context?.config || null,
  }

  return (
    <KontentContext.Provider value={value}>
      {children}
    </KontentContext.Provider>
  )
}
