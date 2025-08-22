"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
const ProvdistMap = dynamic(() => import('@/components/map/provdist-map'), { ssr: false })
import { getRegionName, REGION_OPTIONS } from '@/lib/constants/regions'
import { getProvinceName } from '@/lib/constants/provinces-psgc'

type Row = {
	psgc_code: string
	yield_t_ha: number | null
	color_override?: string | null
	notes?: string | null
	adm1_psgc?: string | number | null
    popup_title?: string | null
    popup_subtitle?: string | null
    popup_fields?: Array<{ label: string; value: string }>
}

type Overlay = {
	psgc_code: string
	yield_t_ha?: number | null
	color_override?: string | null
	notes?: string | null
    popup_title?: string | null
    popup_subtitle?: string | null
    popup_fields?: Array<{ label: string; value: string }>
}

export default function AdminMapPage() {
	const [rows, setRows] = useState<Row[]>([])
	const [saving, setSaving] = useState<string | null>(null)
	const [filter, setFilter] = useState('')
	const [savingAll, setSavingAll] = useState(false)
	const [dirty, setDirty] = useState<Set<string>>(new Set())
    const [regionFilter, setRegionFilter] = useState<string>('')
    const [page, setPage] = useState(1)
    const pageSize = 25

	useEffect(() => {
		Promise.all([
			fetch('/api/map/provdists').then(r => r.json()),
			fetch('/api/admin/map/overlays').then(r => r.ok ? r.json() : []),
		]).then(([fc, overlays]: [{ type: 'FeatureCollection'; features: any[] }, Overlay[]]) => {
			const ovBy = new Map<string, Overlay>((overlays || []).map((o) => [o.psgc_code as string, o as Overlay]))
			const merged: Row[] = (fc.features || []).map((f: any) => {
				const code = f.properties?.adm2_psgc || f.properties?.psgc_code
				const ov = (code ? ovBy.get(String(code)) : undefined) as Overlay | undefined
				return {
					psgc_code: String(code),
					yield_t_ha: ov?.yield_t_ha ?? null,
					color_override: ov?.color_override ?? null,
					notes: ov?.notes ?? null,
					adm1_psgc: f.properties?.adm1_psgc ?? null,
                    popup_title: ov?.popup_title ?? null,
                    popup_subtitle: ov?.popup_subtitle ?? null,
                    popup_fields: ov?.popup_fields ?? [],
				}
			}).filter((r: Row) => r.psgc_code)
			setRows(merged)
		})
	}, [])



	const onSave = async (r: Row) => {
		setSaving(r.psgc_code)
		try {
			await fetch('/api/admin/map/overlays', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...r, level: 2 }),
			})
			setDirty(prev => {
				const next = new Set(prev)
				next.delete(r.psgc_code)
				return next
			})
		} finally {
			setSaving(null)
		}
	}

	const onSaveAll = async () => {
		if (dirty.size === 0) return
		setSavingAll(true)
		try {
			for (const code of dirty) {
				const r = rows.find(x => x.psgc_code === code)
				if (!r) continue
				// eslint-disable-next-line no-await-in-loop
				await fetch('/api/admin/map/overlays', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...r, level: 2 }),
				})
			}
			setDirty(new Set())
		} finally {
			setSavingAll(false)
		}
	}

	const filtered = useMemo(() => {
		const q = filter.trim().toLowerCase()
		let out = rows
		if (regionFilter) {
			out = out.filter(r => String(r.adm1_psgc || '') === regionFilter)
		}
		if (q) {
			out = out.filter(r =>
				r.psgc_code.toLowerCase().includes(q) ||
				getProvinceName(r.psgc_code).toLowerCase().includes(q) ||
				String(r.adm1_psgc || '').toLowerCase().includes(q) ||
				getRegionName(String(r.adm1_psgc || '')).toLowerCase().includes(q)
			)
		}
		return out
	}, [rows, filter, regionFilter])

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paged = useMemo(() => {
        const start = (page - 1) * pageSize
        return filtered.slice(start, start + pageSize)
    }, [filtered, page])

    const regionOptions = useMemo(() => {
        const set = new Set<string>()
        rows.forEach(r => { if (r.adm1_psgc) set.add(String(r.adm1_psgc)) })
        
        // Create a map to deduplicate regions by name (in case multiple PSGC codes map to same region)
        const regionMap = new Map<string, { code: string; name: string }>()
        
        Array.from(set).sort().forEach(code => {
            const name = getRegionName(code)
            if (!regionMap.has(name)) {
                regionMap.set(name, { code, name })
            }
        })
        
        return Array.from(regionMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [rows])

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Map Overlays (Province/District)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<ProvdistMap />
					<div className="space-y-4">
						{/* Search and Filter Controls */}
						<div className="flex items-center gap-3 flex-wrap">
							<div className="flex-1 min-w-[200px]">
								<Input
									placeholder="Search by province name, PSGC, or region name…"
									value={filter}
									onChange={(e) => setFilter(e.target.value)}
								/>
							</div>
							<div className="flex items-center gap-2">
								<label className="text-sm font-medium text-gray-700">Filter by Region:</label>
								<select
									className="h-9 rounded border px-3 text-sm min-w-[200px]"
									value={regionFilter}
									onChange={(e) => { setRegionFilter(e.target.value); setPage(1) }}
								>
									<option value="">All regions</option>
									{regionOptions.map(region => (
										<option key={region.code} value={region.code}>{region.name}</option>
									))}
								</select>
							</div>
							<Button variant="outline" onClick={onSaveAll} disabled={dirty.size === 0 || savingAll}>
								{savingAll ? 'Saving…' : `Save All (${dirty.size})`}
							</Button>
						</div>
						
						{/* Active Filters Display */}
						{(filter || regionFilter) && (
							<div className="flex items-center gap-2 flex-wrap">
								<span className="text-sm text-gray-600">Active filters:</span>
								{filter && (
									<span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
										Search: "{filter}"
										<button 
											onClick={() => setFilter('')}
											className="ml-1 text-blue-600 hover:text-blue-800"
										>
											×
										</button>
									</span>
								)}
								{regionFilter && (
									<span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
										Region: {getRegionName(regionFilter)}
										<button 
											onClick={() => setRegionFilter('')}
											className="ml-1 text-green-600 hover:text-green-800"
										>
											×
										</button>
									</span>
								)}
								<button 
									onClick={() => { setFilter(''); setRegionFilter(''); setPage(1); }}
									className="text-sm text-gray-500 hover:text-gray-700 underline"
								>
									Clear all filters
								</button>
							</div>
						)}
					</div>
					<div className="border rounded-md overflow-auto">
						<table className="w-full text-sm">
							<thead className="sticky top-0 bg-muted">
								<tr>
									<th className="text-left p-2">Province</th>
									<th className="text-left p-2">Region</th>
									<th className="text-left p-2 w-[140px]">Yield (t/ha)</th>
									<th className="text-left p-2 w-[140px]">Color</th>
									<th className="text-left p-2 w-[200px]">Description</th>
									<th className="text-left p-2 w-[120px]"></th>
								</tr>
							</thead>
							<tbody>
								{paged.map((r) => (
									<tr key={r.psgc_code} className="border-t">
										<td className="p-2">
											<div className="text-sm font-semibold">
												{getProvinceName(r.psgc_code)}
											</div>
										</td>
										<td className="p-2">
											<div className="text-xs font-semibold">
												{getRegionName(String(r.adm1_psgc || ''))}
											</div>
										</td>
										<td className="p-2">
											<Input
												type="number"
												step="0.01"
												placeholder="t/ha"
												value={r.yield_t_ha ?? ''}
												onChange={(e) => {
													const v = e.target.value
													setRows(prev => prev.map(x => x.psgc_code === r.psgc_code ? { ...x, yield_t_ha: v === '' ? null : Number(v) } : x))
													setDirty(prev => new Set(prev).add(r.psgc_code))
												}}
											/>
										</td>
										<td className="p-2">
											<div className="flex items-center gap-2">
												<input
													type="color"
													className="h-8 w-10 cursor-pointer rounded border"
													value={r.color_override ?? '#ffffff'}
													onChange={(e) => {
														const v = e.target.value
														setRows(prev => prev.map(x => x.psgc_code === r.psgc_code ? { ...x, color_override: v } : x))
														setDirty(prev => new Set(prev).add(r.psgc_code))
													}}
												/>
												<Input
													placeholder="#RRGGBB (optional)"
													value={r.color_override ?? ''}
													onChange={(e) => {
														const v = e.target.value
														setRows(prev => prev.map(x => x.psgc_code === r.psgc_code ? { ...x, color_override: v || null } : x))
														setDirty(prev => new Set(prev).add(r.psgc_code))
													}}
												/>
											</div>
										</td>
										<td className="p-2">
											<Input
												placeholder="Enter description..."
												value={r.notes ?? ''}
												onChange={(e) => {
													const v = e.target.value
													setRows(prev => prev.map(x => x.psgc_code === r.psgc_code ? { ...x, notes: v || null } : x))
													setDirty(prev => new Set(prev).add(r.psgc_code))
												}}
											/>
										</td>
										<td className="p-2">
											<Button variant="outline" onClick={() => onSave(r)} disabled={saving === r.psgc_code}>
												{saving === r.psgc_code ? 'Saving…' : (dirty.has(r.psgc_code) ? 'Save' : 'Saved')}
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
                    <div className="flex items-center justify-between text-sm">
                        <div>Rows: {filtered.length} • Page {page} / {pageCount}</div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page<=1}>Prev</Button>
                            <Button variant="outline" onClick={() => setPage(p => Math.min(pageCount, p+1))} disabled={page>=pageCount}>Next</Button>
                        </div>
                    </div>
				</CardContent>
			</Card>
		</div>
	)
}


