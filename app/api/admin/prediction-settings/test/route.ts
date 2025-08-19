/**
 * Admin Prediction Settings Test API
 * 
 * Tests MLR formulas with sample data to validate accuracy
 * and provide recommendations for improvements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

/**
 * Calculate predicted yield using custom coefficients
 * @param quarter - Quarter (1-4)
 * @param temperature - Temperature value
 * @param dewPoint - Dew point value
 * @param precipitation - Precipitation value
 * @param windSpeed - Wind speed value
 * @param humidity - Humidity value
 * @param coefficients - Custom MLR coefficients
 * @returns Predicted yield
 */
function predictYieldForQuarter(
  quarter: number,
  temperature: number,
  dewPoint: number,
  precipitation: number,
  windSpeed: number,
  humidity: number,
  coefficients: FormulaCoefficients
): number {
  // Apply the MLR formula: Ŷ = aT + bD + cP + dW + eH + f
  return (
    coefficients.temperature * temperature +
    coefficients.dewPoint * dewPoint +
    coefficients.precipitation * precipitation +
    coefficients.windSpeed * windSpeed +
    coefficients.humidity * humidity +
    coefficients.constant
  );
}

// Realistic test data based on actual MLR formula outputs from yield_output.csv
const SAMPLE_TEST_DATA = [
  // Q1 test cases - based on actual Q1 predictions (9M+ range)
  { quarter: 1, temperature: 26.88, dewPoint: 21.56, precipitation: 242.4, windSpeed: 3.3, humidity: 78.9, expectedYield: 9056823.8 },
  { quarter: 1, temperature: 27.02, dewPoint: 21.58, precipitation: 245.0, windSpeed: 3.31, humidity: 78.9, expectedYield: 9149642.6 },
  { quarter: 1, temperature: 27.16, dewPoint: 21.61, precipitation: 247.5, windSpeed: 3.32, humidity: 78.8, expectedYield: 9242461.3 },
  
  // Q2 test cases - based on actual Q2 predictions (negative range)
  { quarter: 2, temperature: 28.74, dewPoint: 22.63, precipitation: 329.6, windSpeed: 3.53, humidity: 83.3, expectedYield: -1337216.2 },
  { quarter: 2, temperature: 28.76, dewPoint: 22.7, precipitation: 326.5, windSpeed: 3.52, humidity: 83.3, expectedYield: -1323842.4 },
  { quarter: 2, temperature: 28.77, dewPoint: 22.77, precipitation: 323.4, windSpeed: 3.5, humidity: 83.3, expectedYield: -1310468.5 },
  
  // Q3 test cases - based on actual Q3 predictions (700K+ range)
  { quarter: 3, temperature: 30.65, dewPoint: 23.42, precipitation: 532.5, windSpeed: 2.79, humidity: 86.1, expectedYield: 730377.8 },
  { quarter: 3, temperature: 30.64, dewPoint: 23.4, precipitation: 534.9, windSpeed: 2.8, humidity: 86.1, expectedYield: 732108.1 },
  { quarter: 3, temperature: 30.64, dewPoint: 23.4, precipitation: 535.4, windSpeed: 2.8, humidity: 86.1, expectedYield: 732454.2 },
  
  // Q4 test cases - based on actual Q4 predictions (negative range)
  { quarter: 4, temperature: 27.4, dewPoint: 20.44, precipitation: 428.0, windSpeed: 3.35, humidity: 80.0, expectedYield: -12586363.3 },
  { quarter: 4, temperature: 27.28, dewPoint: 20.43, precipitation: 428.6, windSpeed: 3.34, humidity: 79.9, expectedYield: -12606692.2 },
  { quarter: 4, temperature: 27.16, dewPoint: 20.42, precipitation: 429.3, windSpeed: 3.33, humidity: 79.9, expectedYield: -12627021.1 },
];

export async function POST(request: NextRequest): Promise<NextResponse<TestResponse>> {
  try {
    // Skip authentication for development
    // const supabase = createClient();
    // const { data: { user }, error: authError } = await supabase.auth.getUser();

    // if (authError || !user) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Authentication required',
    //     timestamp: new Date().toISOString()
    //   } as TestResponse, { status: 401 });
    // }

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

          // Calculate percentage error (handle negative values properly)
          const error = Math.abs(predictedYield - testCase.expectedYield);
          const percentageError = (error / Math.abs(testCase.expectedYield)) * 100;
          
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
