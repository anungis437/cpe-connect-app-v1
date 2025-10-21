'use client'

import { useState } from 'react'
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter
} from '@/components/ui'
import { 
  User, 
  Mail, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  Palette, 
  Code,
  Zap,
  Shield
} from 'lucide-react'

/**
 * Design System Demo Page
 * 
 * Showcases the CPE Connect design system components
 * and demonstrates theme switching functionality
 */
export default function DesignSystemDemo() {
  // Temporarily simplified for demo - theme hooks will be restored later
  const themeName = 'light'
  const toggleTheme = () => console.log('Theme toggle - will be restored')
  const isDark = false
  
  // Simple static colors for demo

  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const features = [
    {
      icon: <Palette className="h-6 w-6" />,
      title: 'Design Tokens',
      description: 'Comprehensive design token system with consistent colors, typography, and spacing.',
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Component Library',
      description: 'Built on Radix UI with class-variance-authority for type-safe styling variants.',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Performance',
      description: 'Optimized for performance with tree-shaking and minimal bundle size.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Accessibility',
      description: 'WCAG 2.1 compliant with comprehensive keyboard navigation and screen reader support.',
    },
  ]

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Debug test */}
      <div className="bg-blue-500 text-white p-4 text-center mb-4">
        <h2 className="text-2xl font-bold">CPE Connect Design System - Loading Test</h2>
        <p>If you see this, the page is working!</p>
      </div>
      
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              CPE Connect Design System
            </h1>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            World-class design system built for the CPE Connect platform
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Current theme:</span>
            <span className="font-medium capitalize">{themeName}</span>
          </div>
        </div>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>
              Comprehensive button variants with loading states and accessibility features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Buttons */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
                <Button size="icon" variant="outline">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Button States */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">States</h4>
              <div className="flex flex-wrap gap-3">
                <Button>Normal</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth>Full Width</Button>
              </div>
            </div>

            {/* Buttons with Icons */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">With Icons</h4>
              <div className="flex flex-wrap gap-3">
                <Button leftIcon={<User className="h-4 w-4" />}>
                  Left Icon
                </Button>
                <Button rightIcon={<Mail className="h-4 w-4" />}>
                  Right Icon
                </Button>
                <Button 
                  variant="outline" 
                  leftIcon={<Zap className="h-4 w-4" />}
                  rightIcon={<Shield className="h-4 w-4" />}
                >
                  Both Icons
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Components */}
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>
              Form inputs with validation states, icons, and comprehensive accessibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Inputs */}
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  leftElement={<User className="h-4 w-4" />}
                  required
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  leftElement={<Mail className="h-4 w-4" />}
                  helperText="We'll never share your email address"
                  required
                />
                
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                  required
                />
              </div>

              {/* Input States */}
              <div className="space-y-4">
                <Input
                  label="Success State"
                  placeholder="Valid input"
                  variant="success"
                />
                
                <Input
                  label="Warning State"
                  placeholder="Warning input"
                  variant="warning"
                  helperText="This field needs attention"
                />
                
                <Input
                  label="Error State"
                  placeholder="Invalid input"
                  error="This field is required"
                />
                
                <Input
                  label="Disabled State"
                  placeholder="Disabled input"
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Design System Features</CardTitle>
            <CardDescription>
              Key capabilities and benefits of the CPE Connect design system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} variant="outlined" className="p-0">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {feature.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Color System</CardTitle>
            <CardDescription>
              Theme-aware color palette with semantic color mappings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Background Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Background</h4>
                <div className="space-y-2">
                  <div className="h-12 rounded-md border flex items-center justify-center text-sm bg-background text-foreground">
                    Primary
                  </div>
                  <div className="h-12 rounded-md border flex items-center justify-center text-sm bg-secondary text-secondary-foreground">
                    Secondary
                  </div>
                  <div className="h-12 rounded-md border flex items-center justify-center text-sm bg-muted text-muted-foreground">
                    Accent
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Brand</h4>
                <div className="space-y-2">
                  <div className="h-12 rounded-md flex items-center justify-center text-sm bg-primary text-primary-foreground">
                    Primary
                  </div>
                  <div className="h-12 rounded-md flex items-center justify-center text-sm bg-blue-700 text-white">
                    Secondary
                  </div>
                  <div className="h-12 rounded-md border flex items-center justify-center text-sm bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    Subtle
                  </div>
                </div>
              </div>

              {/* State Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">States</h4>
                <div className="space-y-2">
                  <div className="h-12 rounded-md flex items-center justify-center text-sm bg-green-600 text-white">
                    Success
                  </div>
                  <div className="h-12 rounded-md flex items-center justify-center text-sm bg-amber-600 text-white">
                    Warning
                  </div>
                  <div className="h-12 rounded-md flex items-center justify-center text-sm bg-red-600 text-white">
                    Error
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Colors automatically adapt to the current theme for optimal contrast and accessibility.
            </p>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            CPE Connect Design System - Phase 2 Implementation
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Built with Next.js 14, Radix UI, Tailwind CSS, and TypeScript
          </p>
        </div>
      </div>
    </div>
  )
}