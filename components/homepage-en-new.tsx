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

export default function HomePageContent() {
  const interventionCategories = [
    {
      title: "Enterprise interventions",
      description: "Coaching support, recruitment assistance, HR management, employment stabilization",
      types: "6 intervention types available",
      icon: BriefcaseIcon,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: "Partnership interventions",
      description: "Ad hoc consultation tables, active measure support, consultation projects", 
      types: "3 intervention types available",
      icon: UsersIcon,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: "Sectoral interventions",
      description: "Sectoral workforce committees, advisory committees by sector",
      types: "29 economic sectors covered",
      icon: BuildingOfficeIcon,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ]

  const ecosystemStakeholders = [
    {
      category: "Learners & Organizations",
      description: "Seeking employment services and skills development",
      stakeholder: "LEARNERS",
      roles: [
        {
          title: "Small & Medium Enterprises",
          description: "Access 50-75% funded HR interventions with streamlined applications",
          icon: BriefcaseIcon,
          color: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          ctaText: "Find Programs",
          ctaLink: "/en/learners/programs",
          benefits: ["Simplified funding applications", "Provider matching", "Progress tracking"]
        },
        {
          title: "Individual Workers",
          description: "Career development and skills training opportunities",
          icon: UsersIcon,
          color: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          ctaText: "Explore Training",
          ctaLink: "/en/learners/individual",
          benefits: ["Personalized pathways", "Certification tracking", "Skills assessment"]
        }
      ]
    },
    {
      category: "Service Providers",
      description: "Delivering specialized interventions and consulting",
      stakeholder: "PROVIDERS",
      roles: [
        {
          title: "Consultants & Specialists",
          description: "Expand your reach through our comprehensive provider network",
          icon: AcademicCapIcon,
          color: 'bg-orange-50 border-orange-200',
          iconColor: 'text-orange-600',
          ctaText: "Join Provider Network",
          ctaLink: "/en/providers/register",
          benefits: ["Client matching system", "Automated billing", "Performance analytics"]
        },
        {
          title: "Internal Coordinators",
          description: "Streamline project management with integrated tools",
          icon: ChartBarIcon,
          color: 'bg-purple-50 border-purple-200',
          iconColor: 'text-purple-600',
          ctaText: "Access Platform",
          ctaLink: "/en/providers/internal",
          benefits: ["Project dashboards", "Resource allocation", "Impact reporting"]
        }
      ]
    },
    {
      category: "Government & Ministry",
      description: "Data-driven insights and program oversight",
      stakeholder: "GOVERNMENT",
      roles: [
        {
          title: "Ministry Personnel",
          description: "Comprehensive analytics and program effectiveness data",
          icon: BuildingOfficeIcon,
          color: 'bg-indigo-50 border-indigo-200',
          iconColor: 'text-indigo-600',
          ctaText: "View Analytics Dashboard",
          ctaLink: "/en/government/analytics",
          benefits: ["Real-time program metrics", "Funding impact analysis", "Sector performance data"]
        },
        {
          title: "Policy Makers",
          description: "Evidence-based insights for program optimization",
          icon: DocumentCheckIcon,
          color: 'bg-teal-50 border-teal-200',
          iconColor: 'text-teal-600',
          ctaText: "Access Insights",
          ctaLink: "/en/government/insights",
          benefits: ["Outcome tracking", "ROI analysis", "Predictive modeling"]
        }
      ]
    }
  ]

  const userRoleCategories = [
    {
      title: "Organizations seeking support",
      description: "Enterprises, associations, and cooperatives needing HR interventions",
      icon: BuildingOfficeIcon,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      title: "Individual learners",
      description: "Workers and employees seeking skill development opportunities",
      icon: UsersIcon,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      title: "Service providers", 
      description: "HR specialists, coaches, and consultants delivering interventions",
      icon: AcademicCapIcon,
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      title: "Project coordinators",
      description: "Internal coordinators and ministry personnel managing CPE projects",
      icon: ChartBarIcon,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600'
    }
  ]

  const platformFeatures = [
    {
      title: "CPE project management",
      description: "Complete project creation, tracking, and management with 50-75% funding",
      icon: DocumentCheckIcon,
      color: 'text-blue-600'
    },
    {
      title: "Consultation committees",
      description: "Multi-stakeholder collaboration tools and meeting management",
      icon: UsersIcon,
      color: 'text-green-600'
    },
    {
      title: "HR diagnostics", 
      description: "Assessment tools for organizational and individual needs analysis",
      icon: ChartBarIcon,
      color: 'text-purple-600'
    },
    {
      title: "Certification pathways",
      description: "Ministry-recognized certification for different specialized roles",
      icon: AcademicCapIcon,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              CPE Connect
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              The Essential Employment Ecosystem Platform
            </p>
            <p className="text-lg mb-8 text-blue-200 max-w-4xl mx-auto">
              Connecting learners, service providers, and government through intelligent data analytics and comprehensive program management for Quebec's employment consultation system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/en/auth/signup"
                className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Join the Platform
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/en/analytics-demo"
                className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                See Analytics Demo
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
              Three intervention categories
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {interventionCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <div
                  key={index}
                  className={`p-8 rounded-xl border-2 transition-all duration-300 ${category.color}`}
                >
                  <div className="text-center">
                    <Icon className={`h-16 w-16 mx-auto mb-4 ${category.iconColor}`} />
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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Three-Way Ecosystem Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              CPE Connect intelligently connects learners, providers, and government through comprehensive data analytics and seamless integration, becoming the essential platform for Quebec's employment ecosystem.
            </p>
          </div>
          
          <div className="space-y-12">
            {ecosystemStakeholders.map((stakeholder, stakeholderIndex) => (
              <div key={stakeholderIndex} className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
                <div className="text-center mb-8">
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                    stakeholder.stakeholder === 'LEARNERS' ? 'bg-blue-100 text-blue-800' :
                    stakeholder.stakeholder === 'PROVIDERS' ? 'bg-orange-100 text-orange-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}>
                    {stakeholder.stakeholder}
                  </div>
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
                        <p className="text-gray-600 mb-4">
                          {role.description}
                        </p>
                        <ul className="text-sm text-gray-500 mb-6 space-y-1">
                          {role.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
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

      {/* User Roles */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Supporting all employment stakeholders
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

      {/* Analytics Value Proposition */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Data-Driven Excellence
            </h2>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto mb-8">
              Our comprehensive analytics platform makes CPE Connect indispensable to the Quebec employment ecosystem through actionable insights and measurable outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm">
              <ChartBarIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Real-Time Program Analytics</h3>
              <p className="text-blue-100 mb-6">
                Track intervention effectiveness, funding ROI, and participant outcomes across all 29 economic sectors.
              </p>
              <div className="text-3xl font-bold text-yellow-400 mb-2">95%</div>
              <div className="text-sm text-blue-200">Program completion visibility</div>
            </div>

            <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm">
              <DocumentCheckIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Predictive Insights</h3>
              <p className="text-blue-100 mb-6">
                AI-powered recommendations for program optimization, resource allocation, and policy development.
              </p>
              <div className="text-3xl font-bold text-green-400 mb-2">40%</div>
              <div className="text-sm text-blue-200">Improvement in program matching</div>
            </div>

            <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-sm">
              <UsersIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">Ecosystem Intelligence</h3>
              <p className="text-blue-100 mb-6">
                Comprehensive stakeholder analytics enabling evidence-based policy and program decisions.
              </p>
              <div className="text-3xl font-bold text-purple-400 mb-2">360°</div>
              <div className="text-sm text-blue-200">Ecosystem visibility</div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/en/analytics/overview"
              className="inline-flex items-center bg-white text-indigo-900 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Explore Analytics Suite
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Platform Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built to serve all stakeholders with specialized tools and seamless integration
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
                Available funding
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Ministry contribution of 50% to 75% based on priority sector
              </p>
              <p className="text-sm text-gray-500">
                Priority sectors: digital transformation, experienced workers, community sector
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}