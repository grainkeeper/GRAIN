"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Save, Shield, Info, Phone, Mail, Activity, Database, Cloud, AlertTriangle, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState({
    app_name: '',
    app_description: '',
    maintenance_mode: false,
    maintenance_message: '',
    contact_email: '',
    support_phone: '',
    max_file_size_mb: 50,
    allowed_file_types: ['csv', 'xlsx']
  })
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadSettings = async () => {
    const r = await fetch('/api/admin/settings')
    if (r.ok) {
      const data = await r.json()
      setSettings(data)
    }
  }

  const loadHealth = async () => {
    const r = await fetch('/api/admin/settings/health')
    if (r.ok) {
      const data = await r.json()
      setHealth(data)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (r.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        loadHealth() // Refresh health after settings change
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
    loadHealth()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'configured':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'not_configured':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'configured':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'not_configured':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">App Settings</h1>
        <p className="text-muted-foreground">Configure general application settings and behavior</p>
      </div>

      {/* System Health */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Current system status and connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(health.database.status)}
                <div>
                  <div className="font-medium">Database</div>
                  <div className={`text-sm ${getStatusColor(health.database.status)}`}>
                    {health.database.message}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(health.storage.status)}
                <div>
                  <div className="font-medium">Storage</div>
                  <div className={`text-sm ${getStatusColor(health.storage.status)}`}>
                    {health.storage.message}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                {getStatusIcon(health.weather.status)}
                <div>
                  <div className="font-medium">Weather API</div>
                  <div className={`text-sm ${getStatusColor(health.weather.status)}`}>
                    {health.weather.message}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Last checked: {new Date(health.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              General Information
            </CardTitle>
            <CardDescription>Basic app configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app_name">App Name</Label>
              <Input
                id="app_name"
                value={settings.app_name}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                placeholder="GRAINKEEPER"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="app_description">App Description</Label>
              <Textarea
                id="app_description"
                value={settings.app_description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, app_description: e.target.value })}
                placeholder="AI-powered rice farming assistant"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_file_size">Max File Size (MB)</Label>
              <Input
                id="max_file_size"
                type="number"
                min="1"
                max="100"
                value={settings.max_file_size_mb}
                onChange={(e) => setSettings({ ...settings, max_file_size_mb: parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Maintenance & Support
            </CardTitle>
            <CardDescription>System maintenance and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <Switch
                id="maintenance"
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
              />
            </div>

            {settings.maintenance_mode && (
              <div className="space-y-2">
                <Label htmlFor="maintenance_message">Maintenance Message</Label>
                <Textarea
                  id="maintenance_message"
                  value={settings.maintenance_message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, maintenance_message: e.target.value })}
                  placeholder="System is under maintenance. Please try again later."
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="contact_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Email
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="support@grainkeeper.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Support Phone
              </Label>
              <Input
                id="support_phone"
                value={settings.support_phone}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                placeholder="+63 912 345 6789"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
