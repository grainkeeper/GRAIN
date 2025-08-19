import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const start = Date.now()
  // Read key from DB settings first
  const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single()
  const apiKey = settings?.weather_api_key || process.env.WEATHER_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 400 })
  try {
    const r = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Manila`, { cache: 'no-store' })
    const payload = await r.json()
    const ms = Date.now() - start
    if (!r.ok) {
      return NextResponse.json({ ok: false, latencyMs: ms, error: payload?.error?.message || 'Failed' }, { status: 502 })
    }
    await supabase.from('app_settings').update({ weather_last_ok_at: new Date().toISOString() }).eq('id', 1)
    return NextResponse.json({ ok: true, latencyMs: ms, sampleBytes: JSON.stringify(payload).length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Network error' }, { status: 500 })
  }
}


