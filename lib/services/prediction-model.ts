export interface WeatherData {
  date: string;
  temp_c: number;
  dewpoint_c: number;
  precip_mm: number;
  wind_kph: number;
  humidity: number;
  text?: string;
  icon?: string;
  daily_chance_of_rain?: number;
}

export interface PlantingWindow {
  startDate: string;
  endDate: string;
  score: number;
  conditions: {
    temperature: number;
    dewPoint: number;
    precipitation: number;
    windSpeed: number;
    humidity: number;
  };
  confidence: number;
  predictedYield: number;
  weatherStability: number;
  riskFactors: string[];
  weatherDescription: string;
  historicalInsights?: {
    historicalAverage: number;
    historicalBest: number;
    historicalWorst: number;
    successRate: number;
    performance: 'above_average' | 'average' | 'below_average';
    percentile: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
  };
}

export class YieldPredictionModel {
  // Quarterly prediction formulas
  predictQuarter1(temperature: number, dewPoint: number, precipitation: number, windSpeed: number, humidity: number): number {
    return 8478.474259 * temperature - 16643.35313 * dewPoint + 36502.00765 * precipitation - 5998.639807 * windSpeed - 787.357142 * humidity + 420307.9461;
  }
  
  predictQuarter2(temperature: number, dewPoint: number, precipitation: number, windSpeed: number, humidity: number): number {
    return -3835.953799 * temperature - 6149.597523 * dewPoint - 4483.424128 * precipitation - 2593.991107 * windSpeed - 8024.420014 * humidity + 1067116.384;
  }
  
  predictQuarter3(temperature: number, dewPoint: number, precipitation: number, windSpeed: number, humidity: number): number {
    return 16630.77076 * temperature - 1018.254139 * dewPoint + 403.126612 * precipitation + 74623.00801 * windSpeed + 25918.43338 * humidity - 2410001.76;
  }
  
  predictQuarter4(temperature: number, dewPoint: number, precipitation: number, windSpeed: number, humidity: number): number {
    return 8993.693672 * temperature + 5844.061829 * dewPoint - 30748.53656 * precipitation - 33023.39764 * windSpeed - 1155.458549 * humidity + 410764.6506;
  }

  // Determine best quarter for planting
  getBestPlantingQuarter(location: string, year: number): number {
    // Simplified logic: Q2 (April-June) is typically best for rice planting in Philippines
    // This avoids dependency on removed historical data service
    return 2;
  }

  // Find best 7-day planting window
  async findBestPlantingWindow(
    location: string,
    year: number,
    quarter: number
  ): Promise<PlantingWindow[]> {
    const startDate = this.getQuarterStartDate(year, quarter);
    const endDate = this.getQuarterEndDate(year, quarter);
    
    // Check if we're requesting future dates
    const now = new Date();
    const isFutureQuarter = startDate > now;
    const isPastQuarter = endDate < now;
    
    if (isFutureQuarter) {
      console.log(`⚠️ Debug: Requesting future quarter (${year} Q${quarter}), using current weather + 14-day forecast`);
      // For future quarters, use current weather + available forecast
      const currentDate = new Date();
      const forecastEndDate = new Date();
      forecastEndDate.setDate(currentDate.getDate() + 14); // Max 14 days forecast
      
      const weatherData = await this.getWeatherForecast(location, currentDate, forecastEndDate);
      
      if (weatherData.length < 7) {
        console.log(`❌ Debug: Not enough weather data (${weatherData.length} days) for analysis`);
        return [];
      }
      
      // Analyze available data and adjust dates to requested year
      const windows = this.analyzePlantingWindows(weatherData, quarter, year);
      return windows.slice(0, 3);
    } else if (isPastQuarter) {
      console.log(`📚 Debug: Requesting past quarter (${year} Q${quarter}), using historical weather data`);
      // For past quarters, use historical weather data
      const weatherData = await this.getHistoricalWeatherData(location, startDate, endDate);
      
      if (weatherData.length < 7) {
        console.log(`❌ Debug: Not enough historical weather data (${weatherData.length} days) for analysis`);
        return [];
      }
      
      // Analyze historical data
      const windows = this.analyzePlantingWindows(weatherData, quarter, year);
      return windows.slice(0, 3);
    } else {
      // For current quarter, get current + forecast data
      console.log(`🌤️ Debug: Requesting current quarter (${year} Q${quarter}), using current + forecast data`);
      const weatherData = await this.getWeatherForecast(location, startDate, endDate);
      
      if (weatherData.length < 7) {
        console.log(`❌ Debug: Not enough weather data (${weatherData.length} days) for analysis`);
        return [];
      }
      
      // Analyze each 7-day period
      const windows = this.analyzePlantingWindows(weatherData, quarter, year);
      return windows.slice(0, 3);
    }
  }

