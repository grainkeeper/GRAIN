import type { LocationCoordinates, WeatherDataPoint } from '@/lib/services/open-meteo-api';
import type { PlantingDayAnalysis } from '@/lib/services/daily-forecast-analysis';

/**
 * TypeScript interfaces for Rice Yield Prediction System
 * 
 * This file defines the data structures used throughout the prediction system,
 * including historical weather data, prediction results, and related types.
 */

// ============================================================================
// HISTORICAL WEATHER DATA STRUCTURES (2025-2100)
// ============================================================================

/**
 * Individual weather data point from the 2025-2100 historical dataset
 * Contains the geoclimatic variables used in the MLR formulas
 */
export interface HistoricalWeatherData {
  /** Temperature in Celsius (°C) - T variable in MLR formulas */
  temperature: number;
  
  /** Dew Point in Celsius (°C) - D variable in MLR formulas */
  dewPoint: number;
  
  /** Precipitation in millimeters (mm) - P variable in MLR formulas */
  precipitation: number;
  
  /** Wind Speed in kilometers per hour (km/h) - W variable in MLR formulas */
  windSpeed: number;
  
  /** Relative Humidity as percentage (%) - H variable in MLR formulas */
  humidity: number;
  
  /** Date of the weather data point */
  date: string; // ISO 8601 format: "2025-01-15"
  
  /** Location identifier (optional, for location-specific data) */
  location?: string;
}

/**
 * Quarterly weather data aggregation for a specific year
 * Contains averaged weather data for each quarter (Q1-Q4)
 */
export interface QuarterlyWeatherData {
  /** Year of the data */
  year: number;
  
  /** Quarter 1 weather data (Jan-Mar) */
  quarter1: HistoricalWeatherData;
  
  /** Quarter 2 weather data (Apr-Jun) */
  quarter2: HistoricalWeatherData;
  
  /** Quarter 3 weather data (Jul-Sep) */
  quarter3: HistoricalWeatherData;
  
  /** Quarter 4 weather data (Oct-Dec) */
  quarter4: HistoricalWeatherData;
}

/**
 * Complete historical weather dataset for 2025-2100
 * Organized by year and quarter for easy access
 */
export interface HistoricalWeatherDataset {
  /** Start year of the dataset */
  startYear: number; // 2025
  
  /** End year of the dataset */
  endYear: number; // 2100
  
  /** Weather data organized by year */
  data: Record<number, QuarterlyWeatherData>;
  
  /** Metadata about the dataset */
  metadata: {
    /** Data source description */
    source: string;
    
    /** Data format version */
    version: string;
    
    /** Last updated timestamp */
    lastUpdated: string;
    
    /** Data coverage information */
    coverage: {
      /** Number of years covered */
      years: number;
      
      /** Number of quarters covered */
      quarters: number;
      
      /** Geographic coverage */
      regions: string[];
    };
  };
}

// ============================================================================
// PREDICTION RESULT STRUCTURES
// ============================================================================

/**
 * Result of quarter selection analysis
 * Shows predicted yields for all quarters and the optimal choice
 */
export interface QuarterSelectionResult {
  /** Year analyzed */
  year: number;
  
  /** Analysis timestamp */
  analysisDate: string;
  
  /** Predicted yields for each quarter */
  quarters: Array<{
    quarter: Quarter;
    predictedYield: number;
    weatherData: HistoricalWeatherData;
    confidence: ConfidenceLevel;
    quarterName: string;
    quarterMonths: { start: string; end: string };
  }>;
  
  /** Optimal quarter for planting */
  optimalQuarter: {
    quarter: Quarter;
    predictedYield: number;
    weatherData: HistoricalWeatherData;
    confidence: ConfidenceLevel;
    quarterName: string;
    quarterMonths: { start: string; end: string };
  };
  
  /** Overall confidence in the prediction */
  overallConfidence: ConfidenceLevel;
  
  /** Recommendations based on analysis */
  recommendations: string[];
}

/**
 * 7-day planting window within a quarter
 * Represents the optimal 7-day period for planting
 */
