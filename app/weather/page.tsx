import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cloud, Thermometer, Droplets, Wind, Calendar } from 'lucide-react'

export default function WeatherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Weather Forecast</h1>
        <p className="text-muted-foreground">7-day weather forecast and planting windows</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5" />
              <span>Temperature</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">28°C</div>
              <div className="text-sm text-muted-foreground">Average</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="h-5 w-5" />
              <span>Rainfall</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">15mm</div>
              <div className="text-sm text-muted-foreground">Expected</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wind className="h-5 w-5" />
              <span>Wind</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">12 km/h</div>
              <div className="text-sm text-muted-foreground">Speed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Planting Window</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-lg font-semibold">March 15-22</div>
              <div className="text-sm text-muted-foreground">Optimal Period</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
          <CardDescription>
            Detailed weather forecast for rice farming
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              <Cloud className="h-8 w-8 mx-auto mb-2" />
              <p>Weather forecast data will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
