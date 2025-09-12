'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import LineChart from '@/components/charts/line-chart'
import BarChart from '@/components/charts/bar-chart'
import PieChart from '@/components/charts/pie-chart'
import { 
  Calendar,
  MapPin,
  Activity,
  Loader2,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react'

interface UserAnalytics {
  farmProfile: any
  hasData: boolean
  message?: string
  totalCalculations?: number
  trends: {
    yieldTrends: Array<{
      date: string
      yield: number
      quarter: number
      variety: string
      year: number
    }>
    varietyPerformance: Record<string, { count: number; totalYield: number; avgYield: number }>
    quarterPerformance: Record<string, { count: number; totalYield: number; avgYield: number }>
    monthlyActivity: Record<string, number>
    recentPerformance: Array<{
      date: string
      yield: number
      confidence: number
      location: string
      variety: string
      quarter: number
    }>
  }
}

export default function UserDashboard() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">{error}</span>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  const { trends, farmProfile, hasData, message, totalCalculations } = analytics

  // Show message if no data
  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Farm Dashboard</h1>
          <p className="text-muted-foreground">
            Track your rice yield predictions and farm performance
          </p>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
              <p className="text-muted-foreground max-w-md">
                {message || 'Start by making some yield predictions to see your analytics.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {farmProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Farm Profile</CardTitle>
              <CardDescription>Your current farm information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium">{farmProfile.farm_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {farmProfile.province}, {farmProfile.region}
                  </p>
                  {farmProfile.municipality && (
                    <p className="text-sm text-muted-foreground">
                      {farmProfile.municipality}, {farmProfile.barangay}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Soil Type:</span>
                    <Badge variant="secondary">{farmProfile.soil_type}</Badge>
                  </div>
                  {farmProfile.preferred_rice_variety && (
                    <div className="flex justify-between">
                      <span className="text-sm">Preferred Variety:</span>
                      <Badge variant="outline">{farmProfile.preferred_rice_variety}</Badge>
                    </div>
                  )}
                  {farmProfile.farming_method && (
                    <div className="flex justify-between">
                      <span className="text-sm">Farming Method:</span>
                      <Badge variant="outline">{farmProfile.farming_method}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Prepare chart data only if we have meaningful data
  const yieldTrendData = trends.yieldTrends.length > 1 ? {
    labels: trends.yieldTrends.map(trend => new Date(trend.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Predicted Yield (kg/ha)',
        data: trends.yieldTrends.map(trend => trend.yield),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
      },
    ],
  } : null

  const varietyData = Object.keys(trends.varietyPerformance).length > 1 ? {
    labels: Object.keys(trends.varietyPerformance),
    datasets: [
      {
        label: 'Average Yield by Variety (kg/ha)',
        data: Object.values(trends.varietyPerformance).map(v => v.avgYield),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  } : null

  const quarterData = Object.keys(trends.quarterPerformance).length > 1 ? {
    labels: Object.keys(trends.quarterPerformance).map(q => `Q${q}`),
    datasets: [
      {
        label: 'Calculations by Quarter',
        data: Object.values(trends.quarterPerformance).map(q => q.count),
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(244, 63, 94, 0.8)'],
        borderColor: ['rgb(59, 130, 246)', 'rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(244, 63, 94)'],
        borderWidth: 1,
      },
    ],
  } : null

  const monthlyActivityData = Object.keys(trends.monthlyActivity).length > 1 ? {
    labels: Object.keys(trends.monthlyActivity).sort().map(month => {
      const [year, monthNum] = month.split('-')
      const date = new Date(parseInt(year), parseInt(monthNum) - 1)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }),
    datasets: [
      {
        label: 'Monthly Activity',
        data: Object.keys(trends.monthlyActivity).sort().map(month => trends.monthlyActivity[month]),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Farm Dashboard</h1>
        <p className="text-muted-foreground">
          Track your rice yield predictions and farm performance
        </p>
      </div>

      {/* Farm Profile Info */}
      {farmProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Farm Profile</CardTitle>
            <CardDescription>Your current farm information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium">{farmProfile.farm_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {farmProfile.province}, {farmProfile.region}
                </p>
                {farmProfile.municipality && (
                  <p className="text-sm text-muted-foreground">
                    {farmProfile.municipality}, {farmProfile.barangay}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Soil Type:</span>
                  <Badge variant="secondary">{farmProfile.soil_type}</Badge>
                </div>
                {farmProfile.preferred_rice_variety && (
                  <div className="flex justify-between">
                    <span className="text-sm">Preferred Variety:</span>
                    <Badge variant="outline">{farmProfile.preferred_rice_variety}</Badge>
                  </div>
                )}
                {farmProfile.farming_method && (
                  <div className="flex justify-between">
                    <span className="text-sm">Farming Method:</span>
                    <Badge variant="outline">{farmProfile.farming_method}</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid - Only show if we have meaningful data */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Yield Trends - Only show if we have multiple calculations */}
        {yieldTrendData && (
          <Card>
            <CardHeader>
              <CardTitle>Yield Trends</CardTitle>
              <CardDescription>Your predicted yields over time</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart data={yieldTrendData} height={300} />
            </CardContent>
          </Card>
        )}

        {/* Variety Performance - Only show if we have multiple varieties */}
        {varietyData && (
          <Card>
            <CardHeader>
              <CardTitle>Variety Performance</CardTitle>
              <CardDescription>Average yield by rice variety</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={varietyData} height={300} />
            </CardContent>
          </Card>
        )}

        {/* Quarter Distribution - Only show if we have multiple quarters */}
        {quarterData && (
          <Card>
            <CardHeader>
              <CardTitle>Planting Quarter Distribution</CardTitle>
              <CardDescription>Your preferred planting quarters</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart data={quarterData} height={300} />
            </CardContent>
          </Card>
        )}

        {/* Monthly Activity - Only show if we have multiple months */}
        {monthlyActivityData && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
              <CardDescription>Your calculation activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={monthlyActivityData} height={300} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Performance - Always show if we have any calculations */}
      {trends.recentPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Calculations</CardTitle>
            <CardDescription>Your latest yield predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.recentPerformance.map((perf, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(perf.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{perf.location}</span>
                    </div>
                    <Badge variant="outline">{perf.variety}</Badge>
                    <Badge variant="secondary">Q{perf.quarter}</Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">{perf.yield.toFixed(0)} kg/ha</div>
                      {perf.confidence && (
                        <div className="text-sm text-muted-foreground">
                          {perf.confidence.toFixed(1)}% confidence
                        </div>
                      )}
                    </div>
                    {perf.confidence && (
                      <div className="w-16">
                        <Progress value={perf.confidence} className="h-2" />
                      </div>
                    )}
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
