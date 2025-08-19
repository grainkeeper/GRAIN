import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
	const supabase = await createClient()
	const { data, error } = await supabase.from('map_settings').select('*').eq('id', 1).maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json(data || { id: 1, popup_title_template: '{{name}}', popup_subtitle_template: '', popup_body_template: '' })
}

export async function POST(req: Request) {
	const supabase = await createClient()
	const { data: userData } = await supabase.auth.getUser()
	if (!userData?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const body = await req.json()
	const payload = {
		id: 1,
		popup_title_template: body.popup_title_template ?? null,
		popup_subtitle_template: body.popup_subtitle_template ?? null,
		popup_body_template: body.popup_body_template ?? null,
		updated_by: userData.user.id,
	}
	const { data, error } = await supabase.from('map_settings').upsert(payload, { onConflict: 'id' }).select('*').single()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json(data)
}


