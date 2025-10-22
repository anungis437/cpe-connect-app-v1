import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { 
  BriefcaseIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface HomePageProps {
  params: { locale: string }
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const t = await getTranslations()

  const interventionCategories = [
    {
      key: 'enterprise',
      icon: BriefcaseIcon,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      key: 'partnership',
      icon: UsersIcon,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      key: 'sectoral',
      icon: BuildingOfficeIcon,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ]

  const userRoleCategories = [
    {
      key: 'consultants',
      icon: AcademicCapIcon,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      key: 'coordinators',
      icon: ChartBarIcon,
      color: 'bg-teal-50 border-teal-200',
      iconColor: 'text-teal-600'
    },
    {
      key: 'representatives',
      icon: UsersIcon,
      color: 'bg-indigo-50 border-indigo-200',
      iconColor: 'text-indigo-600'
    },
    {
      key: 'ministry',
      icon: BuildingOfficeIcon,
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600'
    }
  ]

  const platformFeatures = [
    {
      key: 'projects',
      icon: DocumentCheckIcon,
      color: 'text-blue-600'
    },
    {
      key: 'committees',
      icon: UsersIcon,
      color: 'text-green-600'
    },
    {
      key: 'assessments',
      icon: ChartBarIcon,
      color: 'text-purple-600'
    },
    {
      key: 'certification',
      icon: AcademicCapIcon,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CPE</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
                  <p className="text-sm text-gray-600">{t('app.subtitle')}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <Link 
                  href="/fr" 
                  className={`px-3 py-1 rounded-md text-sm ${locale === 'fr' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Français
                </Link>
                <Link 
                  href="/en" 
                  className={`px-3 py-1 rounded-md text-sm ${locale === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  English
                </Link>
              </div>
              <Link 
                href={`/${locale}/auth/signin`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('auth.signIn')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              {t('home.hero.subtitle')}
            </p>
            <p className="text-lg mb-8 text-blue-200 max-w-4xl mx-auto">
              {t('home.hero.description')}
            </p>
            <Link
              href={`/${locale}/auth/signup`}
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              {t('home.hero.cta')}
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Intervention Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.interventions.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {interventionCategories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.key}
                  className={`p-8 rounded-xl border-2 transition-all duration-300 ${category.color}`}
                >
                  <div className="text-center">
                    <Icon className={`h-16 w-16 mx-auto mb-4 ${category.iconColor}`} />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {t(`home.interventions.${category.key}.title`)}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t(`home.interventions.${category.key}.description`)}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {t(`home.interventions.${category.key}.types`)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.roles.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userRoleCategories.map((role) => {
              const Icon = role.icon
              return (
                <div
                  key={role.key}
                  className={`p-6 rounded-lg border ${role.color} bg-white hover:shadow-md transition-shadow`}
                >
                  <Icon className={`h-12 w-12 mb-4 ${role.iconColor}`} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(`home.roles.${role.key}.title`)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(`home.roles.${role.key}.description`)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {platformFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.key}
                  className="flex items-start space-x-4 p-6 rounded-lg bg-gray-50"
                >
                  <Icon className={`h-8 w-8 mt-1 ${feature.color}`} />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t(`home.features.${feature.key}.title`)}
                    </h3>
                    <p className="text-gray-600">
                      {t(`home.features.${feature.key}.description`)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Funding Information */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <CurrencyDollarIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('home.funding.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {t('home.funding.description')}
              </p>
              <p className="text-sm text-gray-500">
                {t('home.funding.priority_sectors')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold">CPE</span>
              </div>
              <span className="text-xl font-bold">{t('app.title')}</span>
            </div>
            <p className="text-gray-400 mb-4">
              {t('app.tagline')}
            </p>
            <p className="text-sm text-gray-500">
              © 2025 {t('app.title')} - {locale === 'fr' ? 'Gouvernement du Québec' : 'Government of Quebec'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}