export interface PlantingWindow {
  /** Start date of the 7-day window */
  startDate: string; // ISO 8601 format
  
  /** End date of the 7-day window */
  endDate: string; // ISO 8601 format
  
  /** Weather stability score (0-100) */
  weatherStability: number;
  
  /** Confidence level in this recommendation (0-100) */
  confidence: number;
  
  /** Average temperature during the window */
  averageTemperature: number;
  
  /** Average precipitation during the window */
  averagePrecipitation: number;
  
  /** Risk factors identified */
  riskFactors: string[];
  
  /** Recommendations for this window */
  recommendations: string[];
}

/**
 * Complete prediction result combining quarter selection and 7-day window
 */
export interface RiceYieldPrediction {
  /** Quarter selection result */
  quarterSelection: QuarterSelectionResult;
  
  /** Optimal 7-day planting windows (primary + alternatives) */
  plantingWindows: {
    /** Primary recommendation */
    primary: PlantingWindow;
    
    /** Alternative windows if primary is not feasible */
    alternatives: PlantingWindow[];
  };
  
  /** Location used for the prediction */
  location: {
    region?: string;
    province?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  /** Prediction metadata */
  metadata: {
    /** Prediction timestamp */
    predictedAt: string;
    
    /** Data sources used */
    dataSources: string[];
    
    /** Model version used */
    modelVersion: string;
    
    /** Accuracy rating based on historical performance */
    accuracyRating: number; // 0-100
  };
}

// ============================================================================
// API REQUEST/RESPONSE STRUCTURES
// ============================================================================

/**
 * Request payload for quarter selection API
 */
export interface QuarterSelectionRequest {
  /** Year to analyze (2025-2100) */
  year: number;
  
  /** Optional location for context */
  location?: {
    region?: string;
    province?: string;
    city?: string;
  };
}

/**
 * Request payload for planting window analysis API
 */
export interface PlantingWindowRequest {
  /** Year to analyze */
  year: number;
  
  /** Quarter to analyze (1-4) */
  quarter: 1 | 2 | 3 | 4;
  
  /** Location for weather analysis */
  location: {
    region?: string;
    province?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

/**
 * API response wrapper for prediction results
 */
export interface PredictionResponse<T> {
  /** Success status */
  success: boolean;
  
  /** Response data */
  data?: T;
  
  /** Error message if failed */
  error?: string;
  
  /** Response timestamp */
  timestamp: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Quarter type for type safety
 */
export type Quarter = 1 | 2 | 3 | 4;

/**
 * Year range for the historical dataset
 */
export type HistoricalYear = number; // 2025-2100

/**
 * Confidence level type
 */
export type ConfidenceLevel = number; // 0-100

/**
 * Weather stability score type
 */
export type WeatherStabilityScore = number; // 0-100

export interface PlantingWindowAnalysis {
  location: LocationCoordinates;
  forecastPeriod: string;
  dailyAnalysis: PlantingDayAnalysis[];
  summary: {
    totalDays: number;
    plantableDays: number;
    bestPlantingDays: PlantingDayAnalysis[];
    overallRecommendation: string;
    nextUpdateDate: string;
    weatherTrends: {
      temperatureTrend: 'stable' | 'rising' | 'falling';
      precipitationTrend: 'dry' | 'moderate' | 'wet';
      windTrend: 'calm' | 'moderate' | 'windy';
    };
  };
}

export interface SavedPlantingAnalysis {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  forecast_period: string;
  plantable_days: number;
  total_days: number;
  excellent_days: number;
  overall_recommendation: string;
  next_update_date: string;
  weather_trends: {
    temperature_trend: 'stable' | 'rising' | 'falling';
    precipitation_trend: 'dry' | 'moderate' | 'wet';
    wind_trend: 'calm' | 'moderate' | 'windy';
  };
  best_planting_days: Array<{
    date: string;
    suitability_score: number;
    weather_summary: {
      temperature: string;
      precipitation: string;
      wind_speed: string;
      humidity: string;
    };
  }>;
  created_at: string;
  updated_at: string;
}
