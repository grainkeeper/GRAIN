"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, Settings, Save, BarChart3, Users, TrendingUp, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ChatbotAdminPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    welcome_message: '',
    max_conversation_length: 50,
    temperature: 0.7,
    model: 'gpt-3.5-turbo'
  })
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadSettings = async () => {
    const r = await fetch('/api/admin/chatbot/settings')
    if (r.ok) {
      const data = await r.json()
      setSettings(data)
    }
  }

  const loadAnalytics = async () => {
    const r = await fetch('/api/admin/chatbot/analytics')
    if (r.ok) {
      const data = await r.json()
      setAnalytics(data)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/chatbot/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (r.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
    loadAnalytics()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chatbot Settings</h1>
        <p className="text-muted-foreground">Configure the AI assistant behavior and responses</p>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalConversations}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.botMessages} bot, {analytics.overview.userMessages} user
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.satisfaction.averageRating}/5</div>
              <p className="text-xs text-muted-foreground">
                {analytics.satisfaction.ratedMessages} rated messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Helpful Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.satisfaction.helpfulRate}%</div>
              <p className="text-xs text-muted-foreground">
                Marked as helpful
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic chatbot configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enable Chatbot</Label>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="welcome">Welcome Message</Label>
              <Input
                id="welcome"
                value={settings.welcome_message}
                onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                placeholder="Enter the welcome message users will see..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={settings.model} onValueChange={(value) => setSettings({ ...settings, model: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
            <CardDescription>Fine-tune the AI behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (Creativity)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  {settings.temperature < 0.5 ? 'Conservative' : settings.temperature < 1 ? 'Balanced' : 'Creative'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_length">Max Conversation Length</Label>
              <Input
                id="max_length"
                type="number"
                min="10"
                max="200"
                value={settings.max_conversation_length}
                onChange={(e) => setSettings({ ...settings, max_conversation_length: parseInt(e.target.value) })}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of messages to keep in conversation history
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      {analytics?.dailyActivity && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
            <CardDescription>Message volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32">
              {analytics.dailyActivity.map((day: any, i: number) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="bg-green-500 rounded-t w-8 transition-all"
                    style={{ 
                      height: `${Math.max(10, (day.messages / Math.max(...analytics.dailyActivity.map((d: any) => d.messages))) * 100)}%` 
                    }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs font-medium">{day.messages}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
