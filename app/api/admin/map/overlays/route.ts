import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
	try {
		const supabase = await createClient()
		const { data: userData } = await supabase.auth.getUser()
		if (!userData?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { data, error } = await supabase
			.from('map_overlays')
			.select('*')
			.eq('level', 2)
			.order('name', { ascending: true })
		if (error) throw error

		return NextResponse.json(data)
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 })
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const supabase = await createClient()
		const { data: userData } = await supabase.auth.getUser()
		if (!userData?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const psgc_code = String(body.psgc_code || '').trim()
		if (!psgc_code) {
			return NextResponse.json({ error: 'psgc_code is required' }, { status: 400 })
		}

		const record = {
			psgc_code,
			name: String(body.name || psgc_code),
			level: Number(body.level ?? 2),
			parent_psgc_code: body.parent_psgc_code ?? null,
			yield_t_ha: body.yield_t_ha === null || body.yield_t_ha === '' || body.yield_t_ha === undefined ? null : Number(body.yield_t_ha),
			color_override: body.color_override || null,
			notes: body.notes || null,
			popup_title: body.popup_title || null,
			popup_subtitle: body.popup_subtitle || null,
			popup_fields: Array.isArray(body.popup_fields) ? body.popup_fields : null,
			updated_by: userData.user.id,
		}

		const { data, error } = await supabase
			.from('map_overlays')
			.upsert(record, { onConflict: 'psgc_code' })
			.select('*')
		if (error) throw error

		return NextResponse.json(data?.[0] ?? null)
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 })
	}
}


