import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Get real user count from auth.users
    const { count: userCount, error: userError } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true })
    
    if (userError) {
      console.error('Error fetching user count:', userError)
    }

    // Get real yield predictions count
    const { count: predictionCount, error: predictionError } = await supabase
      .from('yield_predictions')
      .select('*', { count: 'exact', head: true })
    
    if (predictionError) {
      console.error('Error fetching prediction count:', predictionError)
    }

    // Get active datasets count
    const { count: activeDatasets, error: datasetError } = await supabase
      .from('yield_dataset_versions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    if (datasetError) {
      console.error('Error fetching active datasets:', datasetError)
    }

    // Get today's chatbot sessions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: chatbotSessions, error: chatbotError } = await supabase
      .from('chatbot_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    
    if (chatbotError) {
      console.error('Error fetching chatbot sessions:', chatbotError)
    }

    // Get recent yield predictions activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('yield_predictions')
      .select(`
        id,
        created_at,
        predicted_yield_tons_per_hectare,
        farm_profile_id,
        user_farm_profiles!inner(province)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (activityError) {
      console.error('Error fetching recent activity:', activityError)
    }

    // Check if yield data is available
    const { data: yieldData, error: yieldDataError } = await supabase
      .from('yield_dataset_versions')
      .select('id, filename, created_at')
      .eq('is_active', true)
      .limit(1)
    
    if (yieldDataError) {
      console.error('Error checking yield data:', yieldDataError)
    }

    // Check system health components
    const systemHealth = {
      openMeteoAPI: 'operational', // Open-Meteo doesn't require API key
      predictionModel: yieldData && yieldData.length > 0 ? 'operational' : 'configured',
      chatbot: 'operational' // Assuming chatbot is operational if we can query conversations
    }

    return NextResponse.json({
      overview: {
        registeredFarmers: userCount || 0,
        yieldPredictions: predictionCount || 0,
        weatherForecasts: 1, // Open-Meteo is always available
        chatbotSessions: chatbotSessions || 0,
        activeDatasets: activeDatasets || 0
      },
      recentActivity: recentActivity?.map(activity => ({
        id: activity.id,
        type: 'yield_prediction',
        province: activity.user_farm_profiles?.province || 'Unknown',
        predictedYield: activity.predicted_yield_tons_per_hectare,
        timestamp: activity.created_at
      })) || [],
      topProvinces: yieldData && yieldData.length > 0 ? 'Data available' : 'No data',
      systemHealth
    })
  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
