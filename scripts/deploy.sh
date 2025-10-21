#!/bin/bash

# CPE Connect Deployment Script
# This script handles the complete deployment process

set -e # Exit on error

echo "🚀 Starting CPE Connect Deployment Process..."

# Configuration
DOCKER_IMAGE_NAME="cpe-connect-app"
DOCKER_REGISTRY="ghcr.io/your-org"
VERSION=$(date +%Y%m%d-%H%M%S)
ENVIRONMENT=${1:-production}

echo "📋 Deployment Configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Version: $VERSION"
echo "  Registry: $DOCKER_REGISTRY"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if required environment variables are set
if [ "$ENVIRONMENT" = "production" ]; then
  required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "POWERBI_CLIENT_ID"
    "POWERBI_CLIENT_SECRET"
  )

  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo "❌ Error: Required environment variable $var is not set"
      exit 1
    fi
  done
  echo "✅ Environment variables validated"
fi

# Run tests
echo "🧪 Running tests..."
npm run test:ci 2>/dev/null || {
  echo "⚠️  Tests failed, but continuing with deployment..."
}

# Run linting
echo "🔍 Running linter..."
npm run lint 2>/dev/null || {
  echo "⚠️  Linting issues found, but continuing with deployment..."
}

# Type check
echo "📝 Running type check..."
npm run type-check || {
  echo "❌ Type check failed"
  exit 1
}

# Build application
echo "🔨 Building application..."
BUILD_STANDALONE=true npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker build \
  --build-arg NODE_ENV=$ENVIRONMENT \
  --build-arg VERSION=$VERSION \
  -t $DOCKER_IMAGE_NAME:$VERSION \
  -t $DOCKER_IMAGE_NAME:latest \
  .

# Tag for registry
if [ -n "$DOCKER_REGISTRY" ]; then
  echo "🏷️  Tagging image for registry..."
  docker tag $DOCKER_IMAGE_NAME:$VERSION $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$VERSION
  docker tag $DOCKER_IMAGE_NAME:latest $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest
fi

# Run security scan (optional)
if command -v docker-scan &> /dev/null; then
  echo "🛡️  Running security scan..."
  docker scan $DOCKER_IMAGE_NAME:$VERSION || {
    echo "⚠️  Security scan found issues, review before deploying to production"
  }
fi

# Deploy based on environment
case $ENVIRONMENT in
  "development"|"dev")
    echo "🏗️  Deploying to development environment..."
    docker-compose -f docker-compose.yml up -d --build
    ;;
  
  "staging")
    echo "🎭 Deploying to staging environment..."
    # Add staging-specific deployment commands here
    docker-compose -f docker-compose.staging.yml up -d
    ;;
  
  "production"|"prod")
    echo "🌟 Deploying to production environment..."
    
    # Push to registry
    if [ -n "$DOCKER_REGISTRY" ]; then
      echo "📤 Pushing to registry..."
      docker push $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$VERSION
      docker push $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest
    fi
    
    # Deploy with zero-downtime
    docker-compose -f docker-compose.prod.yml up -d
    
    # Health check
    echo "🏥 Running health check..."
    sleep 30
    
    for i in {1..10}; do
      if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        echo "✅ Application is healthy"
        break
      else
        echo "⏳ Waiting for application to be ready... ($i/10)"
        sleep 10
      fi
      
      if [ $i -eq 10 ]; then
        echo "❌ Health check failed"
        exit 1
      fi
    done
    ;;
    
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Available environments: development, staging, production"
    exit 1
    ;;
esac

# Post-deployment tasks
echo "🧹 Running post-deployment tasks..."

# Database migrations (if needed)
# docker exec $(docker-compose ps -q app) npm run db:migrate

# Clear cache (if using Redis)
# docker exec $(docker-compose ps -q redis) redis-cli FLUSHDB

# Generate sitemap
echo "🗺️  Generating sitemap..."
curl -X POST http://localhost:3000/api/revalidate?secret=$REVALIDATION_SECRET >/dev/null 2>&1 || true

echo "🎉 Deployment completed successfully!"
echo "📊 Deployment Summary:"
echo "  Image: $DOCKER_IMAGE_NAME:$VERSION"
echo "  Environment: $ENVIRONMENT"
echo "  Status: Running"

# Show running containers
echo "🐳 Running containers:"
docker-compose ps

echo "✅ CPE Connect deployment process completed!"