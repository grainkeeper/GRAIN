// Historical Weather Service
// Fetches historical weather data for model validation and backtesting

export interface HistoricalWeatherPoint {
  date: string;
  temperature: number;
  dewPoint: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  location: string;
}

export interface HistoricalYieldPoint {
  year: number;
  quarter: number;
  actualYield: number; // tons per hectare
  source: string;
}

export interface ValidationDataset {
  weatherData: HistoricalWeatherPoint[];
  yieldData: HistoricalYieldPoint[];
  period: {
    startYear: number;
    endYear: number;
    location: string;
  };
}

export class HistoricalWeatherService {
  private weatherService: any;
  
  constructor() {
    // Import the weather service
    const { WeatherService } = require('./weather-api');
    this.weatherService = new WeatherService();
  }

  // Fetch historical weather data for a specific period
  async getHistoricalWeatherData(
    location: string, 
    startYear: number, 
    endYear: number,
    maxRequests: number = 100 // Limit API calls
  ): Promise<HistoricalWeatherPoint[]> {
    console.log(`📚 Fetching historical weather for ${location} (${startYear}-${endYear})`);
    
    const weatherData: HistoricalWeatherPoint[] = [];
    const requests = [];
    
    // Generate sample dates (one per month for performance)
    const sampleDates = this.generateSampleDates(startYear, endYear, maxRequests);
    
    for (const date of sampleDates) {
      requests.push(this.fetchHistoricalDay(location, date));
    }
    
    // Fetch data with rate limiting
    const results = await this.fetchWithRateLimit(requests, 10); // 10 requests per second
    
    // Process results
    results.forEach((result, index) => {
      if (result.success && result.data) {
        weatherData.push({
          date: sampleDates[index],
          temperature: result.data.temp_c,
          dewPoint: result.data.dewpoint_c,
          precipitation: result.data.precip_mm,
          windSpeed: result.data.wind_kph,
          humidity: result.data.humidity,
          location: location
        });
      }
    });
    
    console.log(`✅ Retrieved ${weatherData.length} historical weather points`);
    return weatherData;
  }

  // Get actual rice yield data (placeholder - would connect to government databases)
  async getHistoricalYieldData(
    startYear: number, 
    endYear: number,
    location: string
  ): Promise<HistoricalYieldPoint[]> {
    // This would fetch from:
    // - PhilRice database
    // - PSA (Philippine Statistics Authority)
    // - Department of Agriculture
    
    console.log(`📊 Fetching historical yield data for ${location} (${startYear}-${endYear})`);
    
    // For now, return sample data structure
    const yieldData: HistoricalYieldPoint[] = [];
    
    for (let year = startYear; year <= endYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        // Sample data - replace with actual API calls
        yieldData.push({
          year,
          quarter,
          actualYield: this.generateSampleYield(year, quarter, location),
          source: 'PhilRice'
        });
      }
    }
    
    console.log(`✅ Retrieved ${yieldData.length} historical yield points`);
    return yieldData;
  }

  // Create validation dataset for model testing
  async createValidationDataset(
    location: string,
    startYear: number,
    endYear: number
  ): Promise<ValidationDataset> {
    const [weatherData, yieldData] = await Promise.all([
      this.getHistoricalWeatherData(location, startYear, endYear),
      this.getHistoricalYieldData(startYear, endYear, location)
    ]);
    
    return {
      weatherData,
      yieldData,
      period: {
        startYear,
        endYear,
        location
      }
    };
  }

  // Generate sample dates for historical data fetching
  private generateSampleDates(startYear: number, endYear: number, maxDates: number): string[] {
    const dates: string[] = [];
    const totalMonths = (endYear - startYear + 1) * 12;
    const step = Math.max(1, Math.floor(totalMonths / maxDates));
    
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month += step) {
        // Use 15th of each month for representative data
        const date = `${year}-${month.toString().padStart(2, '0')}-15`;
        dates.push(date);
        
        if (dates.length >= maxDates) break;
      }
      if (dates.length >= maxDates) break;
    }
    
    return dates;
  }

  // Fetch historical weather for a specific date
  private async fetchHistoricalDay(location: string, date: string): Promise<{success: boolean, data?: any, error?: string}> {
    try {
      const data = await this.weatherService.getHistoricalWeather(location, date);
      return { success: true, data };
    } catch (error) {
      console.warn(`⚠️ Failed to fetch historical data for ${date}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Rate-limited fetching to avoid API limits
  private async fetchWithRateLimit(requests: Promise<any>[], rateLimit: number): Promise<any[]> {
    const results: any[] = [];
    const batchSize = rateLimit;
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
      
      // Wait 1 second between batches
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Generate sample yield data (replace with actual data sources)
  private generateSampleYield(year: number, quarter: number, location: string): number {
    // This is placeholder data - replace with actual historical yields
    const baseYield = 4.5; // tons per hectare
    const yearFactor = 1 + (year - 2010) * 0.02; // 2% annual growth
    const quarterFactors = [1.1, 0.9, 1.2, 0.8]; // Q1=best, Q4=worst
    const locationFactor = 1.0; // Would vary by location
    
    return baseYield * yearFactor * quarterFactors[quarter - 1] * locationFactor;
  }

  // Get available data sources
  getDataSources(): { name: string; description: string; availability: string }[] {
    return [
      {
        name: 'WeatherAPI.com',
        description: 'Historical weather data (2010-present)',
        availability: 'Available via API'
      },
      {
        name: 'PAGASA',
        description: 'Philippine Atmospheric, Geophysical and Astronomical Services Administration',
        availability: 'Government database - requires access'
      },
      {
        name: 'PhilRice',
        description: 'Philippine Rice Research Institute',
        availability: 'Research database - requires access'
      },
      {
        name: 'PSA',
        description: 'Philippine Statistics Authority',
        availability: 'Government database - requires access'
      },
      {
        name: 'Department of Agriculture',
        description: 'Agricultural statistics and yield data',
        availability: 'Government database - requires access'
      }
    ];
  }
}

