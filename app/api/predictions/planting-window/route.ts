/**
 * Integrated Planting Window Analysis API Endpoint
 * 
 * POST /api/predictions/planting-window
 * 
 * Combines quarter selection (96.01% accurate MLR) with 7-day window analysis
 * using Open-Meteo data for complete location-specific planting recommendations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  analyzePlantingWindow,
  type PlantingAnalysisRequest,
  type IntegratedPlantingAnalysis 
} from '@/lib/services/planting-window-analysis';
import { 
  createLocationCoordinates,
  findClosestRegion,
  getRegionByName,
  isWithinPhilippines,
  type PhilippineRegion 
} from '@/lib/utils/philippine-locations';
import { PredictionResponse } from '@/lib/types/prediction';

interface PlantingWindowRequestBody {
  year: number;
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
    region?: string; // Philippine region name
  };
  options?: {
    includeAlternatives?: boolean;
    useHistoricalData?: boolean;
    overrideQuarter?: 1 | 2 | 3 | 4;
  };
}

interface PlantingWindowResponse {
  analysis: IntegratedPlantingAnalysis;
  regionInfo?: {
    region: PhilippineRegion;
    recommendations: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: PlantingWindowRequestBody = await request.json();
    const { year, location, options = {} } = body;

    // Validate required fields
    if (!year || typeof year !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Invalid year parameter',
        details: ['Year is required and must be a number'],
        timestamp: new Date().toISOString()
      } as PredictionResponse<null>, { status: 400 });
    }

    if (year < 2025 || year > 2100) {
      return NextResponse.json({
        success: false,
        error: 'Invalid year range',
        details: ['Year must be between 2025 and 2100'],
        timestamp: new Date().toISOString()
      } as PredictionResponse<null>, { status: 400 });
    }

    // Handle location input - support multiple formats
    let coordinates;
    let regionInfo: { region: PhilippineRegion; recommendations: string[] } | undefined;

    if (location?.latitude && location?.longitude) {
      // Direct coordinates provided
      try {
        coordinates = createLocationCoordinates(
          location.latitude,
          location.longitude,
          location.name || 'Custom Location'
        );
        
        // Find closest Philippine region for additional context
        const closestRegion = findClosestRegion(location.latitude, location.longitude);
        regionInfo = {
          region: closestRegion,
          recommendations: [
            `Closest region: ${closestRegion.region}`,
            `Production level: ${closestRegion.riceProduction}`,
            ...closestRegion.mainSeasons.map(season => `Season: ${season}`)
          ]
        };
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Invalid coordinates',
          details: [error instanceof Error ? error.message : 'Invalid latitude/longitude'],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 400 });
      }
    } else if (location?.region) {
      // Philippine region name provided
      const region = getRegionByName(location.region);
      if (!region) {
        return NextResponse.json({
          success: false,
          error: 'Unknown Philippine region',
          details: [`Region "${location.region}" not found. Please use coordinates or a valid region name.`],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 400 });
      }
      
      coordinates = region.coordinates;
      regionInfo = {
        region,
        recommendations: [
          `Region: ${region.region}`,
          `Description: ${region.description}`,
          `Production: ${region.riceProduction}`,
          ...region.mainSeasons.map(season => `Season: ${season}`)
        ]
      };
    } else {
      // Default to Central Luzon (major rice region)
      const defaultRegion = getRegionByName('Central Luzon')!;
      coordinates = defaultRegion.coordinates;
      regionInfo = {
        region: defaultRegion,
        recommendations: [
          'Using Central Luzon (default rice region)',
          'Provide specific coordinates or region for accurate analysis',
          ...defaultRegion.mainSeasons.map(season => `Season: ${season}`)
        ]
      };
    }

    // Prepare analysis request
    const analysisRequest: PlantingAnalysisRequest = {
      year,
      location: coordinates,
      includeAlternatives: options.includeAlternatives ?? false,
      useHistoricalData: options.useHistoricalData ?? true,
      overrideQuarter: options.overrideQuarter as any
    };

    // Perform integrated analysis
    console.log(`[API] Starting planting window analysis for ${coordinates.name} in ${year}`);
    const analysis = await analyzePlantingWindow(analysisRequest);

    // Return successful response
    const responseData: PlantingWindowResponse = {
      analysis,
      regionInfo
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    } as PredictionResponse<PlantingWindowResponse>);

  } catch (error) {
    console.error('Planting window analysis API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Invalid request')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid request parameters',
          details: [error.message],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 400 });
      }

      if (error.message.includes('weather data')) {
        return NextResponse.json({
          success: false,
          error: 'Weather data unavailable',
          details: ['Unable to fetch historical weather data for the specified location and period'],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 503 });
      }

      if (error.message.includes('analysis failed')) {
        return NextResponse.json({
          success: false,
          error: 'Analysis failed',
          details: [error.message],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 500 });
      }
    }

    // Generic error response
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: ['An unexpected error occurred during planting window analysis'],
      timestamp: new Date().toISOString()
    } as PredictionResponse<null>, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for simple analysis
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const regionParam = searchParams.get('region');
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');

    if (!yearParam) {
      return NextResponse.json({
        success: false,
        error: 'Year parameter is required',
        details: ['Please provide a year parameter in the query string'],
        timestamp: new Date().toISOString()
      } as PredictionResponse<null>, { status: 400 });
    }

    const year = parseInt(yearParam, 10);
    
    // Build request body from query parameters
    const requestBody: PlantingWindowRequestBody = {
      year,
      location: {},
      options: {
        includeAlternatives: searchParams.get('alternatives') === 'true',
        useHistoricalData: searchParams.get('historical') !== 'false'
      }
    };

    // Handle location from query params
    if (latParam && lngParam) {
      requestBody.location!.latitude = parseFloat(latParam);
      requestBody.location!.longitude = parseFloat(lngParam);
      requestBody.location!.name = searchParams.get('name') || 'Custom Location';
    } else if (regionParam) {
      requestBody.location!.region = regionParam;
    }

    // Use POST handler logic
    const mockRequest = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' }
    });

    return await POST(mockRequest);

  } catch (error) {
    console.error('Planting window analysis API error (GET):', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: ['An unexpected error occurred during planting window analysis'],
      timestamp: new Date().toISOString()
    } as PredictionResponse<null>, { status: 500 });
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    details: ['PUT method is not supported for this endpoint'],
    timestamp: new Date().toISOString()
  } as PredictionResponse<null>, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    details: ['DELETE method is not supported for this endpoint'],
    timestamp: new Date().toISOString()
  } as PredictionResponse<null>, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    details: ['PATCH method is not supported for this endpoint'],
    timestamp: new Date().toISOString()
  } as PredictionResponse<null>, { status: 405 });
}