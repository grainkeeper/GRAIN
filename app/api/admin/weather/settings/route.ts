import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single()
  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
  const hasKey = Boolean(data?.weather_api_key)
  return NextResponse.json({ provider: data?.weather_provider || 'WeatherAPI', hasKey, lastOkAt: data?.weather_last_ok_at || null })
}

export async function PATCH(request: Request) {
  const { supabase, user } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { apiKey, provider } = body
  const update: any = {}
  if (typeof apiKey === 'string') update.weather_api_key = apiKey
  if (typeof provider === 'string') update.weather_provider = provider
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 })
  const { error } = await supabase.from('app_settings').upsert({ id: 1, ...update })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}


