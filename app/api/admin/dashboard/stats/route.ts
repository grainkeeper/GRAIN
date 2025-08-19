import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  // Skip Supabase for development (use mock data)
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // Skip authentication for development (comment out for production)
  // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Mock data for development
    const userCount = 125;
    const predictionCount = 847;
    const chatbotSessions = 23;
    const activeDatasets = 3;
    
    const recentActivity = [
      {
        id: '1',
        created_at: new Date().toISOString(),
        province: 'Nueva Ecija',
        predicted_yield: 4.2
      },
      {
        id: '2',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        province: 'Isabela',
        predicted_yield: 3.8
      }
    ];

    const topProvinces = [
      {
        id: '1',
        filename: 'yield_data_2024.csv',
        created_at: new Date().toISOString()
      }
    ];

    // Open-Meteo API is always operational (no API key required)
    const weatherStatus = 'operational'

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
        openMeteoAPI: weatherStatus,
        predictionModel: activeDatasets ? 'operational' : 'no_data',
        chatbot: 'operational'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
