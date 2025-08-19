/**
 * Rice Yield Prediction Service
 * 
 * Core service implementing the 4 MLR formulas for rice yield prediction.
 * Uses historical weather data (2025-2100) to predict optimal planting quarters.
 * 
 * Accuracy: 96.01% based on mathematical analysis and geoclimatic variables.
 */

import { 
  calculateQuarterlyYield, 
  QUARTERLY_FORMULAS,
  getQuarterlyFormula 
} from '@/lib/constants/quarterly-formulas';

import { 
  getQuarterlyWeatherData,
  getYearlyWeatherData,
  validateYear,
  validateQuarter,
  validateWeatherData,
  getQuarterName,
  getQuarterMonths
} from '@/lib/data/historical-weather-2025-2100';

import {
  QuarterSelectionResult,
  QuarterSelectionRequest,
  HistoricalWeatherData,
  Quarter,
  HistoricalYear,
  ConfidenceLevel,
  PredictionResponse
} from '@/lib/types/prediction';

// ============================================================================
// CORE PREDICTION FUNCTIONS
// ============================================================================

/**
 * Calculate predicted yield for a specific quarter using MLR formula
 * @param year - Year to analyze (2025-2100)
 * @param quarter - Quarter to analyze (1-4)
 * @returns Predicted yield and weather data used
 * @throws Error if year/quarter invalid or data unavailable
 */
export function predictQuarterYield(year: HistoricalYear, quarter: Quarter): {
  predictedYield: number;
  weatherData: HistoricalWeatherData;
  confidence: ConfidenceLevel;
} {
  // Validate inputs
  if (!validateYear(year)) {
    throw new Error(`Invalid year: ${year}. Must be between 2025 and 2100.`);
  }

  if (!validateQuarter(quarter)) {
    throw new Error(`Invalid quarter: ${quarter}. Must be 1, 2, 3, or 4.`);
  }

  // Get historical weather data for the quarter
  const weatherData = getQuarterlyWeatherData(year, quarter);
  
  // Validate weather data
  if (!validateWeatherData(weatherData)) {
    throw new Error(`Invalid weather data for ${year} Q${quarter}`);
  }

  // Calculate predicted yield using MLR formula
  const predictedYield = calculateQuarterlyYield(quarter, {
    temperature: weatherData.temperature,
    dewPoint: weatherData.dewPoint,
    precipitation: weatherData.precipitation,
    windSpeed: weatherData.windSpeed,
    humidity: weatherData.humidity
  });

  // Calculate confidence level based on data quality and formula accuracy
  const confidence = calculateConfidenceLevel(weatherData, quarter);

  return {
    predictedYield,
    weatherData,
    confidence
  };
}

/**
 * Analyze all quarters for a given year and find the optimal planting quarter
 * @param year - Year to analyze (2025-2100)
 * @returns Complete quarter selection analysis with all quarters compared
 * @throws Error if year invalid or data unavailable
 */
