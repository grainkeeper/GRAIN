'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
import type { LatLngExpression } from 'leaflet'

type Props = {
	height?: number
}

type FeatureProps = {
	psgc_code?: string | number | null
	name_overlay?: string | null
	yield_t_ha?: number | null
	adm2_psgc?: string | number | null
  popup_title?: string | null
  popup_subtitle?: string | null
  popup_fields?: Array<{ label: string; value: string }>
}

export default function ProvdistMap({ height = 520 }: Props) {
	const center = useMemo<LatLngExpression>(() => [12.8797, 121.774], [])
	const [data, setData] = useState<any>(null)
  const [tpl, setTpl] = useState<{ title?: string; subtitle?: string; body?: string } | null>(null)

	useEffect(() => {
		let cancelled = false
		fetch('/api/map/provdists')
			.then((r) => r.json())
			.then((json) => {
				if (!cancelled) setData(json)
			})
			.catch(() => {})

    fetch('/api/admin/map/settings')
      .then(r => r.json())
      .then((d) => {
        if (!cancelled) setTpl({ title: d?.popup_title_template, subtitle: d?.popup_subtitle_template, body: d?.popup_body_template })
      })
      .catch(() => {})
		return () => {
			cancelled = true
		}
	}, [])

	const styleFn = (feature?: { properties?: FeatureProps }) => {
		return {
			color: '#334155',
			weight: 0.8,
			fillColor: '#ffffff',
			fillOpacity: 0,
		}
	}

	const onEachFeature = (feature: { properties?: FeatureProps }, layer: any) => {
		const p = feature?.properties || {}
		const name = p.name_overlay || String(p.psgc_code || p.adm2_psgc || 'Unknown')
		const y = p.yield_t_ha
		const title = p.popup_title || name
		const subtitle = p.popup_subtitle || ''
		const extra = Array.isArray(p.popup_fields) ? p.popup_fields : []
		layer.on({
			click: () => {
				const vars: Record<string, any> = { name, psgc_code: p.psgc_code || p.adm2_psgc, yield_t_ha: y }
				extra.forEach(f => { vars[f.label] = f.value })
				const render = (s?: string) => s ? s.replace(/\{\{(.*?)\}\}/g, (_, k) => (vars[k.trim()] ?? '')) : ''
				const T = p.popup_title || render(tpl?.title) || name
				const S = p.popup_subtitle || render(tpl?.subtitle) || ''
				const B = render(tpl?.body)
				const lines = [`<div style="min-width:220px">`, `<div style="font-weight:600">${T}</div>`, S ? `<div style="color:#6b7280">${S}</div>` : '', B, !B ? `<div>Rice yield: ${y == null ? '—' : `${y} t/ha`}</div>` : '', ...extra.map(f => `<div><span style=\"color:#6b7280\">${f.label}:</span> ${f.value}</div>`), `</div>`].filter(Boolean).join('')
				layer.bindPopup(lines).openPopup()
			},
		})
	}

	return (
		<div style={{ width: '100%', height }}>
			<MapContainer center={center} zoom={6} style={{ width: '100%', height: '100%' }}>
				<TileLayer
					attribution='&copy; OpenStreetMap'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{data && (
					<GeoJSON data={data as any} style={styleFn as any} onEachFeature={onEachFeature as any} />
				)}
			</MapContainer>
		</div>
	)
}


