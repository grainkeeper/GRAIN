"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Palette, MapPin, Settings } from 'lucide-react'

interface ChoroplethRange {
  min: number
  max: number
  color: string
  label: string
}

export default function MapSettingsPage() {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [body, setBody] = useState('')
  const [choroplethRanges, setChoroplethRanges] = useState<ChoroplethRange[]>([
    { min: 0, max: 1, color: '#fef3c7', label: '< 1.0' },
    { min: 1, max: 2, color: '#fde68a', label: '1.0 - 1.9' },
    { min: 2, max: 3, color: '#fbbf24', label: '2.0 - 2.9' },
    { min: 3, max: 4, color: '#f59e0b', label: '3.0 - 3.9' },
    { min: 4, max: 5, color: '#d97706', label: '4.0 - 4.9' },
    { min: 5, max: 6, color: '#b45309', label: '5.0 - 5.9' },
    { min: 6, max: 7, color: '#92400e', label: '6.0 - 6.9' },
    { min: 7, max: 8, color: '#78350f', label: '7.0 - 7.9' },
    { min: 8, max: 9, color: '#451a03', label: '8.0 - 8.9' },
    { min: 9, max: 10, color: '#1c1917', label: '≥ 9.0' },
  ])
  const [noDataColor, setNoDataColor] = useState('#f3f4f6')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/map/settings').then(r => r.json()).then(d => {
      setTitle(d?.popup_title_template || '{{province}}')
      setSubtitle(d?.popup_subtitle_template || 'Philippine Province')
      setBody(d?.popup_body_template || '<div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px;"><div style="width: 10px; height: 10px; background: #16a34a; border-radius: 50%;"></div><span style="font-weight: 600; color: #166534; font-size: 14px;">Rice Yield: {{yield_t_ha}} t/ha</span></div>')
      setChoroplethRanges(d?.choropleth_ranges || choroplethRanges)
      setNoDataColor(d?.no_data_color || '#f3f4f6')
    })
  }, [])

  const onSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/map/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          popup_title_template: title, 
          popup_subtitle_template: subtitle, 
          popup_body_template: body,
          choropleth_ranges: choroplethRanges,
          no_data_color: noDataColor
        })
      })
      // Show success message
      alert('Settings saved successfully! The map will update automatically.')
    } catch (error) {
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateRange = (index: number, field: keyof ChoroplethRange, value: string | number) => {
    const newRanges = [...choroplethRanges]
    newRanges[index] = { ...newRanges[index], [field]: value }
    setChoroplethRanges(newRanges)
  }

  const addRange = () => {
    const lastRange = choroplethRanges[choroplethRanges.length - 1]
    const newMin = lastRange ? lastRange.max : 0
    setChoroplethRanges([...choroplethRanges, { 
      min: newMin, 
      max: newMin + 1, 
      color: '#cccccc', 
      label: `${newMin} - ${newMin + 1}` 
    }])
  }

  const removeRange = (index: number) => {
    if (choroplethRanges.length > 1) {
      setChoroplethRanges(choroplethRanges.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      {/* Popup Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map Popup Templates
          </CardTitle>
          <CardDescription>Configure how popup information is displayed on the map</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div>
              <Label>Title template</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="{{province}}" />
            </div>
            <div>
              <Label>Subtitle template</Label>
              <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="PSGC: {{psgc_code}}" />
            </div>
            <div>
              <Label>Body HTML template</Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="<div>Rice yield: {{yield_t_ha}} t/ha</div><div>Notes: {{notes}}</div>" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Available variables: {'{{province}}'}, {'{{name}}'}, {'{{psgc_code}}'}, {'{{yield_t_ha}}'}, {'{{notes}}'}, and any overlay property.
          </div>
        </CardContent>
      </Card>

      {/* Choropleth Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choropleth Color Configuration
          </CardTitle>
          <CardDescription>Configure the color ranges for yield data visualization on the map</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* No Data Color */}
          <div>
            <Label>No Data Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                type="color" 
                value={noDataColor} 
                onChange={e => setNoDataColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <span className="text-sm text-muted-foreground">Color for areas without yield data</span>
            </div>
          </div>

          {/* Yield Ranges */}
          <div>
            <Label>Yield Ranges (t/ha)</Label>
            <div className="space-y-3 mt-2">
              {choroplethRanges.map((range, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="number"
                      step="0.1"
                      value={range.min}
                      onChange={e => updateRange(index, 'min', parseFloat(e.target.value) || 0)}
                      className="w-20"
                      placeholder="Min"
                    />
                    <span className="text-sm">to</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={range.max}
                      onChange={e => updateRange(index, 'max', parseFloat(e.target.value) || 0)}
                      className="w-20"
                      placeholder="Max"
                    />
                    <Input
                      type="color"
                      value={range.color}
                      onChange={e => updateRange(index, 'color', e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={range.label}
                      onChange={e => updateRange(index, 'label', e.target.value)}
                      className="flex-1"
                      placeholder="Label"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeRange(index)}
                    disabled={choroplethRanges.length <= 1}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={addRange} variant="outline" size="sm">
                Add Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}


