/**
 * Integrated Planting Window Analysis Service
 * 
 * Combines quarter selection (96.01% accurate MLR formulas) with 7-day window analysis
 * using Open-Meteo historical data for location-specific recommendations.
 * 
 * Flow:
 * 1. Use MLR formulas with 2025-2100 data to select optimal quarter
 * 2. Fetch Open-Meteo historical data for that quarter at specific location
 * 3. Analyze 7-day windows within the quarter for best planting period
 * 4. Provide combined recommendations with confidence scoring
 */

import { 
  analyzeQuarterSelection
} from './rice-yield-prediction';
import type { QuarterSelectionResult } from '@/lib/types/prediction';
import { 
  getQuarterlyHistoricalWeatherData, 
  type LocationCoordinates,
  type WeatherDataPoint 
} from './open-meteo-api';
import { 
  findPlantingWindows, 
  type PlantingWindowAnalysis,
  type PlantingWindow,
  validateWeatherData 
} from '@/lib/utils/weather-stability';
import { Quarter } from '@/lib/types/prediction';

export interface IntegratedPlantingAnalysis {
  // Quarter Selection Results (from MLR formulas)
  quarterSelection: QuarterSelectionResult;
  optimalQuarter: Quarter;
  quarterConfidence: number; // Based on 96.01% accuracy
  
  // 7-Day Window Analysis (from Open-Meteo + stability analysis)
  windowAnalysis: PlantingWindowAnalysis | null;
  optimalWindow: PlantingWindow | null;
  windowConfidence: number;
  
  // Combined Recommendations
  overallConfidence: number; // Combined quarter + window confidence
  recommendation: {
    plantingPeriod: string; // e.g., "March 15-21, 2025"
    quarterReason: string;
    windowReason: string;
    riskLevel: 'low' | 'medium' | 'high';
    actionItems: string[];
  };
  
  // Metadata
  location: LocationCoordinates;
  year: number;
  analysisDate: string;
  dataQuality: {
    quarterData: 'excellent' | 'good' | 'fair' | 'poor';
    weatherData: 'excellent' | 'good' | 'fair' | 'poor';
    overall: 'excellent' | 'good' | 'fair' | 'poor';
  };
  
  // Additional Analysis
  fallbackOptions?: {
    alternativeQuarters: { quarter: Quarter; confidence: number }[];
    alternativeWindows: PlantingWindow[];
  };
}

export interface PlantingAnalysisRequest {
  year: number;
  location: LocationCoordinates;
  includeAlternatives?: boolean;
  useHistoricalData?: boolean; // true = use Open-Meteo historical, false = use forecast when available
  /** Optional quarter override from user (1..4). If provided, use this quarter instead of MLR optimal. */
  overrideQuarter?: Quarter;
}

export interface PlantingAnalysisValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Main integrated planting window analysis service
 */
export class PlantingWindowAnalysisService {
  
