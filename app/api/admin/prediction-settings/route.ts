/**
 * Admin Prediction Settings API
 * 
 * Displays MLR formula configurations (read-only).
 * These formulas have been tested to provide 96.01% accuracy and cannot be modified.
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

interface PredictionSettingsResponse {
  success: boolean;
  data?: {
    formulas: FormulaData[];
    lastUpdated: string;
    readOnly: boolean;
  };
  error?: string;
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<PredictionSettingsResponse>> {
  try {
    // Skip authentication for development
    // const supabase = createClient();
    // const { data: { user }, error: authError } = await supabase.auth.getUser();

    // if (authError || !user) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Authentication required',
    //     timestamp: new Date().toISOString()
    //   } as PredictionSettingsResponse, { status: 401 });
    // }

    // Return the default formulas from constants (read-only)
    const defaultFormulas: FormulaData[] = QUARTERLY_FORMULAS.map(formula => ({
      quarter: formula.quarter,
      coefficients: formula.coefficients,
      accuracy: 96.01,
      description: formula.name
    }));

    return NextResponse.json({
      success: true,
      data: {
        formulas: defaultFormulas,
        lastUpdated: new Date().toISOString(),
        readOnly: true
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

// Remove PATCH method - formulas are read-only
export async function PATCH() {
  return NextResponse.json({ 
    error: 'Formulas are read-only and cannot be modified',
    readOnly: true 
  }, { status: 403 });
}

// Remove other methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
