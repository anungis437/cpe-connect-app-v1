import { PageLayout } from '@/components/navigation'
import Link from 'next/link'
import { 
  BuildingOfficeIcon,
  UserIcon,
  BookOpenIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function ApprenantsPage() {
  const features = [
    {
      title: 'Programmes financés',
      description: 'Accès à des interventions RH financées de 50% à 75% selon votre secteur d\'activité.',
      icon: CurrencyDollarIcon,
      color: 'text-green-600'
    },
    {
      title: 'Jumelage personnalisé',
      description: 'Notre système vous associe automatiquement aux meilleurs fournisseurs selon vos besoins.',
      icon: UserIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Suivi des progrès',
      description: 'Tableaux de bord en temps réel pour suivre l\'avancement de vos projets et formations.',
      icon: ChartBarIcon,
      color: 'text-purple-600'
    },
    {
      title: 'Certification reconnue',
      description: 'Obtenez des certifications reconnues par le ministère pour vos formations complétées.',
      icon: CheckCircleIcon,
      color: 'text-orange-600'
    }
  ]

  const programTypes = [
    {
      title: 'PME (6-99 employés)',
      description: 'Programmes prioritaires avec financement jusqu\'à 75%',
      features: [
        'Diagnostic RH personnalisé',
        'Coaching en gestion',
        'Stratégies de recrutement',
        'Amélioration de la productivité'
      ],
      cta: 'Commencer l\'évaluation',
      href: '/fr/apprenants/pme'
    },
    {
      title: 'Travailleurs individuels',
      description: 'Formation et développement professionnel personnalisé',
      features: [
        'Évaluation des compétences',
        'Parcours de formation',
        'Certification professionnelle',
        'Accompagnement personnalisé'
      ],
      cta: 'Explorer les formations',
      href: '/fr/apprenants/individuel'
    }
  ]

  return (
    <PageLayout
      title="Pour les apprenants"
      description="Organisations et individus cherchant du soutien RH et développement des compétences"
    >
      <div className="space-y-16">

        {/* Hero Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Développez vos compétences avec le soutien CPE
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Accédez à des programmes de formation financés et à un accompagnement personnalisé 
              pour améliorer vos pratiques RH et développer vos compétences professionnelles.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Avantages de la plateforme CPE Connect
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-white p-6 rounded-xl shadow-md">
                  <Icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Program Types */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Choisissez votre catégorie
          </h3>
          <div className="grid lg:grid-cols-2 gap-8">
            {programTypes.map((program) => (
              <div key={program.title} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {program.title}
                      </h4>
                      <p className="text-gray-600">
                        {program.description}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {program.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={program.href}
                    className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {program.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Prêt à commencer?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers d\'organisations et professionnels qui utilisent CPE Connect 
            pour développer leurs compétences et améliorer leurs pratiques RH.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fr/auth/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              S'inscrire gratuitement
            </Link>
            <Link
              href="/fr/demo-analytique"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Voir une démonstration
            </Link>
          </div>
        </div>

      </div>
    </PageLayout>
  )
}