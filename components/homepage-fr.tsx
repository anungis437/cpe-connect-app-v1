'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Screen from '@/components/ui/screen'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function HomePageContentFr() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Screen className="min-h-screen">
        {/* Navigation Header */}
        <nav className="w-full border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CPE</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Académie CPE</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/en" className="text-muted-foreground hover:text-foreground transition-colors">
                English
              </Link>
              <ThemeToggle />
              <Button variant="outline" size="sm">
                Se connecter
              </Button>
              <Button size="sm">
                Commencer
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              {/* Hero Content */}
              <div className="text-center lg:text-left">
                <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Maîtrisez les compétences professionnelles avec 
                  <span className="text-primary"> CPE Connect</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                  Système de gestion d'apprentissage bilingue à votre rythme conçu pour la formation professionnelle continue. 
                  Développez votre expertise, obtenez des certifications et faites progresser votre carrière.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Commencer à apprendre aujourd'hui
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                    Parcourir les cours
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-8 pt-8 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">✓</span>
                    <span>Certifié par l'industrie</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">✓</span>
                    <span>Apprentissage autonome</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">✓</span>
                    <span>Support bilingue</span>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  {/* Professional Learning Image */}
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                    alt="Équipe professionnelle collaborant et apprenant"
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                  
                  {/* Overlay with stats */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">500+</div>
                          <div className="text-xs text-muted-foreground">Apprenants</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">50+</div>
                          <div className="text-xs text-muted-foreground">Cours</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">95%</div>
                          <div className="text-xs text-muted-foreground">Succès</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-xl">📚</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-foreground mb-12">
              Pourquoi choisir l'Académie CPE?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Apprentissage autonome</h4>
                <p className="text-muted-foreground">
                  Apprenez à votre rythme avec des horaires flexibles et des parcours d'apprentissage personnalisés.
                </p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Plateforme bilingue</h4>
                <p className="text-muted-foreground">
                  Accédez au contenu en anglais et en français pour s'adapter aux préférences d'apprentissage diverses.
                </p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Obtenez des certifications</h4>
                <p className="text-muted-foreground">
                  Terminez les cours et obtenez des certificats reconnus par l'industrie pour renforcer vos références.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Course Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-foreground mb-12">
              Explorez les parcours d'apprentissage
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Compétences d'affaires</h4>
                  <p className="text-sm text-muted-foreground">Leadership, gestion de projet et pensée stratégique</p>
                </div>
              </Card>
              
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💻</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Technologie</h4>
                  <p className="text-sm text-muted-foreground">Programmation, analyse de données et transformation numérique</p>
                </div>
              </Card>
              
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Design et créativité</h4>
                  <p className="text-sm text-muted-foreground">Design UI/UX, image de marque et pensée créative</p>
                </div>
              </Card>
              
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Analytique</h4>
                  <p className="text-sm text-muted-foreground">Science des données, rapports et intelligence d'affaires</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-primary-foreground/80">Apprenants actifs</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-primary-foreground/80">Cours d'experts</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-primary-foreground/80">Taux de réussite</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-primary-foreground/80">Accès d'apprentissage</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Prêt à commencer votre parcours d'apprentissage?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de professionnels qui font progresser leur carrière avec l'Académie CPE.
            </p>
            <Button size="lg" className="text-lg px-8 py-3">
              Créer un compte gratuit
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 border-t border-border py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">CPE</span>
                </div>
                <span className="text-sm text-muted-foreground">© 2025 Académie CPE. Tous droits réservés.</span>
              </div>
              
              <div className="flex space-x-6 text-sm">
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  À propos
                </Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Confidentialité
                </Link>
                <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </Screen>
    </ThemeProvider>
  )
}