  /**
   * Perform complete planting window analysis
   */
  async analyzePlantingWindow(request: PlantingAnalysisRequest): Promise<IntegratedPlantingAnalysis> {
    // Validate request
    const validation = this.validateRequest(request);
    if (!validation.isValid) {
      throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
    }

    const { year, location, includeAlternatives = false, useHistoricalData = true } = request;

    try {
      // Step 1: Perform quarter selection using MLR formulas
      console.log(`[PlantingAnalysis] Analyzing optimal quarter for year ${year}`);
      const quarterSelection = analyzeQuarterSelection(year);
      // Use override quarter if provided, otherwise MLR optimal
      const chosenQuarter = (request.overrideQuarter ?? quarterSelection.optimalQuarter) as Quarter;
      
      // Quarter confidence is based on the 96.01% accuracy of MLR formulas
      const quarterConfidence = this.calculateQuarterConfidence(quarterSelection);

      // Step 2: Get historical weather data for the chosen quarter
      console.log(`[PlantingAnalysis] Fetching weather data for Q${chosenQuarter} at ${location.name}`);
      let weatherData: WeatherDataPoint[];
      
      try {
        if (useHistoricalData) {
          // Use previous year's data as a proxy for historical patterns
          const historicalYear = year - 1;
          weatherData = await getQuarterlyHistoricalWeatherData(location, historicalYear, chosenQuarter);
        } else {
          // For future implementation: Use forecast data when available
          weatherData = await getQuarterlyHistoricalWeatherData(location, year - 1, chosenQuarter);
        }
      } catch (error) {
        console.warn(`[PlantingAnalysis] Failed to fetch weather data: ${error}`);
        // Fallback: try with a different year
        weatherData = await getQuarterlyHistoricalWeatherData(location, 2023, chosenQuarter);
      }

      // Validate weather data
      if (!validateWeatherData(weatherData)) {
        throw new Error('Invalid weather data received from Open-Meteo API');
      }

      // Step 3: Analyze 7-day planting windows within the quarter
      console.log(`[PlantingAnalysis] Analyzing 7-day planting windows for ${weatherData.length} days of data`);
      let windowAnalysis = findPlantingWindows(weatherData, location.name, year, chosenQuarter);

      // Project window dates from reference year to target year for display
      if (windowAnalysis.windows.length > 0) {
        const projected = windowAnalysis.windows.map(w => ({
          ...w,
          startDate: this.projectDateToYear(w.startDate, year),
          endDate: this.projectDateToYear(w.endDate, year)
        }));
        const projectedOptimal = windowAnalysis.optimalWindow
          ? { ...windowAnalysis.optimalWindow, startDate: this.projectDateToYear(windowAnalysis.optimalWindow.startDate, year), endDate: this.projectDateToYear(windowAnalysis.optimalWindow.endDate, year) }
          : null;
        windowAnalysis = { ...windowAnalysis, windows: projected, optimalWindow: projectedOptimal };
      }

      const optimalWindow = windowAnalysis.optimalWindow;

      // Step 4: Calculate confidence scores
      const windowConfidence = optimalWindow ? optimalWindow.confidence : 0;
      const overallConfidence = this.calculateOverallConfidence(quarterConfidence, windowConfidence);

      // Step 5: Generate recommendations
      const recommendation = this.generateRecommendation(
        quarterSelection, 
        windowAnalysis, 
        optimalWindow, 
        overallConfidence
      );

      // Step 6: Assess data quality
      const dataQuality = this.assessDataQuality(quarterSelection, windowAnalysis, weatherData);

      // Step 7: Generate fallback options if requested
      let fallbackOptions;
      if (includeAlternatives) {
        fallbackOptions = await this.generateFallbackOptions(
          year, 
          location, 
          quarterSelection, 
          windowAnalysis
        );
      }

      return {
        quarterSelection,
        optimalQuarter: chosenQuarter,
        quarterConfidence,
        windowAnalysis,
        optimalWindow,
        windowConfidence,
        overallConfidence,
        recommendation,
        location,
        year,
        analysisDate: new Date().toISOString(),
        dataQuality,
        fallbackOptions
      };

    } catch (error) {
      console.error(`[PlantingAnalysis] Analysis failed:`, error);
      throw new Error(`Planting window analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private projectDateToYear(dateStr: string, targetYear: number): string {
    const d = new Date(dateStr);
    const projected = new Date(targetYear, d.getMonth(), d.getDate());
    return projected.toISOString().slice(0, 10);
  }

  /**
   * Validate analysis request
   */
  private validateRequest(request: PlantingAnalysisRequest): PlantingAnalysisValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate year
    if (!request.year || typeof request.year !== 'number') {
      errors.push('Year is required and must be a number');
    } else if (request.year < 2025 || request.year > 2100) {
      errors.push('Year must be between 2025 and 2100');
    }

    // Validate location
    if (!request.location) {
      errors.push('Location is required');
    } else {
      if (typeof request.location.latitude !== 'number' || 
          request.location.latitude < -90 || 
          request.location.latitude > 90) {
        errors.push('Valid latitude is required (-90 to 90)');
      }
      
      if (typeof request.location.longitude !== 'number' || 
          request.location.longitude < -180 || 
          request.location.longitude > 180) {
        errors.push('Valid longitude is required (-180 to 180)');
      }
      
      if (!request.location.name || typeof request.location.name !== 'string') {
        errors.push('Location name is required');
      }
    }

    // Warnings for edge cases
    if (request.year === new Date().getFullYear()) {
      warnings.push('Analysis for current year may have limited historical data');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate quarter confidence based on MLR formula accuracy
   */
  private calculateQuarterConfidence(quarterSelection: QuarterSelectionResult): number {
    // Base confidence from 96.01% MLR accuracy
    let confidence = 96.01;
    
    // Adjust based on yield spread (tighter spread = higher confidence)
    const yields = [
      quarterSelection.quarterlyYields.quarter1.predictedYield,
      quarterSelection.quarterlyYields.quarter2.predictedYield,
      quarterSelection.quarterlyYields.quarter3.predictedYield,
      quarterSelection.quarterlyYields.quarter4.predictedYield
    ];
    
    const minYield = Math.min(...yields);
    const maxYield = Math.max(...yields);
    const yieldSpread = (maxYield - minYield) / maxYield;
    
    // If yields are very close, reduce confidence slightly (ambiguous)
    if (yieldSpread < 0.05) {
      confidence -= 5;
    } else if (yieldSpread > 0.3) {
      // If there's a clear winner, boost confidence
      confidence += 2;
    }
    
    // Use overall confidence from quarter selection
    confidence = (confidence + quarterSelection.overallConfidence) / 2;
    
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Calculate overall confidence combining quarter and window analysis
   */
  private calculateOverallConfidence(quarterConfidence: number, windowConfidence: number): number {
    // Quarter confidence has higher weight due to 96.01% accuracy
    const quarterWeight = 0.7;
    const windowWeight = 0.3;
    
    const overall = (quarterConfidence * quarterWeight) + (windowConfidence * windowWeight);
    
    return Math.round(overall * 100) / 100;
  }

  /**
   * Generate comprehensive recommendation
   */
  private generateRecommendation(
    quarterSelection: QuarterSelectionResult,
    windowAnalysis: PlantingWindowAnalysis,
    optimalWindow: PlantingWindow | null,
    overallConfidence: number
  ) {
    const quarter = quarterSelection.optimalQuarter;
    const quarterNames = {
      1: 'Q1 (January-March)',
      2: 'Q2 (April-June)', 
      3: 'Q3 (July-September)',
      4: 'Q4 (October-December)'
    };
    
    let plantingPeriod = quarterNames[quarter];
    let windowReason = 'Quarter-level recommendation only';
    const actionItems: string[] = [];
    
    if (optimalWindow) {
      plantingPeriod = `${optimalWindow.startDate} to ${optimalWindow.endDate}`;
      windowReason = `Optimal 7-day window with ${optimalWindow.confidence.toFixed(1)}% stability confidence`;
      
      // Add specific recommendations from window analysis
      if (optimalWindow.score.recommendations.length > 0) {
        actionItems.push(...optimalWindow.score.recommendations);
      }
    }
    
    const quarterReason = `Optimal quarter based on MLR analysis (${quarterSelection.optimalYield.toFixed(0)} kg/ha predicted yield)`;
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (overallConfidence >= 85) {
      riskLevel = 'low';
    } else if (overallConfidence < 70) {
      riskLevel = 'high';
    }
    
    // Add general action items based on confidence and risk
    if (riskLevel === 'high') {
      actionItems.unshift('Consider additional risk mitigation measures');
    }
    
    if (overallConfidence >= 90) {
      actionItems.unshift('Excellent planting conditions predicted');
    }
    
    return {
      plantingPeriod,
      quarterReason,
      windowReason,
      riskLevel,
      actionItems
    };
  }

  /**
   * Assess overall data quality
   */
  private assessDataQuality(
    quarterSelection: QuarterSelectionResult,
    windowAnalysis: PlantingWindowAnalysis,
    weatherData: WeatherDataPoint[]
  ) {
    // Quarter data is always excellent (using established MLR formulas)
    const quarterData: 'excellent' = 'excellent';
    
    // Weather data quality from window analysis
    const weatherData_quality = windowAnalysis.dataQuality;
    
    // Overall quality is the minimum of both
    const qualityLevels = ['poor', 'fair', 'good', 'excellent'];
    const quarterIndex = qualityLevels.indexOf(quarterData);
    const weatherIndex = qualityLevels.indexOf(weatherData_quality);
    const overallIndex = Math.min(quarterIndex, weatherIndex);
    
    return {
      quarterData,
      weatherData: weatherData_quality,
      overall: qualityLevels[overallIndex] as 'excellent' | 'good' | 'fair' | 'poor'
    };
  }

  /**
   * Generate fallback options for alternative planning
   */
  private async generateFallbackOptions(
    year: number,
    location: LocationCoordinates,
    quarterSelection: QuarterSelectionResult,
    windowAnalysis: PlantingWindowAnalysis
  ) {
    // Alternative quarters (sorted by yield)
    const quarterYields = [
      { quarter: 1 as Quarter, yield: quarterSelection.quarterlyYields.quarter1.predictedYield, confidence: quarterSelection.quarterlyYields.quarter1.confidence },
      { quarter: 2 as Quarter, yield: quarterSelection.quarterlyYields.quarter2.predictedYield, confidence: quarterSelection.quarterlyYields.quarter2.confidence },
      { quarter: 3 as Quarter, yield: quarterSelection.quarterlyYields.quarter3.predictedYield, confidence: quarterSelection.quarterlyYields.quarter3.confidence },
      { quarter: 4 as Quarter, yield: quarterSelection.quarterlyYields.quarter4.predictedYield, confidence: quarterSelection.quarterlyYields.quarter4.confidence }
    ];
    
    const alternativeQuarters = quarterYields
      .filter(q => q.quarter !== quarterSelection.optimalQuarter)
      .sort((a, b) => b.yield - a.yield)
      .slice(0, 2) // Top 2 alternatives
      .map(q => ({ quarter: q.quarter, confidence: q.confidence }));
    
    // Alternative windows (next best options)
    const alternativeWindows = windowAnalysis.windows
      .filter(w => w !== windowAnalysis.optimalWindow)
      .slice(0, 3); // Top 3 alternatives
    
    return {
      alternativeQuarters,
      alternativeWindows
    };
  }
}

// Export singleton instance
export const plantingWindowAnalysisService = new PlantingWindowAnalysisService();

// Convenience function for quick analysis
export async function analyzePlantingWindow(request: PlantingAnalysisRequest): Promise<IntegratedPlantingAnalysis> {
  return plantingWindowAnalysisService.analyzePlantingWindow(request);
}
