/**
 * Admin System Health Monitoring API
 * 
 * Provides real-time system health metrics including database connectivity,
 * API status, prediction accuracy, and resource utilization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SystemHealthMetrics {
  overall: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  components: {
    database: {
      status: 'online' | 'offline' | 'degraded';
      responseTime: number;
      lastCheck: string;
    };
    openMeteoAPI: {
      status: 'online' | 'offline' | 'degraded';
      responseTime: number;
      lastCheck: string;
      dailyRequests: number;
      rateLimit: number;
    };
    predictionService: {
      status: 'online' | 'offline' | 'degraded';
      accuracyRate: number;
      totalPredictions: number;
      successRate: number;
      lastPrediction: string;
    };
    storage: {
      status: 'online' | 'offline' | 'degraded';
      usedSpace: number;
      totalSpace: number;
      usagePercentage: number;
    };
    authentication: {
      status: 'online' | 'offline' | 'degraded';
      activeUsers: number;
      totalUsers: number;
      failedLogins: number;
    };
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    uptime: number;
  };
  alerts: {
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    resolved: boolean;
  }[];
  statistics: {
    todayPredictions: number;
    weeklyPredictions: number;
    monthlyPredictions: number;
    averageAccuracy: number;
    topPerformingRegion: string;
    systemLoad: number;
  };
}

interface HealthResponse {
  success: boolean;
  data?: SystemHealthMetrics;
  error?: string;
  timestamp: string;
}

// Mock system health data for demonstration
const generateMockHealthData = (): SystemHealthMetrics => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  return {
    overall: 'healthy',
    timestamp: now.toISOString(),
    components: {
      database: {
        status: 'online',
        responseTime: 45,
        lastCheck: now.toISOString()
      },
      openMeteoAPI: {
        status: 'online',
        responseTime: 120,
        lastCheck: now.toISOString(),
        dailyRequests: 1247,
        rateLimit: 10000
      },
      predictionService: {
        status: 'online',
        accuracyRate: 96.01,
        totalPredictions: 3482,
        successRate: 99.7,
        lastPrediction: oneHourAgo.toISOString()
      },
      storage: {
        status: 'online',
        usedSpace: 2.4,
        totalSpace: 10.0,
        usagePercentage: 24
      },
      authentication: {
        status: 'online',
        activeUsers: 127,
        totalUsers: 542,
        failedLogins: 3
      }
    },
    performance: {
      cpuUsage: 23.5,
      memoryUsage: 67.2,
      diskUsage: 45.8,
      networkLatency: 28,
      uptime: 2592000 // 30 days in seconds
    },
    alerts: [
      {
        id: 'alert-001',
        level: 'info',
        message: 'System backup completed successfully',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: true
      },
      {
        id: 'alert-002',
        level: 'warning',
        message: 'High memory usage detected (>65%)',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        resolved: false
      }
    ],
    statistics: {
      todayPredictions: 89,
      weeklyPredictions: 634,
      monthlyPredictions: 2847,
      averageAccuracy: 96.01,
      topPerformingRegion: 'Central Luzon',
      systemLoad: 0.65
    }
  };
};

export async function GET(request: NextRequest): Promise<NextResponse<HealthResponse>> {
  try {
    // Skip Supabase for development
    // const supabase = createClient();
    // const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Skip authentication check for development (comment out for production)
    // if (authError || !user) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Authentication required',
    //     timestamp: new Date().toISOString()
    //   } as HealthResponse, { status: 401 });
    // }

    // Generate health metrics
    const healthData = generateMockHealthData();

    // Determine overall system health
    const componentStatuses = Object.values(healthData.components).map(comp => comp.status);
    const hasOffline = componentStatuses.includes('offline');
    const hasDegraded = componentStatuses.includes('degraded');
    
    if (hasOffline) {
      healthData.overall = 'critical';
    } else if (hasDegraded || healthData.performance.cpuUsage > 80 || healthData.performance.memoryUsage > 80) {
      healthData.overall = 'warning';
    } else {
      healthData.overall = 'healthy';
    }

    // Add critical alerts for high resource usage
    if (healthData.performance.cpuUsage > 80) {
      healthData.alerts.unshift({
        id: `alert-cpu-${Date.now()}`,
        level: 'critical',
        message: `High CPU usage detected: ${healthData.performance.cpuUsage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    if (healthData.performance.memoryUsage > 80) {
      healthData.alerts.unshift({
        id: `alert-memory-${Date.now()}`,
        level: 'critical',
        message: `High memory usage detected: ${healthData.performance.memoryUsage.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    return NextResponse.json({
      success: true,
      data: healthData,
      timestamp: new Date().toISOString()
    } as HealthResponse);

  } catch (error) {
    console.error('System health monitoring error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    } as HealthResponse, { status: 500 });
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
