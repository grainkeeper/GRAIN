"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function MapSettingsPage() {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/map/settings').then(r => r.json()).then(d => {
      setTitle(d?.popup_title_template || '{{name}}')
      setSubtitle(d?.popup_subtitle_template || '')
      setBody(d?.popup_body_template || '')
    })
  }, [])

  const onSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/map/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popup_title_template: title, popup_subtitle_template: subtitle, popup_body_template: body })
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Map Popup Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div>
              <label className="text-sm font-medium">Title template</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="{{name}}" />
            </div>
            <div>
              <label className="text-sm font-medium">Subtitle template</label>
              <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Province {{psgc_code}}" />
            </div>
            <div>
              <label className="text-sm font-medium">Body HTML template</label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="<div>Rice yield: {{yield_t_ha}} t/ha</div>" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Available variables: {'{{name}}'}, {'{{psgc_code}}'}, {'{{yield_t_ha}}'}, and any overlay property.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


