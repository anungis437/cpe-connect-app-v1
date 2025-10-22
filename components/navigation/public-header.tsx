'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { 
  Bars3Icon, 
  XMarkIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  BriefcaseIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const params = useParams()
  const currentLocale = params.locale || 'fr'
  const isEnglish = currentLocale === 'en'

  const navigationItems = {
    fr: {
      programs: {
        title: 'Programmes',
        items: [
          { 
            title: 'Interventions d\'entreprise', 
            href: '/fr/programmes/entreprise',
            description: 'Coaching, recrutement, gestion RH',
            icon: BriefcaseIcon
          },
          { 
            title: 'Interventions partenariales', 
            href: '/fr/programmes/partenariaux',
            description: 'Projets multi-organisationnels',
            icon: UsersIcon
          },
          { 
            title: 'Interventions sectorielles', 
            href: '/fr/programmes/sectoriels',
            description: '29 secteurs économiques',
            icon: BuildingOfficeIcon
          }
        ]
      },
      stakeholders: {
        title: 'Parties prenantes',
        items: [
          { 
            title: 'Apprenants', 
            href: '/fr/apprenants',
            description: 'Organisations et individus',
            icon: AcademicCapIcon
          },
          { 
            title: 'Fournisseurs', 
            href: '/fr/fournisseurs',
            description: 'Consultants et coordonnateurs',
            icon: ChartBarIcon
          },
          { 
            title: 'Gouvernement', 
            href: '/fr/gouvernement',
            description: 'Aperçus et analytique',
            icon: DocumentCheckIcon
          }
        ]
      },
      resources: {
        title: 'Ressources',
        items: [
          { 
            title: 'Centre d\'aide', 
            href: '/fr/aide',
            description: 'Guides et documentation'
          },
          { 
            title: 'Financement', 
            href: '/fr/financement',
            description: 'Information sur les subventions'
          },
          { 
            title: 'Certification', 
            href: '/fr/certification',
            description: 'Parcours de certification'
          },
          { 
            title: 'Secteurs économiques', 
            href: '/fr/secteurs',
            description: '29 secteurs d\'intervention'
          }
        ]
      }
    },
    en: {
      programs: {
        title: 'Programs',
        items: [
          { 
            title: 'Enterprise Interventions', 
            href: '/en/programs/enterprise',
            description: 'Coaching, recruitment, HR management',
            icon: BriefcaseIcon
          },
          { 
            title: 'Partnership Interventions', 
            href: '/en/programs/partnership',
            description: 'Multi-organizational projects',
            icon: UsersIcon
          },
          { 
            title: 'Sectoral Interventions', 
            href: '/en/programs/sectoral',
            description: '29 economic sectors',
            icon: BuildingOfficeIcon
          }
        ]
      },
      stakeholders: {
        title: 'Stakeholders',
        items: [
          { 
            title: 'Learners', 
            href: '/en/learners',
            description: 'Organizations and individuals',
            icon: AcademicCapIcon
          },
          { 
            title: 'Providers', 
            href: '/en/providers',
            description: 'Consultants and coordinators',
            icon: ChartBarIcon
          },
          { 
            title: 'Government', 
            href: '/en/government',
            description: 'Insights and analytics',
            icon: DocumentCheckIcon
          }
        ]
      },
      resources: {
        title: 'Resources',
        items: [
          { 
            title: 'Help Center', 
            href: '/en/help',
            description: 'Guides and documentation'
          },
          { 
            title: 'Funding', 
            href: '/en/funding',
            description: 'Subsidy information'
          },
          { 
            title: 'Certification', 
            href: '/en/certification',
            description: 'Certification pathways'
          },
          { 
            title: 'Economic Sectors', 
            href: '/en/sectors',
            description: '29 intervention sectors'
          }
        ]
      }
    }
  }

  const nav = navigationItems[currentLocale as keyof typeof navigationItems]

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const authLinks = {
    fr: {
      signIn: 'Se connecter',
      register: 'S\'inscrire',
      demo: 'Voir la démo'
    },
    en: {
      signIn: 'Sign In',
      register: 'Register',
      demo: 'View Demo'
    }
  }

  const auth = authLinks[currentLocale as keyof typeof authLinks]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href={`/${currentLocale}`} className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">CPE Connect</div>
                <div className="text-xs text-gray-500">
                  {isEnglish ? 'Quebec Employment Platform' : 'Plateforme Emploi Québec'}
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            
            {/* Programs Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('programs')}
                className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {nav.programs.title}
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </button>
              
              {openDropdown === 'programs' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {nav.programs.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-start px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <Icon className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Stakeholders Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('stakeholders')}
                className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {nav.stakeholders.title}
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </button>
              
              {openDropdown === 'stakeholders' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {nav.stakeholders.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-start px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <Icon className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('resources')}
                className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {nav.resources.title}
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </button>
              
              {openDropdown === 'resources' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {nav.resources.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </nav>

          {/* Right side - Language + Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {/* Language Switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Link
                href={currentLocale === 'fr' ? '/en' : '/fr'}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center ${
                  currentLocale === 'fr' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GlobeAltIcon className="h-4 w-4 mr-1" />
                FR
              </Link>
              <Link
                href={currentLocale === 'en' ? '/fr' : '/en'}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center ${
                  currentLocale === 'en' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GlobeAltIcon className="h-4 w-4 mr-1" />
                EN
              </Link>
            </div>

            {/* Auth Links */}
            <Link
              href={`/${currentLocale}/auth/signin`}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              {auth.signIn}
            </Link>
            
            <Link
              href={`/${currentLocale}/auth/signup`}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {auth.register}
            </Link>

            <Link
              href={`/${currentLocale}/demo-analytique`}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {auth.demo}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            
            {/* Mobile Programs */}
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">{nav.programs.title}</div>
              <div className="space-y-1 pl-4">
                {nav.programs.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Stakeholders */}
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">{nav.stakeholders.title}</div>
              <div className="space-y-1 pl-4">
                {nav.stakeholders.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Resources */}
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">{nav.resources.title}</div>
              <div className="space-y-1 pl-4">
                {nav.resources.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Link
                href={`/${currentLocale}/auth/signin`}
                className="block w-full text-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {auth.signIn}
              </Link>
              <Link
                href={`/${currentLocale}/auth/signup`}
                className="block w-full text-center bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {auth.register}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}