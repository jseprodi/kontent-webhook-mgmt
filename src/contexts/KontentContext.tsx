import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'

interface KontentContextType {
  context: any | null
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
  const [context, setContext] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeKontent() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check if we're running in the Kontent.ai environment
        if (typeof window !== 'undefined' && window.location.hostname.includes('kontent.ai')) {
          try {
            // Dynamically import the SDK only when needed
            const { getCustomAppContext } = await import('@kontent-ai/custom-app-sdk')
            const response = await getCustomAppContext()
            
            if (response.isError) {
              setError(`Error ${response.code}: ${response.description}`)
              console.error('Failed to get Kontent.ai context:', response)
            } else {
              setContext(response)
              console.log('Kontent.ai context loaded:', response)
            }
          } catch (sdkError) {
            console.warn('Failed to load Kontent.ai custom app SDK:', sdkError)
            setError('Failed to load Kontent.ai SDK')
          }
        } else {
          // Local development mode - no context available
          console.log('Running in local development mode - no Kontent.ai context available')
          setContext(null)
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

  const value = useMemo<KontentContextType>(() => ({
    context,
    isLoading,
    error,
    environmentId: context?.environmentId || null,
    userId: context?.userId || null,
    userEmail: context?.userEmail || null,
    userRoles: context?.userRoles || null,
    appConfig: context || null,
  }), [context, isLoading, error])

  return (
    <KontentContext.Provider value={value}>
      {children}
    </KontentContext.Provider>
  )
}
