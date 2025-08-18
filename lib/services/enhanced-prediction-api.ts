// Enhanced Prediction API Model
// Finds optimal 7-day planting windows within quarters using live weather forecasts
import { logger } from '@/lib/utils/logger'

export interface PlantingWindowRequest {
  location: {
    region: string;
    province: string;
    city: string;
    barangay: string;
  };
  year: number;
  quarter: number;
  riceVariety: string;
}

export interface DailyWeatherData {
  date: string;
  temperature: number;
  dewPoint: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  condition: string;
  icon: string;
}

export interface SevenDayWindow {
  startDate: string;
  endDate: string;
  averageYield: number;
  dailyYields: number[];
  weatherStability: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface PlantingWindowResponse {
  location: string;
  year: number;
  quarter: number;
  riceVariety: string;
  optimalWindows: SevenDayWindow[];
  quarterAverage: number;
  analysis: {
    bestMonth: string;
    weatherTrend: string;
    riskAssessment: string;
    farmingAdvice: string[];
  };
}

export class EnhancedPredictionAPI {
  private weatherAPI: any; // WeatherAPI service
  private predictionModel: any; // Your MLR model

  constructor(weatherAPI: any, predictionModel: any) {
    this.weatherAPI = weatherAPI;
    this.predictionModel = predictionModel;
  }

  /**
   * Main API method: Find best 7-day planting windows within a quarter
   */
  async findOptimalPlantingWindows(request: PlantingWindowRequest): Promise<PlantingWindowResponse> {
    try {
      logger.info(`Finding optimal planting windows for ${request.location.province}, Q${request.quarter} ${request.year}`);

      // 1. Get quarter date range
      const quarterDates = this.getQuarterDateRange(request.year, request.quarter);
      
      // 2. Fetch live weather forecast for the entire quarter
      const locationString = this.buildLocationString(request.location);
      const weatherForecast = await this.getQuarterlyWeatherForecast(locationString, quarterDates);
      
      // 3. Analyze every 7-day window within the quarter
      const sevenDayWindows = this.analyzeSevenDayWindows(weatherForecast, request.quarter);
      
      // 4. Rank windows by optimal conditions
      const optimalWindows = this.rankOptimalWindows(sevenDayWindows);
      
      // 5. Generate comprehensive analysis
      const analysis = this.generateQuarterAnalysis(optimalWindows, weatherForecast, request.quarter);
      
      return {
        location: locationString,
        year: request.year,
        quarter: request.quarter,
        riceVariety: request.riceVariety,
        optimalWindows: optimalWindows.slice(0, 5), // Top 5 windows
        quarterAverage: this.calculateQuarterAverage(weatherForecast, request.quarter),
        analysis
      };

    } catch (error: any) {
      logger.error('Error finding optimal planting windows:', error);
      throw new Error(`Failed to find optimal planting windows: ${error.message}`);
    }
  }

  /**
   * Get quarter date range (3 months)
   */
  private getQuarterDateRange(year: number, quarter: number): { startDate: string; endDate: string } {
    const quarterMonths = {
      1: { start: 1, end: 3 },   // Jan-Mar
      2: { start: 4, end: 6 },   // Apr-Jun
      3: { start: 7, end: 9 },   // Jul-Sep
      4: { start: 10, end: 12 }  // Oct-Dec
    };

    const { start, end } = quarterMonths[quarter as keyof typeof quarterMonths];
    return {
      startDate: `${year}-${start.toString().padStart(2, '0')}-01`,
      endDate: `${year}-${end.toString().padStart(2, '0')}-${this.getLastDayOfMonth(year, end)}`
    };
  }

  /**
   * Get last day of month
   */
  private getLastDayOfMonth(year: number, month: number): string {
    const lastDay = new Date(year, month, 0).getDate();
    return lastDay.toString().padStart(2, '0');
  }

  /**
   * Fetch weather forecast for entire quarter
   */
  private async getQuarterlyWeatherForecast(location: string, dateRange: { startDate: string; endDate: string }): Promise<DailyWeatherData[]> {
    const weatherData: DailyWeatherData[] = [];
    
    // Get current date
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // If quarter is in the future, use forecast data (max 14 days)
    if (startDate > now) {
      const daysDiff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 14) {
        // Within forecast range, get actual forecast
        console.log(`🌤️ Fetching real weather forecast for ${location} (${daysDiff} days)`);
        const forecast = await this.weatherAPI.getWeatherForecast(location, Math.min(daysDiff, 14));
        return forecast.map((day: any) => ({
          date: day.date,
          temperature: day.temp_c,
          dewPoint: day.dewpoint_c,
          precipitation: day.precip_mm,
          windSpeed: day.wind_kph,
          humidity: day.humidity,
          condition: day.text,
          icon: day.icon
        }));
      } else {
        // Beyond forecast range - use historical patterns from same quarter
        console.log(`📊 Using historical weather patterns for ${location} (quarter ${daysDiff} days in future)`);
        return this.getHistoricalQuarterPattern(location, startDate, endDate);
      }
    }
    
