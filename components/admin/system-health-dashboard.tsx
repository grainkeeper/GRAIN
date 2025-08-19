/**
 * System Health Dashboard Component
 * 
 * Displays real-time system health metrics, performance monitoring,
 * and prediction accuracy overview for administrators.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Database, 
  Cloud, 
  Target, 
  HardDrive, 
  Users, 
  Cpu, 
  MemoryStick, 
  Wifi,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Server,
  Loader2
} from 'lucide-react';

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

interface SystemHealthDashboardProps {
  className?: string;
}

export default function SystemHealthDashboard({ className }: SystemHealthDashboardProps) {
  const [healthData, setHealthData] = useState<SystemHealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadHealthData = async () => {
    try {
      const response = await fetch('/api/admin/system-health');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load system health data');
      }

      setHealthData(result.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (error) {
      console.error('System health error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load system health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadHealthData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
      case 'warning':
        return 'text-yellow-600';
      case 'offline':
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'offline':
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'default';
      case 'degraded':
      case 'warning':
        return 'secondary';
      case 'offline':
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading system health data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No system health data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall System Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(healthData.overall)}
            <h2 className="text-2xl font-bold">System Health</h2>
          </div>
          <Badge variant={getStatusBadgeVariant(healthData.overall)}>
            {healthData.overall.toUpperCase()}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated ? formatTimeAgo(lastUpdated.toISOString()) : 'Unknown'}
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Predictions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.statistics.todayPredictions}</div>
            <p className="text-xs text-muted-foreground">
              {healthData.statistics.weeklyPredictions} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {healthData.statistics.averageAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Top: {healthData.statistics.topPerformingRegion}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.components.authentication.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {healthData.components.authentication.totalUsers} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(healthData.performance.uptime)}</div>
            <p className="text-xs text-muted-foreground">
              Load: {(healthData.statistics.systemLoad * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Component Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Component Status
          </CardTitle>
          <CardDescription>
            Real-time status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Database */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">Database</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData.components.database.status)}
                <span className="text-sm text-muted-foreground">
                  {healthData.components.database.responseTime}ms
                </span>
              </div>
            </div>

            {/* Open-Meteo API */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span className="font-medium">Open-Meteo API</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData.components.openMeteoAPI.status)}
                <span className="text-sm text-muted-foreground">
                  {healthData.components.openMeteoAPI.responseTime}ms
                </span>
              </div>
            </div>

            {/* Prediction Service */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="font-medium">Predictions</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData.components.predictionService.status)}
                <span className="text-sm text-muted-foreground">
                  {healthData.components.predictionService.successRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Storage */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="font-medium">Storage</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData.components.storage.status)}
                <span className="text-sm text-muted-foreground">
                  {healthData.components.storage.usagePercentage}%
                </span>
              </div>
            </div>

            {/* Authentication */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData.components.authentication.status)}
                <span className="text-sm text-muted-foreground">
                  {healthData.components.authentication.failedLogins} fails
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Real-time system resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* CPU Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span className="font-medium">CPU Usage</span>
                </div>
                <span className={`font-medium ${healthData.performance.cpuUsage > 80 ? 'text-red-600' : healthData.performance.cpuUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {healthData.performance.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={healthData.performance.cpuUsage} className="h-2" />
            </div>

            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4" />
                  <span className="font-medium">Memory Usage</span>
                </div>
                <span className={`font-medium ${healthData.performance.memoryUsage > 80 ? 'text-red-600' : healthData.performance.memoryUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {healthData.performance.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={healthData.performance.memoryUsage} className="h-2" />
            </div>

            {/* Disk Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="font-medium">Disk Usage</span>
                </div>
                <span className={`font-medium ${healthData.performance.diskUsage > 80 ? 'text-red-600' : healthData.performance.diskUsage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {healthData.performance.diskUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={healthData.performance.diskUsage} className="h-2" />
            </div>

            {/* Network Latency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <span className="font-medium">Network Latency</span>
                </div>
                <span className={`font-medium ${healthData.performance.networkLatency > 100 ? 'text-red-600' : healthData.performance.networkLatency > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {healthData.performance.networkLatency}ms
                </span>
              </div>
              <Progress value={Math.min(healthData.performance.networkLatency, 200) / 2} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {healthData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Recent system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthData.alerts.slice(0, 5).map((alert) => (
                <Alert 
                  key={alert.id} 
                  variant={alert.level === 'critical' || alert.level === 'error' ? 'destructive' : 'default'}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>{alert.message}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.resolved ? 'default' : 'secondary'}>
                          {alert.resolved ? 'Resolved' : alert.level.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
