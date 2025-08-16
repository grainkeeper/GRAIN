import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Cloud, Calendar, MapPin, Thermometer, Droplets, Wind } from 'lucide-react'

export default function WeatherPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weather Management</h1>
          <p className="text-muted-foreground">Manage weather forecasts and planting windows</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Forecasts
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forecasts</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Current forecasts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planting Windows</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Covered Provinces</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Out of 81 provinces
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Weather API
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>7-Day Forecast</CardTitle>
            <CardDescription>
              Weather forecast for rice farming regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                <Cloud className="h-8 w-8 mx-auto mb-2" />
                <p>No forecast data available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Planting Windows</CardTitle>
            <CardDescription>
              Optimal 7-day periods for rice planting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No planting windows calculated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Temperature Trends</CardTitle>
            <CardDescription>
              Average temperature by province
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-center text-muted-foreground py-4">
                <Thermometer className="h-8 w-8 mx-auto mb-2" />
                <p>No temperature data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rainfall Patterns</CardTitle>
            <CardDescription>
              Precipitation forecasts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-center text-muted-foreground py-4">
                <Droplets className="h-8 w-8 mx-auto mb-2" />
                <p>No rainfall data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wind Conditions</CardTitle>
            <CardDescription>
              Wind speed and direction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-center text-muted-foreground py-4">
                <Wind className="h-8 w-8 mx-auto mb-2" />
                <p>No wind data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weather API Configuration</CardTitle>
          <CardDescription>
            Configure weather data sources and update frequency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">API Provider</label>
                <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>OpenWeatherMap</option>
                  <option>WeatherAPI</option>
                  <option>AccuWeather</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Update Frequency</label>
                <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Every 3 hours</option>
                  <option>Every 6 hours</option>
                  <option>Daily</option>
                </select>
              </div>
            </div>
            <Button>Save Configuration</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