    // If quarter is in the past, use historical data
    if (startDate <= now) {
      console.log(`📚 Fetching historical weather data for ${location} (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`);
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        try {
          const historicalData = await this.weatherAPI.getHistoricalWeather(location, dateString);
          weatherData.push({
            date: dateString,
            temperature: historicalData.temp_c,
            dewPoint: historicalData.dewpoint_c,
            precipitation: historicalData.precip_mm,
            windSpeed: historicalData.wind_kph,
            humidity: historicalData.humidity,
            condition: historicalData.text,
            icon: historicalData.icon
          });
        } catch (error) {
          console.warn(`No historical data available for ${dateString}`);
          // Skip days without historical data instead of using mock data
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      if (weatherData.length === 0) {
        throw new Error(`No historical weather data available for ${location} for the selected period. Please try a different location or time period.`);
      }
    }
    
    return weatherData;
  }

  /**
   * Get historical weather patterns for the same quarter in previous years
   */
  private async getHistoricalQuarterPattern(location: string, startDate: Date, endDate: Date): Promise<DailyWeatherData[]> {
    const weatherData: DailyWeatherData[] = [];
    const currentYear = new Date().getFullYear();
    
    // Try to get data from the same quarter in previous years (last 3 years)
    for (let yearOffset = 1; yearOffset <= 3; yearOffset++) {
      const historicalYear = currentYear - yearOffset;
      const historicalStartDate = new Date(historicalYear, startDate.getMonth(), startDate.getDate());
      const historicalEndDate = new Date(historicalYear, endDate.getMonth(), endDate.getDate());
      
      console.log(`📈 Trying historical data from ${historicalYear} (${historicalStartDate.toISOString().split('T')[0]} to ${historicalEndDate.toISOString().split('T')[0]})`);
      
      const currentDate = new Date(historicalStartDate);
      let daysFound = 0;
      
      while (currentDate <= historicalEndDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        try {
          const historicalData = await this.weatherAPI.getHistoricalWeather(location, dateString);
          weatherData.push({
            date: new Date(startDate.getTime() + (currentDate.getTime() - historicalStartDate.getTime())).toISOString().split('T')[0], // Map to future date
            temperature: historicalData.temp_c,
            dewPoint: historicalData.dewpoint_c,
            precipitation: historicalData.precip_mm,
            windSpeed: historicalData.wind_kph,
            humidity: historicalData.humidity,
            condition: historicalData.text,
            icon: historicalData.icon
          });
          daysFound++;
        } catch (error) {
          // Continue to next day
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // If we found enough data (at least 60 days), use this pattern
      if (daysFound >= 60) {
        console.log(`✅ Found ${daysFound} days of historical weather pattern from ${historicalYear}`);
        return weatherData;
      }
    }
    
    // If no historical pattern found, throw error
    throw new Error(`Cannot provide weather data for ${location} - no historical patterns available for this quarter. Please select a quarter within the next 14 days or try a different location.`);
  }

  /**
   * Analyze all possible 7-day windows within the quarter
   */
  private analyzeSevenDayWindows(weatherData: DailyWeatherData[], quarter: number): SevenDayWindow[] {
    const windows: SevenDayWindow[] = [];
    
    // Slide 7-day window through all available days
    for (let i = 0; i <= weatherData.length - 7; i++) {
      const windowData = weatherData.slice(i, i + 7);
      const window = this.calculateWindowMetrics(windowData, quarter);
      windows.push(window);
    }
    
    return windows;
  }

  /**
   * Calculate metrics for a 7-day window
   */
  private calculateWindowMetrics(windowData: DailyWeatherData[], quarter: number): SevenDayWindow {
    const dailyYields: number[] = [];
    let totalYield = 0;
    
    // Calculate daily yields using your MLR model
    windowData.forEach(day => {
      const predictedYield = this.predictDailyYield(day, quarter);
      dailyYields.push(predictedYield);
      totalYield += predictedYield;
    });
    
    const averageYield = totalYield / 7;
    const weatherStability = this.calculateWeatherStability(windowData);
    const confidence = this.calculateConfidence(windowData, averageYield, quarter);
    
    // Debug logging
    console.log(`🔍 Window ${windowData[0].date} to ${windowData[6].date}:`);
    console.log(`   - Average Yield: ${averageYield.toFixed(0)} kg/ha`);
    console.log(`   - Weather Stability: ${weatherStability.toFixed(1)}%`);
    console.log(`   - Confidence: ${confidence.toFixed(1)}%`);
    const riskFactors = this.identifyRiskFactors(windowData);
    const recommendations = this.generateRecommendations(windowData, averageYield);
    
    return {
      startDate: windowData[0].date,
      endDate: windowData[6].date,
      averageYield,
      dailyYields,
      weatherStability,
      confidence,
      riskFactors,
      recommendations
    };
  }

  /**
   * Predict daily yield using your MLR model
   */
  private predictDailyYield(weather: DailyWeatherData, quarter: number): number {
    const { temperature, dewPoint, precipitation, windSpeed, humidity } = weather;
    
    switch (quarter) {
      case 1:
        return this.predictionModel.predictQuarter1(temperature, dewPoint, precipitation, windSpeed, humidity);
      case 2:
        return this.predictionModel.predictQuarter2(temperature, dewPoint, precipitation, windSpeed, humidity);
      case 3:
        return this.predictionModel.predictQuarter3(temperature, dewPoint, precipitation, windSpeed, humidity);
      case 4:
        return this.predictionModel.predictQuarter4(temperature, dewPoint, precipitation, windSpeed, humidity);
      default:
        throw new Error(`Invalid quarter: ${quarter}`);
    }
  }

  /**
   * Calculate weather stability (consistency of conditions)
   */
  private calculateWeatherStability(windowData: DailyWeatherData[]): number {
    const temps = windowData.map(d => d.temperature);
    const precip = windowData.map(d => d.precipitation);
    const humidity = windowData.map(d => d.humidity);
    
    const tempVariance = this.calculateVariance(temps);
    const precipVariance = this.calculateVariance(precip);
    const humidityVariance = this.calculateVariance(humidity);
    
    // Lower variance = higher stability
    const stability = 100 - ((tempVariance + precipVariance + humidityVariance) / 3);
    return Math.max(0, Math.min(100, stability));
  }

  /**
   * Calculate confidence level based on weather consistency
   */
  private calculateConfidence(windowData: DailyWeatherData[], averageYield: number, quarter: number): number {
    const yields = windowData.map(d => this.predictDailyYield(d, quarter));
    const weatherStability = this.calculateWeatherStability(windowData);
    
    // Calculate yield consistency (how much yields vary relative to average)
    const avgYield = yields.reduce((sum, y) => sum + y, 0) / yields.length;
    const yieldDeviations = yields.map(y => Math.abs(y - avgYield));
    const maxDeviation = Math.max(...yieldDeviations);
    const avgDeviation = yieldDeviations.reduce((sum, d) => sum + d, 0) / yieldDeviations.length;
    
    // Yield consistency: lower deviation = higher consistency
    const yieldConsistency = avgYield !== 0 ? Math.max(0, 100 - (avgDeviation / Math.abs(avgYield)) * 100) : 100;
    
    // Higher stability and higher yield consistency = higher confidence
    const confidence = (weatherStability * 0.6) + (yieldConsistency * 0.4);
    
    // Debug confidence calculation
    console.log(`   - Average Yield: ${avgYield.toFixed(0)} kg/ha`);
    console.log(`   - Average Deviation: ${avgDeviation.toFixed(0)} kg/ha`);
    console.log(`   - Yield Consistency: ${yieldConsistency.toFixed(1)}%`);
    console.log(`   - Confidence Formula: (${weatherStability.toFixed(1)} * 0.6) + (${yieldConsistency.toFixed(1)} * 0.4) = ${confidence.toFixed(1)}%`);
    
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Identify potential risk factors
   */
  private identifyRiskFactors(windowData: DailyWeatherData[]): string[] {
    const risks: string[] = [];
    
    const avgTemp = windowData.reduce((sum, d) => sum + d.temperature, 0) / 7;
    const avgPrecip = windowData.reduce((sum, d) => sum + d.precipitation, 0) / 7;
    const maxWind = Math.max(...windowData.map(d => d.windSpeed));
    
    if (avgTemp > 35) risks.push('High temperature stress');
    if (avgTemp < 20) risks.push('Low temperature stress');
    if (avgPrecip > 300) risks.push('Excessive rainfall');
    if (avgPrecip < 50) risks.push('Drought conditions');
    if (maxWind > 20) risks.push('High wind damage risk');
    
    return risks;
  }

  /**
   * Generate farming recommendations
   */
  private generateRecommendations(windowData: DailyWeatherData[], averageYield: number): string[] {
    const recommendations: string[] = [];
    
    if (averageYield > 8000000) {
      recommendations.push('Excellent conditions - maximize planting area');
      recommendations.push('Consider high-yield rice varieties');
    } else if (averageYield > 5000000) {
      recommendations.push('Good conditions - proceed with normal planting');
      recommendations.push('Monitor weather closely');
    } else if (averageYield > 0) {
      recommendations.push('Moderate conditions - reduce planting area');
      recommendations.push('Consider drought-resistant varieties');
    } else {
      recommendations.push('Poor conditions - delay planting if possible');
      recommendations.push('Consider alternative crops');
    }
    
    return recommendations;
  }

  /**
   * Rank windows by optimal conditions
   */
  private rankOptimalWindows(windows: SevenDayWindow[]): SevenDayWindow[] {
    return windows.sort((a, b) => {
      // Primary: Average yield (higher is better)
      if (Math.abs(a.averageYield - b.averageYield) > 100000) {
        return b.averageYield - a.averageYield;
      }
      
      // Secondary: Weather stability (higher is better)
      if (Math.abs(a.weatherStability - b.weatherStability) > 10) {
        return b.weatherStability - a.weatherStability;
      }
      
      // Tertiary: Confidence level (higher is better)
      return b.confidence - a.confidence;
    });
  }

  /**
   * Generate comprehensive quarter analysis
   */
  private generateQuarterAnalysis(optimalWindows: SevenDayWindow[], weatherData: DailyWeatherData[], quarter: number): any {
    const bestWindow = optimalWindows[0];
    const quarterYields = weatherData.map(d => this.predictDailyYield(d, quarter));
    const avgQuarterYield = quarterYields.reduce((sum, y) => sum + y, 0) / quarterYields.length;
    
    // Find best month
    const monthlyAverages = this.calculateMonthlyAverages(weatherData, quarter);
    const bestMonth = Object.entries(monthlyAverages).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    return {
      bestMonth,
      weatherTrend: this.analyzeWeatherTrend(weatherData),
      riskAssessment: this.assessQuarterRisks(weatherData),
      farmingAdvice: this.generateQuarterAdvice(optimalWindows, avgQuarterYield)
    };
  }

  // Helper methods
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private buildLocationString(location: any): string {
    return `${location.city}, ${location.province}, Philippines`;
  }

  private calculateQuarterAverage(weatherData: DailyWeatherData[], quarter: number): number {
    const yields = weatherData.map(d => this.predictDailyYield(d, quarter));
    return yields.reduce((sum, y) => sum + y, 0) / yields.length;
  }

  private calculateMonthlyAverages(weatherData: DailyWeatherData[], quarter: number): Record<string, number> {
    const monthlyData: Record<string, number[]> = {};
    
    weatherData.forEach(day => {
      const month = new Date(day.date).toLocaleString('default', { month: 'long' });
      if (!monthlyData[month]) monthlyData[month] = [];
      monthlyData[month].push(this.predictDailyYield(day, quarter));
    });
    
    const averages: Record<string, number> = {};
    Object.entries(monthlyData).forEach(([month, yields]) => {
      averages[month] = yields.reduce((sum, y) => sum + y, 0) / yields.length;
    });
    
    return averages;
  }

  private analyzeWeatherTrend(weatherData: DailyWeatherData[]): string {
    const temps = weatherData.map(d => d.temperature);
    const firstHalf = temps.slice(0, Math.floor(temps.length / 2));
    const secondHalf = temps.slice(Math.floor(temps.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, t) => sum + t, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + t, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 2) return 'Warming trend';
    if (secondAvg < firstAvg - 2) return 'Cooling trend';
    return 'Stable conditions';
  }

  private assessQuarterRisks(weatherData: DailyWeatherData[]): string {
    const risks = [];
    const avgTemp = weatherData.reduce((sum, d) => sum + d.temperature, 0) / weatherData.length;
    const avgPrecip = weatherData.reduce((sum, d) => sum + d.precipitation, 0) / weatherData.length;
    
    if (avgTemp > 32) risks.push('High temperature stress');
    if (avgPrecip > 250) risks.push('Excessive rainfall');
    if (avgPrecip < 100) risks.push('Drought risk');
    
    return risks.length > 0 ? risks.join(', ') : 'Low risk conditions';
  }

  private generateQuarterAdvice(optimalWindows: SevenDayWindow[], avgQuarterYield: number): string[] {
    const advice = [];
    
    if (optimalWindows.length > 0) {
      const bestYield = optimalWindows[0].averageYield;
      advice.push(`Best 7-day window: ${optimalWindows[0].startDate} to ${optimalWindows[0].endDate}`);
      advice.push(`Expected yield: ${(bestYield / 1000).toFixed(1)} tons/ha`);
    }
    
    if (avgQuarterYield > 5000000) {
      advice.push('Overall quarter shows good conditions for rice farming');
    } else {
      advice.push('Consider alternative planting strategies for this quarter');
    }
    
    return advice;
  }
}
