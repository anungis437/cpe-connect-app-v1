interface HomePageProps {
  params: { locale: string }
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">
        {locale === 'fr' ? 'Bienvenue - Académie CPE' : 'Welcome - CPE Academy'}
      </h1>
      <p className="text-lg mb-4">
        Locale: <strong>{locale}</strong>
      </p>
      <p className="text-gray-600">
        {locale === 'fr' 
          ? 'Si vous voyez cette page, le routage fonctionne correctement!' 
          : 'If you can see this page, routing is working correctly!'}
      </p>
      <div className="mt-8 space-x-4">
        <a href="/en" className="text-blue-600 hover:underline">English</a>
        <a href="/fr" className="text-blue-600 hover:underline">Français</a>
        <a href="/en/auth/signin" className="text-blue-600 hover:underline">Sign In</a>
      </div>
    </div>
  )
}
