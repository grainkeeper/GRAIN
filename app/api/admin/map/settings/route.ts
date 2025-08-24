import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
	const supabase = await createClient()
	const { data, error } = await supabase.from('map_settings').select('*').eq('id', 1).maybeSingle()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	
	// Default choropleth ranges
	const defaultChoroplethRanges = [
		{ min: 0, max: 1, color: '#fef3c7', label: '< 1.0' },
		{ min: 1, max: 2, color: '#fde68a', label: '1.0 - 1.9' },
		{ min: 2, max: 3, color: '#fbbf24', label: '2.0 - 2.9' },
		{ min: 3, max: 4, color: '#f59e0b', label: '3.0 - 3.9' },
		{ min: 4, max: 5, color: '#d97706', label: '4.0 - 4.9' },
		{ min: 5, max: 6, color: '#b45309', label: '5.0 - 5.9' },
		{ min: 6, max: 7, color: '#92400e', label: '6.0 - 6.9' },
		{ min: 7, max: 8, color: '#78350f', label: '7.0 - 7.9' },
		{ min: 8, max: 9, color: '#451a03', label: '8.0 - 8.9' },
		{ min: 9, max: 10, color: '#1c1917', label: '≥ 9.0' },
	]
	
	return NextResponse.json(data || { 
		id: 1, 
		popup_title_template: '{{name}}', 
		popup_subtitle_template: 'Philippine Province', 
		popup_body_template: '<div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px;"><div style="width: 10px; height: 10px; background: #16a34a; border-radius: 50%;"></div><span style="font-weight: 600; color: #166534; font-size: 14px;">Rice Yield: {{yield_t_ha}} t/ha</span></div>',
		choropleth_ranges: defaultChoroplethRanges,
		no_data_color: '#f3f4f6'
	})
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
		choropleth_ranges: body.choropleth_ranges ?? null,
		no_data_color: body.no_data_color ?? null,
		updated_by: userData.user.id,
	}
	const { data, error } = await supabase.from('map_settings').upsert(payload, { onConflict: 'id' }).select('*').single()
	if (error) return NextResponse.json({ error: error.message }, { status: 500 })
	return NextResponse.json(data)
}


