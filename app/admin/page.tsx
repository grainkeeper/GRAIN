"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, BarChart3, Activity, Wheat, MapPin, Bot, Upload, Settings, MessageSquare, TrendingUp, CheckCircle, AlertTriangle, Info, ArrowRight, Database, Globe } from 'lucide-react'
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
          <h1 className="text-3xl font-bold">GR-AI-N Admin Dashboard</h1>
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
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">GR-AI-N Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">Rice Yield Forecasting & Advisory Platform Management</p>
        <p className="text-sm text-muted-foreground">
          Monitor platform performance, manage rice varieties, configure AI chatbot, and oversee prediction models for Philippine rice farmers.
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common admin tasks and navigation shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => router.push('/admin/varieties')}
            >
              <Database className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Manage Varieties</div>
                <div className="text-xs text-muted-foreground">Add/edit rice varieties</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => router.push('/admin/chatbot')}
            >
              <Bot className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">AI Chatbot</div>
                <div className="text-xs text-muted-foreground">Monitor conversations</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => router.push('/admin/prediction-settings')}
            >
              <BarChart3 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Prediction Settings</div>
                <div className="text-xs text-muted-foreground">Configure ML models</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => router.push('/admin/map')}
            >
              <Globe className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Map Management</div>
                <div className="text-xs text-muted-foreground">Regional data & settings</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Platform Statistics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.registeredFarmers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total platform users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yield Predictions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.yieldPredictions || 0}</div>
            <p className="text-xs text-muted-foreground">
              ML model predictions made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weather Forecasts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.weatherForecasts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Open-Meteo API calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chatbot Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.chatbotSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Today's AI conversations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Data Status */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Health Overview</CardTitle>
            <CardDescription>
              Platform services and APIs status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Open-Meteo Weather API</span>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Prediction Model</span>
                </div>
                {getStatusIcon(stats?.systemHealth?.predictionModel)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-green-500" />
                  <span className="text-sm">AI Chatbot (Gemini)</span>
                </div>
                {getStatusIcon(stats?.systemHealth?.chatbot)}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-3"
                onClick={() => router.push('/admin/settings')}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Configuration</CardTitle>
            <CardDescription>
              Current data sources and platform configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Rice Varieties</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats?.overview?.activeDatasets || 0} active
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Yield Data</span>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Hardcoded CSV
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Philippine Regions</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  17 regions mapped
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Platform Ready</div>
                  <div>All core services operational for rice farmers</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>Latest user interactions and predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">
                        Yield prediction for {activity.province}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {activity.predictedYield?.toFixed(1)} tons/ha
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
