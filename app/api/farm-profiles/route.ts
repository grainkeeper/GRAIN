import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_farm_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Accept JSON or form submissions
  const contentType = req.headers.get('content-type') || ''
  const parseBody = async () => {
    if (contentType.includes('application/json')) {
      try { return await req.json() } catch { return {} }
    }
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const fd = await req.formData()
      const obj: Record<string, any> = {}
      fd.forEach((v, k) => { obj[k] = typeof v === 'string' ? v : (v as File) })
      return obj
    }
    return {}
  }
  const body = await parseBody()

  // Build update fields only from provided keys to avoid overwriting
  const updatableKeys = [
    'farm_name', 'province', 'region', 'municipality', 'barangay',
    'farm_size_hectares', 'rice_area_hectares', 'soil_type',
    'preferred_rice_variety', 'farming_method'
  ] as const
  type UpdatableKey = typeof updatableKeys[number]
  const updateFields: Record<string, any> = {}
  for (const key of updatableKeys) {
    if (body[key] !== undefined && body[key] !== '') {
      if (key === 'farm_size_hectares' || key === 'rice_area_hectares') {
        const num = parseFloat(String(body[key]))
        if (!Number.isNaN(num)) updateFields[key] = num
      } else {
        updateFields[key] = body[key]
      }
    }
  }

  const { data: existing } = await supabase
    .from('user_farm_profiles')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let data: any, error: any
  if (existing) {
    // Only update provided fields
    const updatePayload = { ...updateFields }
    if (Object.keys(updatePayload).length > 0) {
      ;({ data, error } = await supabase
        .from('user_farm_profiles')
        .update(updatePayload)
        .eq('id', existing.id)
        .select('*')
        .single())
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      // No profile changes requested; fetch existing row
      const res = await supabase
        .from('user_farm_profiles')
        .select('*')
        .eq('id', existing.id)
        .single()
      data = res.data
      error = res.error
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Create a new active profile with provided fields
    const insertPayload = {
      user_id: user.id,
      is_active: true,
      soil_type: 'Unknown',
      ...updateFields
    }
    ;({ data, error } = await supabase
      .from('user_farm_profiles')
      .insert(insertPayload)
      .select('*')
      .single())
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Optionally persist planting_date into farm_historical_performance
  if (body.planting_date) {
    await supabase
      .from('farm_historical_performance')
      .insert({ farm_profile_id: data.id, planting_date: body.planting_date })
  }

  return NextResponse.json({ data })
}


