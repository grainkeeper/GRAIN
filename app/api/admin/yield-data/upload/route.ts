import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseCsvOrXlsx, validateGrid } from '@/lib/services/parser'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await request.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  const buf = Buffer.from(await file.arrayBuffer())
  const grid = await parseCsvOrXlsx(buf)
  const preview = validateGrid(grid)
  return NextResponse.json({ preview })
}


