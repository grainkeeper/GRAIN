import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single()
  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    app_name: data?.app_name ?? 'GRAINKEEPER',
    app_description: data?.app_description ?? 'AI-powered rice farming assistant',
    maintenance_mode: data?.maintenance_mode ?? false,
    maintenance_message: data?.maintenance_message ?? 'System is under maintenance. Please try again later.',
    contact_email: data?.contact_email ?? '',
    support_phone: data?.support_phone ?? '',
    max_file_size_mb: data?.max_file_size_mb ?? 50,
    allowed_file_types: data?.allowed_file_types ?? ['csv', 'xlsx']
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { 
    app_name, 
    app_description, 
    maintenance_mode, 
    maintenance_message, 
    contact_email, 
    support_phone,
    max_file_size_mb,
    allowed_file_types
  } = body
  const update: any = {}
  if (typeof app_name === 'string') update.app_name = app_name
  if (typeof app_description === 'string') update.app_description = app_description
  if (typeof maintenance_mode === 'boolean') update.maintenance_mode = maintenance_mode
  if (typeof maintenance_message === 'string') update.maintenance_message = maintenance_message
  if (typeof contact_email === 'string') update.contact_email = contact_email
  if (typeof support_phone === 'string') update.support_phone = support_phone
  if (typeof max_file_size_mb === 'number') update.max_file_size_mb = max_file_size_mb
  if (Array.isArray(allowed_file_types)) update.allowed_file_types = allowed_file_types
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 })
  const { error } = await supabase.from('app_settings').upsert({ id: 1, ...update })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
