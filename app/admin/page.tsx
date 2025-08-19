"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, BarChart3, Activity, Wheat, Cloud, MapPin, Bot, Upload, Settings, MessageSquare, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadStats = async () => {
    try {
      const r = await fetch('/api/admin/dashboard/stats')
      if (r.ok) {
        const data = await r.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'configured':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'not_configured':
      case 'no_data':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600'
      case 'configured':
        return 'text-yellow-600'
      case 'not_configured':
      case 'no_data':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">GrainKeeper Admin Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GrainKeeper Admin Dashboard</h1>
        <p className="text-muted-foreground">Rice Yield Forecasting & Advisory Platform Management</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.registeredFarmers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yield Predictions</CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.yieldPredictions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total predictions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Datasets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.activeDatasets || 0}</div>
            <p className="text-xs text-muted-foreground">
              Yield data versions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chatbot Sessions</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.chatbotSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest farming activities and predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Yield prediction for {activity.province}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.predictedYield} tons/ha • {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">No recent activity</p>
                    <p className="text-xs text-muted-foreground">System is ready for data</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common admin tasks for GrainKeeper
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => router.push('/admin/yield-data')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Yield Data (CSV/Excel)
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => router.push('/admin/weather')}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Update Weather Integration
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => router.push('/admin/chatbot')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Manage Chatbot Settings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => router.push('/admin/varieties')}
              >
                <Wheat className="h-4 w-4 mr-2" />
                Manage Rice Varieties
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Data Status</CardTitle>
            <CardDescription>
              Current yield data availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topProvinces === 'Data available' ? (
                <div className="text-center text-green-600 py-4">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>Yield data available</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p>No yield data available</p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push('/admin/yield-data')}
                  >
                    Upload Data
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weather Integration</CardTitle>
            <CardDescription>
              Current weather API status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                {getStatusIcon(stats?.systemHealth?.weatherAPI)}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats?.systemHealth?.weatherAPI === 'operational' && 'Weather forecasts active'}
                {stats?.systemHealth?.weatherAPI === 'configured' && 'API configured, needs testing'}
                {stats?.systemHealth?.weatherAPI === 'not_configured' && 'No API key configured'}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => router.push('/admin/weather')}
              >
                Configure Weather
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Platform status and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Weather API</span>
                {getStatusIcon(stats?.systemHealth?.weatherAPI)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Prediction Model</span>
                {getStatusIcon(stats?.systemHealth?.predictionModel)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chatbot</span>
                {getStatusIcon(stats?.systemHealth?.chatbot)}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => router.push('/admin/settings')}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
