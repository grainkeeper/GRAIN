import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.from('chatbot_settings').select('*').eq('id', 1).single()
  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    enabled: data?.enabled ?? true,
    welcome_message: data?.welcome_message ?? 'Hello! I\'m your rice farming assistant. How can I help you today?',
    max_conversation_length: data?.max_conversation_length ?? 50,
    temperature: data?.temperature ?? 0.7,
    model: data?.model ?? 'gpt-3.5-turbo'
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { enabled, welcome_message, max_conversation_length, temperature, model } = body
  const update: any = {}
  if (typeof enabled === 'boolean') update.enabled = enabled
  if (typeof welcome_message === 'string') update.welcome_message = welcome_message
  if (typeof max_conversation_length === 'number') update.max_conversation_length = max_conversation_length
  if (typeof temperature === 'number') update.temperature = temperature
  if (typeof model === 'string') update.model = model
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 })
  const { error } = await supabase.from('chatbot_settings').upsert({ id: 1, ...update })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
