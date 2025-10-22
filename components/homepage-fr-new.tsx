import Link from 'next/link'
import { 
  BriefcaseIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export default function HomePageContentFr() {
  const interventionCategories = [
    {
      title: "Interventions en entreprise",
      description: "Accompagnement coaching, soutien au recrutement, gestion RH, stabilisation d'emploi",
      types: "6 types d'interventions disponibles",
      icon: BriefcaseIcon,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Interventions de partenariat",
      description: "Tables de concertation ad hoc, soutien aux mesures actives, projets de concertation", 
      types: "3 types d'interventions disponibles",
      icon: UsersIcon,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600',
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Interventions sectorielles",
      description: "Comités sectoriels de main-d'œuvre, comités consultatifs par secteur",
      types: "29 secteurs économiques couverts",
      icon: BuildingOfficeIcon,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ]

  const ecosystemStakeholders = [
    {
      category: "Apprenants et organisations",
      description: "À la recherche de services d'emploi et développement des compétences",
      stakeholder: "APPRENANTS",
      roles: [
        {
          title: "Petites et moyennes entreprises",
          description: "Accès aux interventions RH financées à 50-75% avec demandes simplifiées",
          icon: BriefcaseIcon,
          color: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          ctaText: "Trouver des programmes",
          ctaLink: "/fr/apprenants/programmes",
          benefits: ["Demandes de financement simplifiées", "Jumelage de fournisseurs", "Suivi des progrès"]
        },
        {
          title: "Travailleurs individuels",
          description: "Opportunités de développement professionnel et formation",
          icon: UsersIcon,
          color: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          ctaText: "Explorer la formation",
          ctaLink: "/fr/apprenants/individuel",
          benefits: ["Parcours personnalisés", "Suivi de certification", "Évaluation des compétences"]
        }
      ]
    },
    {
      category: "Fournisseurs de services",
      description: "Livraison d'interventions spécialisées et conseil",
      stakeholder: "FOURNISSEURS",
      roles: [
        {
          title: "Consultants et spécialistes",
          description: "Élargissez votre portée grâce à notre réseau complet de fournisseurs",
          icon: AcademicCapIcon,
          color: 'bg-orange-50 border-orange-200',
          iconColor: 'text-orange-600',
          ctaText: "Rejoindre le réseau",
          ctaLink: "/fr/fournisseurs/inscription",
          benefits: ["Système de jumelage clients", "Facturation automatisée", "Analytique de performance"]
        },
        {
          title: "Coordonnateurs internes",
          description: "Rationalisez la gestion de projets avec des outils intégrés",
          icon: ChartBarIcon,
          color: 'bg-purple-50 border-purple-200',
          iconColor: 'text-purple-600',
          ctaText: "Accéder à la plateforme",
          ctaLink: "/fr/fournisseurs/interne",
          benefits: ["Tableaux de bord de projets", "Allocation des ressources", "Rapports d'impact"]
        }
      ]
    },
    {
      category: "Gouvernement et ministère",
      description: "Aperçus basés sur les données et supervision des programmes",
      stakeholder: "GOUVERNEMENT",
      roles: [
        {
          title: "Personnel ministériel",
          description: "Analytique complète et données d'efficacité des programmes",
          icon: BuildingOfficeIcon,
          color: 'bg-indigo-50 border-indigo-200',
          iconColor: 'text-indigo-600',
          ctaText: "Voir tableau analytique",
          ctaLink: "/fr/gouvernement/analytique",
          benefits: ["Métriques de programme en temps réel", "Analyse d'impact du financement", "Données de performance sectorielle"]
        },
        {
          title: "Décideurs politiques",
          description: "Aperçus fondés sur des preuves pour l'optimisation des programmes",
          icon: DocumentCheckIcon,
          color: 'bg-teal-50 border-teal-200',
          iconColor: 'text-teal-600',
          ctaText: "Accéder aux aperçus",
          ctaLink: "/fr/gouvernement/aperçus",
          benefits: ["Suivi des résultats", "Analyse de ROI", "Modélisation prédictive"]
        }
      ]
    }
  ]

  const userRoleCategories = [
    {
      title: "Organisations cherchant du soutien",
      description: "Entreprises, associations et coopératives nécessitant des interventions RH",
      icon: BuildingOfficeIcon,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      title: "Apprenants individuels",
      description: "Travailleurs et employés cherchant des opportunités de développement",
      icon: UsersIcon,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      title: "Fournisseurs de services",
      description: "Spécialistes RH, coachs et consultants livrant des interventions",
      icon: AcademicCapIcon,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      title: "Coordonnateurs de projet",
      description: "Coordonnateurs internes et personnel ministériel gérant les projets CPE",
      icon: ChartBarIcon,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600'
    }
  ]

  const platformFeatures = [
    {
      title: "Écosystème d'analyse de données",
      description: "Intelligence en temps réel sur l'efficacité des programmes et l'impact du financement pour la prise de décision gouvernementale",
      icon: ChartBarIcon,
      color: 'text-blue-600'
    },
    {
      title: "Gestion intégrée de l'écosystème",
      description: "Connexion transparente entre apprenants, fournisseurs et ministère avec suivi complet des résultats",
      icon: UsersIcon,
      color: 'text-green-600'
    },
    {
      title: "Suivi prédictif des programmes", 
      description: "Modélisation avancée des résultats de formation et optimisation automatique du jumelage",
      icon: DocumentCheckIcon,
      color: 'text-purple-600'
    },
    {
      title: "Certification et validation",
      description: "Parcours de certification standardisés avec validation numérique et reconnaissance ministérielle",
      icon: AcademicCapIcon,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        {/* Professional background image */}
        <div className="absolute inset-0 bg-black/20">
          <img 
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Professional team collaboration" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              CPE Connect
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              La plateforme écosystémique essentielle de l'emploi
            </p>
            <p className="text-lg mb-8 text-blue-200 max-w-4xl mx-auto">
              Connectant apprenants, fournisseurs de services et gouvernement grâce à l'analytique intelligente et à la gestion intégrée des programmes pour l'écosystème emploi du Québec.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/fr/auth/signup"
                className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Rejoindre la plateforme
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/fr/demo-analytique"
                className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Voir la démo analytique
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intervention Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trois catégories d'interventions
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {interventionCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <div
                  key={index}
                  className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${category.color}`}
                >
                  {/* Professional image header */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-4 left-4">
                      <Icon className={`h-12 w-12 text-white drop-shadow-lg`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {category.types}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Personas - Learners and Providers */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Professional workspace" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Que vous cherchiez du soutien ou offriez des services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              CPE Connect sert à la fois les organisations et individus cherchant du développement RH, ainsi que les fournisseurs spécialisés qui livrent ces interventions.
            </p>
          </div>
          
          <div className="space-y-16">
            {ecosystemStakeholders.map((stakeholder, stakeholderIndex) => (
              <div key={stakeholderIndex} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {stakeholder.category}
                  </h3>
                  <p className="text-gray-600">
                    {stakeholder.description}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {stakeholder.roles.map((role, roleIndex) => {
                    const Icon = role.icon
                    return (
                      <div
                        key={roleIndex}
                        className={`p-6 rounded-xl border-2 ${role.color} transition-all hover:shadow-md`}
                      >
                        <Icon className={`h-12 w-12 mb-4 ${role.iconColor}`} />
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">
                          {role.title}
                        </h4>
                        <p className="text-gray-600 mb-6">
                          {role.description}
                        </p>
                        <Link
                          href={role.ctaLink}
                          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${role.iconColor.replace('text-', 'bg-')} text-white hover:opacity-90`}
                        >
                          {role.ctaText}
                          <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Value Proposition */}
      <section className="relative py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        {/* Data visualization background */}
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Data analytics dashboard" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Excellence basée sur les données
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Transformer l'écosystème de l'emploi du Québec grâce à l'analyse complète et aux aperçus prédictifs
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-3xl font-bold text-white mb-2">95%</div>
                  <div className="text-blue-100">Visibilité de l'achèvement des programmes</div>
                </div>
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-3xl font-bold text-white mb-2">40%</div>
                  <div className="text-blue-100">Amélioration du jumelage programmes</div>
                </div>
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-3xl font-bold text-white mb-2">360°</div>
                  <div className="text-blue-100">Visibilité de l'écosystème</div>
                </div>
                <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-3xl font-bold text-white mb-2">ROI</div>
                  <div className="text-blue-100">Suivi d'impact en temps réel</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Capacités d'analyse avancées :</h3>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                    Métriques de performance des programmes en temps réel
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                    Analyse d'impact du financement gouvernemental
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                    Modélisation prédictive des résultats de formation
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-400 mr-3" />
                    Rapports automatisés sur l'efficacité sectorielle
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
                <ChartBarIcon className="h-24 w-24 text-blue-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  Tableau de bord analytique
                </h3>
                <p className="text-blue-100 mb-6">
                  Accédez à des aperçus complets sur l'écosystème de l'emploi avec notre plateforme d'analyse avancée.
                </p>
                <Link 
                  href="/fr/demo-analytique"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Voir la démonstration
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <p className="text-sm text-blue-200">
                Plateforme d'intelligence de données conçue pour l'indispensabilité gouvernementale
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Soutenir tous les acteurs de l'emploi
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userRoleCategories.map((role, index) => {
              const Icon = role.icon
              return (
                <div
                  key={index}
                  className={`p-6 rounded-lg border ${role.color} bg-white hover:shadow-md transition-shadow`}
                >
                  <Icon className={`h-12 w-12 mb-4 ${role.iconColor}`} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {role.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {role.description}
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
              Plateforme écosystémique alimentée par l'analyse
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Connecter les apprenants, fournisseurs et gouvernement à travers une intelligence de données avancée et des aperçus prédictifs
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-6 rounded-lg bg-gray-50"
                >
                  <Icon className={`h-8 w-8 mt-1 ${feature.color}`} />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
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
                Financement disponible
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Contribution ministérielle de 50% à 75% selon le secteur prioritaire
              </p>
              <p className="text-sm text-gray-500">
                Secteurs prioritaires : transformation numérique, travailleurs expérimentés, secteur communautaire
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}