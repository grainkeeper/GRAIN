import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's farm profile
    const { data: farmProfile } = await supabase
      .from('user_farm_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    // Get user's recent calculations
    const { data: calculations } = await supabase
      .from('recent_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // Only process data if we have calculations
    if (!calculations || calculations.length === 0) {
      return NextResponse.json({
        farmProfile,
        hasData: false,
        message: 'No calculations found. Start by making some yield predictions to see your analytics.'
      })
    }

    // Filter out calculations with missing key data
    const validCalculations = calculations.filter(calc => 
      calc.predicted_yield && 
      calc.predicted_yield > 0 && 
      calc.rice_variety && 
      calc.optimal_quarter
    )

    if (validCalculations.length === 0) {
      return NextResponse.json({
        farmProfile,
        hasData: false,
        message: 'No valid calculation data found. Your calculations may be missing key information.'
      })
    }

    // Yield trends over time (only if we have multiple calculations)
    const yieldTrends = validCalculations.length > 1 ? validCalculations.map(calc => ({
      date: calc.created_at,
      yield: calc.predicted_yield,
      quarter: calc.optimal_quarter,
      variety: calc.rice_variety,
      year: calc.year
    })) : []

    // Performance by variety (only if we have multiple varieties)
    const varietyCounts = validCalculations.reduce((acc, calc) => {
      const variety = calc.rice_variety || 'Unknown'
      acc[variety] = (acc[variety] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const varietyPerformance = Object.keys(varietyCounts).length > 1 ? 
      validCalculations.reduce((acc, calc) => {
        const variety = calc.rice_variety || 'Unknown'
        if (!acc[variety]) {
          acc[variety] = { count: 0, totalYield: 0, avgYield: 0 }
        }
        acc[variety].count++
        acc[variety].totalYield += calc.predicted_yield || 0
        acc[variety].avgYield = acc[variety].totalYield / acc[variety].count
        return acc
      }, {} as Record<string, { count: number; totalYield: number; avgYield: number }>) : {}

    // Performance by quarter (only if we have multiple quarters)
    const quarterCounts = validCalculations.reduce((acc, calc) => {
      const quarter = calc.optimal_quarter?.toString() || 'Unknown'
      acc[quarter] = (acc[quarter] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const quarterPerformance = Object.keys(quarterCounts).length > 1 ?
      validCalculations.reduce((acc, calc) => {
        const quarter = calc.optimal_quarter?.toString() || 'Unknown'
        if (!acc[quarter]) {
          acc[quarter] = { count: 0, totalYield: 0, avgYield: 0 }
        }
        acc[quarter].count++
        acc[quarter].totalYield += calc.predicted_yield || 0
        acc[quarter].avgYield = acc[quarter].totalYield / acc[quarter].count
        return acc
      }, {} as Record<string, { count: number; totalYield: number; avgYield: number }>) : {}

    // Monthly activity (only if we have multiple months)
    const monthlyActivity = validCalculations.length > 3 ? 
      validCalculations.reduce((acc, calc) => {
        const month = new Date(calc.created_at).toISOString().slice(0, 7) // YYYY-MM
        acc[month] = (acc[month] || 0) + 1
        return acc
      }, {} as Record<string, number>) : {}

    // Recent performance (last 5 calculations)
    const recentPerformance = validCalculations.slice(0, 5).map(calc => ({
      date: calc.created_at,
      yield: calc.predicted_yield,
      confidence: calc.confidence_level,
      location: calc.location_name,
      variety: calc.rice_variety,
      quarter: calc.optimal_quarter
    }))

    return NextResponse.json({
      farmProfile,
      hasData: true,
      totalCalculations: validCalculations.length,
      trends: {
        yieldTrends,
        varietyPerformance,
        quarterPerformance,
        monthlyActivity,
        recentPerformance
      }
    })
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
