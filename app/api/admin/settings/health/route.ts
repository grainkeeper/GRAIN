import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const health = {
    database: { status: 'unknown', message: '' },
    storage: { status: 'unknown', message: '' },
    weather: { status: 'unknown', message: '' },
    timestamp: new Date().toISOString()
  }

  // Check database connectivity
  try {
    const { data, error } = await supabase.from('app_settings').select('id').limit(1)
    if (error) throw error
    health.database = { status: 'healthy', message: 'Database connection successful' }
  } catch (error: any) {
    health.database = { status: 'error', message: error.message || 'Database connection failed' }
  }

  // Check storage connectivity
  try {
    const { data, error } = await supabase.storage.listBuckets()
    if (error) throw error
    health.storage = { status: 'healthy', message: `${data.length} buckets available` }
  } catch (error: any) {
    health.storage = { status: 'error', message: error.message || 'Storage connection failed' }
  }

  // Check weather API (if configured)
  try {
    const { data: settings } = await supabase.from('app_settings').select('weather_api_key, weather_last_ok_at').eq('id', 1).single()
    if (settings?.weather_api_key) {
      health.weather = { 
        status: 'configured', 
        message: settings.weather_last_ok_at 
          ? `Last test: ${new Date(settings.weather_last_ok_at).toLocaleString()}` 
          : 'API key configured but not tested'
      }
    } else {
      health.weather = { status: 'not_configured', message: 'Weather API not configured' }
    }
  } catch (error: any) {
    health.weather = { status: 'error', message: error.message || 'Weather check failed' }
  }

  return NextResponse.json(health)
}
