/**
 * Weather Stability Analysis Utilities
 * 
 * Provides functions to analyze weather stability and calculate scores
 * for 7-day planting windows within selected quarters.
 */

import { WeatherDataPoint } from '@/lib/services/open-meteo-api';

export interface WeatherStabilityScore {
  overallScore: number; // 0-100, higher is better
  temperatureStability: number; // 0-100
  precipitationScore: number; // 0-100
  windStability: number; // 0-100
  humidityStability: number; // 0-100
  factors: {
    temperatureVariance: number;
    precipitationTotal: number;
    precipitationDays: number;
    windVariance: number;
    humidityVariance: number;
    extremeEvents: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PlantingWindow {
  startDate: string;
  endDate: string;
  score: WeatherStabilityScore;
  weatherData: WeatherDataPoint[];
  confidence: number;
}

export interface PlantingWindowAnalysis {
  location: string;
  year: number;
  quarter: number;
  windows: PlantingWindow[];
  optimalWindow: PlantingWindow | null;
  analysisDate: string;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Optimal weather ranges for rice planting (based on agricultural research)
const OPTIMAL_WEATHER_RANGES = {
  temperature: { min: 20, max: 35, optimal: 25 }, // Celsius
  precipitation: { min: 0, max: 50, optimal: 10 }, // mm per day
  windSpeed: { min: 0, max: 25, optimal: 8 }, // km/h
  humidity: { min: 60, max: 90, optimal: 75 } // %
};

// Penalty weights for different weather factors
const STABILITY_WEIGHTS = {
  temperature: 0.35, // Most important for rice growth
  precipitation: 0.25, // Critical for water availability
  windSpeed: 0.20, // Affects plant stress
  humidity: 0.20  // Affects transpiration
};

/**
 * Calculate weather stability score for a 7-day window
 */
export function calculateWeatherStabilityScore(weatherData: WeatherDataPoint[]): WeatherStabilityScore {
  if (weatherData.length === 0) {
    return createEmptyStabilityScore();
  }

  // Calculate basic statistics
  const temperatures = weatherData.map(d => d.temperature);
  const precipitations = weatherData.map(d => d.precipitation);
  const windSpeeds = weatherData.map(d => d.windSpeed);
  const humidities = weatherData.map(d => d.humidity);

  // Calculate variances and averages
  const tempStats = calculateStatistics(temperatures);
  const precipStats = calculateStatistics(precipitations);
  const windStats = calculateStatistics(windSpeeds);
  const humidityStats = calculateStatistics(humidities);

  // Calculate individual stability scores
  const temperatureStability = calculateTemperatureStability(tempStats);
  const precipitationScore = calculatePrecipitationScore(precipStats, weatherData.length);
  const windStability = calculateWindStability(windStats);
  const humidityStability = calculateHumidityStability(humidityStats);

  // Calculate overall score
  const overallScore = 
    temperatureStability * STABILITY_WEIGHTS.temperature +
    precipitationScore * STABILITY_WEIGHTS.precipitation +
    windStability * STABILITY_WEIGHTS.windSpeed +
    humidityStability * STABILITY_WEIGHTS.humidity;

  // Identify extreme events
  const extremeEvents = countExtremeEvents(weatherData);

  // Generate recommendations
  const recommendations = generateRecommendations({
    temperatureStability,
    precipitationScore,
    windStability,
    humidityStability,
    tempStats,
    precipStats,
    windStats,
    humidityStats,
    extremeEvents
  });

  // Determine risk level
  const riskLevel = determineRiskLevel(overallScore, extremeEvents);

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    temperatureStability: Math.round(temperatureStability * 100) / 100,
    precipitationScore: Math.round(precipitationScore * 100) / 100,
    windStability: Math.round(windStability * 100) / 100,
    humidityStability: Math.round(humidityStability * 100) / 100,
    factors: {
      temperatureVariance: tempStats.variance,
      precipitationTotal: precipStats.sum,
      precipitationDays: precipStats.nonZeroCount,
      windVariance: windStats.variance,
      humidityVariance: humidityStats.variance,
      extremeEvents
    },
    recommendations,
    riskLevel
  };
}

/**
 * Find optimal 7-day planting windows within a quarter
 */
export function findPlantingWindows(
  weatherData: WeatherDataPoint[],
  location: string,
  year: number,
  quarter: number
): PlantingWindowAnalysis {
  const windows: PlantingWindow[] = [];
  
  // Need at least 7 days of data
  if (weatherData.length < 7) {
    return {
      location,
      year,
      quarter,
      windows: [],
      optimalWindow: null,
      analysisDate: new Date().toISOString(),
      dataQuality: 'poor'
    };
  }

  // Generate all possible 7-day windows
  for (let i = 0; i <= weatherData.length - 7; i++) {
    const windowData = weatherData.slice(i, i + 7);
    const startDate = windowData[0].date;
    const endDate = windowData[6].date;
    
    const score = calculateWeatherStabilityScore(windowData);
    
    // Calculate confidence based on data quality and consistency
    const confidence = calculateWindowConfidence(windowData, score);
    
    windows.push({
      startDate,
      endDate,
      score,
      weatherData: windowData,
      confidence
    });
  }

  // Sort windows by score (highest first)
  windows.sort((a, b) => b.score.overallScore - a.score.overallScore);

  // Find optimal window (highest score with good confidence)
  const optimalWindow = windows.find(w => w.confidence >= 70) || windows[0] || null;

  // Assess data quality
  const dataQuality = assessDataQuality(weatherData);

  return {
    location,
    year,
    quarter,
    windows,
    optimalWindow,
    analysisDate: new Date().toISOString(),
    dataQuality
  };
}

/**
 * Calculate basic statistics for a dataset
 */
function calculateStatistics(values: number[]) {
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const nonZeroCount = values.filter(v => v > 0).length;
  
  return { sum, mean, variance, nonZeroCount, min: Math.min(...values), max: Math.max(...values) };
}

/**
 * Calculate temperature stability score
 */
function calculateTemperatureStability(stats: ReturnType<typeof calculateStatistics>): number {
  const { mean, variance, min, max } = stats;
  const optimal = OPTIMAL_WEATHER_RANGES.temperature.optimal;
  
  // Base score from distance from optimal temperature
  const distanceFromOptimal = Math.abs(mean - optimal);
  const baseScore = Math.max(0, 1 - distanceFromOptimal / 15); // 15°C tolerance
  
  // Variance penalty (lower variance is better)
  const variancePenalty = Math.min(1, variance / 25); // 25°C² variance threshold
  
  // Extreme temperature penalty
  const extremePenalty = 
    (Math.max(0, min - OPTIMAL_WEATHER_RANGES.temperature.min) + 
     Math.max(0, OPTIMAL_WEATHER_RANGES.temperature.max - max)) / 10;
  
  return Math.max(0, baseScore - variancePenalty * 0.3 - extremePenalty * 0.2);
}

/**
 * Calculate precipitation score
 */
function calculatePrecipitationScore(stats: ReturnType<typeof calculateStatistics>, totalDays: number): number {
  const { sum, nonZeroCount } = stats;
  const avgDailyPrecip = sum / totalDays;
  
  // Optimal daily precipitation is around 10mm
  const distanceFromOptimal = Math.abs(avgDailyPrecip - OPTIMAL_WEATHER_RANGES.precipitation.optimal);
  const baseScore = Math.max(0, 1 - distanceFromOptimal / 20); // 20mm tolerance
  
  // Bonus for consistent light rain (better than heavy sporadic rain)
  const consistencyBonus = nonZeroCount / totalDays * 0.3;
  
  // Penalty for too much rain
  const heavyRainPenalty = Math.max(0, (avgDailyPrecip - 30) / 20) * 0.4;
  
  return Math.max(0, Math.min(1, baseScore + consistencyBonus - heavyRainPenalty));
}

/**
 * Calculate wind stability score
 */
function calculateWindStability(stats: ReturnType<typeof calculateStatistics>): number {
  const { mean, variance } = stats;
  const optimal = OPTIMAL_WEATHER_RANGES.windSpeed.optimal;
  
  // Base score from distance from optimal wind speed
  const distanceFromOptimal = Math.abs(mean - optimal);
  const baseScore = Math.max(0, 1 - distanceFromOptimal / 15);
  
  // Variance penalty (consistent wind is better)
  const variancePenalty = Math.min(1, variance / 50);
  
  return Math.max(0, baseScore - variancePenalty * 0.2);
}

/**
 * Calculate humidity stability score
 */
function calculateHumidityStability(stats: ReturnType<typeof calculateStatistics>): number {
  const { mean, variance } = stats;
  const optimal = OPTIMAL_WEATHER_RANGES.humidity.optimal;
  
  // Base score from distance from optimal humidity
  const distanceFromOptimal = Math.abs(mean - optimal);
  const baseScore = Math.max(0, 1 - distanceFromOptimal / 20);
  
  // Variance penalty (consistent humidity is better)
  const variancePenalty = Math.min(1, variance / 100);
  
  return Math.max(0, baseScore - variancePenalty * 0.2);
}

/**
 * Count extreme weather events
 */
function countExtremeEvents(weatherData: WeatherDataPoint[]): number {
  let count = 0;
  
  for (const data of weatherData) {
    // Extreme temperature
    if (data.temperature < 15 || data.temperature > 40) count++;
    
    // Heavy precipitation
    if (data.precipitation > 50) count++;
    
    // High winds
    if (data.windSpeed > 30) count++;
    
    // Extreme humidity
    if (data.humidity < 40 || data.humidity > 95) count++;
  }
  
  return count;
}

/**
 * Generate recommendations based on weather analysis
 */
function generateRecommendations(params: {
  temperatureStability: number;
  precipitationScore: number;
  windStability: number;
  humidityStability: number;
  tempStats: ReturnType<typeof calculateStatistics>;
  precipStats: ReturnType<typeof calculateStatistics>;
  windStats: ReturnType<typeof calculateStatistics>;
  humidityStats: ReturnType<typeof calculateStatistics>;
  extremeEvents: number;
}): string[] {
  const recommendations: string[] = [];
  const { tempStats, precipStats, windStats, extremeEvents } = params;
  
  // Temperature recommendations
  if (tempStats.mean < 20) {
    recommendations.push('Consider delaying planting until temperatures warm up');
  } else if (tempStats.mean > 35) {
    recommendations.push('Monitor for heat stress and ensure adequate irrigation');
  }
  
  if (tempStats.variance > 20) {
    recommendations.push('High temperature variability - consider shorter planting window');
  }
  
  // Precipitation recommendations
  if (precipStats.sum < 20) {
    recommendations.push('Low rainfall expected - ensure irrigation systems are ready');
  } else if (precipStats.sum > 200) {
    recommendations.push('Heavy rainfall expected - monitor for flooding and drainage');
  }
  
  // Wind recommendations
  if (windStats.mean > 20) {
    recommendations.push('High winds expected - consider wind protection measures');
  }
  
  // Extreme events
  if (extremeEvents > 2) {
    recommendations.push('Multiple extreme weather events expected - consider alternative timing');
  }
  
  // General recommendations
  if (params.temperatureStability > 0.8 && params.precipitationScore > 0.7) {
    recommendations.push('Excellent planting conditions expected');
  }
  
  return recommendations;
}

/**
 * Determine risk level based on score and extreme events
 */
function determineRiskLevel(overallScore: number, extremeEvents: number): 'low' | 'medium' | 'high' {
  if (overallScore >= 0.8 && extremeEvents <= 1) return 'low';
  if (overallScore >= 0.6 && extremeEvents <= 3) return 'medium';
  return 'high';
}

/**
 * Calculate confidence level for a planting window
 */
function calculateWindowConfidence(weatherData: WeatherDataPoint[], score: WeatherStabilityScore): number {
  let confidence = score.overallScore * 100;
  
  // Boost confidence for consistent data
  if (weatherData.length === 7) confidence += 10;
  
  // Reduce confidence for extreme events
  confidence -= score.factors.extremeEvents * 5;
  
  // Boost confidence for good temperature stability
  if (score.temperatureStability > 0.8) confidence += 5;
  
  return Math.max(0, Math.min(100, confidence));
}

/**
 * Assess data quality based on completeness and consistency
 */
function assessDataQuality(weatherData: WeatherDataPoint[]): 'excellent' | 'good' | 'fair' | 'poor' {
  if (weatherData.length < 7) return 'poor';
  if (weatherData.length >= 90) return 'excellent';
  if (weatherData.length >= 60) return 'good';
  return 'fair';
}

/**
 * Create empty stability score for error cases
 */
function createEmptyStabilityScore(): WeatherStabilityScore {
  return {
    overallScore: 0,
    temperatureStability: 0,
    precipitationScore: 0,
    windStability: 0,
    humidityStability: 0,
    factors: {
      temperatureVariance: 0,
      precipitationTotal: 0,
      precipitationDays: 0,
      windVariance: 0,
      humidityVariance: 0,
      extremeEvents: 0
    },
    recommendations: ['Insufficient weather data for analysis'],
    riskLevel: 'high'
  };
}

/**
 * Validate weather data points
 */
export function validateWeatherData(data: WeatherDataPoint[]): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;
  
  for (const point of data) {
    if (!point.date || 
        typeof point.temperature !== 'number' ||
        typeof point.dewPoint !== 'number' ||
        typeof point.precipitation !== 'number' ||
        typeof point.windSpeed !== 'number' ||
        typeof point.humidity !== 'number') {
      return false;
    }
  }
  
  return true;
}
