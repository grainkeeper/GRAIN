'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
import type { LatLngExpression } from 'leaflet'
import { getProvinceName } from '@/lib/constants/provinces-psgc'
import { Globe } from 'lucide-react'

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
  const [choroplethSettings, setChoroplethSettings] = useState<{
    ranges: Array<{ min: number; max: number; color: string; label: string }>;
    noDataColor: string;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

	const loadSettings = async () => {
		try {
			const settings = await fetch('/api/admin/map/settings').then(r => r.json())
			setTpl({ 
				title: settings?.popup_title_template, 
				subtitle: settings?.popup_subtitle_template, 
				body: settings?.popup_body_template 
			})
			setChoroplethSettings({
				ranges: settings?.choropleth_ranges || [],
				noDataColor: settings?.no_data_color || '#f3f4f6'
			})
		} catch (error) {
			console.error('Failed to load map settings:', error)
		}
	}

	useEffect(() => {
		let cancelled = false
		setIsLoading(true)
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
				setChoroplethSettings({
					ranges: settings?.choropleth_ranges || [],
					noDataColor: settings?.no_data_color || '#f3f4f6'
				})
				setIsLoading(false)
			}
		}).catch((error) => {
			console.error(error)
			if (!cancelled) {
				setIsLoading(false)
			}
		})
		return () => {
			cancelled = true
		}
	}, [])

	// Listen for settings changes (poll every 30 seconds)
	useEffect(() => {
		const interval = setInterval(loadSettings, 30000)
		return () => clearInterval(interval)
	}, [])

	// Choropleth color scale function
	const getChoroplethColor = (yieldValue: number | null): string => {
		if (yieldValue === null || yieldValue === undefined) {
			return choroplethSettings?.noDataColor || '#f3f4f6' // Light gray for no data
		}
		
		// Use configured ranges if available, otherwise fallback to default
		const ranges = choroplethSettings?.ranges || []
		if (ranges.length > 0) {
			for (const range of ranges) {
				if (yieldValue >= range.min && yieldValue < range.max) {
					return range.color
				}
			}
			// If no range matches, use the last range's color for values >= max
			if (ranges.length > 0 && yieldValue >= ranges[ranges.length - 1].max) {
				return ranges[ranges.length - 1].color
			}
		}
		
		// Fallback to default color scale
		if (yieldValue < 1) return '#fef3c7'
		if (yieldValue < 2) return '#fde68a'
		if (yieldValue < 3) return '#fbbf24'
		if (yieldValue < 4) return '#f59e0b'
		if (yieldValue < 5) return '#d97706'
		if (yieldValue < 6) return '#b45309'
		if (yieldValue < 7) return '#92400e'
		if (yieldValue < 8) return '#78350f'
		if (yieldValue < 9) return '#451a03'
		return '#1c1917'
	}

	const styleFn = (feature?: { properties?: FeatureProps }) => {
		const properties = feature?.properties
		const yieldValue = properties?.yield_t_ha
		
		// Use choropleth color based on yield value
		const fillColor = getChoroplethColor(yieldValue ?? null)
		const hasData = yieldValue !== null && yieldValue !== undefined
		
		return {
			color: '#334155',
			weight: 0.8,
			fillColor: fillColor,
			fillOpacity: hasData ? 0.8 : 0.3, // Higher opacity for areas with data
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
		const bodyHtml = renderTemplate(tpl?.body || null, p) || `
			<div style="
				display: flex;
				align-items: center;
				gap: 10px;
				padding: 12px 16px;
				background: #f0fdf4;
				border-radius: 8px;
				margin-bottom: 0;
			">
				<div style="
					width: 10px;
					height: 10px;
					background: #16a34a;
					border-radius: 50%;
				"></div>
				<span style="font-weight: 600; color: #166534; font-size: 14px;">
					Rice Yield: ${p.yield_t_ha == null ? '—' : `${p.yield_t_ha} t/ha`}
				</span>
			</div>
		`

		const popupContent = `
			<div style="
				min-width: 240px; 
				max-width: 340px; 
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
				background: white;
				border-radius: 12px;
				box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
				overflow: hidden;
			">
				<!-- Header -->
				<div style="
					background: linear-gradient(135deg, #059669 0%, #10b981 100%);
					color: white;
					padding: 16px 20px;
					font-weight: 600;
					font-size: 16px;
					line-height: 1.3;
				">
					${title}
				</div>
				
				<!-- Content -->
				<div style="padding: 20px;">
					${subtitle ? `
						<div style="
							color: #6b7280;
							font-size: 13px;
							margin-bottom: 16px;
							font-style: italic;
							line-height: 1.4;
						">
							${subtitle}
						</div>
					` : ''}
					
					<div style="
						color: #374151;
						font-size: 14px;
						line-height: 1.6;
					">
						${bodyHtml}
					</div>
				</div>
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
		<div style={{ width: '100%', height: responsiveHeight, position: 'relative' }}>
			{isLoading && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
					<div className="text-center">
						<Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
						<p className="text-sm text-muted-foreground">Loading map...</p>
					</div>
				</div>
			)}
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
			
			{/* Choropleth Legend */}
						{choroplethSettings && (
				<div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white p-2 sm:p-3 rounded-lg shadow-lg border text-xs z-[9999] max-w-[120px] sm:max-w-none">
					<div className="font-medium mb-1 sm:mb-2 text-[10px] sm:text-xs">Rice Yield (t/ha)</div>
					<div className="space-y-0.5 sm:space-y-1">
						<div className="flex items-center gap-1 sm:gap-2">
							<div
								className="w-3 h-2 sm:w-4 sm:h-3 border border-gray-300"
								style={{ backgroundColor: choroplethSettings.noDataColor }}
							></div>
							<span className="text-[9px] sm:text-xs">No data</span>
						</div>
						{choroplethSettings.ranges.map((range, index) => (
							<div key={index} className="flex items-center gap-1 sm:gap-2">
								<div
									className="w-3 h-2 sm:w-4 sm:h-3 border border-gray-300"
									style={{ backgroundColor: range.color }}
								></div>
								<span className="text-[9px] sm:text-xs">{range.label}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}


