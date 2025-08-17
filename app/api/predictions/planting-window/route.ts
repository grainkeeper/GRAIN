import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/services/weather-api';
import { YieldPredictionModel } from '@/lib/services/prediction-model';
import { EnhancedPredictionAPI } from '@/lib/services/enhanced-prediction-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, year, quarter, riceVariety } = body;

    console.log('🌾 Planting Window Request:', { location, year, quarter, riceVariety });

    // Validate required fields
    if (!location || !year || !quarter || !riceVariety) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'location, year, quarter, and riceVariety are required'
        },
        { status: 400 }
      );
    }

    // Initialize services
    const weatherAPI = new WeatherService();
    const predictionModel = new YieldPredictionModel();
    const enhancedAPI = new EnhancedPredictionAPI(weatherAPI, predictionModel);

    // Find optimal planting windows
    const result = await enhancedAPI.findOptimalPlantingWindows({
      location,
      year,
      quarter,
      riceVariety
    });

    console.log(`✅ Found ${result.optimalWindows.length} optimal planting windows`);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('❌ Planting window prediction error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to predict planting windows',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
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
