import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Wheat, TrendingUp, Users } from 'lucide-react'

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Philippine Rice Map</h1>
        <p className="text-muted-foreground">Interactive map showing rice yield data across provinces</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Total Provinces</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">81</div>
              <div className="text-sm text-muted-foreground">Philippines</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wheat className="h-5 w-5" />
              <span>Active Regions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-muted-foreground">With data</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Avg. Yield</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">3.8</div>
              <div className="text-sm text-muted-foreground">t/ha</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Farmers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">2.4M</div>
              <div className="text-sm text-muted-foreground">Registered</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interactive Map</CardTitle>
          <CardDescription>
            Click on provinces to view detailed rice yield data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Philippine Map</p>
              <p className="text-sm">Interactive province map with yield data</p>
              <Button className="mt-4">Load Map</Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <span className="text-sm font-medium">38</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Yield</span>
                <span className="text-sm font-medium">4.2 t/ha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Farmers</span>
                <span className="text-sm font-medium">1.2M</span>
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
                <span className="text-sm font-medium">16</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Yield</span>
                <span className="text-sm font-medium">3.5 t/ha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Farmers</span>
                <span className="text-sm font-medium">0.8M</span>
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
                <span className="text-sm font-medium">27</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Yield</span>
                <span className="text-sm font-medium">3.9 t/ha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Farmers</span>
                <span className="text-sm font-medium">0.4M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
