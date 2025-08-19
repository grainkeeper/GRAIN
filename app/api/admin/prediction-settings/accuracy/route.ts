/**
 * Admin Prediction Accuracy Tracking API
 * 
 * Tracks prediction accuracy over time and provides performance monitoring
 * for the MLR formulas with historical data analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface AccuracyRecord {
  id: string;
  quarter: number;
  predictedYield: number;
  actualYield: number;
  accuracy: number;
  location: string;
  timestamp: string;
  weatherConditions: {
    temperature: number;
    dewPoint: number;
    precipitation: number;
    windSpeed: number;
    humidity: number;
  };
}

interface AccuracyStats {
  overallAccuracy: number;
  totalPredictions: number;
  quarterStats: Record<number, {
    accuracy: number;
    predictions: number;
    averageError: number;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  recentPerformance: {
    last30Days: number;
    last90Days: number;
    lastYear: number;
  };
  accuracyTrend: {
    period: string;
    accuracy: number;
  }[];
  recommendations: string[];
}

interface AccuracyResponse {
  success: boolean;
  data?: AccuracyStats;
  error?: string;
  timestamp: string;
}

// Mock accuracy data for demonstration
const MOCK_ACCURACY_DATA: AccuracyRecord[] = [
  // Q1 2024 data
  { id: '1', quarter: 1, predictedYield: 4200, actualYield: 4150, accuracy: 98.8, location: 'Central Luzon', timestamp: '2024-03-15', weatherConditions: { temperature: 25.5, dewPoint: 18.2, precipitation: 45.3, windSpeed: 12.1, humidity: 75.8 } },
  { id: '2', quarter: 1, predictedYield: 3950, actualYield: 4000, accuracy: 98.8, location: 'Ilocos Region', timestamp: '2024-03-20', weatherConditions: { temperature: 22.8, dewPoint: 16.9, precipitation: 52.1, windSpeed: 8.7, humidity: 82.3 } },
  { id: '3', quarter: 1, predictedYield: 4450, actualYield: 4400, accuracy: 98.9, location: 'Cagayan Valley', timestamp: '2024-03-25', weatherConditions: { temperature: 28.1, dewPoint: 20.5, precipitation: 38.7, windSpeed: 15.3, humidity: 68.9 } },
  
  // Q2 2024 data
  { id: '4', quarter: 2, predictedYield: 4800, actualYield: 4850, accuracy: 99.0, location: 'Central Luzon', timestamp: '2024-06-15', weatherConditions: { temperature: 30.2, dewPoint: 23.8, precipitation: 28.9, windSpeed: 18.5, humidity: 65.4 } },
  { id: '5', quarter: 2, predictedYield: 5100, actualYield: 5050, accuracy: 99.0, location: 'Calabarzon', timestamp: '2024-06-20', weatherConditions: { temperature: 32.7, dewPoint: 25.1, precipitation: 22.3, windSpeed: 20.1, humidity: 58.7 } },
  { id: '6', quarter: 2, predictedYield: 4600, actualYield: 4650, accuracy: 98.9, location: 'Mimaropa', timestamp: '2024-06-25', weatherConditions: { temperature: 27.9, dewPoint: 21.4, precipitation: 35.6, windSpeed: 14.8, humidity: 72.1 } },
  
  // Q3 2024 data
  { id: '7', quarter: 3, predictedYield: 4700, actualYield: 4750, accuracy: 98.9, location: 'Central Luzon', timestamp: '2024-09-15', weatherConditions: { temperature: 29.8, dewPoint: 22.6, precipitation: 31.2, windSpeed: 16.9, humidity: 70.3 } },
  { id: '8', quarter: 3, predictedYield: 4950, actualYield: 4900, accuracy: 99.0, location: 'Calabarzon', timestamp: '2024-09-20', weatherConditions: { temperature: 31.5, dewPoint: 24.3, precipitation: 26.8, windSpeed: 19.2, humidity: 63.8 } },
  { id: '9', quarter: 3, predictedYield: 4300, actualYield: 4350, accuracy: 98.8, location: 'Bicol Region', timestamp: '2024-09-25', weatherConditions: { temperature: 26.4, dewPoint: 19.7, precipitation: 41.5, windSpeed: 11.4, humidity: 78.9 } },
  
  // Q4 2024 data
  { id: '10', quarter: 4, predictedYield: 4100, actualYield: 4150, accuracy: 98.8, location: 'Central Luzon', timestamp: '2024-12-15', weatherConditions: { temperature: 24.1, dewPoint: 17.8, precipitation: 48.7, windSpeed: 13.6, humidity: 76.5 } },
  { id: '11', quarter: 4, predictedYield: 4350, actualYield: 4300, accuracy: 98.9, location: 'Calabarzon', timestamp: '2024-12-20', weatherConditions: { temperature: 26.9, dewPoint: 19.2, precipitation: 42.1, windSpeed: 15.8, humidity: 69.2 } },
  { id: '12', quarter: 4, predictedYield: 3800, actualYield: 3850, accuracy: 98.7, location: 'Ilocos Region', timestamp: '2024-12-25', weatherConditions: { temperature: 21.3, dewPoint: 15.6, precipitation: 55.3, windSpeed: 9.2, humidity: 84.1 } },
  
  // Historical data for trend analysis
  { id: '13', quarter: 1, predictedYield: 4100, actualYield: 4050, accuracy: 98.8, location: 'Central Luzon', timestamp: '2023-03-15', weatherConditions: { temperature: 24.8, dewPoint: 17.5, precipitation: 47.2, windSpeed: 11.8, humidity: 76.2 } },
  { id: '14', quarter: 2, predictedYield: 4700, actualYield: 4650, accuracy: 98.9, location: 'Central Luzon', timestamp: '2023-06-15', weatherConditions: { temperature: 29.5, dewPoint: 22.1, precipitation: 30.5, windSpeed: 17.2, humidity: 66.8 } },
  { id: '15', quarter: 3, predictedYield: 4600, actualYield: 4650, accuracy: 98.9, location: 'Central Luzon', timestamp: '2023-09-15', weatherConditions: { temperature: 28.9, dewPoint: 21.8, precipitation: 32.1, windSpeed: 16.5, humidity: 71.2 } },
  { id: '16', quarter: 4, predictedYield: 4000, actualYield: 4050, accuracy: 98.8, location: 'Central Luzon', timestamp: '2023-12-15', weatherConditions: { temperature: 23.7, dewPoint: 17.2, precipitation: 49.8, windSpeed: 13.1, humidity: 77.1 } },
];

export async function GET(request: NextRequest): Promise<NextResponse<AccuracyResponse>> {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      } as AccuracyResponse, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, 30d, 90d, 1y
    const quarter = searchParams.get('quarter'); // 1, 2, 3, 4

    // Filter data based on parameters
    let filteredData = MOCK_ACCURACY_DATA;
    
    if (quarter) {
      filteredData = filteredData.filter(record => record.quarter === parseInt(quarter));
    }

    if (period !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (period) {
        case '30d':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredData = filteredData.filter(record => new Date(record.timestamp) >= cutoffDate);
    }

    // Calculate overall accuracy
    const totalPredictions = filteredData.length;
    const overallAccuracy = totalPredictions > 0 
      ? filteredData.reduce((sum, record) => sum + record.accuracy, 0) / totalPredictions 
      : 0;

    // Calculate quarter-specific stats
    const quarterStats: Record<number, any> = {};
    for (let q = 1; q <= 4; q++) {
      const quarterData = filteredData.filter(record => record.quarter === q);
      if (quarterData.length > 0) {
        const quarterAccuracy = quarterData.reduce((sum, record) => sum + record.accuracy, 0) / quarterData.length;
        const averageError = quarterData.reduce((sum, record) => sum + Math.abs(record.predictedYield - record.actualYield), 0) / quarterData.length;
        
        // Simple trend calculation (comparing recent vs older data)
        const recentData = quarterData.filter(record => new Date(record.timestamp) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
        const olderData = quarterData.filter(record => new Date(record.timestamp) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
        
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentData.length > 0 && olderData.length > 0) {
          const recentAccuracy = recentData.reduce((sum, record) => sum + record.accuracy, 0) / recentData.length;
          const olderAccuracy = olderData.reduce((sum, record) => sum + record.accuracy, 0) / olderData.length;
          
          if (recentAccuracy > olderAccuracy + 0.5) trend = 'improving';
          else if (recentAccuracy < olderAccuracy - 0.5) trend = 'declining';
        }

        quarterStats[q] = {
          accuracy: quarterAccuracy,
          predictions: quarterData.length,
          averageError,
          trend
        };
      }
    }

    // Calculate recent performance
    const now = new Date();
    const last30Days = filteredData.filter(record => new Date(record.timestamp) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    const last90Days = filteredData.filter(record => new Date(record.timestamp) >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
    const lastYear = filteredData.filter(record => new Date(record.timestamp) >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000));

    const recentPerformance = {
      last30Days: last30Days.length > 0 ? last30Days.reduce((sum, record) => sum + record.accuracy, 0) / last30Days.length : 0,
      last90Days: last90Days.length > 0 ? last90Days.reduce((sum, record) => sum + record.accuracy, 0) / last90Days.length : 0,
      lastYear: lastYear.length > 0 ? lastYear.reduce((sum, record) => sum + record.accuracy, 0) / lastYear.length : 0
    };

    // Calculate accuracy trend over time
    const accuracyTrend = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    for (let month = 0; month < 12; month++) {
      const monthData = filteredData.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate.getFullYear() === currentYear && recordDate.getMonth() === month;
      });
      
      const monthAccuracy = monthData.length > 0 
        ? monthData.reduce((sum, record) => sum + record.accuracy, 0) / monthData.length 
        : 0;
      
      accuracyTrend.push({
        period: months[month],
        accuracy: monthAccuracy
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (overallAccuracy < 95) {
      recommendations.push('Overall accuracy is below 95%. Consider reviewing MLR coefficients.');
    }
    
    Object.entries(quarterStats).forEach(([quarter, stats]) => {
      if (stats.accuracy < 95) {
        recommendations.push(`Q${quarter} accuracy is below 95%. Review coefficients for this quarter.`);
      }
      if (stats.trend === 'declining') {
        recommendations.push(`Q${quarter} accuracy is declining. Investigate recent changes.`);
      }
    });

    if (recentPerformance.last30Days < recentPerformance.last90Days) {
      recommendations.push('Recent 30-day performance is lower than 90-day average. Monitor for issues.');
    }

    if (recommendations.length === 0) {
      recommendations.push('All accuracy metrics are performing well. No immediate action required.');
    }

    return NextResponse.json({
      success: true,
      data: {
        overallAccuracy,
        totalPredictions,
        quarterStats,
        recentPerformance,
        accuracyTrend,
        recommendations
      },
      timestamp: new Date().toISOString()
    } as AccuracyResponse);

  } catch (error) {
    console.error('Prediction accuracy tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as AccuracyResponse, { status: 500 });
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
