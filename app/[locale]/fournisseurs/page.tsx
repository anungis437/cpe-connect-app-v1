import { PageLayout } from '@/components/navigation'
import Link from 'next/link'
import { 
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function FournisseursPage() {
  const benefits = [
    {
      title: 'Réseau de clients étendu',
      description: 'Accédez à une base de clients qualifiés à travers tout le Québec via notre système de jumelage.',
      icon: UsersIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Facturation automatisée',
      description: 'Système intégré de facturation et de paiement pour simplifier votre administration.',
      icon: CurrencyDollarIcon,
      color: 'text-green-600'
    },
    {
      title: 'Analytique de performance',
      description: 'Tableaux de bord détaillés pour suivre vos projets et mesurer votre impact.',
      icon: ChartBarIcon,
      color: 'text-purple-600'
    },
    {
      title: 'Certification reconnue',
      description: 'Validation de vos compétences par le système CPE avec reconnaissance ministérielle.',
      icon: DocumentCheckIcon,
      color: 'text-orange-600'
    }
  ]

  const providerTypes = [
    {
      title: 'Consultants externes',
      description: 'Spécialistes RH, coachs en gestion, experts en facilitation',
      specialties: [
        'Coaching exécutif et gestion',
        'Recrutement et sélection',
        'Formation et développement',
        'Consultation RH stratégique',
        'Facilitation de comités'
      ],
      cta: 'Rejoindre le réseau',
      href: '/fr/fournisseurs/externe',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Coordonnateurs internes',
      description: 'Coordonnateurs de projet, animateurs de comités, coordonnateurs RH',
      specialties: [
        'Gestion de projets CPE',
        'Animation de comités',
        'Coordination intersectorielle',
        'Suivi et évaluation',
        'Liaison gouvernementale'
      ],
      cta: 'Accéder aux outils',
      href: '/fr/fournisseurs/interne',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ]

  const processSteps = [
    {
      step: '1',
      title: 'Inscription et évaluation',
      description: 'Soumettez votre candidature avec vos qualifications et expériences pertinentes.'
    },
    {
      step: '2',
      title: 'Validation des compétences',
      description: 'Processus de validation par nos experts sectoriels et reconnaissance CPE.'
    },
    {
      step: '3',
      title: 'Accès à la plateforme',
      description: 'Recevez vos accès et commencez à recevoir des demandes de jumelage.'
    },
    {
      step: '4',
      title: 'Suivi et développement',
      description: 'Bénéficiez d\'un accompagnement continu et d\'opportunités de perfectionnement.'
    }
  ]

  return (
    <PageLayout
      title="Pour les fournisseurs de services"
      description="Consultants et coordonnateurs spécialisés dans la livraison d'interventions CPE"
    >
      <div className="space-y-16">

        {/* Hero Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Élargissez votre impact avec CPE Connect
            </h2>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Rejoignez notre réseau de spécialistes RH et profitez d'un système de jumelage avancé, 
              d'outils de gestion intégrés et d'une reconnaissance professionnelle accrue.
            </p>
            <div className="mt-6">
              <Link
                href="/fr/fournisseurs/inscription"
                className="inline-flex items-center bg-white text-orange-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Devenir fournisseur
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Avantages du réseau CPE Connect
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="bg-white p-6 rounded-xl shadow-md">
                  <Icon className={`h-12 w-12 ${benefit.color} mb-4`} />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Provider Types */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Catégories de fournisseurs
          </h3>
          <div className="grid lg:grid-cols-2 gap-8">
            {providerTypes.map((type) => (
              <div key={type.title} className={`${type.bgColor} rounded-xl p-8`}>
                <div className="flex items-center mb-6">
                  <AcademicCapIcon className={`h-12 w-12 ${type.iconColor} mr-4`} />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {type.title}
                    </h4>
                    <p className="text-gray-600">
                      {type.description}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-3">Spécialités recherchées:</h5>
                  <ul className="space-y-2">
                    {type.specialties.map((specialty, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                        {specialty}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link
                  href={type.href}
                  className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  {type.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Process Steps */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Processus d'intégration
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Impact du réseau CPE Connect
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Fournisseurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Taux de satisfaction client</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">29</div>
              <div className="text-gray-600">Secteurs économiques couverts</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Prêt à rejoindre notre réseau?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Devenez partie intégrante de l'écosystème d'emploi du Québec et contribuez 
            au développement des compétences à travers la province.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fr/fournisseurs/inscription"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Commencer l'inscription
            </Link>
            <Link
              href="/fr/fournisseurs/criteres"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Voir les critères
            </Link>
          </div>
        </div>

      </div>
    </PageLayout>
  )
}