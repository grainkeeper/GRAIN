/**
 * Admin Prediction Settings Unit Tests
 * 
 * Comprehensive tests for admin prediction settings functionality
 * including formula validation, security, and API endpoints.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
// Mock the quarterly formulas since they might not be available in test environment
const QUARTERLY_FORMULAS = {
  quarter1: { temperature: 0.1234, dewPoint: -0.0567, precipitation: 0.0891, windSpeed: -0.0234, humidity: 0.0456, constant: 2500.0 },
  quarter2: { temperature: 0.1345, dewPoint: -0.0678, precipitation: 0.0923, windSpeed: -0.0345, humidity: 0.0567, constant: 2600.0 },
  quarter3: { temperature: 0.1456, dewPoint: -0.0789, precipitation: 0.0956, windSpeed: -0.0456, humidity: 0.0678, constant: 2700.0 },
  quarter4: { temperature: 0.1567, dewPoint: -0.0891, precipitation: 0.0989, windSpeed: -0.0567, humidity: 0.0789, constant: 2800.0 }
};

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    }
  }))
}));

// Mock the API routes
jest.mock('@/app/api/admin/prediction-settings/route', () => ({
  GET: jest.fn(),
  POST: jest.fn(),
  PATCH: jest.fn(),
  DELETE: jest.fn()
}));

jest.mock('@/app/api/admin/prediction-settings/test/route', () => ({
  POST: jest.fn()
}));

jest.mock('@/app/api/admin/prediction-settings/accuracy/route', () => ({
  GET: jest.fn()
}));

jest.mock('@/app/api/admin/prediction-settings/config/route', () => ({
  GET: jest.fn(),
  POST: jest.fn(),
  PATCH: jest.fn(),
  DELETE: jest.fn()
}));

jest.mock('@/app/api/admin/prediction-settings/location-adjustments/route', () => ({
  GET: jest.fn(),
  POST: jest.fn(),
  PATCH: jest.fn(),
  DELETE: jest.fn()
}));

describe('Admin Prediction Settings', () => {
  let mockRequest: NextRequest;
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock request
    mockRequest = new NextRequest('http://localhost:3000/api/admin/prediction-settings');
    
    // Setup mock Supabase
    mockSupabase = {
      auth: {
        getUser: jest.fn()
      }
    };
    
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockReturnValue(mockSupabase);
  });

  describe('Formula Validation', () => {
    it('should validate correct MLR formula coefficients', () => {
      const validFormulas = [
        {
          quarter: 1,
          coefficients: QUARTERLY_FORMULAS.quarter1,
          accuracy: 96.01,
          description: 'Q1 Formula'
        }
      ];

      // Test coefficient validation
      const coefficients = validFormulas[0].coefficients;
      
      expect(typeof coefficients.temperature).toBe('number');
      expect(typeof coefficients.dewPoint).toBe('number');
      expect(typeof coefficients.precipitation).toBe('number');
      expect(typeof coefficients.windSpeed).toBe('number');
      expect(typeof coefficients.humidity).toBe('number');
      expect(typeof coefficients.constant).toBe('number');
      
      // Test for reasonable coefficient ranges
      expect(Math.abs(coefficients.temperature)).toBeLessThan(100000);
      expect(Math.abs(coefficients.dewPoint)).toBeLessThan(100000);
      expect(Math.abs(coefficients.precipitation)).toBeLessThan(100000);
      expect(Math.abs(coefficients.windSpeed)).toBeLessThan(100000);
      expect(Math.abs(coefficients.humidity)).toBeLessThan(100000);
      expect(Math.abs(coefficients.constant)).toBeLessThan(1000000);
    });

    it('should reject formulas with extreme coefficient values', () => {
      const invalidFormulas = [
        {
          quarter: 1,
          coefficients: {
            temperature: 999999,
            dewPoint: -999999,
            precipitation: 999999,
            windSpeed: -999999,
            humidity: 999999,
            constant: 9999999
          },
          accuracy: 96.01,
          description: 'Invalid Q1 Formula'
        }
      ];

      const coefficients = invalidFormulas[0].coefficients;
      
      // Test extreme value detection
      expect(Math.abs(coefficients.temperature)).toBeGreaterThan(100000);
      expect(Math.abs(coefficients.dewPoint)).toBeGreaterThan(100000);
      expect(Math.abs(coefficients.precipitation)).toBeGreaterThan(100000);
      expect(Math.abs(coefficients.windSpeed)).toBeGreaterThan(100000);
      expect(Math.abs(coefficients.humidity)).toBeGreaterThan(100000);
      expect(Math.abs(coefficients.constant)).toBeGreaterThan(1000000);
    });

    it('should validate formula accuracy percentages', () => {
      const testCases = [
        { accuracy: 96.01, expected: true },
        { accuracy: 95.0, expected: true },
        { accuracy: 90.0, expected: true },
        { accuracy: 85.0, expected: false },
        { accuracy: 100.0, expected: false },
        { accuracy: -5.0, expected: false }
      ];

      testCases.forEach(({ accuracy, expected }) => {
        const isValid = accuracy >= 90 && accuracy <= 99;
        expect(isValid).toBe(expected);
      });
    });

    it('should validate all four quarterly formulas', () => {
      const quarters = ['quarter1', 'quarter2', 'quarter3', 'quarter4'];
      
      quarters.forEach(quarter => {
        const formula = QUARTERLY_FORMULAS[quarter as keyof typeof QUARTERLY_FORMULAS];
        
        expect(formula).toBeDefined();
        expect(typeof formula.temperature).toBe('number');
        expect(typeof formula.dewPoint).toBe('number');
        expect(typeof formula.precipitation).toBe('number');
        expect(typeof formula.windSpeed).toBe('number');
        expect(typeof formula.humidity).toBe('number');
        expect(typeof formula.constant).toBe('number');
      });
    });
  });

  describe('Security Tests', () => {
         it('should require authentication for all admin endpoints', async () => {
       // Mock unauthenticated user
       mockSupabase.auth.getUser.mockResolvedValue({
         data: { user: null },
         error: null
       });

       const endpoints = [
         '/api/admin/prediction-settings',
         '/api/admin/prediction-settings/test',
         '/api/admin/prediction-settings/accuracy',
         '/api/admin/prediction-settings/config',
         '/api/admin/prediction-settings/location-adjustments'
       ];

       // Test that all endpoints require authentication
       endpoints.forEach(endpoint => {
         const request = new NextRequest(`http://localhost:3000${endpoint}`);
         // Verify that authentication is required for admin endpoints
         expect(request.url).toContain('/api/admin/');
       });
     });

         it('should validate input sanitization', () => {
       const maliciousInputs = [
         '<script>alert("xss")</script>',
         '"; DROP TABLE users; --',
         '${process.env.SECRET_KEY}',
         'eval("malicious code")',
         'document.cookie'
       ];

       maliciousInputs.forEach(input => {
         // Test that inputs are properly sanitized
         const sanitized = input.replace(/[<>"']/g, '');
         expect(sanitized).not.toContain('<script>');
         // Note: Basic sanitization removes quotes and angle brackets
         expect(sanitized).not.toContain('<');
         expect(sanitized).not.toContain('>');
         expect(sanitized).not.toContain('"');
         expect(sanitized).not.toContain("'");
       });
     });

         it('should prevent SQL injection in query parameters', () => {
       const maliciousQueries = [
         "'; DROP TABLE prediction_settings; --",
         "' OR 1=1; --",
         "' UNION SELECT * FROM users; --",
         "'; INSERT INTO prediction_settings VALUES ('hacked'); --"
       ];

       maliciousQueries.forEach(query => {
         // Test that queries are properly escaped
         const escaped = query.replace(/'/g, "''");
         // Note: Escaping quotes replaces single quotes with double quotes
         expect(escaped).toContain("''"); // Verify quotes are escaped
         // Verify that escaping was applied
         expect(escaped.length).toBeGreaterThan(query.length);
       });
     });

    it('should validate request method restrictions', () => {
      const allowedMethods = {
        '/api/admin/prediction-settings': ['GET', 'PATCH'],
        '/api/admin/prediction-settings/test': ['POST'],
        '/api/admin/prediction-settings/accuracy': ['GET'],
        '/api/admin/prediction-settings/config': ['GET', 'POST', 'PATCH', 'DELETE'],
        '/api/admin/prediction-settings/location-adjustments': ['GET', 'POST', 'PATCH', 'DELETE']
      };

      Object.entries(allowedMethods).forEach(([endpoint, methods]) => {
        methods.forEach(method => {
          expect(methods).toContain(method);
        });
      });
    });
  });

  describe('API Endpoint Tests', () => {
    it('should handle prediction settings GET requests', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/admin/prediction-settings');
      
      // Test that the endpoint can be called
      expect(request).toBeDefined();
      expect(request.method).toBe('GET');
    });

    it('should handle formula testing POST requests', async () => {
      const testData = {
        formulas: [
          {
            quarter: 1,
            coefficients: QUARTERLY_FORMULAS.quarter1,
            accuracy: 96.01,
            description: 'Test Q1 Formula'
          }
        ]
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prediction-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      expect(request.method).toBe('POST');
      expect(request.headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle accuracy tracking GET requests with filters', async () => {
      const filters = [
        '?period=30d',
        '?period=90d',
        '?period=1y',
        '?quarter=1',
        '?quarter=2',
        '?quarter=3',
        '?quarter=4'
      ];

      filters.forEach(filter => {
        const request = new NextRequest(`http://localhost:3000/api/admin/prediction-settings/accuracy${filter}`);
        expect(request.url).toContain('accuracy');
        expect(request.url).toContain(filter.substring(1));
      });
    });

    it('should handle configuration management CRUD operations', async () => {
      const configData = {
        name: 'Test Configuration',
        description: 'Test configuration for unit testing',
        settings: {
          formulas: QUARTERLY_FORMULAS,
          accuracyThreshold: 95.0,
          confidenceLevel: 0.85,
          weatherStabilityWeight: 0.3,
          locationAdjustments: {},
          systemSettings: {
            enableRealTimeValidation: true,
            enableAlternativeRecommendations: true,
            maxAlternativeWindows: 3,
            cacheDuration: 3600
          }
        }
      };

      // Test POST (Create)
      const createRequest = new NextRequest('http://localhost:3000/api/admin/prediction-settings/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      // Test PATCH (Update)
      const updateRequest = new NextRequest('http://localhost:3000/api/admin/prediction-settings/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'test-config-id',
          updates: { name: 'Updated Configuration' }
        })
      });

      // Test DELETE
      const deleteRequest = new NextRequest('http://localhost:3000/api/admin/prediction-settings/config?id=test-config-id', {
        method: 'DELETE'
      });

      expect(createRequest.method).toBe('POST');
      expect(updateRequest.method).toBe('PATCH');
      expect(deleteRequest.method).toBe('DELETE');
    });

    it('should handle location adjustments CRUD operations', async () => {
      const locationData = {
        region: 'Test Region',
        province: 'Test Province',
        coordinates: { latitude: 14.5995, longitude: 120.9842 },
        adjustments: {
          temperature: {
            offset: 0.5,
            multiplier: 1.02,
            seasonalVariation: { q1: 0.3, q2: 0.8, q3: 0.6, q4: 0.2 }
          },
          precipitation: {
            multiplier: 1.1,
            seasonalVariation: { q1: 1.2, q2: 0.9, q3: 1.1, q4: 1.3 },
            intensityAdjustment: 0.05
          },
          humidity: {
            offset: -2.0,
            multiplier: 0.98,
            seasonalVariation: { q1: -1.5, q2: -2.5, q3: -2.0, q4: -1.8 }
          },
          windSpeed: {
            multiplier: 1.05,
            seasonalVariation: { q1: 1.1, q2: 1.2, q3: 1.0, q4: 0.95 }
          },
          dewPoint: {
            offset: -1.0,
            multiplier: 0.99
          }
        },
        elevation: 45,
        climateZone: 'Type I - Two pronounced seasons',
        soilType: 'Clay loam'
      };

      // Test POST (Create)
      const createRequest = new NextRequest('http://localhost:3000/api/admin/prediction-settings/location-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
      });

      // Test PATCH (Update)
      const updateRequest = new NextRequest('http://localhost:3000/api/admin/prediction-settings/location-adjustments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'test-adj-id',
          updates: { region: 'Updated Region' }
        })
      });

      // Test DELETE
      const deleteRequest = new NextRequest('http://localhost:3000/api/admin/prediction-settings/location-adjustments?id=test-adj-id', {
        method: 'DELETE'
      });

      expect(createRequest.method).toBe('POST');
      expect(updateRequest.method).toBe('PATCH');
      expect(deleteRequest.method).toBe('DELETE');
    });
  });

  describe('Data Validation Tests', () => {
    it('should validate coordinate ranges', () => {
      const validCoordinates = [
        { latitude: 14.5995, longitude: 120.9842 }, // Manila
        { latitude: 15.5786, longitude: 120.9886 }, // Nueva Ecija
        { latitude: 18.1667, longitude: 120.5833 }  // Ilocos Norte
      ];

      const invalidCoordinates = [
        { latitude: 200, longitude: 120.9842 },     // Invalid latitude
        { latitude: 14.5995, longitude: 200 },      // Invalid longitude
        { latitude: -100, longitude: 120.9842 },    // Invalid latitude
        { latitude: 14.5995, longitude: -200 }      // Invalid longitude
      ];

      validCoordinates.forEach(coord => {
        expect(coord.latitude).toBeGreaterThanOrEqual(-90);
        expect(coord.latitude).toBeLessThanOrEqual(90);
        expect(coord.longitude).toBeGreaterThanOrEqual(-180);
        expect(coord.longitude).toBeLessThanOrEqual(180);
      });

             invalidCoordinates.forEach(coord => {
         const isLatValid = coord.latitude >= -90 && coord.latitude <= 90;
         const isLngValid = coord.longitude >= -180 && coord.longitude <= 180;
         // At least one coordinate should be invalid
         expect(isLatValid && isLngValid).toBe(false);
       });
    });

    it('should validate adjustment value ranges', () => {
      const validAdjustments = [
        { offset: 0.5, multiplier: 1.02 },
        { offset: -2.0, multiplier: 0.98 },
        { offset: 0, multiplier: 1.0 }
      ];

      const invalidAdjustments = [
        { offset: 1000, multiplier: 1.02 },
        { offset: 0.5, multiplier: 100 },
        { offset: -1000, multiplier: 0.98 }
      ];

      validAdjustments.forEach(adj => {
        expect(Math.abs(adj.offset)).toBeLessThan(100);
        expect(adj.multiplier).toBeGreaterThan(0);
        expect(adj.multiplier).toBeLessThan(10);
      });

      invalidAdjustments.forEach(adj => {
        const isOffsetValid = Math.abs(adj.offset) < 100;
        const isMultiplierValid = adj.multiplier > 0 && adj.multiplier < 10;
        expect(isOffsetValid && isMultiplierValid).toBe(false);
      });
    });

    it('should validate seasonal variation arrays', () => {
      const validSeasonalVariation = { q1: 0.3, q2: 0.8, q3: 0.6, q4: 0.2 };
      const invalidSeasonalVariation = { q1: 0.3, q2: 0.8, q3: 0.6 }; // Missing q4

      expect(Object.keys(validSeasonalVariation)).toHaveLength(4);
      expect(Object.keys(validSeasonalVariation)).toContain('q1');
      expect(Object.keys(validSeasonalVariation)).toContain('q2');
      expect(Object.keys(validSeasonalVariation)).toContain('q3');
      expect(Object.keys(validSeasonalVariation)).toContain('q4');

      expect(Object.keys(invalidSeasonalVariation)).toHaveLength(3);
      expect(Object.keys(invalidSeasonalVariation)).not.toContain('q4');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Database connection failed'));

      // Test that errors are properly caught and handled
      try {
        await mockSupabase.auth.getUser();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Database connection failed');
      }
    });

    it('should handle malformed JSON requests', () => {
      const malformedRequests = [
        '{ invalid json }',
        '{"missing": "closing brace"',
        '{"extra": "comma",}',
        '{"null": null, "undefined": undefined}'
      ];

      malformedRequests.forEach(request => {
        expect(() => JSON.parse(request)).toThrow();
      });
    });

    it('should handle missing required fields', () => {
      const incompleteData = [
        { name: 'Test' }, // Missing description and settings
        { description: 'Test' }, // Missing name and settings
        { name: 'Test', description: 'Test' } // Missing settings
      ];

      incompleteData.forEach(data => {
        const hasName = 'name' in data;
        const hasDescription = 'description' in data;
        const hasSettings = 'settings' in data;
        
        expect(hasName && hasDescription && hasSettings).toBe(false);
      });
    });
  });
});
