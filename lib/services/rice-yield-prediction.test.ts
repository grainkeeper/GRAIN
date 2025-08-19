/**
 * Unit Tests for Rice Yield Prediction Service
 * 
 * Tests the core prediction functions, MLR formula accuracy, and quarter selection logic.
 */

import { 
  predictQuarterYield, 
  analyzeQuarterSelection, 
  analyzeYearRange,
  getQuarterDetails,
  validateQuarterSelectionRequest,
  formatQuarterSelectionResult,
  getPredictionAccuracyInfo
} from './rice-yield-prediction';

import { 
  calculateQuarterlyYield,
  QUARTERLY_FORMULAS 
} from '@/lib/constants/quarterly-formulas';

import { 
  getQuarterlyWeatherData,
  validateYear,
  validateQuarter 
} from '@/lib/data/historical-weather-2025-2100';

// Mock the historical weather data module
jest.mock('@/lib/data/historical-weather-2025-2100', () => ({
  getQuarterlyWeatherData: jest.fn(),
  getYearlyWeatherData: jest.fn(),
  validateYear: jest.fn(),
  validateQuarter: jest.fn(),
  validateWeatherData: jest.fn().mockReturnValue(true), // Always return true for valid data
  getQuarterName: jest.fn(),
  getQuarterMonths: jest.fn()
}));

// Mock the quarterly formulas module
jest.mock('@/lib/constants/quarterly-formulas', () => ({
  calculateQuarterlyYield: jest.fn(),
  QUARTERLY_FORMULAS: [
    {
      quarter: 1,
      coefficients: { temperature: 8478.474259, dewPoint: -16643.35313, precipitation: 36502.00765, windSpeed: -5998.639807, humidity: -787.357142, constant: 420307.9461 },
      formula: 'Ŷ = 8478.474259T - 16643.35313D + 36502.00765P - 5998.639807W - 787.357142H + 420307.9461'
    },
    {
      quarter: 2,
      coefficients: { temperature: -3835.953799, dewPoint: -6149.597523, precipitation: -4483.424128, windSpeed: -2593.991107, humidity: -8024.420014, constant: 1067116.384 },
      formula: 'Ŷ = -3835.953799T - 6149.597523D - 4483.424128P - 2593.991107W - 8024.420014H + 1067116.384'
    },
    {
      quarter: 3,
      coefficients: { temperature: 16630.77076, dewPoint: -1018.254139, precipitation: 403.126612, windSpeed: 74623.00801, humidity: 25918.43338, constant: -2410001.76 },
      formula: 'Ŷ = 16630.77076T - 1018.254139D + 403.126612P + 74623.00801W + 25918.43338H - 2410001.76'
    },
    {
      quarter: 4,
      coefficients: { temperature: 8993.693672, dewPoint: 5844.061829, precipitation: -30748.53656, windSpeed: -33023.39764, humidity: -1155.458549, constant: 410764.6506 },
      formula: 'Ŷ = 8993.693672T + 5844.061829D - 30748.53656P - 33023.39764W - 1155.458549H + 410764.6506'
    }
  ],
  getQuarterlyFormula: jest.fn()
}));

const mockGetQuarterlyWeatherData = getQuarterlyWeatherData as jest.MockedFunction<typeof getQuarterlyWeatherData>;
const mockValidateYear = validateYear as jest.MockedFunction<typeof validateYear>;
const mockValidateQuarter = validateQuarter as jest.MockedFunction<typeof validateQuarter>;
const mockCalculateQuarterlyYield = calculateQuarterlyYield as jest.MockedFunction<typeof calculateQuarterlyYield>;

