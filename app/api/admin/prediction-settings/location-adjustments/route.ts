/**
 * Admin Location-Specific Parameter Adjustments API
 * 
 * Manages location-specific parameter adjustments for regional weather variations
 * across different Philippine regions to improve prediction accuracy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface LocationAdjustment {
  id: string;
  region: string;
  province?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  adjustments: {
    temperature: {
      offset: number;
      multiplier: number;
      seasonalVariation: {
        q1: number;
        q2: number;
        q3: number;
        q4: number;
      };
    };
    precipitation: {
      multiplier: number;
      seasonalVariation: {
        q1: number;
        q2: number;
        q3: number;
        q4: number;
      };
      intensityAdjustment: number;
    };
    humidity: {
      offset: number;
      multiplier: number;
      seasonalVariation: {
        q1: number;
        q2: number;
        q3: number;
        q4: number;
      };
    };
    windSpeed: {
      multiplier: number;
      seasonalVariation: {
        q1: number;
        q2: number;
        q3: number;
        q4: number;
      };
    };
    dewPoint: {
      offset: number;
      multiplier: number;
    };
  };
  elevation: number;
  climateZone: string;
  soilType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface LocationAdjustmentResponse {
  success: boolean;
  data?: LocationAdjustment | LocationAdjustment[];
  error?: string;
  timestamp: string;
}

// Mock location adjustment data
const MOCK_LOCATION_ADJUSTMENTS: LocationAdjustment[] = [
  {
    id: 'adj-001',
    region: 'Central Luzon',
    province: 'Nueva Ecija',
    coordinates: { latitude: 15.5786, longitude: 120.9886 },
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
    soilType: 'Clay loam',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    notes: 'Primary rice-producing province with consistent weather patterns'
  },
  {
    id: 'adj-002',
    region: 'Calabarzon',
    province: 'Laguna',
    coordinates: { latitude: 14.1667, longitude: 121.3333 },
    adjustments: {
      temperature: {
        offset: 1.0,
        multiplier: 1.05,
        seasonalVariation: { q1: 0.8, q2: 1.2, q3: 1.0, q4: 0.7 }
      },
      precipitation: {
        multiplier: 1.2,
        seasonalVariation: { q1: 1.3, q2: 1.0, q3: 1.2, q4: 1.4 },
        intensityAdjustment: 0.08
      },
      humidity: {
        offset: -1.5,
        multiplier: 0.97,
        seasonalVariation: { q1: -1.0, q2: -2.0, q3: -1.8, q4: -1.2 }
      },
      windSpeed: {
        multiplier: 1.1,
        seasonalVariation: { q1: 1.15, q2: 1.25, q3: 1.05, q4: 1.0 }
      },
      dewPoint: {
        offset: -0.8,
        multiplier: 0.98
      }
    },
    elevation: 25,
    climateZone: 'Type I - Two pronounced seasons',
    soilType: 'Silty clay',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    notes: 'Coastal province with higher humidity and precipitation'
  },
  {
    id: 'adj-003',
    region: 'Ilocos Region',
    province: 'Ilocos Norte',
    coordinates: { latitude: 18.1667, longitude: 120.5833 },
    adjustments: {
      temperature: {
        offset: -0.5,
        multiplier: 0.98,
        seasonalVariation: { q1: -0.3, q2: -0.8, q3: -0.6, q4: -0.2 }
      },
      precipitation: {
        multiplier: 0.9,
        seasonalVariation: { q1: 0.8, q2: 0.7, q3: 0.9, q4: 1.1 },
        intensityAdjustment: -0.03
      },
      humidity: {
        offset: 1.0,
        multiplier: 1.02,
        seasonalVariation: { q1: 0.8, q2: 1.5, q3: 1.2, q4: 0.9 }
      },
      windSpeed: {
        multiplier: 1.15,
        seasonalVariation: { q1: 1.2, q2: 1.3, q3: 1.1, q4: 1.05 }
      },
      dewPoint: {
        offset: 0.5,
        multiplier: 1.01
      }
    },
    elevation: 120,
    climateZone: 'Type I - Two pronounced seasons',
    soilType: 'Sandy loam',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    notes: 'Northern province with cooler temperatures and lower precipitation'
  },
  {
    id: 'adj-004',
    region: 'Bicol Region',
    province: 'Camarines Sur',
    coordinates: { latitude: 13.5833, longitude: 123.3667 },
    adjustments: {
      temperature: {
        offset: 0.8,
        multiplier: 1.03,
        seasonalVariation: { q1: 0.6, q2: 1.0, q3: 0.9, q4: 0.5 }
      },
      precipitation: {
        multiplier: 1.4,
        seasonalVariation: { q1: 1.5, q2: 1.2, q3: 1.4, q4: 1.6 },
        intensityAdjustment: 0.12
      },
      humidity: {
        offset: 2.0,
        multiplier: 1.03,
        seasonalVariation: { q1: 1.8, q2: 2.5, q3: 2.2, q4: 1.9 }
      },
      windSpeed: {
        multiplier: 1.2,
        seasonalVariation: { q1: 1.25, q2: 1.35, q3: 1.15, q4: 1.1 }
      },
      dewPoint: {
        offset: 1.2,
        multiplier: 1.02
      }
    },
    elevation: 35,
    climateZone: 'Type II - No dry season',
    soilType: 'Clay',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    notes: 'High rainfall region with tropical climate'
  }
];

// GET - Retrieve location adjustments
export async function GET(request: NextRequest): Promise<NextResponse<LocationAdjustmentResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adjustmentId = searchParams.get('id');
    const region = searchParams.get('region');
    const activeOnly = searchParams.get('active') === 'true';

    let filteredAdjustments = MOCK_LOCATION_ADJUSTMENTS;

    // Filter by region if specified
    if (region) {
      filteredAdjustments = filteredAdjustments.filter(adj => 
        adj.region.toLowerCase().includes(region.toLowerCase())
      );
    }

    // Filter by active status if requested
    if (activeOnly) {
      filteredAdjustments = filteredAdjustments.filter(adj => adj.isActive);
    }

    // Return specific adjustment if ID provided
    if (adjustmentId) {
      const adjustment = filteredAdjustments.find(adj => adj.id === adjustmentId);
      if (!adjustment) {
        return NextResponse.json({
          success: false,
          error: 'Location adjustment not found',
          timestamp: new Date().toISOString()
        } as LocationAdjustmentResponse, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: adjustment,
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse);
    }

    // Return all adjustments
    return NextResponse.json({
      success: true,
      data: filteredAdjustments,
      timestamp: new Date().toISOString()
    } as LocationAdjustmentResponse);

  } catch (error) {
    console.error('Location adjustment retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as LocationAdjustmentResponse, { status: 500 });
  }
}

// POST - Create new location adjustment
export async function POST(request: NextRequest): Promise<NextResponse<LocationAdjustmentResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse, { status: 401 });
    }

    const body = await request.json();
    const { region, province, coordinates, adjustments, elevation, climateZone, soilType, notes } = body;

    // Validate required fields
    if (!region || !coordinates || !adjustments) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: region, coordinates, adjustments',
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse, { status: 400 });
    }

    // Validate coordinates
    if (typeof coordinates.latitude !== 'number' || typeof coordinates.longitude !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Invalid coordinates format',
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse, { status: 400 });
    }

    // Validate adjustments structure
    const requiredAdjustments = ['temperature', 'precipitation', 'humidity', 'windSpeed', 'dewPoint'];
    for (const adj of requiredAdjustments) {
      if (!adjustments[adj]) {
        return NextResponse.json({
          success: false,
          error: `Missing adjustment: ${adj}`,
          timestamp: new Date().toISOString()
        } as LocationAdjustmentResponse, { status: 400 });
      }
    }

    // Create new location adjustment
    const newAdjustment: LocationAdjustment = {
      id: `adj-${Date.now()}`,
      region,
      province,
      coordinates,
      adjustments,
      elevation: elevation || 0,
      climateZone: climateZone || 'Type I - Two pronounced seasons',
      soilType: soilType || 'Clay loam',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes
    };

    // In a real implementation, save to database here
    // For now, return the created adjustment
    return NextResponse.json({
      success: true,
      data: newAdjustment,
      timestamp: new Date().toISOString()
    } as LocationAdjustmentResponse, { status: 201 });

  } catch (error) {
    console.error('Location adjustment creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as LocationAdjustmentResponse, { status: 500 });
  }
}

// PATCH - Update location adjustment
export async function PATCH(request: NextRequest): Promise<NextResponse<LocationAdjustmentResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse, { status: 401 });
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: id, updates',
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse, { status: 400 });
    }

    // Validate allowed update fields
    const allowedFields = ['region', 'province', 'coordinates', 'adjustments', 'elevation', 'climateZone', 'soilType', 'isActive', 'notes'];
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Invalid update fields: ${invalidFields.join(', ')}`,
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse, { status: 400 });
    }

    // In a real implementation, update in database here
    // For now, return success response
    return NextResponse.json({
      success: true,
      data: { id, ...updates, updatedAt: new Date().toISOString() },
      timestamp: new Date().toISOString()
    } as LocationAdjustmentResponse);

  } catch (error) {
    console.error('Location adjustment update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as LocationAdjustmentResponse, { status: 500 });
  }
}

// DELETE - Delete location adjustment
export async function DELETE(request: NextRequest): Promise<NextResponse<LocationAdjustmentResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adjustmentId = searchParams.get('id');

    if (!adjustmentId) {
      return NextResponse.json({
        success: false,
        error: 'Location adjustment ID required',
        timestamp: new Date().toISOString()
      } as LocationAdjustmentResponse, { status: 400 });
    }

    // In a real implementation, delete from database here
    // For now, return success response
    return NextResponse.json({
      success: true,
      data: { id: adjustmentId, deleted: true },
      timestamp: new Date().toISOString()
    } as LocationAdjustmentResponse);

  } catch (error) {
    console.error('Location adjustment deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as LocationAdjustmentResponse, { status: 500 });
  }
}
