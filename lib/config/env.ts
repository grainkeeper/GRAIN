// Environment configuration
export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
}

// Validate required environment variables
export function validateEnv() {
  const required = ['GEMINI_API_KEY']
  const missing = required.filter(key => !env[key as keyof typeof env])
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`)
    console.warn('Please create a .env.local file with the required variables')
    return false
  }
  
  return true
}
