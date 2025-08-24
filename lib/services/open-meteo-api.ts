/**
 * Open-Meteo API Integration Service
 * 
 * Provides access to historical weather data (80 years) and 16-day forecasts
 * for 7-day planting window analysis within selected quarters.
 * 
 * API Documentation: https://open-meteo.com/en/docs
 * - Historical data: https://archive-api.open-meteo.com/v1/
 * - Forecast data: https://api.open-meteo.com/v1/
 */

export interface OpenMeteoWeatherData {
  time: string[];
  temperature_2m: number[];
  dewpoint_2m: number[];
  precipitation: number[];
  windspeed_10m: number[];
  relative_humidity_2m: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    dewpoint_2m_max: string;
    dewpoint_2m_min: string;
    precipitation_sum: string;
    windspeed_10m_max: string;
    relative_humidity_2m_max: string;
    relative_humidity_2m_min: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    dewpoint_2m_max: number[];
    dewpoint_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
    relative_humidity_2m_max: number[];
    relative_humidity_2m_min: number[];
  };
}

export interface OpenMeteoHistoricalResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    dewpoint_2m_max: string;
    dewpoint_2m_min: string;
    precipitation_sum: string;
    windspeed_10m_max: string;
    relative_humidity_2m_max: string;
    relative_humidity_2m_min: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    dewpoint_2m_max: number[];
    dewpoint_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
    relative_humidity_2m_max: number[];
    relative_humidity_2m_min: number[];
  };
}

export interface OpenMeteoError {
  error: boolean;
  reason: string;
}

export interface WeatherDataPoint {
  date: string;
  temperature: number;
  dewPoint: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name: string;
}

// Base URLs for Open-Meteo APIs
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const HISTORICAL_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

// Cache for API responses (in-memory, could be enhanced with Redis)
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Base API client with error handling and caching
 */
class OpenMeteoAPIClient {
  private async makeRequest<T>(url: string, params: Record<string, any>): Promise<T> {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;
    const cacheKey = fullUrl;

    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Rice-Yield-Prediction/1.0'
        },
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 seconds
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Check for Open-Meteo specific errors
      if (data.error) {
        throw new Error(`Open-Meteo API Error: ${data.reason || 'Unknown error'}`);
      }

