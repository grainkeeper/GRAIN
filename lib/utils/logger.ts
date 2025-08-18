// Production-ready logging utility
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  info: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data || '')
    }
  },

  error: (message: string, error?: unknown) => {
    // Always log errors in production
    console.error(`[ERROR] ${message}`, error || '')
  },

  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '')
    }
  },

  debug: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data || '')
    }
  }
}
