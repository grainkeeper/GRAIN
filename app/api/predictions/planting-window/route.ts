import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/services/weather-api';
import { YieldPredictionModel } from '@/lib/services/prediction-model';
import { EnhancedPredictionAPI } from '@/lib/services/enhanced-prediction-api';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { location, year, quarter } = await request.json()
    
    if (!location || !year || !quarter) {
      return NextResponse.json({ 
        error: 'Missing required parameters: location, year, quarter' 
      }, { status: 400 })
    }

    logger.info('Planting window request:', { location, year, quarter })

    const predictionModel = new YieldPredictionModel()
    const windows = await predictionModel.findBestPlantingWindow(location, year, quarter)

    logger.info('Planting windows found:', { count: windows.length })

    return NextResponse.json({
      success: true,
      windows: windows
    })

  } catch (error) {
    logger.error('Error in planting window prediction:', error)
    return NextResponse.json({ 
      error: 'Failed to predict planting windows',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Planting Window Prediction API',
    description: 'Find optimal 7-day planting windows within quarters using live weather forecasts',
    usage: {
      method: 'POST',
      body: {
        location: {
          region: 'string',
          province: 'string', 
          city: 'string',
          barangay: 'string'
        },
        year: 'number',
        quarter: 'number (1-4)',
        riceVariety: 'string'
      }
    },
    features: [
      'Live weather forecast integration',
      '7-day window analysis within quarters',
      'Location-specific predictions',
      'Risk assessment and recommendations',
      'Weather stability scoring',
      'Confidence level calculation'
    ]
  });
}
