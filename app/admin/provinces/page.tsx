import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Wheat, TrendingUp, Users, BarChart3 } from 'lucide-react'

export default function ProvincesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Philippine Provinces</h1>
          <p className="text-muted-foreground">Geospatial data and yield predictions by province</p>
        </div>
        <Button>
          <MapPin className="h-4 w-4 mr-2" />
          View Map
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Provinces</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">81</div>
            <p className="text-xs text-muted-foreground">
              Philippines
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              With data
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Yielding</CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Provinces
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              tons/hectare
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Geospatial Map</CardTitle>
            <CardDescription>
              Interactive map of the Philippines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Philippine Map</p>
                <p className="text-sm">Interactive province map with yield data</p>
                <Button className="mt-4">Load Map</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Provinces</CardTitle>
            <CardDescription>
              Highest rice yield predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                <Wheat className="h-8 w-8 mx-auto mb-2" />
                <p>No province data available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Luzon</CardTitle>
            <CardDescription>
              Northern Philippines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Provinces</span>
                <span className="text-sm font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Yield</span>
                <span className="text-sm font-medium">0 t/ha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Farmers</span>
                <span className="text-sm font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visayas</CardTitle>
            <CardDescription>
              Central Philippines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Provinces</span>
                <span className="text-sm font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Yield</span>
                <span className="text-sm font-medium">0 t/ha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Farmers</span>
                <span className="text-sm font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mindanao</CardTitle>
            <CardDescription>
              Southern Philippines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Provinces</span>
                <span className="text-sm font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Yield</span>
                <span className="text-sm font-medium">0 t/ha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Farmers</span>
                <span className="text-sm font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Province Data</CardTitle>
          <CardDescription>
            Manage province-specific yield data and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  placeholder="Search provinces..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button variant="outline">Export Data</Button>
            </div>
            
            <div className="border rounded-lg">
              <div className="p-4 text-center text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p>No province data found. Import data or add your first province.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
