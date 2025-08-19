import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Get user count (farmers)
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get yield predictions count (from user farming data)
    const { count: predictionCount } = await supabase
      .from('user_farming_data')
      .select('*', { count: 'exact', head: true })

    // Get chatbot conversations (today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: chatbotSessions } = await supabase
      .from('chatbot_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // Get active yield dataset versions
    const { count: activeDatasets } = await supabase
      .from('yield_dataset_versions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get recent activity (last 5 yield predictions)
    const { data: recentActivity } = await supabase
      .from('user_farming_data')
      .select('id, created_at, province, predicted_yield')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get top provinces by yield data
    const { data: topProvinces } = await supabase
      .from('yield_dataset_versions')
      .select('id, filename, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    // Get system health status
    const { data: appSettings } = await supabase
      .from('app_settings')
      .select('weather_api_key, weather_last_ok_at')
      .eq('id', 1)
      .single()

    const weatherStatus = appSettings?.weather_api_key ? 
      (appSettings.weather_last_ok_at ? 'operational' : 'configured') : 'not_configured'

    return NextResponse.json({
      overview: {
        registeredFarmers: userCount || 0,
        yieldPredictions: predictionCount || 0,
        weatherForecasts: weatherStatus === 'operational' ? 1 : 0,
        chatbotSessions: chatbotSessions || 0,
        activeDatasets: activeDatasets || 0
      },
      recentActivity: recentActivity?.map(activity => ({
        id: activity.id,
        type: 'yield_prediction',
        province: activity.province,
        predictedYield: activity.predicted_yield,
        timestamp: activity.created_at
      })) || [],
      topProvinces: topProvinces?.length ? 'Data available' : 'No data',
      systemHealth: {
        weatherAPI: weatherStatus,
        predictionModel: activeDatasets ? 'operational' : 'no_data',
        chatbot: 'operational'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
