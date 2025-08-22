'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
import type { LatLngExpression } from 'leaflet'
import { getProvinceName } from '@/lib/constants/provinces-psgc'

type Props = {
	height?: number
}

type FeatureProps = {
	psgc_code?: string | number | null
	name?: string | null
	name_overlay?: string | null
	yield_t_ha?: number | null
	adm2_psgc?: string | number | null
	psgc_code_norm?: string | null
	color_override?: string | null
	notes?: string | null
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
		Promise.all([
			fetch('/api/map/provdists').then(r => r.json()),
			fetch('/api/admin/map/settings').then(r => r.json())
		]).then(([geoJsonData, settings]) => {
			if (!cancelled) {
				setData(geoJsonData)
				setTpl({ 
					title: settings?.popup_title_template, 
					subtitle: settings?.popup_subtitle_template, 
					body: settings?.popup_body_template 
				})
			}
		}).catch(console.error)
		return () => {
			cancelled = true
		}
	}, [])

	const styleFn = (feature?: { properties?: FeatureProps }) => {
		const fill = feature?.properties?.color_override ?? '#ffffff'
		return {
			color: '#334155',
			weight: 0.8,
			fillColor: fill,
			fillOpacity: fill === '#ffffff' ? 0 : 0.7,
		}
	}

	const renderTemplate = (template: string | null, props: FeatureProps) => {
		if (!template) return ''
		let content = template
		
		// Get the PSGC code for province name mapping
		const psgcCode = String(props.psgc_code || props.adm2_psgc || props.psgc_code_norm || '')
		
		// Handle all available properties for template substitution
		// This ensures that template variables like {{province}}, {{psgc_code}}, {{yield_t_ha}}, {{notes}} work correctly
		const allProps = {
			...props,
			// Use province name from our mapping instead of old name field
			province: getProvinceName(psgcCode),
			name: getProvinceName(psgcCode), // Keep backward compatibility with {{name}}
			psgc_code: psgcCode,
			yield_t_ha: props.yield_t_ha || 0,
			notes: props.notes || ''
		}
		
		for (const key in allProps) {
			if (Object.prototype.hasOwnProperty.call(allProps, key)) {
				const value = (allProps as any)[key]
				content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value == null ? '—' : String(value))
			}
		}
		return content
	}

	const onEachFeature = (feature: { properties?: FeatureProps }, layer: any) => {
		const p = feature?.properties || {}
		const defaultName = String(p.psgc_code_norm || p.adm2_psgc || 'Unknown')

		// Determine popup content based on per-district override or global template
		const title = p.popup_title ?? (renderTemplate(tpl?.title || null, p) || defaultName)
		const subtitle = p.popup_subtitle ?? (renderTemplate(tpl?.subtitle || null, p) || '')
		const bodyHtml = renderTemplate(tpl?.body || null, p) || `<div>Rice yield: ${p.yield_t_ha == null ? '—' : `${p.yield_t_ha} t/ha`}</div>`

		const popupContent = `
			<div style="min-width:180px; max-width:280px; font-size:14px; color:#1f2937;">
				<div style="font-weight:600; color:#111827; margin-bottom:4px;">${title}</div>
				${subtitle ? `<div style="color:#6b7280; font-size:12px; margin-bottom:8px;">${subtitle}</div>` : ''}
				<div style="color:#374151;">${bodyHtml}</div>
			</div>
		`

		layer.on({
			mouseover: (e: any) => e.target.setStyle({ weight: 1.6 }),
			mouseout: (e: any) => e.target.setStyle({ weight: 0.8 }),
			click: () => layer.bindPopup(popupContent).openPopup(),
		})
	}

	// Responsive height for mobile
	const responsiveHeight = useMemo(() => {
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return Math.min(height, 400) // Smaller on mobile
		}
		return height
	}, [height])

	return (
		<div style={{ width: '100%', height: responsiveHeight }}>
			<MapContainer 
				center={center} 
				zoom={6} 
				style={{ width: '100%', height: '100%' }}
				zoomControl={true}
				scrollWheelZoom={true}
				doubleClickZoom={true}
				touchZoom={true}
				dragging={true}
			>
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


