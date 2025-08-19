import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data, error } = await supabase
    .from('yield_dataset_versions')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })

  // We stored files at imports/yield-data/{id}/{filename}
  const path = `imports/yield-data/${data.id}/${data.filename}`
  const { data: file, error: dlErr } = await supabase.storage.from('imports').download(path)
  if (dlErr || !file) return NextResponse.json({ error: dlErr?.message || 'Download failed' }, { status: 500 })

  return new NextResponse(file as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${data.filename}"`
    }
  })
}
