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
export async function predictQuarterYield(year: HistoricalYear, quarter: Quarter): Promise<{
  predictedYield: number;
  weatherData: HistoricalWeatherData;
  confidence: ConfidenceLevel;
}> {
  // Validate inputs
  if (!validateYear(year)) {
    throw new Error(`Invalid year: ${year}. Must be between 2025 and 2100.`);
  }

  if (!validateQuarter(quarter)) {
    throw new Error(`Invalid quarter: ${quarter}. Must be 1, 2, 3, or 4.`);
  }

  // Get historical weather data for the quarter
  const weatherData = await getQuarterlyWeatherData(year, quarter);
  
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
export async function analyzeQuarterSelection(year: HistoricalYear): Promise<QuarterSelectionResult> {
  // Validate year
  if (!validateYear(year)) {
    throw new Error(`Invalid year: ${year}. Must be between 2025 and 2100.`);
  }

  // Get all quarterly weather data for the year
  const yearlyData = await getYearlyWeatherData(year);
  
  // Analyze each quarter
  const quarterResults: Array<{
    quarter: Quarter;
    predictedYield: number;
    weatherData: HistoricalWeatherData;
    confidence: ConfidenceLevel;
  }> = [];

  for (let quarter = 1; quarter <= 4; quarter++) {
    try {
      const result = await predictQuarterYield(year, quarter as Quarter);
      quarterResults.push({
        quarter: quarter as Quarter,
        predictedYield: result.predictedYield,
        weatherData: result.weatherData,
        confidence: result.confidence
      });
    } catch (error) {
      console.error(`Error analyzing quarter ${quarter} for year ${year}:`, error);
      // Continue with other quarters
    }
  }

  if (quarterResults.length === 0) {
    throw new Error(`No valid quarter data available for year ${year}`);
  }

  // Find the optimal quarter (highest predicted yield)
  const optimalQuarter = quarterResults.reduce((best, current) => 
    current.predictedYield > best.predictedYield ? current : best
  );

  // Calculate overall confidence based on data quality
  const overallConfidence = calculateOverallConfidence(quarterResults);

  return {
    year,
    analysisDate: new Date().toISOString(),
    quarters: quarterResults.map(result => ({
      quarter: result.quarter,
      predictedYield: result.predictedYield,
      weatherData: result.weatherData,
      confidence: result.confidence,
      quarterName: getQuarterName(result.quarter),
      quarterMonths: getQuarterMonths(result.quarter)
    })),
    optimalQuarter: {
      quarter: optimalQuarter.quarter,
      predictedYield: optimalQuarter.predictedYield,
      weatherData: optimalQuarter.weatherData,
      confidence: optimalQuarter.confidence,
      quarterName: getQuarterName(optimalQuarter.quarter),
      quarterMonths: getQuarterMonths(optimalQuarter.quarter)
    },
    overallConfidence,
    recommendations: generateQuarterRecommendations(quarterResults, optimalQuarter)
  };
}

/**
 * Get quarter selection analysis for multiple years
 * @param startYear - Start year (2025-2100)
 * @param endYear - End year (2025-2100)
 * @returns Array of quarter selection results for each year
 * @throws Error if year range invalid
 */
export async function analyzeYearRange(startYear: HistoricalYear, endYear: HistoricalYear): Promise<QuarterSelectionResult[]> {
  if (startYear > endYear) {
    throw new Error(`Invalid year range: ${startYear}-${endYear}. Start year must be <= end year.`);
  }

  if (!validateYear(startYear) || !validateYear(endYear)) {
    throw new Error(`Invalid year range: ${startYear}-${endYear}. Must be between 2025 and 2100.`);
  }

  const results: QuarterSelectionResult[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    try {
      const result = await analyzeQuarterSelection(year);
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
  quarter: Quarter;
  predictedYield: number;
  confidence: number;
  weatherData: HistoricalWeatherData;
}>): ConfidenceLevel {
  if (quarterlyYields.length === 0) {
    return 0;
  }

  // Average confidence across all quarters
  const averageConfidence = quarterlyYields.reduce((sum, q) => sum + q.confidence, 0) / quarterlyYields.length;

  // Adjust based on yield spread (if yields are very close, confidence is lower)
  const yields = quarterlyYields.map(q => q.predictedYield);
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

/**
 * Generate recommendations based on quarter selection analysis
 */
function generateQuarterRecommendations(
  quarterResults: Array<{
    quarter: Quarter;
    predictedYield: number;
    weatherData: HistoricalWeatherData;
    confidence: ConfidenceLevel;
  }>,
  optimalQuarter: {
    quarter: Quarter;
    predictedYield: number;
    weatherData: HistoricalWeatherData;
    confidence: ConfidenceLevel;
  }
): string[] {
  const recommendations: string[] = [];
  
  // Add optimal quarter recommendation
  recommendations.push(`Plant during Q${optimalQuarter.quarter} for optimal yield of ${optimalQuarter.predictedYield.toFixed(0)} tons/ha`);
  
  // Add confidence-based recommendations
  if (optimalQuarter.confidence >= 90) {
    recommendations.push('High confidence in this recommendation based on weather data quality');
  } else if (optimalQuarter.confidence >= 80) {
    recommendations.push('Good confidence in this recommendation');
  } else {
    recommendations.push('Moderate confidence - consider monitoring weather conditions closely');
  }
  
  // Add yield comparison recommendations
  const otherQuarters = quarterResults.filter(q => q.quarter !== optimalQuarter.quarter);
  const secondBest = otherQuarters.reduce((best, current) => 
    current.predictedYield > best.predictedYield ? current : best
  );
  
  const yieldDifference = optimalQuarter.predictedYield - secondBest.predictedYield;
  const yieldDifferencePercent = (yieldDifference / optimalQuarter.predictedYield) * 100;
  
  if (yieldDifferencePercent > 20) {
    recommendations.push('Significant yield advantage over other quarters');
  } else if (yieldDifferencePercent > 10) {
    recommendations.push('Moderate yield advantage over other quarters');
  } else {
    recommendations.push('Close yield predictions across quarters - consider backup options');
  }
  
  return recommendations;
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
  return {
    year: result.year,
    optimalQuarter: {
      number: result.optimalQuarter.quarter,
      name: result.optimalQuarter.quarterName,
      months: result.optimalQuarter.quarterMonths,
      predictedYield: Math.round(result.optimalQuarter.predictedYield),
      confidence: Math.round(result.overallConfidence)
    },
    allQuarters: result.quarters.map(data => ({
      quarter: data.quarter,
      name: data.quarterName,
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
    analyzedAt: new Date(result.analysisDate).toLocaleString()
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
