'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function PublicFooter() {
  const params = useParams()
  const currentLocale = params.locale || 'fr'
  const isEnglish = currentLocale === 'en'

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href={`/${currentLocale}`} className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <BuildingOfficeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">CPE Connect</span>
            </Link>
            <p className="text-gray-300 text-sm mb-6">
              {isEnglish 
                ? 'Essential ecosystem platform for Quebec employment' 
                : 'Plateforme écosystémique essentielle pour l\'emploi au Québec'
              }
            </p>
            
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="h-5 w-5 text-gray-400" />
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <Link
                  href="/fr"
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    currentLocale === 'fr' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  FR
                </Link>
                <Link
                  href="/en"
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    currentLocale === 'en' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  EN
                </Link>
              </div>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              {isEnglish ? 'Programs' : 'Programmes'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${currentLocale}/programmes/entreprise`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'Enterprise Interventions' : 'Interventions d\'entreprise'}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/programmes/partenariaux`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'Partnership Interventions' : 'Interventions partenariales'}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/programmes/sectoriels`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'Sectoral Interventions' : 'Interventions sectorielles'}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/secteurs`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'Economic Sectors' : 'Secteurs économiques'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Stakeholders */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              {isEnglish ? 'Stakeholders' : 'Parties prenantes'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${currentLocale}/apprenants`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'For Learners' : 'Pour les apprenants'}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/fournisseurs`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'For Providers' : 'Pour les fournisseurs'}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/gouvernement`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'For Government' : 'Pour le gouvernement'}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/analytique`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'Analytics & Data' : 'Analytique et données'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              {isEnglish ? 'Resources' : 'Ressources'}
            </h3>
            <ul className="space-y-2 mb-6">
              <li>
                <Link href={`/${currentLocale}/aide`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'Help Center' : 'Centre d\'aide'}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/financement`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'Funding' : 'Financement'}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/certification`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'Certification' : 'Certification'}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/api-docs`} className="text-gray-300 hover:text-white text-sm transition-colors">
                  {isEnglish ? 'API Documentation' : 'Documentation API'}
                </Link>
              </li>
            </ul>
            
            <div className="text-sm text-gray-400">
              <p className="mb-1">{isEnglish ? 'Contact:' : 'Contact:'}</p>
              <p>info@cpeconnect.quebec</p>
              <p>Québec, Canada</p>
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <Link href={`/${currentLocale}/confidentialite`} className="hover:text-white transition-colors">
                {isEnglish ? 'Privacy Policy' : 'Politique de confidentialité'}
              </Link>
              <Link href={`/${currentLocale}/conditions`} className="hover:text-white transition-colors">
                {isEnglish ? 'Terms of Use' : 'Conditions d\'utilisation'}
              </Link>
              <Link href={`/${currentLocale}/accessibilite`} className="hover:text-white transition-colors">
                {isEnglish ? 'Accessibility' : 'Accessibilité'}
              </Link>
            </div>
            <p>
              © 2025 CPE Connect - {isEnglish ? 'Government of Quebec' : 'Gouvernement du Québec'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}