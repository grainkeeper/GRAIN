"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
const ProvdistMap = dynamic(() => import('@/components/map/provdist-map'), { ssr: false })
import { psgcService } from '@/lib/services/psgc-api'
import { normalizeProvincePsgc } from '@/lib/map/psgc'

type Row = {
	psgc_code: string
	name: string
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
	name?: string | null
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
    const [codeToName, setCodeToName] = useState<Map<string, string>>(new Map())

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
					name: (ov?.name ?? undefined) ? String(ov?.name) : '',
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

    // Autofill names by PSGC (client-side from PSGC API)
    useEffect(() => {
        (async () => {
            const provinces = await psgcService.getProvincesCached()
            const m = new Map<string, string>()
            provinces.forEach(p => {
                const key = normalizeProvincePsgc(p.code)
                if (key) m.set(key, p.name)
            })
            setCodeToName(m)
            // Fill missing names in current rows using normalized 9-digit codes
            setRows(prev => prev.map(r => {
                const key = normalizeProvincePsgc(r.psgc_code)
                const auto = key ? m.get(key) : undefined
                const name = (r.name && r.name.trim().length > 0) ? r.name : (auto || '')
                return { ...r, name }
            }))
        })()
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
				(r.name || '').toLowerCase().includes(q) ||
				String(r.adm1_psgc || '').toLowerCase().includes(q)
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
        return Array.from(set).sort()
    }, [rows])

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Map Overlays (Province/District)</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<ProvdistMap />
					<div className="flex items-center gap-2 flex-wrap">
						<Input
							placeholder="Search by name, PSGC, or region code…"
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
						/>
						<select
							className="h-9 rounded border px-2"
							value={regionFilter}
							onChange={(e) => { setRegionFilter(e.target.value); setPage(1) }}
						>
							<option value="">All regions</option>
							{regionOptions.map(code => (
								<option key={code} value={code}>{code}</option>
							))}
						</select>
						<Button variant="outline" onClick={onSaveAll} disabled={dirty.size === 0 || savingAll}>
							{savingAll ? 'Saving…' : `Save All (${dirty.size})`}
						</Button>
					</div>
					<div className="border rounded-md overflow-auto">
						<table className="w-full text-sm">
							<thead className="sticky top-0 bg-muted">
								<tr>
									<th className="text-left p-2 w-[280px]">Name</th>
									<th className="text-left p-2">PSGC</th>
									<th className="text-left p-2">Region (ADM1)</th>
									<th className="text-left p-2 w-[140px]">Yield (t/ha)</th>
									<th className="text-left p-2 w-[140px]">Color</th>
									<th className="text-left p-2">Notes</th>
									<th className="text-left p-2 w-[220px]">Popup Title / Subtitle</th>
									<th className="text-left p-2 w-[120px]"></th>
								</tr>
							</thead>
							<tbody>
								{paged.map((r) => (
									<tr key={r.psgc_code} className="border-t">
										<td className="p-2">
											<Input
												placeholder="Friendly name"
												value={r.name ?? ''}
												onChange={(e) => {
													const v = e.target.value
													setRows(prev => prev.map(x => x.psgc_code === r.psgc_code ? { ...x, name: v } : x))
													setDirty(prev => new Set(prev).add(r.psgc_code))
												}}
											/>
										</td>
										<td className="p-2 font-mono text-xs">{r.psgc_code}</td>
										<td className="p-2 font-mono text-xs">{r.adm1_psgc ?? '—'}</td>
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
												placeholder="Notes (optional)"
												value={r.notes ?? ''}
												onChange={(e) => {
													const v = e.target.value
													setRows(prev => prev.map(x => x.psgc_code === r.psgc_code ? { ...x, notes: v || null } : x))
													setDirty(prev => new Set(prev).add(r.psgc_code))
												}}
											/>
										</td>
										<td className="p-2">
											<div className="flex flex-col gap-1">
												<Input
													placeholder="Popup title"
													value={r.popup_title ?? ''}
													onChange={(e) => {
														const v = e.target.value
														setRows(prev => prev.map(x => x.psgc_code === r.psgc_code ? { ...x, popup_title: v || null } : x))
														setDirty(prev => new Set(prev).add(r.psgc_code))
													}}
												/>
												<Input
													placeholder="Popup subtitle"
													value={r.popup_subtitle ?? ''}
													onChange={(e) => {
														const v = e.target.value
														setRows(prev => prev.map(x => x.psgc_code === r.psgc_code ? { ...x, popup_subtitle: v || null } : x))
														setDirty(prev => new Set(prev).add(r.psgc_code))
													}}
												/>
											</div>
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


