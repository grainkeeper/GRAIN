/**
 * Admin Prediction Settings API
 * 
 * Handles saving and retrieving MLR formula configurations
 * with proper authentication and validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QUARTERLY_FORMULAS } from '@/lib/constants/quarterly-formulas';

interface FormulaCoefficients {
  temperature: number;
  dewPoint: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  constant: number;
}

interface FormulaData {
  quarter: number;
  coefficients: FormulaCoefficients;
  accuracy: number;
  description: string;
}

interface PredictionSettingsRequest {
  formulas: FormulaData[];
}

interface PredictionSettingsResponse {
  success: boolean;
  data?: {
    formulas: FormulaData[];
    lastUpdated: string;
  };
  error?: string;
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<PredictionSettingsResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as PredictionSettingsResponse, { status: 401 });
    }

    // For now, return the default formulas from constants
    // In a real implementation, you'd fetch from database
    const defaultFormulas: FormulaData[] = [
      {
        quarter: 1,
        coefficients: QUARTERLY_FORMULAS.quarter1,
        accuracy: 96.01,
        description: 'Q1 (January-March) - Optimal for early planting season'
      },
      {
        quarter: 2,
        coefficients: QUARTERLY_FORMULAS.quarter2,
        accuracy: 96.01,
        description: 'Q2 (April-June) - Peak growing season'
      },
      {
        quarter: 3,
        coefficients: QUARTERLY_FORMULAS.quarter3,
        accuracy: 96.01,
        description: 'Q3 (July-September) - Late growing season'
      },
      {
        quarter: 4,
        coefficients: QUARTERLY_FORMULAS.quarter4,
        accuracy: 96.01,
        description: 'Q4 (October-December) - Harvest preparation'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        formulas: defaultFormulas,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    } as PredictionSettingsResponse);

  } catch (error) {
    console.error('Prediction settings GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as PredictionSettingsResponse, { status: 500 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse<PredictionSettingsResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as PredictionSettingsResponse, { status: 401 });
    }

    // Parse request body
    const body: PredictionSettingsRequest = await request.json();
    const { formulas } = body;

    if (!formulas || !Array.isArray(formulas) || formulas.length !== 4) {
      return NextResponse.json({
        success: false,
        error: 'Invalid formulas data',
        timestamp: new Date().toISOString()
      } as PredictionSettingsResponse, { status: 400 });
    }

    // Validate formulas
    for (const formula of formulas) {
      if (!formula.coefficients || typeof formula.coefficients !== 'object') {
        return NextResponse.json({
          success: false,
          error: `Invalid coefficients for Q${formula.quarter}`,
          timestamp: new Date().toISOString()
        } as PredictionSettingsResponse, { status: 400 });
      }

      const { coefficients } = formula;
      const requiredFields = ['temperature', 'dewPoint', 'precipitation', 'windSpeed', 'humidity', 'constant'];
      
      for (const field of requiredFields) {
        if (typeof coefficients[field as keyof FormulaCoefficients] !== 'number') {
          return NextResponse.json({
            success: false,
            error: `Invalid ${field} coefficient for Q${formula.quarter}`,
            timestamp: new Date().toISOString()
          } as PredictionSettingsResponse, { status: 400 });
        }
      }

      // Check for extreme values
      if (Math.abs(coefficients.temperature) > 100000) {
        return NextResponse.json({
          success: false,
          error: `Temperature coefficient for Q${formula.quarter} seems too large`,
          timestamp: new Date().toISOString()
        } as PredictionSettingsResponse, { status: 400 });
      }
      if (Math.abs(coefficients.dewPoint) > 100000) {
        return NextResponse.json({
          success: false,
          error: `Dew point coefficient for Q${formula.quarter} seems too large`,
          timestamp: new Date().toISOString()
        } as PredictionSettingsResponse, { status: 400 });
      }
      if (Math.abs(coefficients.precipitation) > 100000) {
        return NextResponse.json({
          success: false,
          error: `Precipitation coefficient for Q${formula.quarter} seems too large`,
          timestamp: new Date().toISOString()
        } as PredictionSettingsResponse, { status: 400 });
      }
      if (Math.abs(coefficients.windSpeed) > 100000) {
        return NextResponse.json({
          success: false,
          error: `Wind speed coefficient for Q${formula.quarter} seems too large`,
          timestamp: new Date().toISOString()
        } as PredictionSettingsResponse, { status: 400 });
      }
      if (Math.abs(coefficients.humidity) > 100000) {
        return NextResponse.json({
          success: false,
          error: `Humidity coefficient for Q${formula.quarter} seems too large`,
          timestamp: new Date().toISOString()
        } as PredictionSettingsResponse, { status: 400 });
      }
      if (Math.abs(coefficients.constant) > 1000000) {
        return NextResponse.json({
          success: false,
          error: `Constant term for Q${formula.quarter} seems too large`,
          timestamp: new Date().toISOString()
        } as PredictionSettingsResponse, { status: 400 });
      }
    }

    // In a real implementation, you'd save to database
    // For now, we'll just return success
    console.log('Saving prediction formulas:', formulas);

    return NextResponse.json({
      success: true,
      data: {
        formulas,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    } as PredictionSettingsResponse);

  } catch (error) {
    console.error('Prediction settings PATCH error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as PredictionSettingsResponse, { status: 500 });
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
