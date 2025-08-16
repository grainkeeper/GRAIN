import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wheat, Cloud, MessageSquare, MapPin, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to <span className="text-green-600">GrainKeeper</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent rice yield forecasting and farming advisory platform. 
          Get accurate predictions and expert guidance for better harvests.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/predictions">Get Yield Predictions</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/chatbot">Ask GRAINKEEPER</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wheat className="h-5 w-5 text-green-600" />
              <span>Yield Predictions</span>
            </CardTitle>
            <CardDescription>
              Get accurate rice yield forecasts using our advanced ML model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our Multiple Linear Regression model analyzes weather patterns, soil conditions, 
              and historical data to predict your rice yield with high accuracy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              <span>Weather Integration</span>
            </CardTitle>
            <CardDescription>
              Real-time weather forecasts and optimal planting windows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access 7-day weather forecasts and discover the best planting periods 
              for maximum yield potential in your region.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <span>GRAINKEEPER Chatbot</span>
            </CardTitle>
            <CardDescription>
              AI-powered farming advice and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get personalized farming advice based on your crop type, soil conditions, 
              and location from our intelligent assistant.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <span>Province Map</span>
            </CardTitle>
            <CardDescription>
              Interactive map with province-specific data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Explore rice yield data across all 81 Philippine provinces with our 
              interactive geospatial visualization.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span>Analytics</span>
            </CardTitle>
            <CardDescription>
              Comprehensive insights and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your farming performance with detailed analytics, charts, 
              and historical yield comparisons.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <span>Farmer Community</span>
            </CardTitle>
            <CardDescription>
              Connect with fellow farmers and share experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Join our growing community of rice farmers and access shared knowledge, 
              best practices, and success stories.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Quick Actions</h2>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button variant="outline" asChild>
            <Link href="/predictions">View Predictions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/weather">Check Weather</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/chatbot">Chat with AI</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/map">Explore Map</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
