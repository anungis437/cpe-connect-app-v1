import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Screen from '@/components/ui/screen'

export default async function DashboardPageWithScreen({ params: { locale } }: { params: { locale: string } }) {
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
    <Screen variant="dashboard" fullHeight padding="none">
      {/* Navigation - Outside of main padding */}
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
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                  {locale === 'fr' ? 'Déconnexion' : 'Sign Out'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content with padding applied */}
      <Screen padding="lg" className="flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <Screen variant="course" padding="lg" className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {locale === 'fr' ? 'Bienvenue' : 'Welcome'}, {(profile as any)?.full_name || user.email?.split('@')[0]}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {locale === 'fr' 
                    ? 'Continuez votre parcours d\'apprentissage' 
                    : 'Continue your learning journey'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {enrollments?.length || 0}
                </div>
                <div className="text-sm text-gray-500">
                  {locale === 'fr' ? 'Cours inscrits' : 'Enrolled Courses'}
                </div>
              </div>
            </div>
          </Screen>

          {/* Current Courses */}
          {enrollments && enrollments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                {locale === 'fr' ? 'Mes cours' : 'My Courses'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment: any) => (
                  <Screen key={enrollment.id} variant="course" padding="md">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {locale === 'fr' ? enrollment.course.title_fr : enrollment.course.title_en}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {locale === 'fr' ? enrollment.course.description_fr : enrollment.course.description_en}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{locale === 'fr' ? 'Progrès' : 'Progress'}</span>
                          <span>{enrollment.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <Link
                        href={`/${locale}/courses/${enrollment.course.id}`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                      >
                        {enrollment.progress_percentage > 0 
                          ? (locale === 'fr' ? 'Continuer' : 'Continue')
                          : (locale === 'fr' ? 'Commencer' : 'Start')
                        }
                      </Link>
                    </div>
                  </Screen>
                ))}
              </div>
            </div>
          )}

          {/* Available Courses */}
          {availableCourses && availableCourses.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                {locale === 'fr' ? 'Cours disponibles' : 'Available Courses'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses
                  .filter((course: any) => !enrollments?.some((e: any) => e.course_id === course.id))
                  .map((course: any) => (
                  <Screen key={course.id} variant="course" padding="md" className="hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {locale === 'fr' ? course.title_fr : course.title_en}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {locale === 'fr' ? course.description_fr : course.description_en}
                      </p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{course.duration_hours} {locale === 'fr' ? 'heures' : 'hours'}</span>
                        <span>{course.credits_awarded} {locale === 'fr' ? 'crédits' : 'credits'}</span>
                      </div>

                      <form action={async () => {
                        'use server'
                        const supabase = await createServerClient()
                        await supabase.from('enrollments').insert({
                          user_id: user.id,
                          course_id: course.id,
                          enrolled_at: new Date().toISOString(),
                          progress_percentage: 0
                        })
                        redirect(`/${locale}/dashboard`)
                      }}>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors">
                          {locale === 'fr' ? 'S\'inscrire' : 'Enroll Now'}
                        </button>
                      </form>
                    </div>
                  </Screen>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!enrollments || enrollments.length === 0) && (!availableCourses || availableCourses.length === 0) && (
            <Screen variant="course" padding="lg" className="text-center">
              <h3 className="text-xl font-semibold text-gray-600 mb-4">
                {locale === 'fr' ? 'Aucun cours disponible' : 'No courses available'}
              </h3>
              <p className="text-gray-500">
                {locale === 'fr' 
                  ? 'Contactez votre administrateur pour accéder aux cours.'
                  : 'Contact your administrator to access courses.'}
              </p>
            </Screen>
          )}
        </div>
      </Screen>
    </Screen>
  )
}