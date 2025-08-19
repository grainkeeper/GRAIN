import { mergeFeaturesWithOverlays } from '@/lib/map/merge'

describe('mergeFeaturesWithOverlays', () => {
	it('merges matching overlays by adm2_psgc', () => {
		const features = [
			{ type: 'Feature', properties: { adm2_psgc: '123' } },
			{ type: 'Feature', properties: { adm2_psgc: '456' } },
		]
		const overlays = [
			{ psgc_code: '123', name: 'Foo', yield_t_ha: 5.5 },
		]
		const out = mergeFeaturesWithOverlays(features as any, overlays)
		expect(out[0].properties.name_overlay).toBe('Foo')
		expect(out[0].properties.yield_t_ha).toBe(5.5)
		expect(out[1].properties.name_overlay).toBeNull()
	})

	it('handles missing properties gracefully', () => {
		const features = [
			{ type: 'Feature', properties: {} },
		]
		const overlays: any[] = []
		const out = mergeFeaturesWithOverlays(features as any, overlays)
		expect(out[0].properties.psgc_code).toBeNull()
	})
})


