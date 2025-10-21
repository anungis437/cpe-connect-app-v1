'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function SignUpPage({ params: { locale } }: { params: { locale: string } }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            preferred_locale: locale,
          },
          emailRedirectTo: `${window.location.origin}/${locale}/dashboard`
        },
      })

      if (signUpError) throw signUpError

      // The user profile will be created via a database trigger
      // or you can create it via an API route
      if (data.user) {
        // Call an API route to create the profile
        const response = await fetch('/api/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email: email,
            fullName: fullName,
            locale: locale,
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to create profile')
        }
      }

      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'fr' ? "S'inscrire" : 'Sign Up'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'fr' ? 'Académie CPE' : 'CPE Academy'}
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'fr' ? 'Nom complet' : 'Full Name'}
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={locale === 'fr' ? 'Jean Dupont' : 'John Doe'}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'fr' ? 'Courriel' : 'Email'}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={locale === 'fr' ? 'votre@courriel.com' : 'your@email.com'}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'fr' ? 'Mot de passe' : 'Password'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={locale === 'fr' ? 'Mot de passe (min 6 caractères)' : 'Password (min 6 characters)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 font-semibold"
          >
            {loading 
              ? (locale === 'fr' ? 'Inscription...' : 'Signing up...') 
              : (locale === 'fr' ? "S'inscrire" : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            {locale === 'fr' ? 'Déjà un compte?' : 'Already have an account?'}{' '}
            <Link href={`/${locale}/auth/signin`} className="text-blue-600 hover:text-blue-700 font-semibold">
              {locale === 'fr' ? 'Se connecter' : 'Sign In'}
            </Link>
          </p>
          <Link href={`/${locale}`} className="text-sm text-gray-600 hover:text-gray-700 block">
            {locale === 'fr' ? "← Retour à l'accueil" : '← Back to home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
