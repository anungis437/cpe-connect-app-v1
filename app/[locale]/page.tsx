import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            {locale === 'fr' ? 'Académie CPE' : 'CPE Academy'}
          </h1>
          <p className="text-xl text-gray-700">
            {locale === 'fr' 
              ? 'Système de gestion de l\'apprentissage bilingue' 
              : 'Bilingual Self-Paced Learning Management System'}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href={`/${locale}/auth/signin`}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            {locale === 'fr' ? 'Se connecter' : 'Sign In'}
          </Link>
          <Link
            href={`/${locale}/auth/signup`}
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
          >
            {locale === 'fr' ? 'S\'inscrire' : 'Sign Up'}
          </Link>
        </div>

        <div className="pt-8 flex justify-center gap-4">
          <Link
            href="/en"
            className={`px-4 py-2 rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            English
          </Link>
          <Link
            href="/fr"
            className={`px-4 py-2 rounded ${locale === 'fr' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Français
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">
              {locale === 'fr' ? 'Apprentissage modulaire' : 'Modular Learning'}
            </h3>
            <p className="text-gray-600">
              {locale === 'fr' 
                ? 'Cours structurés avec vidéos et quiz interactifs'
                : 'Structured courses with videos and interactive quizzes'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">
              {locale === 'fr' ? 'Suivi des progrès' : 'Progress Tracking'}
            </h3>
            <p className="text-gray-600">
              {locale === 'fr' 
                ? 'Suivez votre progression et obtenez des certificats'
                : 'Track your progress and earn certificates'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">
              {locale === 'fr' ? 'Téléchargement de fichiers' : 'File Upload'}
            </h3>
            <p className="text-gray-600">
              {locale === 'fr' 
                ? 'Téléchargez et gérez vos documents de cours'
                : 'Upload and manage your course artifacts'}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
