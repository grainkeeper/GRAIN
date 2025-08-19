"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Database, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Variety = { id: string; name: string; description?: string; is_active?: boolean }

export default function VarietiesAdminPage() {
  const [loading, setLoading] = useState(false)
  const [varieties, setVarieties] = useState<Variety[]>([])
  const [query, setQuery] = useState("")
  const [form, setForm] = useState<Partial<Variety>>({ name: "", description: "", is_active: true })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return varieties
    return varieties.filter(v => v.name.toLowerCase().includes(q))
  }, [query, varieties])

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/varieties', { cache: 'no-store' })
      const j = await r.json()
      if (r.ok) setVarieties(j.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.name?.trim()) return
    setLoading(true)
    try {
      const r = await fetch('/api/admin/varieties', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      })
      if (r.ok) { 
        setForm({ name: '', description: '', is_active: true }); 
        await load() 
      }
    } finally { 
      setLoading(false) 
    }
  }

  const toggleActive = async (v: Variety) => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/varieties', { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: v.id, is_active: !v.is_active }) 
      })
      if (r.ok) await load()
    } finally { 
      setLoading(false) 
    }
  }

  const deleteVariety = async (v: Variety) => {
    if (!confirm(`Delete variety "${v.name}"?`)) return
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/varieties?id=${v.id}`, { method: 'DELETE' })
      if (r.ok) await load()
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rice Varieties</h1>
        <p className="text-muted-foreground">Manage active varieties shown in the public form</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Varieties List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Varieties
            </CardTitle>
            <CardDescription>Search, activate/deactivate, and manage varieties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className="border rounded-lg divide-y">
              {filtered.length > 0 ? (
                filtered.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{v.name}</h4>
                        {v.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {v.description && (
                        <p className="text-sm text-muted-foreground mt-1">{v.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={v.is_active}
                        onCheckedChange={() => toggleActive(v)}
                        disabled={loading}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteVariety(v)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {query ? 'No varieties found' : 'No varieties added yet'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add New Variety */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Variety
            </CardTitle>
            <CardDescription>Add a new rice variety to the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter variety name..."
                value={form.name || ''}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter variety description..."
                rows={4}
                value={form.description || ''}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active by default</Label>
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm(f => ({ ...f, is_active: checked }))}
              />
            </div>

            <Button 
              onClick={submit} 
              disabled={loading || !form.name?.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variety
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Current variety statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span>Total Varieties: {varieties.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Active: {varieties.filter(v => v.is_active).length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

