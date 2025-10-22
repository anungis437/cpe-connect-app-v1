import { PageLayout } from '@/components/navigation'
import Link from 'next/link'
import { 
  ChartBarIcon,
  DocumentCheckIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function GouvernementPage() {
  const analyticsFeatures = [
    {
      title: 'Métriques en temps réel',
      description: 'Suivi instantané des programmes CPE avec données actualisées en continu.',
      icon: ClockIcon,
      color: 'text-blue-600'
    },
    {
      title: 'ROI du financement',
      description: 'Analyse détaillée du retour sur investissement des subventions accordées.',
      icon: CurrencyDollarIcon,
      color: 'text-green-600'
    },
    {
      title: 'Performance sectorielle',
      description: 'Comparaison de l\'efficacité entre les 29 secteurs économiques.',
      icon: ArrowTrendingUpIcon,
      color: 'text-purple-600'
    },
    {
      title: 'Visibilité complète',
      description: 'Vue d\'ensemble de l\'écosystème avec tous les acteurs et interactions.',
      icon: EyeIcon,
      color: 'text-orange-600'
    }
  ]

  const dashboards = [
    {
      title: 'Tableau de bord exécutif',
      description: 'Vue d\'ensemble stratégique pour les décideurs ministériels',
      features: [
        'KPIs de performance globale',
        'Tendances sectorielles',
        'Allocation budgétaire',
        'Impact économique'
      ],
      users: 'Personnel ministériel senior',
      access: '/fr/gouvernement/executif'
    },
    {
      title: 'Analytique opérationnelle',
      description: 'Données détaillées pour l\'analyse et l\'optimisation des programmes',
      features: [
        'Métriques de programme détaillées',
        'Analyse prédictive',
        'Rapports personnalisés',
        'Alertes automatiques'
      ],
      users: 'Analystes et gestionnaires de programme',
      access: '/fr/gouvernement/operationnel'
    },
    {
      title: 'Surveillance de conformité',
      description: 'Suivi de la conformité réglementaire et des standards qualité',
      features: [
        'Audit de conformité',
        'Validation des certifications',
        'Contrôle qualité',
        'Rapports réglementaires'
      ],
      users: 'Équipes d\'audit et de conformité',
      access: '/fr/gouvernement/conformite'
    }
  ]

  const keyMetrics = [
    {
      value: '2,847',
      label: 'Organisations actives',
      change: '+12%',
      period: 'ce trimestre'
    },
    {
      value: '18.4M$',
      label: 'Financement distribué',
      change: '+8%',
      period: 'cette année'
    },
    {
      value: '94.2%',
      label: 'Taux de satisfaction',
      change: '+2.1%',
      period: 'vs année précédente'
    },
    {
      value: '67%',
      label: 'Programmes complétés',
      change: '+15%',
      period: 'amélioration'
    }
  ]

  const insights = [
    {
      title: 'Efficacité par secteur',
      description: 'Le secteur manufacturier montre le plus haut taux de completion (89%) et ROI (3.2x)',
      priority: 'Haute',
      action: 'Étendre le modèle aux secteurs similaires'
    },
    {
      title: 'Tendance de financement',
      description: 'Augmentation de 23% des demandes pour les interventions partenariales',
      priority: 'Moyenne',
      action: 'Évaluer l\'allocation budgétaire'
    },
    {
      title: 'Performance fournisseurs',
      description: 'Top 10% des fournisseurs génèrent 78% de la satisfaction client',
      priority: 'Haute',
      action: 'Programme de reconnaissance et expansion'
    }
  ]

  return (
    <PageLayout
      title="Tableaux de bord gouvernementaux"
      description="Analyse de données et aperçus stratégiques pour l'écosystème CPE du Québec"
    >
      <div className="space-y-16">

        {/* Hero Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Intelligence de données pour l'excellence CPE
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-6">
              Plateforme d'analyse avancée offrant une visibilité complète sur l'écosystème 
              d'emploi du Québec avec des insights prédictifs et des métriques en temps réel.
            </p>
            <Link
              href="/fr/demo-analytique"
              className="inline-flex items-center bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Accéder à la démonstration
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Métriques clés de l'écosystème
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric) => (
              <div key={metric.label} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {metric.label}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {metric.change} {metric.period}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Features */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Capacités d'analyse avancées
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {analyticsFeatures.map((feature) => {
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

        {/* Dashboards */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Tableaux de bord spécialisés
          </h3>
          <div className="grid lg:grid-cols-3 gap-8">
            {dashboards.map((dashboard) => (
              <div key={dashboard.title} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
                    <h4 className="text-xl font-semibold text-gray-900">
                      {dashboard.title}
                    </h4>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">
                    {dashboard.description}
                  </p>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Fonctionnalités:</h5>
                    <ul className="space-y-1">
                      {dashboard.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-xs text-gray-500 mb-2">Utilisateurs cibles:</div>
                    <div className="text-sm text-gray-700">{dashboard.users}</div>
                  </div>
                  
                  <Link
                    href={dashboard.access}
                    className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Accéder au tableau de bord
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Insights */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Aperçus stratégiques récents
          </h3>
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-400">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {insight.title}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    insight.priority === 'Haute' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Priorité {insight.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">
                  {insight.description}
                </p>
                <div className="text-sm">
                  <span className="text-gray-500">Action recommandée:</span>
                  <span className="text-gray-900 ml-1">{insight.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              Indispensabilité par l'intelligence de données
            </h3>
            <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
              CPE Connect devient l'infrastructure de données essentielle pour l'écosystème 
              d'emploi du Québec, fournissant les insights nécessaires à la prise de décision 
              éclairée et à l'optimisation continue des programmes.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">360°</div>
                <div className="text-gray-300">Visibilité complète de l'écosystème</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">ROI</div>
                <div className="text-gray-300">Mesure d'impact en temps réel</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">IA</div>
                <div className="text-gray-300">Analyse prédictive avancée</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Accès gouvernemental sécurisé
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Accédez aux tableaux de bord avec authentification gouvernementale sécurisée 
            et permissions basées sur les rôles ministériels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fr/auth/gouvernement"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Connexion gouvernementale
            </Link>
            <Link
              href="/fr/gouvernement/documentation"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Documentation technique
            </Link>
          </div>
        </div>

      </div>
    </PageLayout>
  )
}