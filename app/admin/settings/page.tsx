import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Settings, Save, Wheat, Cloud, Bot } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GrainKeeper Settings</h1>
          <p className="text-muted-foreground">Configure your rice yield forecasting platform</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>
              Basic GrainKeeper configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" placeholder="GrainKeeper" defaultValue="GrainKeeper" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform-description">Platform Description</Label>
              <Input id="platform-description" placeholder="Rice Yield Forecasting & Advisory Platform" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input id="admin-email" type="email" placeholder="admin@grainkeeper.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction Model</CardTitle>
            <CardDescription>
              Multiple Linear Regression settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-retrain Model</Label>
                <p className="text-sm text-muted-foreground">
                  Retrain model with new data
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Real-time Predictions</Label>
                <p className="text-sm text-muted-foreground">
                  Enable live yield predictions
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
              <Input id="confidence-threshold" type="number" placeholder="0.8" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weather Integration</CardTitle>
            <CardDescription>
              Weather API and forecast settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weather-api-key">Weather API Key</Label>
              <Input id="weather-api-key" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weather-provider">Weather Provider</Label>
              <select id="weather-provider" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>OpenWeatherMap</option>
                <option>WeatherAPI</option>
                <option>AccuWeather</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="forecast-days">Forecast Days</Label>
              <Input id="forecast-days" type="number" placeholder="7" defaultValue="7" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-refresh Forecasts</Label>
                <p className="text-sm text-muted-foreground">
                  Update weather data automatically
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chatbot Configuration</CardTitle>
            <CardDescription>
              GRAINKEEPER chatbot settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chatbot-language">Response Language</Label>
              <select id="chatbot-language" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>English</option>
                <option>Filipino</option>
                <option>Tagalog</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatbot-style">Response Style</Label>
              <select id="chatbot-style" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Technical</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Chatbot</Label>
                <p className="text-sm text-muted-foreground">
                  Activate GRAINKEEPER assistant
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Data import and export settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-backup Data</Label>
                <p className="text-sm text-muted-foreground">
                  Backup data automatically
                </p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <select id="backup-frequency" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input id="max-file-size" type="number" placeholder="10" defaultValue="10" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
