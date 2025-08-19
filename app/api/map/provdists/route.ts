import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { mergeFeaturesWithOverlays } from '@/lib/map/merge'

export async function GET() {
	try {
		// 1) Load local GeoJSON (ADM2 dissolved)
		const geoPath = path.join(process.cwd(), 'public', 'geo', '2023', 'provdists-medres.geojson')
		const raw = await fs.readFile(geoPath, 'utf8')
		const fc = JSON.parse(raw) as { type: 'FeatureCollection'; features: any[] }

		// 2) Fetch overlays from Supabase (ADM2 level)
		const supabase = await createClient()
		const { data: overlays, error } = await supabase
			.from('map_overlays')
			.select('*')
			.eq('level', 2)
		if (error) throw error


		// 3) Merge overlay fields into features by PSGC
		const features = mergeFeaturesWithOverlays(fc.features || [], overlays || [])

		return NextResponse.json({ type: 'FeatureCollection', features })
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 })
	}
}


