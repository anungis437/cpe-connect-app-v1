import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'
import MainNavigation from '@/components/navigation/main-navigation'
import { BookOpen, Users, Trophy, Globe, ArrowRight, Palette } from 'lucide-react'

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect(`/${locale}/dashboard`)
  }

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: locale === 'fr' ? 'Apprentissage Moderne' : 'Modern Learning',
      description: locale === 'fr' 
        ? 'Plateforme d\'apprentissage interactive avec contenu multimédia'
        : 'Interactive learning platform with multimedia content'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: locale === 'fr' ? 'Communauté' : 'Community',
      description: locale === 'fr'
        ? 'Rejoignez une communauté de professionnels en développement'
        : 'Join a community of developing professionals'
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: locale === 'fr' ? 'Certifications' : 'Certifications',
      description: locale === 'fr'
        ? 'Obtenez des certificats reconnus pour vos compétences'
        : 'Earn recognized certificates for your skills'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: locale === 'fr' ? 'Bilingue' : 'Bilingual',
      description: locale === 'fr'
        ? 'Contenu disponible en français et en anglais'
        : 'Content available in French and English'
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 sm:text-6xl">
                  {locale === 'fr' ? 'Académie CPE' : 'CPE Academy'}
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-gray-700 dark:text-gray-300">
                  {locale === 'fr' 
                    ? 'Système de gestion de l\'apprentissage bilingue avec design system de classe mondiale' 
                    : 'Bilingual Self-Paced Learning Management System with world-class design system'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href={`/${locale}/auth/signin`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    {locale === 'fr' ? 'Se connecter' : 'Sign In'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/signup`}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {locale === 'fr' ? 'S\'inscrire' : 'Sign Up'}
                  </Button>
                </Link>
                <Link href="/design-system">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                    <Palette className="mr-2 h-4 w-4" />
                    Design System
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                {locale === 'fr' ? 'Fonctionnalités' : 'Features'}
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                {locale === 'fr'
                  ? 'Découvrez les outils et fonctionnalités de notre plateforme'
                  : 'Discover the tools and features of our platform'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} variant="outlined" className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Language Selection & Call to Action */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {locale === 'fr' ? 'Choisissez votre langue' : 'Choose your language'}
              </h2>
              
              <div className="flex justify-center gap-4">
                <Link href="/en">
                  <Button 
                    variant={locale === 'en' ? 'default' : 'outline'}
                    size="lg"
                  >
                    English
                  </Button>
                </Link>
                <Link href="/fr">
                  <Button 
                    variant={locale === 'fr' ? 'default' : 'outline'}
                    size="lg"
                  >
                    Français
                  </Button>
                </Link>
              </div>
              
              <div className="pt-8">
                <Link href={`/${locale}/auth/signup`}>
                  <Button size="xl" className="shadow-lg">
                    {locale === 'fr' ? 'Commencer maintenant' : 'Get Started Now'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}