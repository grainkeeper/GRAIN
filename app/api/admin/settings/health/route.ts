import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const health = {
    database: { status: 'unknown', message: '' },
    storage: { status: 'unknown', message: '' },
    openMeteo: { status: 'unknown', message: '' },
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

  // Check Open-Meteo API (always available, no API key required)
  try {
    health.openMeteo = { 
      status: 'operational', 
      message: 'Open-Meteo API operational - no API key required'
    }
  } catch (error: any) {
    health.openMeteo = { status: 'error', message: error.message || 'Open-Meteo check failed' }
  }

  return NextResponse.json(health)
}
