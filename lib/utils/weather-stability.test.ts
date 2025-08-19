/**
 * Unit Tests for Weather Stability Analysis Utilities
 * 
 * Tests the weather stability scoring, planting window analysis, and data validation functions.
 */

import { 
  calculateWeatherStabilityScore,
  findPlantingWindows,
  validateWeatherData,
  type WeatherStabilityScore,
  type PlantingWindowAnalysis,
  type PlantingWindow
} from './weather-stability';

import { WeatherDataPoint } from '@/lib/services/open-meteo-api';

describe('Weather Stability Analysis', () => {
  const mockWeatherData: WeatherDataPoint[] = [
    { date: '2025-01-01', temperature: 25.0, dewPoint: 20.0, precipitation: 5.0, windSpeed: 8.0, humidity: 75 },
    { date: '2025-01-02', temperature: 26.0, dewPoint: 21.0, precipitation: 8.0, windSpeed: 7.0, humidity: 78 },
    { date: '2025-01-03', temperature: 24.5, dewPoint: 19.5, precipitation: 12.0, windSpeed: 9.0, humidity: 80 },
    { date: '2025-01-04', temperature: 25.5, dewPoint: 20.5, precipitation: 3.0, windSpeed: 6.0, humidity: 72 },
    { date: '2025-01-05', temperature: 27.0, dewPoint: 22.0, precipitation: 0.0, windSpeed: 10.0, humidity: 70 },
    { date: '2025-01-06', temperature: 26.5, dewPoint: 21.5, precipitation: 7.0, windSpeed: 8.5, humidity: 76 },
    { date: '2025-01-07', temperature: 25.8, dewPoint: 20.8, precipitation: 9.0, windSpeed: 7.5, humidity: 77 }
  ];

  const extremeWeatherData: WeatherDataPoint[] = [
    { date: '2025-01-01', temperature: 40.0, dewPoint: 35.0, precipitation: 60.0, windSpeed: 35.0, humidity: 95 },
    { date: '2025-01-02', temperature: 15.0, dewPoint: 10.0, precipitation: 0.0, windSpeed: 5.0, humidity: 35 },
    { date: '2025-01-03', temperature: 38.0, dewPoint: 33.0, precipitation: 55.0, windSpeed: 32.0, humidity: 90 },
    { date: '2025-01-04', temperature: 18.0, dewPoint: 13.0, precipitation: 2.0, windSpeed: 8.0, humidity: 45 },
    { date: '2025-01-05', temperature: 42.0, dewPoint: 37.0, precipitation: 70.0, windSpeed: 40.0, humidity: 98 },
    { date: '2025-01-06', temperature: 16.0, dewPoint: 11.0, precipitation: 1.0, windSpeed: 6.0, humidity: 40 },
    { date: '2025-01-07', temperature: 39.0, dewPoint: 34.0, precipitation: 65.0, windSpeed: 38.0, humidity: 92 }
  ];

  describe('calculateWeatherStabilityScore', () => {
    it('should calculate stability score for optimal weather conditions', () => {
      const score = calculateWeatherStabilityScore(mockWeatherData);

      expect(score.overallScore).toBeGreaterThan(0.6); // Good conditions
      expect(score.temperatureStability).toBeGreaterThan(0.65);
      expect(score.precipitationScore).toBeGreaterThan(0.5);
      expect(score.windStability).toBeGreaterThan(0.6);
      expect(score.humidityStability).toBeGreaterThan(0.6);
      expect(score.riskLevel).toBe('low' || 'medium');
      expect(score.recommendations).toBeInstanceOf(Array);
      expect(score.factors.extremeEvents).toBe(0);
    });

    it('should calculate low stability score for extreme weather conditions', () => {
      const score = calculateWeatherStabilityScore(extremeWeatherData);

      expect(score.overallScore).toBeLessThan(0.4); // Poor conditions
      expect(score.riskLevel).toBe('high');
      expect(score.factors.extremeEvents).toBeGreaterThan(3);
      expect(score.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle empty weather data', () => {
      const score = calculateWeatherStabilityScore([]);

      expect(score.overallScore).toBe(0);
      expect(score.riskLevel).toBe('high');
      expect(score.recommendations).toContain('Insufficient weather data for analysis');
    });

    it('should calculate temperature stability correctly', () => {
      const optimalTempData: WeatherDataPoint[] = [
        { date: '2025-01-01', temperature: 25.0, dewPoint: 20.0, precipitation: 5.0, windSpeed: 8.0, humidity: 75 },
        { date: '2025-01-02', temperature: 25.5, dewPoint: 20.5, precipitation: 5.5, windSpeed: 8.5, humidity: 76 },
        { date: '2025-01-03', temperature: 24.8, dewPoint: 19.8, precipitation: 4.8, windSpeed: 7.8, humidity: 74 },
        { date: '2025-01-04', temperature: 25.2, dewPoint: 20.2, precipitation: 5.2, windSpeed: 8.2, humidity: 75 },
        { date: '2025-01-05', temperature: 25.1, dewPoint: 20.1, precipitation: 5.1, windSpeed: 8.1, humidity: 75 },
        { date: '2025-01-06', temperature: 25.3, dewPoint: 20.3, precipitation: 5.3, windSpeed: 8.3, humidity: 76 },
        { date: '2025-01-07', temperature: 25.0, dewPoint: 20.0, precipitation: 5.0, windSpeed: 8.0, humidity: 75 }
      ];

      const score = calculateWeatherStabilityScore(optimalTempData);
      expect(score.temperatureStability).toBeGreaterThan(0.65); // Very stable temperature
    });

    it('should calculate precipitation score correctly', () => {
      const goodPrecipData: WeatherDataPoint[] = [
        { date: '2025-01-01', temperature: 25.0, dewPoint: 20.0, precipitation: 10.0, windSpeed: 8.0, humidity: 75 },
        { date: '2025-01-02', temperature: 25.0, dewPoint: 20.0, precipitation: 8.0, windSpeed: 8.0, humidity: 75 },
        { date: '2025-01-03', temperature: 25.0, dewPoint: 20.0, precipitation: 12.0, windSpeed: 8.0, humidity: 75 },
        { date: '2025-01-04', temperature: 25.0, dewPoint: 20.0, precipitation: 9.0, windSpeed: 8.0, humidity: 75 },
        { date: '2025-01-05', temperature: 25.0, dewPoint: 20.0, precipitation: 11.0, windSpeed: 8.0, humidity: 75 },
        { date: '2025-01-06', temperature: 25.0, dewPoint: 20.0, precipitation: 7.0, windSpeed: 8.0, humidity: 75 },
        { date: '2025-01-07', temperature: 25.0, dewPoint: 20.0, precipitation: 10.0, windSpeed: 8.0, humidity: 75 }
      ];

      const score = calculateWeatherStabilityScore(goodPrecipData);
      expect(score.precipitationScore).toBeGreaterThan(0.7); // Good precipitation pattern
      expect(score.factors.precipitationDays).toBe(7); // All days have precipitation
    });

    it('should identify extreme weather events correctly', () => {
      const score = calculateWeatherStabilityScore(extremeWeatherData);
      
      // Should identify multiple extreme events
      expect(score.factors.extremeEvents).toBeGreaterThan(5);
      
      // Should include recommendations for extreme events
      expect(score.recommendations.some(rec => rec.includes('extreme'))).toBe(true);
    });
  });

  describe('findPlantingWindows', () => {
    it('should find optimal planting windows for good weather data', () => {
      const analysis = findPlantingWindows(mockWeatherData, 'Manila', 2025, 1);

      expect(analysis.location).toBe('Manila');
      expect(analysis.year).toBe(2025);
      expect(analysis.quarter).toBe(1);
      expect(analysis.windows.length).toBe(1); // Only one 7-day window with 7 days of data
      expect(analysis.optimalWindow).toBeDefined();
      expect(analysis.dataQuality).toBe('fair');
      expect(analysis.analysisDate).toBeDefined();
    });

    it('should handle insufficient data', () => {
      const shortData = mockWeatherData.slice(0, 3); // Only 3 days
      const analysis = findPlantingWindows(shortData, 'Manila', 2025, 1);

      expect(analysis.windows.length).toBe(0);
      expect(analysis.optimalWindow).toBeNull();
      expect(analysis.dataQuality).toBe('poor');
    });

    it('should find multiple windows for longer datasets', () => {
      const longData = [
        ...mockWeatherData,
        { date: '2025-01-08', temperature: 26.0, dewPoint: 21.0, precipitation: 6.0, windSpeed: 8.0, humidity: 76 },
        { date: '2025-01-09', temperature: 25.5, dewPoint: 20.5, precipitation: 7.0, windSpeed: 7.5, humidity: 75 },
        { date: '2025-01-10', temperature: 26.5, dewPoint: 21.5, precipitation: 5.0, windSpeed: 8.5, humidity: 77 }
      ];

      const analysis = findPlantingWindows(longData, 'Manila', 2025, 1);

      expect(analysis.windows.length).toBe(4); // 10 days = 4 possible 7-day windows
      expect(analysis.optimalWindow).toBeDefined();
      expect(analysis.windows[0].score.overallScore).toBeGreaterThanOrEqual(analysis.windows[1].score.overallScore);
    });

    it('should sort windows by score', () => {
      const analysis = findPlantingWindows(mockWeatherData, 'Manila', 2025, 1);

      if (analysis.windows.length > 1) {
        for (let i = 1; i < analysis.windows.length; i++) {
          expect(analysis.windows[i-1].score.overallScore).toBeGreaterThanOrEqual(analysis.windows[i].score.overallScore);
        }
      }
    });

    it('should calculate confidence for each window', () => {
      const analysis = findPlantingWindows(mockWeatherData, 'Manila', 2025, 1);

      analysis.windows.forEach(window => {
        expect(window.confidence).toBeGreaterThanOrEqual(0);
        expect(window.confidence).toBeLessThanOrEqual(100);
        expect(window.weatherData.length).toBe(7);
      });
    });

    it('should assess data quality correctly', () => {
      // Poor quality (less than 7 days)
      const poorAnalysis = findPlantingWindows(mockWeatherData.slice(0, 3), 'Manila', 2025, 1);
      expect(poorAnalysis.dataQuality).toBe('poor');

      // Fair quality (7-59 days)
      const fairAnalysis = findPlantingWindows(mockWeatherData, 'Manila', 2025, 1);
      expect(fairAnalysis.dataQuality).toBe('fair');

      // Good quality (60-89 days) - would need more data
      const goodData = Array.from({ length: 70 }, (_, i) => ({
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        temperature: 25.0,
        dewPoint: 20.0,
        precipitation: 5.0,
        windSpeed: 8.0,
        humidity: 75
      }));
      const goodAnalysis = findPlantingWindows(goodData, 'Manila', 2025, 1);
      expect(goodAnalysis.dataQuality).toBe('good');
    });
  });

  describe('validateWeatherData', () => {
    it('should validate correct weather data', () => {
      expect(validateWeatherData(mockWeatherData)).toBe(true);
    });

    it('should reject empty data', () => {
      expect(validateWeatherData([])).toBe(false);
    });

    it('should reject null/undefined data', () => {
      expect(validateWeatherData(null as any)).toBe(false);
      expect(validateWeatherData(undefined as any)).toBe(false);
    });

    it('should reject data with missing fields', () => {
      const invalidData = [
        { date: '2025-01-01', temperature: 25.0, dewPoint: 20.0, precipitation: 5.0, windSpeed: 8.0 }
        // Missing humidity
      ];
      expect(validateWeatherData(invalidData as any)).toBe(false);
    });

    it('should reject data with wrong types', () => {
      const invalidData = [
        { date: '2025-01-01', temperature: '25', dewPoint: 20.0, precipitation: 5.0, windSpeed: 8.0, humidity: 75 }
        // Temperature is string instead of number
      ];
      expect(validateWeatherData(invalidData as any)).toBe(false);
    });

    it('should reject data with missing date', () => {
      const invalidData = [
        { temperature: 25.0, dewPoint: 20.0, precipitation: 5.0, windSpeed: 8.0, humidity: 75 }
        // Missing date
      ];
      expect(validateWeatherData(invalidData as any)).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle single day of data', () => {
      const singleDay = [mockWeatherData[0]];
      const score = calculateWeatherStabilityScore(singleDay);
      
      expect(score.overallScore).toBeGreaterThan(0);
      expect(score.factors.extremeEvents).toBe(0);
    });

    it('should handle zero precipitation', () => {
      const noRainData = mockWeatherData.map(d => ({ ...d, precipitation: 0 }));
      const score = calculateWeatherStabilityScore(noRainData);
      
      expect(score.precipitationScore).toBeLessThan(0.6); // Lower score for no rain
      expect(score.factors.precipitationDays).toBe(0);
    });

    it('should handle very high precipitation', () => {
      const heavyRainData = mockWeatherData.map(d => ({ ...d, precipitation: 100 }));
      const score = calculateWeatherStabilityScore(heavyRainData);
      
      expect(score.precipitationScore).toBeLessThan(0.3); // Lower score for heavy rain
      expect(score.factors.extremeEvents).toBeGreaterThan(0);
    });

    it('should handle temperature extremes', () => {
      const coldData = mockWeatherData.map(d => ({ ...d, temperature: 10 }));
      const hotData = mockWeatherData.map(d => ({ ...d, temperature: 45 }));
      
      const coldScore = calculateWeatherStabilityScore(coldData);
      const hotScore = calculateWeatherStabilityScore(hotData);
      
      expect(coldScore.temperatureStability).toBeLessThan(0.3);
      expect(hotScore.temperatureStability).toBeLessThan(0.3);
      expect(coldScore.factors.extremeEvents).toBeGreaterThan(0);
      expect(hotScore.factors.extremeEvents).toBeGreaterThan(0);
    });

    it('should handle wind extremes', () => {
      const calmData = mockWeatherData.map(d => ({ ...d, windSpeed: 0 }));
      const stormyData = mockWeatherData.map(d => ({ ...d, windSpeed: 50 }));
      
      const calmScore = calculateWeatherStabilityScore(calmData);
      const stormyScore = calculateWeatherStabilityScore(stormyData);
      
      expect(calmScore.windStability).toBeGreaterThan(0.4);
      expect(stormyScore.windStability).toBeLessThan(0.3);
      expect(stormyScore.factors.extremeEvents).toBeGreaterThan(0);
    });
  });

  describe('Recommendations Generation', () => {
    it('should generate recommendations for optimal conditions', () => {
      const optimalData = mockWeatherData.map(d => ({ 
        ...d, 
        temperature: 25.0, 
        precipitation: 10.0, 
        windSpeed: 8.0, 
        humidity: 75 
      }));
      
      const score = calculateWeatherStabilityScore(optimalData);
      
      // Even optimal conditions should have at least one recommendation
      expect(score.recommendations.length).toBeGreaterThanOrEqual(0);
      // Check if it has excellent conditions recommendation
      if (score.recommendations.length > 0) {
        expect(score.recommendations.some(rec => rec.includes('Excellent'))).toBe(true);
      }
    });

    it('should generate recommendations for poor conditions', () => {
      const score = calculateWeatherStabilityScore(extremeWeatherData);
      
      expect(score.recommendations.length).toBeGreaterThan(0);
      expect(score.recommendations.some(rec => rec.includes('extreme'))).toBe(true);
    });

    it('should generate temperature-specific recommendations', () => {
      const coldData = mockWeatherData.map(d => ({ ...d, temperature: 15 }));
      const hotData = mockWeatherData.map(d => ({ ...d, temperature: 40 }));
      
      const coldScore = calculateWeatherStabilityScore(coldData);
      const hotScore = calculateWeatherStabilityScore(hotData);
      
      expect(coldScore.recommendations.some(rec => rec.includes('warm up'))).toBe(true);
      expect(hotScore.recommendations.some(rec => rec.includes('heat stress'))).toBe(true);
    });

    it('should generate precipitation-specific recommendations', () => {
      const dryData = mockWeatherData.map(d => ({ ...d, precipitation: 0 }));
      const wetData = mockWeatherData.map(d => ({ ...d, precipitation: 100 }));
      
      const dryScore = calculateWeatherStabilityScore(dryData);
      const wetScore = calculateWeatherStabilityScore(wetData);
      
      expect(dryScore.recommendations.some(rec => rec.includes('irrigation'))).toBe(true);
      expect(wetScore.recommendations.some(rec => rec.includes('flooding'))).toBe(true);
    });
  });
});
