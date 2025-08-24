import { NextRequest, NextResponse } from 'next/server';
import { analyzePlantingWindows } from '@/lib/services/daily-forecast-analysis';
import type { LocationCoordinates } from '@/lib/services/open-meteo-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location } = body;

    // Validate location
    if (!location || !location.latitude || !location.longitude || !location.name) {
      return NextResponse.json(
        { error: 'Invalid location data. Latitude, longitude, and name are required.' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (location.latitude < -90 || location.latitude > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude. Must be between -90 and 90.' },
        { status: 400 }
      );
    }

    if (location.longitude < -180 || location.longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid longitude. Must be between -180 and 180.' },
        { status: 400 }
      );
    }

    const coordinates: LocationCoordinates = {
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name
    };

    // Analyze planting windows for the next 16 days
    const analysis = await analyzePlantingWindows(coordinates);

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error('[Planting Windows API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze planting windows',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
