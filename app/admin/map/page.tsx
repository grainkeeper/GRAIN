"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import dynamic from 'next/dynamic'
const ProvdistMap = dynamic(() => import('@/components/map/provdist-map'), { ssr: false })
import { getRegionName, REGION_OPTIONS } from '@/lib/constants/regions'
import { getProvinceName } from '@/lib/constants/provinces-psgc'
import { MapPin, Save, Globe, Database, Info, Filter, Layers, Eye } from 'lucide-react'

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
    const [regionFilter, setRegionFilter] = useState<string>('all')
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
		let filtered = rows
		if (filter.trim()) {
			const q = filter.trim().toLowerCase()
			filtered = filtered.filter(r => {
				const name = getProvinceName(r.psgc_code) || ''
				return name.toLowerCase().includes(q)
			})
		}
		if (regionFilter && regionFilter !== 'all') {
			filtered = filtered.filter(r => {
				const region = getRegionName(r.adm1_psgc as string) || ''
				return region === regionFilter
			})
		}
		return filtered
	}, [rows, filter, regionFilter])

	const paginated = useMemo(() => {
		const start = (page - 1) * pageSize
		return filtered.slice(start, start + pageSize)
	}, [filtered, page])

	const totalPages = Math.ceil(filtered.length / pageSize)

	const updateRow = (code: string, updates: Partial<Row>) => {
		setRows(prev => prev.map(r => r.psgc_code === code ? { ...r, ...updates } : r))
		setDirty(prev => new Set(prev).add(code))
	}

	const regionsWithData = useMemo(() => {
		const regions = new Set<string>()
		rows.forEach(r => {
			const region = getRegionName(r.adm1_psgc as string)
			if (region) regions.add(region)
		})
		return Array.from(regions).sort()
	}, [rows])

	// Helper function to format region names for mobile
	const formatRegionName = (region: string) => {
		// For mobile, show shorter versions of long region names
		if (region.includes('Bangsamoro Autonomous Region in Muslim')) {
			return 'BARMM'
		}
		if (region.includes('National Capital Region')) {
			return 'NCR'
		}
		// Keep other region names as they are (they're already short)
		return region
	}

	const totalProvinces = rows.length
	const provincesWithData = rows.filter(r => r.yield_t_ha !== null).length
	const provincesWithOverrides = rows.filter(r => r.color_override).length

	return (
		<div className="space-y-6 max-w-full overflow-x-hidden">
			{/* Header Section */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Philippine Map Management</h1>
				<p className="text-muted-foreground text-lg">Manage regional yield data and map visualizations</p>
				<p className="text-sm text-muted-foreground">
					Configure yield data, color overrides, and popup information for each province/district on the interactive map. Changes affect how farmers see regional data.
				</p>
			</div>

			      {/* Overview Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Provinces</CardTitle>
						<MapPin className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalProvinces}</div>
						<p className="text-xs text-muted-foreground">
							All Philippine regions
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">With Yield Data</CardTitle>
						<Database className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{provincesWithData}</div>
						<p className="text-xs text-muted-foreground">
							Provinces with data
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Color Overrides</CardTitle>
						<Layers className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">{provincesWithOverrides}</div>
						<p className="text-xs text-muted-foreground">
							Custom colors set
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Changes</CardTitle>
						<Save className="h-4 w-4 text-orange-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">{dirty.size}</div>
						<p className="text-xs text-muted-foreground">
							Unsaved changes
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Interactive Map */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Globe className="h-5 w-5" />
						Interactive Map Preview
					</CardTitle>
					<CardDescription>Visual representation of current map data and settings</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-96 border rounded-lg overflow-hidden">
						<ProvdistMap height={384} />
					</div>
					<div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
						<Eye className="h-4 w-4" />
						<span>This map shows how farmers will see the regional data. Use the table below to edit province-specific information.</span>
					</div>
				</CardContent>
			</Card>

			{/* Filters and Controls */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Data Management
					</CardTitle>
					<CardDescription>Search, filter, and edit province data</CardDescription>
				</CardHeader>
				          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="search">Search Provinces</Label>
							<Input
								id="search"
								placeholder="Type province name..."
								value={filter}
								onChange={(e) => setFilter(e.target.value)}
							/>
						</div>
						
						<div className="space-y-2">
							<Label htmlFor="region">Filter by Region</Label>
							<Select value={regionFilter} onValueChange={setRegionFilter}>
								<SelectTrigger>
									<SelectValue placeholder="All regions">
										{regionFilter === 'all' ? (
											"All regions"
										) : (
											<>
												<span className="block sm:hidden">{formatRegionName(regionFilter)}</span>
												<span className="hidden sm:block">{regionFilter}</span>
											</>
										)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent className="z-[9999] bg-white border border-gray-200 shadow-lg max-w-[280px]">
									<SelectItem value="all">All regions</SelectItem>
									{regionsWithData.map(region => (
										<SelectItem key={region} value={region} className="truncate">
											<span className="block sm:hidden">{formatRegionName(region)}</span>
											<span className="hidden sm:block">{region}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Actions</Label>
							<div className="flex gap-2">
								<Button 
									onClick={onSaveAll} 
									disabled={dirty.size === 0 || savingAll}
									variant="outline"
									className="flex items-center gap-2"
								>
									<Save className="h-4 w-4" />
									{savingAll ? 'Saving...' : `Save All (${dirty.size})`}
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Data Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						Province Data Table
					</CardTitle>
					<CardDescription>
						Showing {paginated.length} of {filtered.length} provinces
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{paginated.map((row) => (
							<div key={row.psgc_code} className="p-4 border rounded-lg hover:bg-gray-50">
								{/* Header - Province Info */}
								<div className="flex items-center gap-2 mb-3">
									<h4 className="font-medium truncate">
										{getProvinceName(row.psgc_code) || row.psgc_code}
									</h4>
									<span className="text-xs text-muted-foreground">
										{getRegionName(row.adm1_psgc as string)}
									</span>
								</div>
								
								<div className="text-sm text-muted-foreground mb-4">
									PSGC: {row.psgc_code}
								</div>

								{/* Controls - Responsive Grid */}
								<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
									<div className="space-y-1">
										<Label className="text-xs">Yield (t/ha)</Label>
										<Input
											type="number"
											step="0.01"
											value={row.yield_t_ha ?? ''}
											onChange={(e) => updateRow(row.psgc_code, { yield_t_ha: e.target.value ? parseFloat(e.target.value) : null })}
											className="w-full"
											placeholder="0.00"
										/>
									</div>

									<div className="space-y-1">
										<Label className="text-xs">Color Override</Label>
										<Input
											type="color"
											value={row.color_override || '#ffffff'}
											onChange={(e) => updateRow(row.psgc_code, { color_override: e.target.value })}
											className="w-16 h-8 p-1"
										/>
									</div>

									<div className="space-y-1">
										<Label className="text-xs">Notes</Label>
										<Input
											value={row.notes ?? ''}
											onChange={(e) => updateRow(row.psgc_code, { notes: e.target.value })}
											placeholder="Optional notes..."
											className="w-full"
										/>
									</div>

									<div className="space-y-1">
										<Label className="text-xs">&nbsp;</Label>
										<Button
											onClick={() => onSave(row)}
											disabled={saving === row.psgc_code}
											size="sm"
											variant="outline"
											className="w-full"
										>
											{saving === row.psgc_code ? 'Saving...' : 'Save'}
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-4">
							<div className="text-sm text-muted-foreground">
								Page {page} of {totalPages}
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(p => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(p => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Information Panel */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						About Map Management
					</CardTitle>
				</CardHeader>
				          <CardContent>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
						<div className="space-y-2">
							<h4 className="font-medium text-sm">For Farmers</h4>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• Interactive map shows regional yield data</li>
								<li>• Color-coded provinces indicate yield levels</li>
								<li>• Click provinces for detailed information</li>
								<li>• Helps understand regional farming conditions</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h4 className="font-medium text-sm">For Administrators</h4>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• Set yield data for each province</li>
								<li>• Customize map colors for better visualization</li>
								<li>• Add notes and popup information</li>
								<li>• Changes appear immediately on the map</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}