export function analyzeQuarterSelection(year: HistoricalYear): QuarterSelectionResult {
  // Validate year
  if (!validateYear(year)) {
    throw new Error(`Invalid year: ${year}. Must be between 2025 and 2100.`);
  }

  // Get all quarterly weather data for the year
  const yearlyData = getYearlyWeatherData(year);
  
  // Predict yields for all quarters
  const quarter1Prediction = predictQuarterYield(year, 1);
  const quarter2Prediction = predictQuarterYield(year, 2);
  const quarter3Prediction = predictQuarterYield(year, 3);
  const quarter4Prediction = predictQuarterYield(year, 4);

  // Find the optimal quarter (highest predicted yield)
  const quarterlyYields = [
    { quarter: 1, yield: quarter1Prediction.predictedYield, confidence: quarter1Prediction.confidence, weatherData: quarter1Prediction.weatherData },
    { quarter: 2, yield: quarter2Prediction.predictedYield, confidence: quarter2Prediction.confidence, weatherData: quarter2Prediction.weatherData },
    { quarter: 3, yield: quarter3Prediction.predictedYield, confidence: quarter3Prediction.confidence, weatherData: quarter3Prediction.weatherData },
    { quarter: 4, yield: quarter4Prediction.predictedYield, confidence: quarter4Prediction.confidence, weatherData: quarter4Prediction.weatherData }
  ];

  const optimalQuarter = quarterlyYields.reduce((max, current) => 
    current.yield > max.yield ? current : max
  );

  // Calculate overall confidence based on data consistency
  const overallConfidence = calculateOverallConfidence(quarterlyYields);

  return {
    year,
    quarterlyYields: {
      quarter1: {
        quarter: 1,
        predictedYield: quarter1Prediction.predictedYield,
        confidence: quarter1Prediction.confidence,
        weatherData: quarter1Prediction.weatherData
      },
      quarter2: {
        quarter: 2,
        predictedYield: quarter2Prediction.predictedYield,
        confidence: quarter2Prediction.confidence,
        weatherData: quarter2Prediction.weatherData
      },
      quarter3: {
        quarter: 3,
        predictedYield: quarter3Prediction.predictedYield,
        confidence: quarter3Prediction.confidence,
        weatherData: quarter3Prediction.weatherData
      },
      quarter4: {
        quarter: 4,
        predictedYield: quarter4Prediction.predictedYield,
        confidence: quarter4Prediction.confidence,
        weatherData: quarter4Prediction.weatherData
      }
    },
    optimalQuarter: optimalQuarter.quarter as Quarter,
    optimalYield: optimalQuarter.yield,
    overallConfidence,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Get quarter selection analysis for multiple years
 * @param startYear - Start year (2025-2100)
 * @param endYear - End year (2025-2100)
 * @returns Array of quarter selection results for each year
 * @throws Error if year range invalid
 */
export function analyzeYearRange(startYear: HistoricalYear, endYear: HistoricalYear): QuarterSelectionResult[] {
  if (startYear > endYear) {
    throw new Error(`Invalid year range: ${startYear}-${endYear}. Start year must be <= end year.`);
  }

  if (!validateYear(startYear) || !validateYear(endYear)) {
    throw new Error(`Invalid year range: ${startYear}-${endYear}. Must be between 2025 and 2100.`);
  }

  const results: QuarterSelectionResult[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    try {
      const result = analyzeQuarterSelection(year);
      results.push(result);
    } catch (error) {
      console.warn(`Failed to analyze year ${year}:`, error);
      // Continue with other years
    }
  }

  return results;
}

// ============================================================================
// CONFIDENCE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate confidence level for a quarter prediction
 * @param weatherData - Weather data used for prediction
 * @param quarter - Quarter being analyzed
 * @returns Confidence level (0-100)
 */
function calculateConfidenceLevel(weatherData: HistoricalWeatherData, quarter: Quarter): ConfidenceLevel {
  let confidence = 85; // Base confidence from 96.01% accuracy

  // Adjust confidence based on data quality
  if (!validateWeatherData(weatherData)) {
    confidence -= 20; // Reduce confidence for invalid data
  }

  // Adjust confidence based on weather data completeness
  const missingFields = Object.values(weatherData).filter(value => 
    value === undefined || value === null
  ).length;
  
  confidence -= missingFields * 10; // Reduce confidence for missing data

  // Adjust confidence based on quarter (some quarters may have more reliable data)
  const quarterAdjustments = {
    1: 0,   // Q1: no adjustment
    2: 2,   // Q2: slight boost (good growing conditions)
    3: -2,  // Q3: slight reduction (monsoon season variability)
    4: 1    // Q4: slight boost (stable conditions)
  };
  
  confidence += quarterAdjustments[quarter];

  // Ensure confidence is within valid range
  return Math.max(0, Math.min(100, confidence));
}

/**
 * Calculate overall confidence for quarter selection analysis
 * @param quarterlyYields - Array of quarterly yield predictions
 * @returns Overall confidence level (0-100)
 */
function calculateOverallConfidence(quarterlyYields: Array<{
  quarter: number;
  yield: number;
  confidence: number;
  weatherData: HistoricalWeatherData;
}>): ConfidenceLevel {
  if (quarterlyYields.length === 0) {
    return 0;
  }

  // Average confidence across all quarters
  const averageConfidence = quarterlyYields.reduce((sum, q) => sum + q.confidence, 0) / quarterlyYields.length;

  // Adjust based on yield spread (if yields are very close, confidence is lower)
  const yields = quarterlyYields.map(q => q.yield);
  const maxYield = Math.max(...yields);
  const minYield = Math.min(...yields);
  const yieldSpread = maxYield - minYield;
  const yieldSpreadPercentage = (yieldSpread / maxYield) * 100;

  // Higher spread = higher confidence (clear winner)
  let spreadAdjustment = 0;
  if (yieldSpreadPercentage > 20) {
    spreadAdjustment = 5; // Clear winner
  } else if (yieldSpreadPercentage > 10) {
    spreadAdjustment = 2; // Moderate difference
  } else if (yieldSpreadPercentage < 5) {
    spreadAdjustment = -5; // Very close yields
  }

  const overallConfidence = averageConfidence + spreadAdjustment;
  
  // Ensure confidence is within valid range
  return Math.max(0, Math.min(100, overallConfidence));
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get detailed information about a quarter
 * @param quarter - Quarter number (1-4)
 * @returns Detailed quarter information
 */
export function getQuarterDetails(quarter: Quarter) {
  return {
    quarter,
    name: getQuarterName(quarter),
    months: getQuarterMonths(quarter),
    formula: getQuarterlyFormula(quarter)
  };
}

/**
 * Validate prediction request parameters
 * @param request - Quarter selection request
 * @returns Validation result
 */
export function validateQuarterSelectionRequest(request: QuarterSelectionRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.year) {
    errors.push('Year is required');
  } else if (!validateYear(request.year)) {
    errors.push(`Invalid year: ${request.year}. Must be between 2025 and 2100.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format prediction results for display
 * @param result - Quarter selection result
 * @returns Formatted result for UI display
 */
export function formatQuarterSelectionResult(result: QuarterSelectionResult) {
  const optimalQuarter = result.quarterlyYields[`quarter${result.optimalQuarter}` as keyof typeof result.quarterlyYields];
  
  return {
    year: result.year,
    optimalQuarter: {
      number: result.optimalQuarter,
      name: getQuarterName(result.optimalQuarter),
      months: getQuarterMonths(result.optimalQuarter),
      predictedYield: Math.round(result.optimalYield),
      confidence: Math.round(result.overallConfidence)
    },
    allQuarters: Object.entries(result.quarterlyYields).map(([key, data]) => ({
      quarter: data.quarter,
      name: getQuarterName(data.quarter),
      predictedYield: Math.round(data.predictedYield),
      confidence: Math.round(data.confidence),
      weatherData: {
        temperature: Math.round(data.weatherData.temperature * 10) / 10,
        dewPoint: Math.round(data.weatherData.dewPoint * 10) / 10,
        precipitation: Math.round(data.weatherData.precipitation),
        windSpeed: Math.round(data.weatherData.windSpeed * 10) / 10,
        humidity: Math.round(data.weatherData.humidity)
      }
    })),
    analyzedAt: new Date(result.analyzedAt).toLocaleString()
  };
}

/**
 * Get prediction accuracy information
 * @returns Accuracy metrics and information
 */
export function getPredictionAccuracyInfo() {
  return {
    overallAccuracy: 96.01,
    accuracySource: 'Mathematical analysis and geoclimatic variable correlation',
    confidenceFactors: [
      'Weather data quality and completeness',
      'Seasonal weather pattern consistency',
      'Historical data reliability',
      'Formula coefficient precision'
    ],
    limitations: [
      'Based on historical weather patterns',
      'Does not account for extreme weather events',
      'Regional variations may affect accuracy',
      'Requires location-specific validation for 7-day windows'
    ]
  };
}
