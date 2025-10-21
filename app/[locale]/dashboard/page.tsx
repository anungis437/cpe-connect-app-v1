import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/auth/signin`)
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(*)
    `)
    .eq('user_id', user.id)

  // Get available courses
  const { data: availableCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)

  const handleSignOut = async () => {
    'use server'
    const supabase = await createServerClient()
    await supabase.auth.signOut()
    redirect(`/${locale}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href={`/${locale}/dashboard`} className="text-xl font-bold text-blue-600">
                {locale === 'fr' ? 'Académie CPE' : 'CPE Academy'}
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link href={`/${locale}/dashboard`} className="text-gray-700 hover:text-blue-600">
                  {locale === 'fr' ? 'Tableau de bord' : 'Dashboard'}
                </Link>
                <Link href={`/${locale}/courses`} className="text-gray-700 hover:text-blue-600">
                  {locale === 'fr' ? 'Cours' : 'Courses'}
                </Link>
                <Link href={`/${locale}/certificates`} className="text-gray-700 hover:text-blue-600">
                  {locale === 'fr' ? 'Certificats' : 'Certificates'}
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{(profile as any)?.full_name || user.email}</span>
              <div className="flex gap-2">
                <Link
                  href="/en/dashboard"
                  className={`px-3 py-1 text-sm rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  EN
                </Link>
                <Link
                  href="/fr/dashboard"
                  className={`px-3 py-1 text-sm rounded ${locale === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  FR
                </Link>
              </div>
              <form action={handleSignOut}>
                <button 
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {locale === 'fr' ? 'Déconnexion' : 'Sign Out'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'fr' ? 'Bienvenue, ' : 'Welcome, '}{(profile as any)?.full_name || user.email}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'fr' ? 'Continuez votre apprentissage' : 'Continue your learning journey'}
          </p>
        </div>

        {/* My Courses */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'fr' ? 'Mes cours' : 'My Courses'}
          </h2>
          {enrollments && enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment: any) => (
                <div key={enrollment.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {locale === 'fr' ? enrollment.course.title_fr : enrollment.course.title_en}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {locale === 'fr' ? enrollment.course.description_fr : enrollment.course.description_en}
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{locale === 'fr' ? 'Progrès' : 'Progress'}</span>
                      <span>{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/courses/${enrollment.course_id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {locale === 'fr' ? 'Continuer' : 'Continue'}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">
                {locale === 'fr' 
                  ? 'Vous n\'êtes inscrit à aucun cours pour le moment.' 
                  : 'You are not enrolled in any courses yet.'}
              </p>
              <Link
                href={`/${locale}/courses`}
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {locale === 'fr' ? 'Parcourir les cours' : 'Browse Courses'}
              </Link>
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {locale === 'fr' ? 'Cours disponibles' : 'Available Courses'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses?.filter(course => 
              !enrollments?.some((e: any) => e.course_id === (course as any).id)
            ).map((course: any) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">
                  {locale === 'fr' ? course.title_fr : course.title_en}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {locale === 'fr' ? course.description_fr : course.description_en}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>{course.duration_minutes} {locale === 'fr' ? 'min' : 'min'}</span>
                </div>
                <Link
                  href={`/${locale}/courses/${course.id}/enroll`}
                  className="block w-full text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  {locale === 'fr' ? 'S\'inscrire' : 'Enroll'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
