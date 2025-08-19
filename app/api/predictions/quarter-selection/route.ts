/**
 * Quarter Selection API Endpoint
 * 
 * POST /api/predictions/quarter-selection
 * 
 * Analyzes all quarters for a given year and returns the optimal planting quarter
 * using the 96.01% accurate MLR formulas and historical weather data (2025-2100).
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  analyzeQuarterSelection, 
  validateQuarterSelectionRequest,
  formatQuarterSelectionResult,
  getPredictionAccuracyInfo
} from '@/lib/services/rice-yield-prediction';
import { 
  QuarterSelectionRequest, 
  PredictionResponse, 
  QuarterSelectionResult 
} from '@/lib/types/prediction';

// Type for the formatted response data
type FormattedQuarterSelectionResponse = ReturnType<typeof formatQuarterSelectionResult> & {
  accuracy: ReturnType<typeof getPredictionAccuracyInfo>;
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { year, location }: QuarterSelectionRequest = body;

    // Validate request parameters
    const validation = validateQuarterSelectionRequest({ year, location });
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validation.errors,
        timestamp: new Date().toISOString()
      } as PredictionResponse<null>, { status: 400 });
    }

    // Perform quarter selection analysis
    const result = analyzeQuarterSelection(year);

    // Format result for response
    const formattedResult = formatQuarterSelectionResult(result);

    // Get accuracy information
    const accuracyInfo = getPredictionAccuracyInfo();

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        ...formattedResult,
        accuracy: accuracyInfo
      },
      timestamp: new Date().toISOString()
    } as PredictionResponse<FormattedQuarterSelectionResponse>);

  } catch (error) {
    console.error('Quarter selection API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Invalid year')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid year parameter',
          details: [error.message],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 400 });
      }

      if (error.message.includes('No data available')) {
        return NextResponse.json({
          success: false,
          error: 'Weather data not available',
          details: [error.message],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 404 });
      }

      if (error.message.includes('Invalid weather data')) {
        return NextResponse.json({
          success: false,
          error: 'Data quality issue',
          details: [error.message],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 422 });
      }
    }

    // Generic error response
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: ['An unexpected error occurred during quarter selection analysis'],
      timestamp: new Date().toISOString()
    } as PredictionResponse<null>, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    if (!yearParam) {
      return NextResponse.json({
        success: false,
        error: 'Year parameter is required',
        details: ['Please provide a year parameter in the query string'],
        timestamp: new Date().toISOString()
      } as PredictionResponse<null>, { status: 400 });
    }

    const year = parseInt(yearParam, 10);

    // Validate year parameter
    const validation = validateQuarterSelectionRequest({ year });
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid year parameter',
        details: validation.errors,
        timestamp: new Date().toISOString()
      } as PredictionResponse<null>, { status: 400 });
    }

    // Perform quarter selection analysis
    const result = analyzeQuarterSelection(year);

    // Format result for response
    const formattedResult = formatQuarterSelectionResult(result);

    // Get accuracy information
    const accuracyInfo = getPredictionAccuracyInfo();

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        ...formattedResult,
        accuracy: accuracyInfo
      },
      timestamp: new Date().toISOString()
    } as PredictionResponse<FormattedQuarterSelectionResponse>);

  } catch (error) {
    console.error('Quarter selection API error (GET):', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Invalid year')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid year parameter',
          details: [error.message],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 400 });
      }

      if (error.message.includes('No data available')) {
        return NextResponse.json({
          success: false,
          error: 'Weather data not available',
          details: [error.message],
          timestamp: new Date().toISOString()
        } as PredictionResponse<null>, { status: 404 });
      }
    }

    // Generic error response
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: ['An unexpected error occurred during quarter selection analysis'],
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
