'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { clientAuthService } from '@/lib/auth/service'
import { Loader2 } from 'lucide-react'

const providers = [
  {
    id: 'google' as const,
    name: 'Google',
    icon: '🔗', // Replace with actual Google icon
    enabled: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true'
  },
  {
    id: 'azure' as const,
    name: 'Microsoft',
    icon: '🔗', // Replace with actual Microsoft icon
    enabled: process.env.NEXT_PUBLIC_MICROSOFT_OAUTH_ENABLED === 'true'
  },
  {
    id: 'linkedin' as const,
    name: 'LinkedIn',
    icon: '🔗', // Replace with actual LinkedIn icon
    enabled: process.env.NEXT_PUBLIC_LINKEDIN_OAUTH_ENABLED === 'true'
  }
]

export function OAuthProviders() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleOAuthSignIn = async (providerId: 'google' | 'azure' | 'linkedin') => {
    setLoadingProvider(providerId)
    
    try {
      const result = await clientAuthService.signInWithProvider(providerId)
      
      if (!result.success) {
        console.error('OAuth sign in failed:', result.error)
        // You could show a toast notification here
      }
      // On success, the auth state change will handle the redirect
    } catch (error) {
      console.error('OAuth error:', error)
    } finally {
      setLoadingProvider(null)
    }
  }

  const enabledProviders = providers.filter(provider => provider.enabled)

  if (enabledProviders.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {enabledProviders.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleOAuthSignIn(provider.id)}
          className="w-full"
        >
          {loadingProvider === provider.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="mr-2">{provider.icon}</span>
          )}
          Continue with {provider.name}
        </Button>
      ))}
    </div>
  )
}