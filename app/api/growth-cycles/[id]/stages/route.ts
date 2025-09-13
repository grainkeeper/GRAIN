import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: cycleId } = await params
  const body = await request.json()
  const { stages } = body || {}
  if (!Array.isArray(stages) || stages.length === 0) {
    return NextResponse.json({ error: 'stages array required' }, { status: 400 })
  }

  // Verify ownership via the cycle -> profile
  const { data: cycle } = await supabase
    .from('farm_growth_cycles')
    .select('id, farm_profile_id')
    .eq('id', cycleId)
    .maybeSingle()

  if (!cycle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('user_farm_profiles')
    .select('id, user_id')
    .eq('id', cycle.farm_profile_id)
    .maybeSingle()

  if (!profile || profile.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Replace all overrides atomically
  const { error: delErr } = await supabase
    .from('farm_growth_stage_overrides')
    .delete()
    .eq('growth_cycle_id', cycleId)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  const rows = stages.map((s: any) => ({
    growth_cycle_id: cycleId,
    stage: s.stage,
    start_date: s.start_date,
    end_date: s.end_date,
    note: s.note ?? null
  }))

  const { data, error } = await supabase
    .from('farm_growth_stage_overrides')
    .insert(rows)
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}


