const withNextIntl = require('next-intl/plugin')('./i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Docker and deployment
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Optimize bundle size
    optimizePackageImports: [
      '@heroicons/react',
      '@radix-ui/react-icons',
      'lucide-react',
    ],
  },

  // Image optimization
  images: {
    domains: [
      'supabase.co',
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Optimize for production
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/en/dashboard',
        permanent: false,
      },
      {
        source: '/auth/:path*',
        destination: '/en/auth/:path*',
        permanent: false,
      },
    ]
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Exclude test files from build
    config.module.rules.push({
      test: /\.(test|spec)\.(js|ts|tsx)$/,
      loader: 'ignore-loader'
    });
    
    // Exclude test directories from compilation
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Bundle analyzer (conditional)
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../bundle-analyzer-report.html',
        })
      );
    }
    
    return config;
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if type errors exist
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Don't run ESLint on build (CI handles this separately)
    ignoreDuringBuilds: true,
  },

  // Performance optimizations
  swcMinify: true,
  
  // Gzip compression
  compress: true,

  // PoweredBy header
  poweredByHeader: false,

  // Trailing slash
  trailingSlash: false,

  // Generate sitemap
  generateEtags: true,
}

module.exports = withNextIntl(nextConfig)


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "nzila-ventures",
    project: "cpe_connect_app_v1",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
