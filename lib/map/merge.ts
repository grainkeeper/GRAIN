export type OverlayRecord = {
	psgc_code: string
	name?: string | null
	yield_t_ha?: number | null
	color_override?: string | null
	notes?: string | null
}

/**
 * Merges overlay records into GeoJSON features by PSGC code.
 *
 * - Reads PSGC from feature.properties.adm2_psgc (fallback: PSGC_CODE, psgc_code)
 * - Copies overlay fields into feature.properties
 */
export function mergeFeaturesWithOverlays(
	features: Array<{ type: string; properties?: Record<string, any>; [k: string]: any }>,
	overlays: OverlayRecord[]
): Array<{ type: string; properties: Record<string, any>; [k: string]: any }> {
	const byCode = new Map<string, OverlayRecord>(
		(overlays || []).map((o) => [String(o.psgc_code), o] as const)
	)

	return (features || []).map((f) => {
		const props = f.properties || {}
		const code = props.adm2_psgc ?? props.PSGC_CODE ?? props.psgc_code ?? null
		const ov = code != null ? byCode.get(String(code)) : undefined
		return {
			...f,
			properties: {
				...props,
				psgc_code: code,
				name_overlay: ov?.name ?? null,
				yield_t_ha: ov?.yield_t_ha ?? null,
				color_override: ov?.color_override ?? null,
				notes: ov?.notes ?? null,
			},
		}
	})
}


