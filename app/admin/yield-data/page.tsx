"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, History, CheckCircle2, Download, Trash2, MapPin, Calendar, TrendingUp } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

export default function YieldDataAdminPage() {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<{ 
    headers: string[]; 
    rowCount: number; 
    errors: any[];
    summary?: {
      uniqueProvinces: string[];
      uniqueYears: number[];
      uniqueQuarters: number[];
      provinceCount: number;
      yearCount: number;
      quarterCount: number;
      dataCoverage: {
        provinces: number;
        years: number;
        quarters: number;
      };
    };
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [versions, setVersions] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const validate = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/admin/yield-data/upload', { method: 'POST', body: fd })
      const j = await r.json()
      if (r.ok) setPreview(j.preview)
    } finally { setLoading(false) }
  }

  const commitImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await fetch('/api/admin/yield-data/commit', { method: 'POST', body: fd })
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      loadVersions()
    } finally { setLoading(false) }
  }

  const loadVersions = async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (q.trim()) params.set('q', q.trim())
    const r = await fetch(`/api/admin/yield-data/versions?${params.toString()}`)
    if (r.ok) {
      const j = await r.json()
      setVersions(j.data || [])
      setTotalPages(j.totalPages || 1)
    }
  }

  const activateVersion = async (id: string) => {
    await fetch('/api/admin/yield-data/versions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: true }) })
    loadVersions()
  }

  const deleteVersion = async (id: string) => {
    if (!confirm('Delete this version?')) return
    await fetch(`/api/admin/yield-data/versions?id=${id}`, { method: 'DELETE' })
    loadVersions()
  }

  const downloadVersion = (id: string) => {
    window.open(`/api/admin/yield-data/download?id=${id}`, '_blank')
  }

  useEffect(() => {
    loadVersions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yield Data Management</h1>
        <p className="text-muted-foreground">Upload and manage rice yield datasets</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Dataset
            </CardTitle>
            <CardDescription>Import CSV or Excel files with yield data</CardDescription>
          </CardHeader>
          <CardContent>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="block w-full text-sm" />
            <Button className="mt-3" onClick={validate} disabled={loading}>Validate & Preview</Button>
            {preview && (
              <div className="mt-4 space-y-4">
                {/* Basic Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>Rows: {preview.rowCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">Errors: {preview.errors.length}</span>
                  </div>
                </div>

                {/* Data Coverage Summary */}
                {preview.summary && (
                  <div className="border rounded-lg p-3 bg-muted/50">
                    <h4 className="font-medium text-sm mb-2">Data Coverage</h4>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{preview.summary.provinceCount} Provinces</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{preview.summary.yearCount} Years</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Q:</span>
                        <span>{preview.summary.quarterCount}/4 Quarters</span>
                      </div>
                    </div>
                    
                    {/* Sample Data */}
                    <div className="mt-3 space-y-1 text-xs">
                      <div><span className="text-muted-foreground">Provinces:</span> {preview.summary.uniqueProvinces.slice(0, 3).join(', ')}{preview.summary.uniqueProvinces.length > 3 ? '...' : ''}</div>
                      <div><span className="text-muted-foreground">Years:</span> {preview.summary.uniqueYears.slice(0, 3).join(', ')}{preview.summary.uniqueYears.length > 3 ? '...' : ''}</div>
                      <div><span className="text-muted-foreground">Quarters:</span> {preview.summary.uniqueQuarters.join(', ')}</div>
                    </div>
                  </div>
                )}

                {/* Column Mapping */}
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">Column Mapping</h4>
                  <div className="space-y-1 text-xs">
                    {preview.headers.map((header, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">Column {i + 1}:</span>
                        <span className="font-mono">{header}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Errors */}
                {preview.errors.length > 0 && (
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2 text-red-600">Validation Errors</h4>
                    <div className="max-h-32 overflow-auto space-y-1">
                      {preview.errors.map((e, i) => (
                        <div key={i} className="text-xs text-red-600">
                          Row {e.row}{e.column ? ` (${e.column})` : ''}: {e.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={commitImport} 
                  disabled={loading || preview.errors.length > 0}
                >
                  {preview.errors.length > 0 ? 'Fix Errors First' : 'Import Dataset'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </CardTitle>
            <CardDescription>Manage and activate different yield data versions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <input
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value) }}
                placeholder="Search filename..."
                className="flex-1 rounded-md border px-3 py-2 text-sm"
              />
            </div>
            {versions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No versions uploaded yet.</div>
            ) : (
              <div className="space-y-3">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{v.filename}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(v.created_at).toLocaleDateString()} • {v.row_count} rows
                        {v.is_active && <span className="ml-2 text-green-600 font-medium">• Active</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!v.is_active && (
                        <Button size="sm" onClick={() => activateVersion(v.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => downloadVersion(v.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteVersion(v.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
                    <Button size="sm" variant="outline" disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