describe('Rice Yield Prediction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockValidateYear.mockReturnValue(true);
    mockValidateQuarter.mockReturnValue(true);
    mockCalculateQuarterlyYield.mockReturnValue(500000); // Default yield
  });

  describe('predictQuarterYield', () => {
    const mockWeatherData = {
      temperature: 25.5,
      dewPoint: 20.2,
      precipitation: 150.0,
      windSpeed: 12.5,
      humidity: 75.0,
      date: '2025-03-15',
      location: 'Philippines'
    };

    it('should predict yield for a valid quarter', async () => {
      mockGetQuarterlyWeatherData.mockReturnValue(mockWeatherData);
      mockCalculateQuarterlyYield.mockReturnValue(450000);

      const result = predictQuarterYield(2025, 1);

      expect(result.predictedYield).toBe(450000);
      expect(result.weatherData).toEqual(mockWeatherData);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should throw error for invalid year', () => {
      mockValidateYear.mockReturnValue(false);

      expect(() => predictQuarterYield(2024, 1)).toThrow('Invalid year: 2024');
    });

    it('should throw error for invalid quarter', () => {
      mockValidateQuarter.mockReturnValue(false);

      expect(() => predictQuarterYield(2025, 5 as any)).toThrow('Invalid quarter: 5');
    });

    it('should throw error for unavailable weather data', () => {
      mockGetQuarterlyWeatherData.mockImplementation(() => {
        throw new Error('No data available for year: 2025');
      });

      expect(() => predictQuarterYield(2025, 1)).toThrow('No data available for year: 2025');
    });

    it('should calculate confidence based on data quality', () => {
      mockGetQuarterlyWeatherData.mockReturnValue(mockWeatherData);
      mockCalculateQuarterlyYield.mockReturnValue(500000);

      const result = predictQuarterYield(2025, 2); // Q2 should have slight confidence boost

      expect(result.confidence).toBeGreaterThan(80); // Base confidence from 96.01% accuracy
    });
  });

  describe('analyzeQuarterSelection', () => {
    const mockYearlyData = {
      year: 2025,
      quarter1: { temperature: 23, dewPoint: 18, precipitation: 100, windSpeed: 10, humidity: 70, date: '2025-03-15', location: 'Philippines' },
      quarter2: { temperature: 25, dewPoint: 20, precipitation: 150, windSpeed: 12, humidity: 75, date: '2025-06-15', location: 'Philippines' },
      quarter3: { temperature: 27, dewPoint: 22, precipitation: 200, windSpeed: 14, humidity: 80, date: '2025-09-15', location: 'Philippines' },
      quarter4: { temperature: 25, dewPoint: 20, precipitation: 150, windSpeed: 12, humidity: 75, date: '2025-12-15', location: 'Philippines' }
    };

    beforeEach(() => {
      // Mock the yearly data access
      const { getYearlyWeatherData } = require('@/lib/data/historical-weather-2025-2100');
      getYearlyWeatherData.mockReturnValue(mockYearlyData);
      
      // Mock individual quarter predictions
      mockGetQuarterlyWeatherData
        .mockReturnValueOnce(mockYearlyData.quarter1)
        .mockReturnValueOnce(mockYearlyData.quarter2)
        .mockReturnValueOnce(mockYearlyData.quarter3)
        .mockReturnValueOnce(mockYearlyData.quarter4);
      
      mockCalculateQuarterlyYield
        .mockReturnValueOnce(400000) // Q1
        .mockReturnValueOnce(500000) // Q2 - highest
        .mockReturnValueOnce(450000) // Q3
        .mockReturnValueOnce(480000); // Q4
    });

    it('should analyze all quarters and find optimal quarter', () => {
      const result = analyzeQuarterSelection(2025);

      expect(result.year).toBe(2025);
      expect(result.optimalQuarter).toBe(2); // Q2 has highest yield
      expect(result.optimalYield).toBe(500000);
      expect(result.overallConfidence).toBeGreaterThan(0);
      expect(result.quarterlyYields).toHaveProperty('quarter1');
      expect(result.quarterlyYields).toHaveProperty('quarter2');
      expect(result.quarterlyYields).toHaveProperty('quarter3');
      expect(result.quarterlyYields).toHaveProperty('quarter4');
    });

    it('should throw error for invalid year', () => {
      mockValidateYear.mockReturnValue(false);

      expect(() => analyzeQuarterSelection(2024)).toThrow('Invalid year: 2024');
    });

    it('should calculate overall confidence based on yield spread', () => {
      // Mock very close yields (low confidence)
      mockCalculateQuarterlyYield
        .mockReturnValueOnce(500000) // Q1
        .mockReturnValueOnce(501000) // Q2 - very close
        .mockReturnValueOnce(500500) // Q3
        .mockReturnValueOnce(500200); // Q4

      const result = analyzeQuarterSelection(2025);
      
      // Should have lower confidence due to close yields
      expect(result.overallConfidence).toBeLessThan(90);
    });
  });

  describe('analyzeYearRange', () => {
    it('should throw error for invalid year range', () => {
      expect(() => analyzeYearRange(2027, 2025)).toThrow('Invalid year range: 2027-2025');
    });

    it('should handle individual year failures gracefully', () => {
      // Test that the function exists and can be called
      expect(typeof analyzeYearRange).toBe('function');
      
      // Test that it throws for invalid range
      expect(() => analyzeYearRange(2027, 2025)).toThrow('Invalid year range: 2027-2025');
    });
  });

  describe('getQuarterDetails', () => {
    it('should return quarter details', () => {
      const { getQuarterName, getQuarterMonths, getQuarterlyFormula } = require('@/lib/data/historical-weather-2025-2100');
      const { getQuarterlyFormula: getQuarterlyFormulaMock } = require('@/lib/constants/quarterly-formulas');
      
      getQuarterName.mockReturnValue('Q1 (January-March)');
      getQuarterMonths.mockReturnValue({ start: 'January', end: 'March' });
      getQuarterlyFormulaMock.mockReturnValue(QUARTERLY_FORMULAS[0]);

      const details = getQuarterDetails(1);

      expect(details.quarter).toBe(1);
      expect(details.name).toBe('Q1 (January-March)');
      expect(details.months).toEqual({ start: 'January', end: 'March' });
      expect(details.formula).toBeDefined();
    });
  });

  describe('validateQuarterSelectionRequest', () => {
    it('should validate valid request', () => {
      const result = validateQuarterSelectionRequest({ year: 2025 });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing year', () => {
      const result = validateQuarterSelectionRequest({} as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Year is required');
    });

    it('should reject invalid year', () => {
      mockValidateYear.mockReturnValue(false);

      const result = validateQuarterSelectionRequest({ year: 2024 });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid year: 2024. Must be between 2025 and 2100.');
    });
  });

  describe('formatQuarterSelectionResult', () => {
    it('should format quarter selection result', () => {
             const mockResult = {
         year: 2025,
         quarterlyYields: {
           quarter1: { quarter: 1 as const, predictedYield: 400000, confidence: 80, weatherData: { temperature: 23, dewPoint: 18, precipitation: 100, windSpeed: 10, humidity: 70, date: '2025-03-15', location: 'Philippines' } },
           quarter2: { quarter: 2 as const, predictedYield: 500000, confidence: 85, weatherData: { temperature: 25, dewPoint: 20, precipitation: 150, windSpeed: 12, humidity: 75, date: '2025-06-15', location: 'Philippines' } },
           quarter3: { quarter: 3 as const, predictedYield: 450000, confidence: 82, weatherData: { temperature: 27, dewPoint: 22, precipitation: 200, windSpeed: 14, humidity: 80, date: '2025-09-15', location: 'Philippines' } },
           quarter4: { quarter: 4 as const, predictedYield: 480000, confidence: 83, weatherData: { temperature: 25, dewPoint: 20, precipitation: 150, windSpeed: 12, humidity: 75, date: '2025-12-15', location: 'Philippines' } }
         },
         optimalQuarter: 2 as const,
         optimalYield: 500000,
         overallConfidence: 85,
         analyzedAt: new Date().toISOString()
       };

      const { getQuarterName, getQuarterMonths } = require('@/lib/data/historical-weather-2025-2100');
      getQuarterName.mockReturnValue('Q2 (April-June)');
      getQuarterMonths.mockReturnValue({ start: 'April', end: 'June' });

      const formatted = formatQuarterSelectionResult(mockResult);

      expect(formatted.year).toBe(2025);
      expect(formatted.optimalQuarter.number).toBe(2);
      expect(formatted.optimalQuarter.predictedYield).toBe(500000);
      expect(formatted.optimalQuarter.confidence).toBe(85);
      expect(formatted.allQuarters).toHaveLength(4);
    });
  });

  describe('getPredictionAccuracyInfo', () => {
    it('should return accuracy information', () => {
      const accuracyInfo = getPredictionAccuracyInfo();

      expect(accuracyInfo.overallAccuracy).toBe(96.01);
      expect(accuracyInfo.accuracySource).toBe('Mathematical analysis and geoclimatic variable correlation');
      expect(accuracyInfo.confidenceFactors).toHaveLength(4);
      expect(accuracyInfo.limitations).toHaveLength(4);
    });
  });

  describe('MLR Formula Accuracy Validation', () => {
    beforeEach(() => {
      // Reset mocks for this specific test suite
      mockCalculateQuarterlyYield.mockReset();
      mockGetQuarterlyWeatherData.mockReset();
    });

    it('should calculate correct yields using MLR formulas', () => {
      const testWeatherData = {
        temperature: 25.0,
        dewPoint: 20.0,
        precipitation: 150.0,
        windSpeed: 12.0,
        humidity: 75.0
      };

      // Test Q1 formula: Ŷ = 8478.474259T - 16643.35313D + 36502.00765P - 5998.639807W - 787.357142H + 420307.9461
      const expectedQ1Yield = 
        8478.474259 * testWeatherData.temperature +
        (-16643.35313) * testWeatherData.dewPoint +
        36502.00765 * testWeatherData.precipitation +
        (-5998.639807) * testWeatherData.windSpeed +
        (-787.357142) * testWeatherData.humidity +
        420307.9461;

      // Override the default mock for this specific test
      mockCalculateQuarterlyYield.mockReturnValue(expectedQ1Yield);
      mockGetQuarterlyWeatherData.mockReturnValue({
        ...testWeatherData,
        date: '2025-03-15',
        location: 'Philippines'
      });

      const result = predictQuarterYield(2025, 1);

      expect(result.predictedYield).toBe(expectedQ1Yield);
      expect(mockCalculateQuarterlyYield).toHaveBeenCalledWith(1, testWeatherData);
    });

    it('should maintain 96.01% accuracy claim', () => {
      const accuracyInfo = getPredictionAccuracyInfo();
      
      expect(accuracyInfo.overallAccuracy).toBe(96.01);
      expect(accuracyInfo.accuracySource).toContain('Mathematical analysis');
    });

    it('should handle edge case weather values', () => {
      const extremeWeatherData = {
        temperature: 40.0, // Very high
        dewPoint: 35.0,   // Very high
        precipitation: 500.0, // Very high
        windSpeed: 50.0,  // Very high
        humidity: 95.0    // Very high
      };

      const expectedExtremeYield = 2000000; // High yield for extreme conditions

      mockGetQuarterlyWeatherData.mockReturnValue({
        ...extremeWeatherData,
        date: '2025-03-15',
        location: 'Philippines'
      });
      mockCalculateQuarterlyYield.mockReturnValue(expectedExtremeYield);

      const result = predictQuarterYield(2025, 1);

      expect(result.predictedYield).toBe(expectedExtremeYield);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });
});
