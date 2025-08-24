"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Database, CheckCircle, XCircle, Edit, Trash2, Info, Wheat, Users } from 'lucide-react'
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

  const activeCount = varieties.filter(v => v.is_active).length
  const totalCount = varieties.length

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Rice Varieties Management</h1>
        <p className="text-muted-foreground text-lg">Manage rice varieties available to farmers in the prediction form</p>
        <p className="text-sm text-muted-foreground">
          Add, edit, and control which rice varieties are shown to users when they make yield predictions. Only active varieties appear in the public form.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Varieties</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              All varieties in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Varieties</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Available to farmers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Varieties</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalCount - activeCount}</div>
            <p className="text-xs text-muted-foreground">
              Hidden from farmers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Add New Variety */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Variety
            </CardTitle>
            <CardDescription>Create a new rice variety for farmers to select</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Variety Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., IR64, NSIC Rc222, etc."
              />
              <p className="text-xs text-muted-foreground">
                Use the official variety name as recognized by Philippine rice authorities
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the variety's characteristics, yield potential, or growing requirements..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <Label htmlFor="active">Active (visible to farmers)</Label>
            </div>

            <Button onClick={submit} disabled={loading || !form.name?.trim()} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Variety
            </Button>

            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-4 w-4 text-blue-600" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">Tip:</div>
                <div>Only active varieties appear in the farmer's prediction form. Inactive varieties are hidden but can be reactivated later.</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Varieties List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Manage Varieties
            </CardTitle>
            <CardDescription>Search, activate/deactivate, and manage existing varieties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search varieties..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wheat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No varieties found</p>
                  {query && <p className="text-xs">Try adjusting your search</p>}
                </div>
              ) : (
                filtered.map((variety) => (
                  <div key={variety.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{variety.name}</h4>
                        {variety.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      {variety.description && (
                        <p className="text-sm text-muted-foreground mt-1">{variety.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={variety.is_active}
                        onCheckedChange={() => toggleActive(variety)}
                        disabled={loading}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteVariety(variety)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filtered.length > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                Showing {filtered.length} of {totalCount} varieties
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About Rice Varieties
          </CardTitle>
        </CardHeader>
                  <CardContent>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">For Farmers</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Only active varieties appear in the prediction form</li>
                <li>• Varieties help determine optimal planting conditions</li>
                <li>• Different varieties have different yield potentials</li>
                <li>• Selection affects MLR prediction accuracy</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">For Administrators</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add official Philippine rice varieties</li>
                <li>• Deactivate outdated or unavailable varieties</li>
                <li>• Provide descriptions for farmer guidance</li>
                <li>• Changes take effect immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