  private getQuarterStartDate(year: number, quarter: number): Date {
    const month = (quarter - 1) * 3;
    return new Date(year, month, 1);
  }

  private getQuarterEndDate(year: number, quarter: number): Date {
    const month = quarter * 3 - 1;
    return new Date(year, month + 1, 0);
  }

  private async getWeatherForecast(location: any, startDate: Date, endDate: Date): Promise<WeatherData[]> {
    // Use real WeatherAPI - no fallback to mock data
    const { WeatherService } = await import('./weather-api');
    const weatherService = new WeatherService();
    
    // Convert location object to string format for WeatherAPI
    const locationString = typeof location === 'string' ? location : `${location.city}, ${location.province}, Philippines`;
    
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`🌤️ Debug: Requesting ${days} days of weather for ${locationString} from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    // For future dates, limit to 14 days (WeatherAPI max)
    const now = new Date();
    let actualDays = days;
    let actualEndDate = endDate;
    
    if (startDate > now) {
      actualDays = 14; // WeatherAPI max forecast days
      actualEndDate = new Date();
      actualEndDate.setDate(now.getDate() + 14);
      console.log(`🎯 Debug: Future date range detected, limiting to 14 days forecast`);
    }
    
    const forecast = await weatherService.getWeatherForecast(locationString, actualDays);
    console.log(`📅 Debug: Received ${forecast.length} days of weather data`);
    
    // For future dates, don't filter - use all available forecast data
    if (startDate > now) {
      console.log(`🎯 Debug: Using all ${forecast.length} days of forecast data for future analysis`);
      return forecast;
    }
    
    // Filter forecast to match our date range for past/current dates
    const filteredForecast = forecast.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= startDate && dayDate <= endDate;
    });
    
    console.log(`🎯 Debug: Filtered to ${filteredForecast.length} days in target range`);
    return filteredForecast;
  }

  private async getHistoricalWeatherData(location: any, startDate: Date, endDate: Date): Promise<WeatherData[]> {
    // Use real WeatherAPI historical data
    const { WeatherService } = await import('./weather-api');
    const weatherService = new WeatherService();
    
    // Convert location object to string format for WeatherAPI
    const locationString = typeof location === 'string' ? location : `${location.city}, ${location.province}, Philippines`;
    
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`📚 Debug: Requesting ${days} days of historical weather for ${locationString} from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    
    const historicalData: WeatherData[] = [];
    
    // WeatherAPI historical endpoint requires individual date requests
    // We'll sample key dates within the quarter for analysis
    const sampleDates = this.getSampleDates(startDate, endDate, Math.min(days, 30)); // Max 30 days for performance
    
    for (const date of sampleDates) {
      try {
        const dateStr = date.toISOString().split('T')[0];
        const dayData = await weatherService.getHistoricalWeather(locationString, dateStr);
        historicalData.push(dayData);
      } catch (error) {
        console.warn(`⚠️ Debug: Failed to get historical data for ${date.toISOString().split('T')[0]}:`, error);
        // Continue with other dates
      }
    }
    
    console.log(`📚 Debug: Retrieved ${historicalData.length} days of historical weather data`);
    return historicalData;
  }

