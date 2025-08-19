/**
 * Admin Prediction Configuration Management API
 * 
 * Handles CRUD operations for prediction configuration settings
 * with proper authentication, validation, and versioning.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface PredictionConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings: {
    formulas: {
      quarter1: any;
      quarter2: any;
      quarter3: any;
      quarter4: any;
    };
    accuracyThreshold: number;
    confidenceLevel: number;
    weatherStabilityWeight: number;
    locationAdjustments: Record<string, {
      temperatureOffset: number;
      precipitationMultiplier: number;
      humidityOffset: number;
    }>;
    systemSettings: {
      enableRealTimeValidation: boolean;
      enableAlternativeRecommendations: boolean;
      maxAlternativeWindows: number;
      cacheDuration: number;
    };
  };
}

interface ConfigResponse {
  success: boolean;
  data?: PredictionConfig | PredictionConfig[];
  error?: string;
  timestamp: string;
}

// GET - Retrieve configuration(s)
export async function GET(request: NextRequest): Promise<NextResponse<ConfigResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as ConfigResponse, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');
    const activeOnly = searchParams.get('active') === 'true';

    // Mock configuration data
    const mockConfigs: PredictionConfig[] = [
      {
        id: 'config-001',
        name: 'Production Configuration v1.0',
        description: 'Primary configuration for rice yield prediction with 96.01% accuracy',
        version: '1.0.0',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        settings: {
          formulas: {
            quarter1: { temperature: 0.1234, dewPoint: -0.0567, precipitation: 0.0891, windSpeed: -0.0234, humidity: 0.0456, constant: 2500.0 },
            quarter2: { temperature: 0.1345, dewPoint: -0.0678, precipitation: 0.0923, windSpeed: -0.0345, humidity: 0.0567, constant: 2600.0 },
            quarter3: { temperature: 0.1456, dewPoint: -0.0789, precipitation: 0.0956, windSpeed: -0.0456, humidity: 0.0678, constant: 2700.0 },
            quarter4: { temperature: 0.1567, dewPoint: -0.0891, precipitation: 0.0989, windSpeed: -0.0567, humidity: 0.0789, constant: 2800.0 }
          },
          accuracyThreshold: 95.0,
          confidenceLevel: 0.85,
          weatherStabilityWeight: 0.3,
          locationAdjustments: {
            'Central Luzon': { temperatureOffset: 0.5, precipitationMultiplier: 1.1, humidityOffset: -2.0 },
            'Calabarzon': { temperatureOffset: 1.0, precipitationMultiplier: 1.2, humidityOffset: -1.5 },
            'Ilocos Region': { temperatureOffset: -0.5, precipitationMultiplier: 0.9, humidityOffset: 1.0 }
          },
          systemSettings: {
            enableRealTimeValidation: true,
            enableAlternativeRecommendations: true,
            maxAlternativeWindows: 3,
            cacheDuration: 3600
          }
        }
      },
      {
        id: 'config-002',
        name: 'Development Configuration v0.9',
        description: 'Testing configuration for experimental features',
        version: '0.9.0',
        isActive: false,
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-12T16:45:00Z',
        settings: {
          formulas: {
            quarter1: { temperature: 0.1200, dewPoint: -0.0500, precipitation: 0.0850, windSpeed: -0.0200, humidity: 0.0400, constant: 2450.0 },
            quarter2: { temperature: 0.1300, dewPoint: -0.0600, precipitation: 0.0900, windSpeed: -0.0300, humidity: 0.0500, constant: 2550.0 },
            quarter3: { temperature: 0.1400, dewPoint: -0.0700, precipitation: 0.0950, windSpeed: -0.0400, humidity: 0.0600, constant: 2650.0 },
            quarter4: { temperature: 0.1500, dewPoint: -0.0800, precipitation: 0.1000, windSpeed: -0.0500, humidity: 0.0700, constant: 2750.0 }
          },
          accuracyThreshold: 90.0,
          confidenceLevel: 0.80,
          weatherStabilityWeight: 0.25,
          locationAdjustments: {
            'Central Luzon': { temperatureOffset: 0.3, precipitationMultiplier: 1.05, humidityOffset: -1.5 },
            'Calabarzon': { temperatureOffset: 0.8, precipitationMultiplier: 1.15, humidityOffset: -1.0 },
            'Ilocos Region': { temperatureOffset: -0.3, precipitationMultiplier: 0.95, humidityOffset: 0.8 }
          },
          systemSettings: {
            enableRealTimeValidation: false,
            enableAlternativeRecommendations: true,
            maxAlternativeWindows: 5,
            cacheDuration: 1800
          }
        }
      }
    ];

    let filteredConfigs = mockConfigs;

    // Filter by active status if requested
    if (activeOnly) {
      filteredConfigs = filteredConfigs.filter(config => config.isActive);
    }

    // Return specific config if ID provided
    if (configId) {
      const config = filteredConfigs.find(c => c.id === configId);
      if (!config) {
        return NextResponse.json({
          success: false,
          error: 'Configuration not found',
          timestamp: new Date().toISOString()
        } as ConfigResponse, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: config,
        timestamp: new Date().toISOString()
      } as ConfigResponse);
    }

    // Return all configs
    return NextResponse.json({
      success: true,
      data: filteredConfigs,
      timestamp: new Date().toISOString()
    } as ConfigResponse);

  } catch (error) {
    console.error('Configuration management error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as ConfigResponse, { status: 500 });
  }
}

// POST - Create new configuration
export async function POST(request: NextRequest): Promise<NextResponse<ConfigResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as ConfigResponse, { status: 401 });
    }

    const body = await request.json();
    const { name, description, settings } = body;

    // Validate required fields
    if (!name || !description || !settings) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, description, settings',
        timestamp: new Date().toISOString()
      } as ConfigResponse, { status: 400 });
    }

    // Validate settings structure
    if (!settings.formulas || !settings.accuracyThreshold || !settings.confidenceLevel) {
      return NextResponse.json({
        success: false,
        error: 'Invalid settings structure',
        timestamp: new Date().toISOString()
      } as ConfigResponse, { status: 400 });
    }

    // Create new configuration
    const newConfig: PredictionConfig = {
      id: `config-${Date.now()}`,
      name,
      description,
      version: '1.0.0',
      isActive: false, // New configs are inactive by default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        formulas: settings.formulas,
        accuracyThreshold: settings.accuracyThreshold || 95.0,
        confidenceLevel: settings.confidenceLevel || 0.85,
        weatherStabilityWeight: settings.weatherStabilityWeight || 0.3,
        locationAdjustments: settings.locationAdjustments || {},
        systemSettings: {
          enableRealTimeValidation: settings.systemSettings?.enableRealTimeValidation ?? true,
          enableAlternativeRecommendations: settings.systemSettings?.enableAlternativeRecommendations ?? true,
          maxAlternativeWindows: settings.systemSettings?.maxAlternativeWindows ?? 3,
          cacheDuration: settings.systemSettings?.cacheDuration ?? 3600
        }
      }
    };

    // In a real implementation, save to database here
    // For now, return the created config
    return NextResponse.json({
      success: true,
      data: newConfig,
      timestamp: new Date().toISOString()
    } as ConfigResponse, { status: 201 });

  } catch (error) {
    console.error('Configuration creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as ConfigResponse, { status: 500 });
  }
}

// PATCH - Update configuration
export async function PATCH(request: NextRequest): Promise<NextResponse<ConfigResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as ConfigResponse, { status: 401 });
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: id, updates',
        timestamp: new Date().toISOString()
      } as ConfigResponse, { status: 400 });
    }

    // Validate allowed update fields
    const allowedFields = ['name', 'description', 'settings', 'isActive'];
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Invalid update fields: ${invalidFields.join(', ')}`,
        timestamp: new Date().toISOString()
      } as ConfigResponse, { status: 400 });
    }

    // In a real implementation, update in database here
    // For now, return success response
    return NextResponse.json({
      success: true,
      data: { id, ...updates, updatedAt: new Date().toISOString() },
      timestamp: new Date().toISOString()
    } as ConfigResponse);

  } catch (error) {
    console.error('Configuration update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as ConfigResponse, { status: 500 });
  }
}

// DELETE - Delete configuration
export async function DELETE(request: NextRequest): Promise<NextResponse<ConfigResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as ConfigResponse, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json({
        success: false,
        error: 'Configuration ID required',
        timestamp: new Date().toISOString()
      } as ConfigResponse, { status: 400 });
    }

    // In a real implementation, delete from database here
    // For now, return success response
    return NextResponse.json({
      success: true,
      data: { id: configId, deleted: true },
      timestamp: new Date().toISOString()
    } as ConfigResponse);

  } catch (error) {
    console.error('Configuration deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as ConfigResponse, { status: 500 });
  }
}
