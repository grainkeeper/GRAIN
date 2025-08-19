/**
 * Unit Tests for Integrated Planting Window Analysis Service
 * 
 * Tests the integration of quarter selection with 7-day window analysis,
 * including location-specific recommendations and confidence scoring.
 */

import { 
  PlantingWindowAnalysisService,
  analyzePlantingWindow,
  type PlantingAnalysisRequest,
  type IntegratedPlantingAnalysis 
} from './planting-window-analysis';
import { LocationCoordinates } from './open-meteo-api';

// Mock the dependencies
jest.mock('./rice-yield-prediction', () => ({
  analyzeQuarterSelection: jest.fn()
}));

jest.mock('./open-meteo-api', () => ({
  getQuarterlyHistoricalWeatherData: jest.fn()
}));

jest.mock('@/lib/utils/weather-stability', () => ({
  findPlantingWindows: jest.fn(),
  validateWeatherData: jest.fn()
}));

const mockAnalyzeQuarterSelection = require('./rice-yield-prediction').analyzeQuarterSelection;
const mockGetQuarterlyHistoricalWeatherData = require('./open-meteo-api').getQuarterlyHistoricalWeatherData;
const mockFindPlantingWindows = require('@/lib/utils/weather-stability').findPlantingWindows;
const mockValidateWeatherData = require('@/lib/utils/weather-stability').validateWeatherData;

