/**
 * Unit Tests for Open-Meteo API Service
 * 
 * Tests the API client, data conversion, error handling, and caching functionality.
 */

import { 
  openMeteoClient,
  getWeatherForecast,
  getHistoricalWeatherData,
  getQuarterlyHistoricalWeatherData,
  type OpenMeteoResponse,
  type OpenMeteoHistoricalResponse,
  type LocationCoordinates,
  type WeatherDataPoint
} from './open-meteo-api';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Open-Meteo API Service', () => {
  const mockCoordinates: LocationCoordinates = {
    latitude: 14.5995,
    longitude: 120.9842,
    name: 'Manila, Philippines'
  };

  const mockOpenMeteoResponse: OpenMeteoResponse = {
    latitude: 14.5995,
    longitude: 120.9842,
    generationtime_ms: 0.123,
    utc_offset_seconds: 28800,
    timezone: 'Asia/Manila',
    timezone_abbreviation: 'PHT',
    elevation: 13.0,
    daily_units: {
      time: 'iso8601',
      temperature_2m_max: '°C',
      temperature_2m_min: '°C',
      dewpoint_2m_max: '°C',
      dewpoint_2m_min: '°C',
      precipitation_sum: 'mm',
      windspeed_10m_max: 'km/h',
      relative_humidity_2m_max: '%',
      relative_humidity_2m_min: '%'
    },
    daily: {
      time: ['2025-01-01', '2025-01-02', '2025-01-03'],
      temperature_2m_max: [30.5, 31.2, 29.8],
      temperature_2m_min: [22.1, 23.4, 21.9],
      dewpoint_2m_max: [25.3, 26.1, 24.8],
      dewpoint_2m_min: [18.2, 19.1, 17.9],
      precipitation_sum: [0.0, 5.2, 12.8],
      windspeed_10m_max: [15.2, 18.7, 12.3],
      relative_humidity_2m_max: [85, 88, 92],
      relative_humidity_2m_min: [65, 68, 72]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    openMeteoClient.clearCache();
  });

  describe('API Client', () => {
    it('should make successful forecast request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      const result = await openMeteoClient.getForecast(mockCoordinates);

      expect(result).toEqual(mockOpenMeteoResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('api.open-meteo.com/v1/forecast'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'User-Agent': 'Rice-Yield-Prediction/1.0'
          })
        })
      );
    });

    it('should make successful historical data request', async () => {
      const mockHistoricalResponse: OpenMeteoHistoricalResponse = {
        ...mockOpenMeteoResponse,
        daily: {
          ...mockOpenMeteoResponse.daily,
          time: ['2024-01-01', '2024-01-02']
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistoricalResponse
      } as Response);

      const result = await openMeteoClient.getHistoricalData(
        mockCoordinates,
        '2024-01-01',
        '2024-01-02'
      );

      expect(result).toEqual(mockHistoricalResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('archive-api.open-meteo.com/v1/archive'),
        expect.any(Object)
      );
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response);

      await expect(openMeteoClient.getForecast(mockCoordinates))
        .rejects.toThrow('HTTP 400: Bad Request');
    });

    it('should handle Open-Meteo API errors', async () => {
      const errorResponse = {
        error: true,
        reason: 'Invalid coordinates'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => errorResponse
      } as Response);

      await expect(openMeteoClient.getForecast(mockCoordinates))
        .rejects.toThrow('Open-Meteo API Error: Invalid coordinates');
    });

    it('should handle request timeouts', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(openMeteoClient.getForecast(mockCoordinates))
        .rejects.toThrow('Request timeout - Open-Meteo API is not responding');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(openMeteoClient.getForecast(mockCoordinates))
        .rejects.toThrow('Open-Meteo API request failed: Network error');
    });
  });

  describe('Data Conversion', () => {
    it('should convert Open-Meteo response to weather data points', () => {
      const weatherDataPoints = openMeteoClient.convertToWeatherDataPoints(mockOpenMeteoResponse);

      expect(weatherDataPoints).toHaveLength(3);
      expect(weatherDataPoints[0]).toEqual({
        date: '2025-01-01',
        temperature: 26.3, // (30.5 + 22.1) / 2
        dewPoint: 21.75,   // (25.3 + 18.2) / 2
        precipitation: 0.0,
        windSpeed: 15.2,
        humidity: 75       // (85 + 65) / 2
      });
    });

    it('should handle empty response data', () => {
      const emptyResponse: OpenMeteoResponse = {
        ...mockOpenMeteoResponse,
        daily: {
          ...mockOpenMeteoResponse.daily,
          time: [],
          temperature_2m_max: [],
          temperature_2m_min: [],
          dewpoint_2m_max: [],
          dewpoint_2m_min: [],
          precipitation_sum: [],
          windspeed_10m_max: [],
          relative_humidity_2m_max: [],
          relative_humidity_2m_min: []
        }
      };

      const weatherDataPoints = openMeteoClient.convertToWeatherDataPoints(emptyResponse);
      expect(weatherDataPoints).toHaveLength(0);
    });
  });

  describe('Quarterly Data', () => {
    it('should get quarterly historical data for Q1', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      const result = await openMeteoClient.getQuarterlyHistoricalData(mockCoordinates, 2025, 1);

      expect(result).toEqual(mockOpenMeteoResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2025-01-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2025-03-31'),
        expect.any(Object)
      );
    });

    it('should get quarterly historical data for Q2', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      await openMeteoClient.getQuarterlyHistoricalData(mockCoordinates, 2025, 2);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2025-04-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2025-06-30'),
        expect.any(Object)
      );
    });

    it('should get quarterly historical data for Q3', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      await openMeteoClient.getQuarterlyHistoricalData(mockCoordinates, 2025, 3);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2025-07-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2025-09-30'),
        expect.any(Object)
      );
    });

    it('should get quarterly historical data for Q4', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      await openMeteoClient.getQuarterlyHistoricalData(mockCoordinates, 2025, 4);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('start_date=2025-10-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('end_date=2025-12-31'),
        expect.any(Object)
      );
    });
  });

  describe('Caching', () => {
    it('should cache successful responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      // First call
      await openMeteoClient.getForecast(mockCoordinates);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await openMeteoClient.getForecast(mockCoordinates);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should clear cache', () => {
      const stats = openMeteoClient.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should provide cache statistics', () => {
      const stats = openMeteoClient.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('entries');
      expect(Array.isArray(stats.entries)).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should get weather forecast using utility function', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      const result = await getWeatherForecast(mockCoordinates);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('temperature');
      expect(result[0]).toHaveProperty('dewPoint');
      expect(result[0]).toHaveProperty('precipitation');
      expect(result[0]).toHaveProperty('windSpeed');
      expect(result[0]).toHaveProperty('humidity');
    });

    it('should get historical weather data using utility function', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      const result = await getHistoricalWeatherData(
        mockCoordinates,
        '2025-01-01',
        '2025-01-03'
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    it('should get quarterly historical weather data using utility function', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      const result = await getQuarterlyHistoricalWeatherData(mockCoordinates, 2025, 1);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      } as Response);

      await expect(openMeteoClient.getForecast(mockCoordinates))
        .rejects.toThrow('Open-Meteo API request failed: Invalid JSON');
    });

    it('should handle missing required fields in response', async () => {
      const incompleteResponse = {
        latitude: 14.5995,
        longitude: 120.9842,
        // Missing daily data
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteResponse
      } as Response);

      // This should not throw but return incomplete data
      const result = await openMeteoClient.getForecast(mockCoordinates);
      expect(result).toEqual(incompleteResponse);
    });
  });

  describe('API Parameters', () => {
    it('should include correct parameters in forecast request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      await openMeteoClient.getForecast(mockCoordinates);

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('latitude=14.5995');
      expect(callUrl).toContain('longitude=120.9842');
      expect(callUrl).toContain('forecast_days=16');
      expect(callUrl).toContain('timezone=auto');
    });

    it('should include correct parameters in historical request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenMeteoResponse
      } as Response);

      await openMeteoClient.getHistoricalData(
        mockCoordinates,
        '2025-01-01',
        '2025-01-03'
      );

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('start_date=2025-01-01');
      expect(callUrl).toContain('end_date=2025-01-03');
    });
  });
});
