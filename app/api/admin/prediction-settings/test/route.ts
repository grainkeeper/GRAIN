/**
 * Admin Prediction Settings Test API
 * 
 * Tests MLR formulas with sample data to validate accuracy
 * and provide recommendations for improvements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { predictYieldForQuarter } from '@/lib/services/rice-yield-prediction';

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

interface TestRequest {
  formulas: FormulaData[];
}

interface TestResult {
  quarter: number;
  accuracy: number;
  testCases: number;
  averageError: number;
  maxError: number;
  minError: number;
}

interface TestResponse {
  success: boolean;
  data?: {
    overallAccuracy: number;
    testCases: number;
    status: string;
    quarterResults: Record<string, TestResult>;
    recommendations: string[];
  };
  error?: string;
  timestamp: string;
}

// Sample test data for validation
const SAMPLE_TEST_DATA = [
  // Q1 test cases
  { quarter: 1, temperature: 25.5, dewPoint: 18.2, precipitation: 45.3, windSpeed: 12.1, humidity: 75.8, expectedYield: 4200 },
  { quarter: 1, temperature: 28.1, dewPoint: 20.5, precipitation: 38.7, windSpeed: 15.3, humidity: 68.9, expectedYield: 4450 },
  { quarter: 1, temperature: 22.8, dewPoint: 16.9, precipitation: 52.1, windSpeed: 8.7, humidity: 82.3, expectedYield: 3950 },
  
  // Q2 test cases
  { quarter: 2, temperature: 30.2, dewPoint: 23.8, precipitation: 28.9, windSpeed: 18.5, humidity: 65.4, expectedYield: 4800 },
  { quarter: 2, temperature: 32.7, dewPoint: 25.1, precipitation: 22.3, windSpeed: 20.1, humidity: 58.7, expectedYield: 5100 },
  { quarter: 2, temperature: 27.9, dewPoint: 21.4, precipitation: 35.6, windSpeed: 14.8, humidity: 72.1, expectedYield: 4600 },
  
  // Q3 test cases
  { quarter: 3, temperature: 29.8, dewPoint: 22.6, precipitation: 31.2, windSpeed: 16.9, humidity: 70.3, expectedYield: 4700 },
  { quarter: 3, temperature: 31.5, dewPoint: 24.3, precipitation: 26.8, windSpeed: 19.2, humidity: 63.8, expectedYield: 4950 },
  { quarter: 3, temperature: 26.4, dewPoint: 19.7, precipitation: 41.5, windSpeed: 11.4, humidity: 78.9, expectedYield: 4300 },
  
  // Q4 test cases
  { quarter: 4, temperature: 24.1, dewPoint: 17.8, precipitation: 48.7, windSpeed: 13.6, humidity: 76.5, expectedYield: 4100 },
  { quarter: 4, temperature: 26.9, dewPoint: 19.2, precipitation: 42.1, windSpeed: 15.8, humidity: 69.2, expectedYield: 4350 },
  { quarter: 4, temperature: 21.3, dewPoint: 15.6, precipitation: 55.3, windSpeed: 9.2, humidity: 84.1, expectedYield: 3800 },
];

export async function POST(request: NextRequest): Promise<NextResponse<TestResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as TestResponse, { status: 401 });
    }

    // Parse request body
    const body: TestRequest = await request.json();
    const { formulas } = body;

    if (!formulas || !Array.isArray(formulas) || formulas.length !== 4) {
      return NextResponse.json({
        success: false,
        error: 'Invalid formulas data',
        timestamp: new Date().toISOString()
      } as TestResponse, { status: 400 });
    }

    // Test each formula with sample data
    const quarterResults: Record<string, TestResult> = {};
    let totalAccuracy = 0;
    let totalTestCases = 0;
    const recommendations: string[] = [];

    for (const formula of formulas) {
      const quarterTestData = SAMPLE_TEST_DATA.filter(data => data.quarter === formula.quarter);
      const errors: number[] = [];
      let totalError = 0;

      for (const testCase of quarterTestData) {
        try {
          // Use the provided coefficients for testing
          const predictedYield = predictYieldForQuarter(
            formula.quarter,
            testCase.temperature,
            testCase.dewPoint,
            testCase.precipitation,
            testCase.windSpeed,
            testCase.humidity,
            formula.coefficients // Use the custom coefficients
          );

          const error = Math.abs(predictedYield - testCase.expectedYield);
          const percentageError = (error / testCase.expectedYield) * 100;
          
          errors.push(percentageError);
          totalError += percentageError;
        } catch (error) {
          console.error(`Error testing Q${formula.quarter}:`, error);
          errors.push(100); // 100% error for failed predictions
          totalError += 100;
        }
      }

      const averageError = totalError / quarterTestData.length;
      const accuracy = Math.max(0, 100 - averageError);
      const maxError = Math.max(...errors);
      const minError = Math.min(...errors);

      quarterResults[`Q${formula.quarter}`] = {
        quarter: formula.quarter,
        accuracy,
        testCases: quarterTestData.length,
        averageError,
        maxError,
        minError
      };

      totalAccuracy += accuracy;
      totalTestCases += quarterTestData.length;

      // Generate recommendations based on performance
      if (accuracy < 90) {
        recommendations.push(`Q${formula.quarter} accuracy is below 90%. Consider reviewing coefficients.`);
      }
      if (maxError > 20) {
        recommendations.push(`Q${formula.quarter} has high maximum error (${maxError.toFixed(1)}%). Check for outliers.`);
      }
      if (averageError > 10) {
        recommendations.push(`Q${formula.quarter} average error is high (${averageError.toFixed(1)}%). Consider recalibration.`);
      }
    }

    const overallAccuracy = totalAccuracy / formulas.length;
    let status = 'Passed';
    
    if (overallAccuracy < 85) {
      status = 'Needs Improvement';
      recommendations.push('Overall accuracy is below 85%. Consider comprehensive formula review.');
    } else if (overallAccuracy < 90) {
      status = 'Good';
      recommendations.push('Overall accuracy is good but could be improved.');
    } else {
      status = 'Excellent';
      recommendations.push('Overall accuracy is excellent. Formulas are performing well.');
    }

    // Add general recommendations
    if (recommendations.length === 0) {
      recommendations.push('All formulas are performing well. No immediate action required.');
    }

    return NextResponse.json({
      success: true,
      data: {
        overallAccuracy,
        testCases: totalTestCases,
        status,
        quarterResults,
        recommendations
      },
      timestamp: new Date().toISOString()
    } as TestResponse);

  } catch (error) {
    console.error('Prediction settings test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as TestResponse, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