describe('Integrated Planting Window Analysis Service', () => {
  const mockLocation: LocationCoordinates = {
    latitude: 15.4817,
    longitude: 120.9730,
    name: 'Central Luzon'
  };

  const mockQuarterSelection = {
    year: 2025,
    quarterlyYields: {
      quarter1: { quarter: 1 as const, predictedYield: 400000, confidence: 80, weatherData: {} },
      quarter2: { quarter: 2 as const, predictedYield: 500000, confidence: 85, weatherData: {} },
      quarter3: { quarter: 3 as const, predictedYield: 450000, confidence: 82, weatherData: {} },
      quarter4: { quarter: 4 as const, predictedYield: 480000, confidence: 83, weatherData: {} }
    },
    optimalQuarter: 2 as const,
    optimalYield: 500000,
    overallConfidence: 85,
    analyzedAt: new Date().toISOString()
  };

  const mockWeatherData = [
    { date: '2025-04-01', temperature: 25.0, dewPoint: 20.0, precipitation: 5.0, windSpeed: 8.0, humidity: 75 },
    { date: '2025-04-02', temperature: 26.0, dewPoint: 21.0, precipitation: 8.0, windSpeed: 7.0, humidity: 78 },
    { date: '2025-04-03', temperature: 24.5, dewPoint: 19.5, precipitation: 12.0, windSpeed: 9.0, humidity: 80 },
    { date: '2025-04-04', temperature: 25.5, dewPoint: 20.5, precipitation: 3.0, windSpeed: 6.0, humidity: 72 },
    { date: '2025-04-05', temperature: 27.0, dewPoint: 22.0, precipitation: 0.0, windSpeed: 10.0, humidity: 70 },
    { date: '2025-04-06', temperature: 26.5, dewPoint: 21.5, precipitation: 7.0, windSpeed: 8.5, humidity: 76 },
    { date: '2025-04-07', temperature: 25.8, dewPoint: 20.8, precipitation: 9.0, windSpeed: 7.5, humidity: 77 }
  ];

  const mockWindowAnalysis = {
    location: 'Central Luzon',
    year: 2025,
    quarter: 2,
    windows: [
      {
        startDate: '2025-04-01',
        endDate: '2025-04-07',
        score: {
          overallScore: 85.5,
          temperatureStability: 88.2,
          precipitationScore: 82.1,
          windStability: 86.0,
          humidityStability: 85.8,
          factors: {
            temperatureVariance: 1.2,
            precipitationTotal: 44.0,
            precipitationDays: 6,
            windVariance: 2.1,
            humidityVariance: 12.8,
            extremeEvents: 0
          },
          recommendations: ['Excellent planting conditions expected'],
          riskLevel: 'low' as const
        },
        weatherData: mockWeatherData,
        confidence: 88.5
      }
    ],
    optimalWindow: null,
    analysisDate: new Date().toISOString(),
    dataQuality: 'good' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mocks
    mockAnalyzeQuarterSelection.mockReturnValue(mockQuarterSelection);
    mockGetQuarterlyHistoricalWeatherData.mockResolvedValue(mockWeatherData);
    mockValidateWeatherData.mockReturnValue(true);
    mockFindPlantingWindows.mockReturnValue({
      ...mockWindowAnalysis,
      optimalWindow: mockWindowAnalysis.windows[0]
    });
  });

  describe('PlantingWindowAnalysisService', () => {
    let service: PlantingWindowAnalysisService;

    beforeEach(() => {
      service = new PlantingWindowAnalysisService();
    });

    describe('analyzePlantingWindow', () => {
      it('should perform complete integrated analysis', async () => {
        const request: PlantingAnalysisRequest = {
          year: 2025,
          location: mockLocation,
          includeAlternatives: false,
          useHistoricalData: true
        };

        const result = await service.analyzePlantingWindow(request);

        expect(result).toMatchObject({
          quarterSelection: mockQuarterSelection,
          optimalQuarter: 2,
          location: mockLocation,
          year: 2025
        });
        
        expect(result.quarterConfidence).toBeGreaterThan(80);
        expect(result.windowConfidence).toBeGreaterThan(80);
        expect(result.overallConfidence).toBeGreaterThan(80);
        expect(result.recommendation).toBeDefined();
        expect(result.dataQuality).toBeDefined();
      });

      it('should call dependencies in correct order', async () => {
        const request: PlantingAnalysisRequest = {
          year: 2025,
          location: mockLocation
        };

        await service.analyzePlantingWindow(request);

        expect(mockAnalyzeQuarterSelection).toHaveBeenCalledWith(2025);
        expect(mockGetQuarterlyHistoricalWeatherData).toHaveBeenCalledWith(mockLocation, 2024, 2);
        expect(mockValidateWeatherData).toHaveBeenCalledWith(mockWeatherData);
        expect(mockFindPlantingWindows).toHaveBeenCalledWith(mockWeatherData, 'Central Luzon', 2025, 2);
      });

      it('should handle weather data fetch failures with fallback', async () => {
        mockGetQuarterlyHistoricalWeatherData
          .mockRejectedValueOnce(new Error('API Error'))
          .mockResolvedValueOnce(mockWeatherData);

        const request: PlantingAnalysisRequest = {
          year: 2025,
          location: mockLocation
        };

        const result = await service.analyzePlantingWindow(request);

        expect(mockGetQuarterlyHistoricalWeatherData).toHaveBeenCalledTimes(2);
        expect(mockGetQuarterlyHistoricalWeatherData).toHaveBeenLastCalledWith(mockLocation, 2023, 2);
        expect(result).toBeDefined();
      });

      it('should include alternatives when requested', async () => {
        const request: PlantingAnalysisRequest = {
          year: 2025,
          location: mockLocation,
          includeAlternatives: true
        };

        const result = await service.analyzePlantingWindow(request);

        expect(result.fallbackOptions).toBeDefined();
        expect(result.fallbackOptions!.alternativeQuarters).toBeDefined();
        expect(result.fallbackOptions!.alternativeWindows).toBeDefined();
        expect(result.fallbackOptions!.alternativeQuarters.length).toBeLessThanOrEqual(2);
      });

      it('should validate request parameters', async () => {
        const invalidRequest = {
          year: 2024, // Invalid year
          location: mockLocation
        };

        await expect(service.analyzePlantingWindow(invalidRequest))
          .rejects.toThrow('Invalid request');
      });

      it('should handle invalid weather data', async () => {
        mockValidateWeatherData.mockReturnValue(false);

        const request: PlantingAnalysisRequest = {
          year: 2025,
          location: mockLocation
        };

        await expect(service.analyzePlantingWindow(request))
          .rejects.toThrow('Invalid weather data');
      });
    });

    describe('Request Validation', () => {
      it('should validate year parameter', () => {
        const service = new PlantingWindowAnalysisService();
        
        const invalidYearRequest = {
          year: 2020,
          location: mockLocation
        };

        const validation = (service as any).validateRequest(invalidYearRequest);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Year must be between 2025 and 2100');
      });

      it('should validate location coordinates', () => {
        const service = new PlantingWindowAnalysisService();
        
        const invalidLocationRequest = {
          year: 2025,
          location: {
            latitude: 200, // Invalid latitude
            longitude: 120,
            name: 'Test'
          }
        };

        const validation = (service as any).validateRequest(invalidLocationRequest);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Valid latitude is required (-90 to 90)');
      });

      it('should validate required fields', () => {
        const service = new PlantingWindowAnalysisService();
        
        const emptyRequest = {} as any;

        const validation = (service as any).validateRequest(emptyRequest);
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      });
    });

    describe('Confidence Calculations', () => {
      it('should calculate quarter confidence correctly', () => {
        const service = new PlantingWindowAnalysisService();
        
        const confidence = (service as any).calculateQuarterConfidence(mockQuarterSelection);
        
        expect(confidence).toBeGreaterThan(80);
        expect(confidence).toBeLessThanOrEqual(100);
      });

      it('should calculate overall confidence combining quarter and window', () => {
        const service = new PlantingWindowAnalysisService();
        
        const quarterConfidence = 95;
        const windowConfidence = 85;
        
        const overall = (service as any).calculateOverallConfidence(quarterConfidence, windowConfidence);
        
        // Should be weighted average with quarter having higher weight
        expect(overall).toBeGreaterThan(Math.min(quarterConfidence, windowConfidence));
        expect(overall).toBeLessThan(Math.max(quarterConfidence, windowConfidence));
      });
    });

    describe('Recommendation Generation', () => {
      it('should generate comprehensive recommendations', () => {
        const service = new PlantingWindowAnalysisService();
        
        const windowAnalysis = {
          ...mockWindowAnalysis,
          optimalWindow: mockWindowAnalysis.windows[0]
        };
        
        const recommendation = (service as any).generateRecommendation(
          mockQuarterSelection,
          windowAnalysis,
          windowAnalysis.optimalWindow,
          90
        );

        expect(recommendation.plantingPeriod).toBeDefined();
        expect(recommendation.quarterReason).toBeDefined();
        expect(recommendation.windowReason).toBeDefined();
        expect(recommendation.riskLevel).toBe('low');
        expect(recommendation.actionItems).toBeInstanceOf(Array);
        expect(recommendation.actionItems.length).toBeGreaterThan(0);
      });

      it('should determine risk levels correctly', () => {
        const service = new PlantingWindowAnalysisService();
        
        // High confidence = low risk
        const lowRiskRec = (service as any).generateRecommendation(
          mockQuarterSelection,
          mockWindowAnalysis,
          mockWindowAnalysis.windows[0],
          95
        );
        expect(lowRiskRec.riskLevel).toBe('low');
        
        // Low confidence = high risk
        const highRiskRec = (service as any).generateRecommendation(
          mockQuarterSelection,
          mockWindowAnalysis,
          mockWindowAnalysis.windows[0],
          60
        );
        expect(highRiskRec.riskLevel).toBe('high');
      });
    });

    describe('Data Quality Assessment', () => {
      it('should assess data quality correctly', () => {
        const service = new PlantingWindowAnalysisService();
        
        const dataQuality = (service as any).assessDataQuality(
          mockQuarterSelection,
          mockWindowAnalysis,
          mockWeatherData
        );

        expect(dataQuality.quarterData).toBe('excellent');
        expect(dataQuality.weatherData).toBe('good');
        expect(dataQuality.overall).toBeDefined();
      });

      it('should use minimum quality for overall assessment', () => {
        const service = new PlantingWindowAnalysisService();
        
        const poorWindowAnalysis = {
          ...mockWindowAnalysis,
          dataQuality: 'poor' as const
        };
        
        const dataQuality = (service as any).assessDataQuality(
          mockQuarterSelection,
          poorWindowAnalysis,
          mockWeatherData
        );

        expect(dataQuality.overall).toBe('poor'); // Should be limited by poorest quality
      });
    });
  });

  describe('Convenience Functions', () => {
    it('should export convenience function for quick analysis', async () => {
      const request: PlantingAnalysisRequest = {
        year: 2025,
        location: mockLocation
      };

      const result = await analyzePlantingWindow(request);

      expect(result).toBeDefined();
      expect(result.year).toBe(2025);
      expect(result.location).toEqual(mockLocation);
    });
  });

  describe('Error Handling', () => {
    it('should handle quarter selection failures', async () => {
      mockAnalyzeQuarterSelection.mockImplementation(() => {
        throw new Error('Quarter selection failed');
      });

      const request: PlantingAnalysisRequest = {
        year: 2025,
        location: mockLocation
      };

      await expect(analyzePlantingWindow(request))
        .rejects.toThrow('Planting window analysis failed');
    });

    it('should handle persistent weather data failures', async () => {
      mockGetQuarterlyHistoricalWeatherData.mockRejectedValue(new Error('Weather API unavailable'));

      const request: PlantingAnalysisRequest = {
        year: 2025,
        location: mockLocation
      };

      await expect(analyzePlantingWindow(request))
        .rejects.toThrow('Planting window analysis failed');
    });

    it('should handle window analysis failures', async () => {
      mockFindPlantingWindows.mockImplementation(() => {
        throw new Error('Window analysis failed');
      });

      const request: PlantingAnalysisRequest = {
        year: 2025,
        location: mockLocation
      };

      await expect(analyzePlantingWindow(request))
        .rejects.toThrow('Planting window analysis failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle analysis without optimal window', async () => {
      mockFindPlantingWindows.mockReturnValue({
        ...mockWindowAnalysis,
        windows: [],
        optimalWindow: null
      });

      const request: PlantingAnalysisRequest = {
        year: 2025,
        location: mockLocation
      };

      const result = await analyzePlantingWindow(request);

      expect(result.optimalWindow).toBeNull();
      expect(result.windowConfidence).toBe(0);
      expect(result.recommendation.windowReason).toContain('Quarter-level recommendation only');
    });

    it('should handle different quarter selections', async () => {
      const q3Selection = {
        ...mockQuarterSelection,
        optimalQuarter: 3 as const,
        optimalYield: 450000
      };
      
      mockAnalyzeQuarterSelection.mockReturnValue(q3Selection);

      const request: PlantingAnalysisRequest = {
        year: 2025,
        location: mockLocation
      };

      const result = await analyzePlantingWindow(request);

      expect(result.optimalQuarter).toBe(3);
      expect(mockGetQuarterlyHistoricalWeatherData).toHaveBeenCalledWith(mockLocation, 2024, 3);
    });
  });
});
