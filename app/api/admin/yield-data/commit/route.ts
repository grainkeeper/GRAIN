import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { parseCsvOrXlsx } from '@/lib/services/parser'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await request.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  const buf = Buffer.from(await file.arrayBuffer())
  const checksum = crypto.createHash('sha256').update(buf).digest('hex')
  const filename = file.name || `yield-data-${Date.now()}.csv`

  // Calculate row count for metadata
  let rowCount = 0
  try {
    const grid = await parseCsvOrXlsx(buf)
    rowCount = Math.max(0, grid.length - 1)
  } catch {}

  // Persist version
  const { data: inserted, error } = await supabase
    .from('yield_dataset_versions')
    .insert({ filename, checksum, row_count: rowCount, is_active: true, created_by: user.id })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Deactivate any previous active versions except the one just inserted
  await supabase
    .from('yield_dataset_versions')
    .update({ is_active: false })
    .neq('id', inserted.id)
    .eq('is_active', true)

  // Upload raw file to storage bucket 'imports'
  const path = `imports/yield-data/${inserted.id}/${filename}`
  const { error: upErr } = await supabase.storage.from('imports').upload(path, buf, { upsert: true, contentType: file.type || 'text/csv' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  return NextResponse.json({ data: inserted })
}


