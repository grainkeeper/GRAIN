// Production configuration
export const productionConfig = {
  // Database
  database: {
    maxConnections: 20,
    connectionTimeout: 30000,
    queryTimeout: 10000,
  },
  
  // API
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    timeout: 30000, // 30 seconds
  },
  
  // Security
  security: {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'https://grainkeeper.vercel.app',
      credentials: true,
    },
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  
  // Performance
  performance: {
    cache: {
      maxAge: 3600, // 1 hour
      staleWhileRevalidate: 86400, // 24 hours
    },
    compression: true,
    minify: true,
  },
  
  // Monitoring
  monitoring: {
    enableMetrics: true,
    enableErrorTracking: true,
    logLevel: 'error', // Only log errors in production
  },
}