      // Cache successful response
      responseCache.set(cacheKey, { data, timestamp: Date.now() });

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - Open-Meteo API is not responding');
        }
        throw new Error(`Open-Meteo API request failed: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching weather data');
    }
  }

  /**
   * Get 16-day weather forecast for a location
   */
  async getForecast(coordinates: LocationCoordinates): Promise<OpenMeteoResponse> {
    const params = {
      latitude: coordinates.latitude.toString(),
      longitude: coordinates.longitude.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,dewpoint_2m_max,dewpoint_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max,relative_humidity_2m_min',
      timezone: 'auto',
      forecast_days: '16'
    };

    return this.makeRequest<OpenMeteoResponse>(FORECAST_BASE_URL, params);
  }

  /**
   * Get historical weather data for a specific date range
   */
  async getHistoricalData(
    coordinates: LocationCoordinates,
    startDate: string,
    endDate: string
  ): Promise<OpenMeteoHistoricalResponse> {
    const params = {
      latitude: coordinates.latitude.toString(),
      longitude: coordinates.longitude.toString(),
      start_date: startDate,
      end_date: endDate,
      daily: 'temperature_2m_max,temperature_2m_min,dewpoint_2m_max,dewpoint_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max,relative_humidity_2m_min',
      timezone: 'auto'
    };

    return this.makeRequest<OpenMeteoHistoricalResponse>(HISTORICAL_BASE_URL, params);
  }

  /**
   * Get historical weather data for a specific quarter
   */
  async getQuarterlyHistoricalData(
    coordinates: LocationCoordinates,
    year: number,
    quarter: 1 | 2 | 3 | 4
  ): Promise<OpenMeteoHistoricalResponse> {
    const quarterDates = this.getQuarterDateRange(year, quarter);
    
    return this.getHistoricalData(
      coordinates,
      quarterDates.startDate,
      quarterDates.endDate
    );
  }

  /**
   * Convert Open-Meteo response to standardized weather data points
   */
  convertToWeatherDataPoints(response: OpenMeteoResponse | OpenMeteoHistoricalResponse): WeatherDataPoint[] {
    const { daily } = response;
    const dataPoints: WeatherDataPoint[] = [];

    for (let i = 0; i < daily.time.length; i++) {
      // Calculate average temperature from max/min
      const avgTemperature = (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2;
      
      // Calculate average dew point from max/min
      const avgDewPoint = (daily.dewpoint_2m_max[i] + daily.dewpoint_2m_min[i]) / 2;
      
      // Calculate average humidity from max/min
      const avgHumidity = (daily.relative_humidity_2m_max[i] + daily.relative_humidity_2m_min[i]) / 2;

      dataPoints.push({
        date: daily.time[i],
        temperature: avgTemperature,
        dewPoint: avgDewPoint,
        precipitation: daily.precipitation_sum[i],
        windSpeed: daily.windspeed_10m_max[i],
        humidity: avgHumidity
      });
    }

    return dataPoints;
  }

  /**
   * Get date range for a specific quarter
   */
  private getQuarterDateRange(year: number, quarter: 1 | 2 | 3 | 4): { startDate: string; endDate: string } {
    const quarterRanges = {
      1: { startMonth: 1, endMonth: 3, startDay: 1, endDay: 31 },
      2: { startMonth: 4, endMonth: 6, startDay: 1, endDay: 30 },
      3: { startMonth: 7, endMonth: 9, startDay: 1, endDay: 30 },
      4: { startMonth: 10, endMonth: 12, startDay: 1, endDay: 31 }
    };

    const range = quarterRanges[quarter];
    const startDate = `${year}-${range.startMonth.toString().padStart(2, '0')}-${range.startDay.toString().padStart(2, '0')}`;
    const endDate = `${year}-${range.endMonth.toString().padStart(2, '0')}-${range.endDay.toString().padStart(2, '0')}`;

    return { startDate, endDate };
  }

  /**
   * Clear the response cache
   */
  clearCache(): void {
    responseCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: responseCache.size,
      entries: Array.from(responseCache.keys())
    };
  }
}

// Export singleton instance
export const openMeteoClient = new OpenMeteoAPIClient();

// Export utility functions
export async function getWeatherForecast(coordinates: LocationCoordinates): Promise<WeatherDataPoint[]> {
  const response = await openMeteoClient.getForecast(coordinates);
  return openMeteoClient.convertToWeatherDataPoints(response);
}

export async function getHistoricalWeatherData(
  coordinates: LocationCoordinates,
  startDate: string,
  endDate: string
): Promise<WeatherDataPoint[]> {
  const response = await openMeteoClient.getHistoricalData(coordinates, startDate, endDate);
  return openMeteoClient.convertToWeatherDataPoints(response);
}

export async function getQuarterlyHistoricalWeatherData(
  coordinates: LocationCoordinates,
  year: number,
  quarter: 1 | 2 | 3 | 4
): Promise<WeatherDataPoint[]> {
  const response = await openMeteoClient.getQuarterlyHistoricalData(coordinates, year, quarter);
  return openMeteoClient.convertToWeatherDataPoints(response);
}

/**
 * Get 16-day weather forecast for a specific location
 * @param coordinates - Location coordinates
 * @returns 16-day forecast with daily weather data
 */
export async function get16DayForecast(coordinates: LocationCoordinates): Promise<WeatherDataPoint[]> {
  const response = await openMeteoClient.getForecast(coordinates);
  return openMeteoClient.convertToWeatherDataPoints(response);
}
