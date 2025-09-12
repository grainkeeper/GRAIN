import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const farmProfileId = searchParams.get('farm_profile_id')
  if (!farmProfileId) return NextResponse.json({ error: 'farm_profile_id required' }, { status: 400 })

  const { data: profile } = await supabase
    .from('user_farm_profiles')
    .select('id,user_id')
    .eq('id', farmProfileId)
    .single()
  if (!profile || profile.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: cycle } = await supabase
    .from('farm_growth_cycles')
    .select('*')
    .eq('farm_profile_id', farmProfileId)
    .order('cycle_start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!cycle) return NextResponse.json({ data: null })

  const { data: overrides } = await supabase
    .from('farm_growth_stage_overrides')
    .select('*')
    .eq('growth_cycle_id', cycle.id)
    .order('start_date', { ascending: true })

  return NextResponse.json({ data: { cycle, overrides } })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { farm_profile_id, variety, method, cycle_start_date, cycle_end_date } = body || {}
  if (!farm_profile_id || !cycle_start_date) return NextResponse.json({ error: 'farm_profile_id and cycle_start_date required' }, { status: 400 })

  const { data: profile } = await supabase
    .from('user_farm_profiles')
    .select('id,user_id')
    .eq('id', farm_profile_id)
    .single()
  if (!profile || profile.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: existing } = await supabase
    .from('farm_growth_cycles')
    .select('id')
    .eq('farm_profile_id', farm_profile_id)
    .eq('cycle_start_date', cycle_start_date)
    .maybeSingle()

  let data, error
  if (existing) {
    ;({ data, error } = await supabase
      .from('farm_growth_cycles')
      .update({ variety, method, cycle_end_date })
      .eq('id', existing.id)
      .select('*')
      .single())
  } else {
    ;({ data, error } = await supabase
      .from('farm_growth_cycles')
      .insert({ farm_profile_id, variety, method, cycle_start_date, cycle_end_date })
      .select('*')
      .single())
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}


