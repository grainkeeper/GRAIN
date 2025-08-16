import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wheat, TrendingUp, Calendar, MapPin } from 'lucide-react'

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yield Predictions</h1>
        <p className="text-muted-foreground">Get accurate rice yield forecasts for your farm</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wheat className="h-5 w-5" />
              <span>Current Prediction</span>
            </CardTitle>
            <CardDescription>
              Your latest yield forecast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">4.2</div>
              <div className="text-sm text-muted-foreground">tons per hectare</div>
              <div className="text-xs text-green-600">+12% vs last season</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Planting Window</span>
            </CardTitle>
            <CardDescription>
              Optimal planting period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold">March 15-22</div>
              <div className="text-sm text-muted-foreground">Best 7-day period</div>
              <div className="text-xs text-blue-600">Weather optimized</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Your Location</span>
            </CardTitle>
            <CardDescription>
              Province and region data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold">Nueva Ecija</div>
              <div className="text-sm text-muted-foreground">Central Luzon</div>
              <div className="text-xs text-orange-600">Rice Bowl of the Philippines</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yield Prediction Form</CardTitle>
          <CardDescription>
            Enter your farm details for personalized predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Province</label>
                <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Nueva Ecija</option>
                  <option>Isabela</option>
                  <option>Cagayan</option>
                  <option>Pangasinan</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Rice Variety</label>
                <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>IR64</option>
                  <option>NSIC Rc 160</option>
                  <option>PSB Rc 82</option>
                  <option>Mestizo 1</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Soil Type</label>
                <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Clay Loam</option>
                  <option>Silty Clay</option>
                  <option>Loam</option>
                  <option>Sandy Loam</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Farm Size (hectares)</label>
                <input 
                  type="number" 
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="2.5"
                />
              </div>
            </div>
            <Button className="w-full">Generate Prediction</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Historical Performance</CardTitle>
            <CardDescription>
              Your yield trends over the past seasons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">2023 Season</span>
                <span className="text-sm font-medium">4.1 t/ha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">2022 Season</span>
                <span className="text-sm font-medium">3.8 t/ha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">2021 Season</span>
                <span className="text-sm font-medium">3.9 t/ha</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Confidence</CardTitle>
            <CardDescription>
              Accuracy of our prediction model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">R² Score</span>
                <span className="text-sm font-medium">0.87</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mean Error</span>
                <span className="text-sm font-medium">±0.3 t/ha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Confidence Level</span>
                <span className="text-sm font-medium text-green-600">High</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
