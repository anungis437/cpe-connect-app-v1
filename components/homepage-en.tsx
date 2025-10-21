'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Screen from '@/components/ui/screen'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function HomePageContent() {
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
              <h1 className="text-xl font-bold text-foreground">CPE Academy</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/fr" className="text-muted-foreground hover:text-foreground transition-colors">
                Français
              </Link>
              <ThemeToggle />
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm">
                Get Started
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
                  Master Professional Skills with 
                  <span className="text-primary"> CPE Connect</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                  Self-paced bilingual learning management system designed for continuous professional education. 
                  Build expertise, earn certifications, and advance your career.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Start Learning Today
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                    Browse Courses
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start mt-8 pt-8 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">✓</span>
                    <span>Industry Certified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">✓</span>
                    <span>Self-Paced Learning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">✓</span>
                    <span>Bilingual Support</span>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  {/* Professional Learning Image */}
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                    alt="Professional team collaborating and learning"
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                  
                  {/* Overlay with stats */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">500+</div>
                          <div className="text-xs text-muted-foreground">Learners</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">50+</div>
                          <div className="text-xs text-muted-foreground">Courses</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">95%</div>
                          <div className="text-xs text-muted-foreground">Success</div>
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
              Why Choose CPE Academy?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Self-Paced Learning</h4>
                <p className="text-muted-foreground">
                  Learn at your own speed with flexible scheduling and personalized learning paths.
                </p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Bilingual Platform</h4>
                <p className="text-muted-foreground">
                  Access content in both English and French to accommodate diverse learning preferences.
                </p>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Earn Certifications</h4>
                <p className="text-muted-foreground">
                  Complete courses and earn industry-recognized certificates to boost your credentials.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Course Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-foreground mb-12">
              Explore Learning Tracks
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Business Skills</h4>
                  <p className="text-sm text-muted-foreground">Leadership, project management, and strategic thinking</p>
                </div>
              </Card>
              
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💻</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Technology</h4>
                  <p className="text-sm text-muted-foreground">Programming, data analysis, and digital transformation</p>
                </div>
              </Card>
              
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Design & Creative</h4>
                  <p className="text-sm text-muted-foreground">UI/UX design, branding, and creative thinking</p>
                </div>
              </Card>
              
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Analytics</h4>
                  <p className="text-sm text-muted-foreground">Data science, reporting, and business intelligence</p>
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
                <div className="text-primary-foreground/80">Active Learners</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-primary-foreground/80">Expert Courses</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-primary-foreground/80">Completion Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-primary-foreground/80">Learning Access</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Your Learning Journey?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who are advancing their careers with CPE Academy.
            </p>
            <Button size="lg" className="text-lg px-8 py-3">
              Create Free Account
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
                <span className="text-sm text-muted-foreground">© 2025 CPE Academy. All rights reserved.</span>
              </div>
              
              <div className="flex space-x-6 text-sm">
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
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