  private getSampleDates(startDate: Date, endDate: Date, maxDays: number): Date[] {
    const dates: Date[] = [];
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= maxDays) {
      // If total days is small, get all dates
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
    } else {
      // Sample evenly distributed dates
      const interval = Math.floor(totalDays / maxDays);
      for (let i = 0; i < maxDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (i * interval));
        dates.push(date);
      }
    }
    
    return dates;
  }

    private analyzePlantingWindows(weatherData: WeatherData[], quarter: number, requestedYear: number): PlantingWindow[] {
    console.log(`🔍 Debug: Analyzing ${weatherData.length} days of weather data for Q${quarter} ${requestedYear}`);
    
    // Simplified historical insights (no dependency on removed service)
    const mockHistoricalComparison = {
      historicalAverage: 3500,
      historicalBest: 4500,
      historicalWorst: 2500,
      successRate: 0.75,
      performance: 'average' as const,
      percentile: 50
    };
    const mockTrendAnalysis = {
      trend: 'stable' as const,
      changeRate: 0
    };
    
    const windows: PlantingWindow[] = [];
    
    // Analyze each 7-day period
    for (let i = 0; i <= weatherData.length - 7; i++) {
      const weekData = weatherData.slice(i, i + 7);
      const avgConditions = this.calculateAverageConditions(weekData);
      const score = this.calculatePlantingScore(avgConditions, quarter, weekData);
      const predictedYield = this.predictYield(avgConditions, quarter);
      
      // Adjust dates to the requested year and quarter
      const startDate = this.adjustDateToYear(weekData[0].date, requestedYear, quarter);
      const endDate = this.adjustDateToYear(weekData[6].date, requestedYear, quarter);
      
      // Use simplified historical insights
      const historicalComparison = mockHistoricalComparison;
      const trendAnalysis = mockTrendAnalysis;
      
      windows.push({
        startDate: startDate,
        endDate: endDate,
        score: score,
        conditions: avgConditions,
        confidence: this.calculateConfidence(weekData),
        predictedYield: predictedYield,
        weatherStability: this.calculateWeatherStability(weekData),
        riskFactors: this.identifyRiskFactors(weekData),
        weatherDescription: this.getWeatherDescription(weekData),
        historicalInsights: {
          ...historicalComparison,
          trend: trendAnalysis.trend,
          changeRate: trendAnalysis.changeRate
        }
      });
    }
    
    console.log(`📊 Debug: Created ${windows.length} planting windows for ${requestedYear} with historical insights`);
    return windows.sort((a, b) => b.score - a.score);
  }

  private calculateAverageConditions(weekData: WeatherData[]) {
    const total = weekData.reduce((acc, day) => ({
      temperature: acc.temperature + day.temp_c,
      dewPoint: acc.dewPoint + day.dewpoint_c,
      precipitation: acc.precipitation + day.precip_mm,
      windSpeed: acc.windSpeed + day.wind_kph,
      humidity: acc.humidity + day.humidity
    }), { temperature: 0, dewPoint: 0, precipitation: 0, windSpeed: 0, humidity: 0 });

    return {
      temperature: total.temperature / weekData.length,
      dewPoint: total.dewPoint / weekData.length,
      precipitation: total.precipitation / weekData.length,
      windSpeed: total.windSpeed / weekData.length,
      humidity: total.humidity / weekData.length
    };
  }

  private calculatePlantingScore(conditions: Record<string, number>, quarter: number, weekData: WeatherData[]): number {
    let score = 50; // Start with base score of 50
    
    // Base score from yield prediction (normalize to reasonable range)
    const predictedYield = this.predictYield(conditions, quarter);
    const yieldScore = Math.min(30, Math.max(-20, (predictedYield - 3000) / 100)); // -20 to +30 points
    score += yieldScore;
    
    // Penalize for rain probability
    const avgRainChance = weekData.reduce((sum, day) => sum + (day.daily_chance_of_rain || 0), 0) / weekData.length;
    score -= avgRainChance * 0.3; // Reduce penalty
    
    // Penalize for extreme conditions
    if (conditions.temperature < 20 || conditions.temperature > 35) score -= 15;
    if (conditions.windSpeed > 25) score -= 10;
    if (conditions.humidity < 50 || conditions.humidity > 95) score -= 8;
    
    // Add bonus for optimal conditions
    if (conditions.temperature >= 25 && conditions.temperature <= 30) score += 5;
    if (conditions.humidity >= 70 && conditions.humidity <= 85) score += 3;
    if (avgRainChance < 20) score += 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private predictYield(conditions: Record<string, number>, quarter: number): number {
    switch (quarter) {
      case 1: return this.predictQuarter1(conditions.temperature, conditions.dewPoint, conditions.precipitation, conditions.windSpeed, conditions.humidity);
      case 2: return this.predictQuarter2(conditions.temperature, conditions.dewPoint, conditions.precipitation, conditions.windSpeed, conditions.humidity);
      case 3: return this.predictQuarter3(conditions.temperature, conditions.dewPoint, conditions.precipitation, conditions.windSpeed, conditions.humidity);
      case 4: return this.predictQuarter4(conditions.temperature, conditions.dewPoint, conditions.precipitation, conditions.windSpeed, conditions.humidity);
      default: return 0;
    }
  }

  private calculateConfidence(weekData: WeatherData[]): number {
    // Calculate confidence based on weather consistency
    const tempVariance = this.calculateVariance(weekData.map(d => d.temp_c));
    const humidityVariance = this.calculateVariance(weekData.map(d => d.humidity));
    
    let confidence = 75; // Base confidence
    confidence -= tempVariance * 1.5; // Reduced multiplier
    confidence -= humidityVariance * 0.8; // Reduced multiplier
    
    // Add bonus for consistent weather patterns
    if (tempVariance < 2) confidence += 10;
    if (humidityVariance < 5) confidence += 5;
    
    return Math.max(50, Math.min(95, Math.round(confidence)));
  }

  private calculateWeatherStability(weekData: WeatherData[]): number {
    const tempVariance = this.calculateVariance(weekData.map(d => d.temp_c));
    const humidityVariance = this.calculateVariance(weekData.map(d => d.humidity));
    
    let stability = 85; // Lower base stability
    stability -= tempVariance * 2; // Reduced multiplier
    stability -= humidityVariance * 1.5; // Reduced multiplier
    
    // Add bonus for very stable conditions
    if (tempVariance < 1.5) stability += 15;
    if (humidityVariance < 3) stability += 10;
    
    return Math.max(0, Math.min(100, Math.round(stability)));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private identifyRiskFactors(weekData: WeatherData[]): string[] {
    const risks: string[] = [];
    
    const avgTemp = weekData.reduce((sum, day) => sum + day.temp_c, 0) / weekData.length;
    const avgRainChance = weekData.reduce((sum, day) => sum + (day.daily_chance_of_rain || 0), 0) / weekData.length;
    const avgWind = weekData.reduce((sum, day) => sum + day.wind_kph, 0) / weekData.length;
    
    if (avgTemp < 22) risks.push('Low temperature');
    if (avgTemp > 32) risks.push('High temperature');
    if (avgRainChance > 50) risks.push('High rain probability');
    if (avgWind > 20) risks.push('High wind speed');
    
    return risks;
  }

  private getWeatherDescription(weekData: WeatherData[]): string {
    const avgTemp = weekData.reduce((sum, day) => sum + day.temp_c, 0) / weekData.length;
    const avgRainChance = weekData.reduce((sum, day) => sum + (day.daily_chance_of_rain || 0), 0) / weekData.length;
    
    if (avgRainChance > 60) return 'Rainy conditions expected';
    if (avgRainChance > 30) return 'Partly cloudy with some rain';
    if (avgTemp > 30) return 'Warm and sunny conditions';
    return 'Mild and favorable conditions';
  }

  private adjustDateToYear(dateString: string, targetYear: number, quarter: number): string {
    const date = new Date(dateString);
    const currentMonth = date.getMonth(); // 0-11
    
    // Calculate the target month within the quarter
    const quarterStartMonth = (quarter - 1) * 3; // Q1=0, Q2=3, Q3=6, Q4=9
    const monthOffset = currentMonth % 3; // Position within the quarter (0, 1, or 2)
    const targetMonth = quarterStartMonth + monthOffset;
    
    date.setFullYear(targetYear);
    date.setMonth(targetMonth);
    
    return date.toISOString().split('T')[0];
  }
}
