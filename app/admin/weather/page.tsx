"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cloud } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function WeatherSettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const [lastOk, setLastOk] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const r = await fetch('/api/admin/weather/settings', { cache: 'no-store' })
    const j = await r.json()
    if (r.ok) { setHasKey(j.hasKey); setLastOk(j.lastOkAt) }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/weather/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey }) })
      if (r.ok) { setApiKey(''); await load() }
    } finally { setLoading(false) }
  }

  const test = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/weather/test', { method: 'POST' })
      const j = await r.json()
      if (r.ok && j.ok) setLastOk(new Date().toISOString())
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Weather Provider</h1>
        <p className="text-sm text-muted-foreground">Manage provider key and test connection</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Cloud className="h-4 w-4"/>WeatherAPI</CardTitle>
          <CardDescription>Stored in DB settings; never committed to code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="text-sm font-medium">API Key</label>
            <input type="password" className="w-full rounded-md border px-3 py-2 text-sm" placeholder={hasKey ? '••••••••' : ''} value={apiKey} onChange={e=>setApiKey(e.target.value)} />
            <div className="flex gap-2">
              <Button className="mt-2" onClick={save} disabled={loading || !apiKey}>Save</Button>
              <Button className="mt-2" variant="outline" onClick={test} disabled={loading}>Test Connection</Button>
            </div>
            <div className="text-xs text-muted-foreground">Last successful test: {lastOk ? new Date(lastOk).toLocaleString() : '—'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
