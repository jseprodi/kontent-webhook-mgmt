import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { CustomAppContext } from '@kontent-ai/custom-app-sdk'

interface KontentContextType {
  context: CustomAppContext | null
  isLoading: boolean
  error: string | null
  environmentId: string | null
  userId: string | null
  userEmail: string | null
  userRoles: readonly { readonly id: string; readonly codename: string | null }[] | null
  appConfig: CustomAppContext | null
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

        // Always try to load the Kontent.ai custom app SDK
        try {
          const { getCustomAppContext } = await import('@kontent-ai/custom-app-sdk')
          const response = await getCustomAppContext()
          
          if (response && !response.isError) {
            setContext(response)
          } else if (response && response.isError) {
            setError(`Error ${response.code}: ${response.description}`)
          } else {
            setError('Invalid response from Kontent.ai SDK')
          }
        } catch (sdkError) {
          console.warn('Failed to load Kontent.ai custom app SDK:', sdkError)
          setError('Failed to load Kontent.ai SDK')
        }
      } catch (err) {
        console.error('Error initializing Kontent.ai context:', err)
        setError('Failed to initialize Kontent.ai context')
      } finally {
        setIsLoading(false)
      }
    }

    initializeKontent()
  }, [])

  const value = useMemo<KontentContextType>(() => ({
    context,
    isLoading,
    error,
    environmentId: context && !context.isError ? context.context.environmentId : null,
    userId: context && !context.isError ? context.context.userId : null,
    userEmail: context && !context.isError ? context.context.userEmail : null,
    userRoles: context && !context.isError ? context.context.userRoles : null,
    appConfig: context || null,
  }), [context, isLoading, error])

  return (
    <KontentContext.Provider value={value}>
      {children}
    </KontentContext.Provider>
  )
}
