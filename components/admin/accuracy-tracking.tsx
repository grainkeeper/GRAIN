/**
 * Accuracy Tracking Component
 * 
 * Displays prediction accuracy metrics and performance monitoring
 * for the MLR formulas with historical data analysis.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

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

  recommendations: string[];
}

interface AccuracyTrackingProps {
  className?: string;
}

export default function AccuracyTracking({ className }: AccuracyTrackingProps) {
  const [accuracyData, setAccuracyData] = useState<AccuracyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedQuarter, setSelectedQuarter] = useState('all');

  const loadAccuracyData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedPeriod !== 'all') params.append('period', selectedPeriod);
      if (selectedQuarter !== 'all') params.append('quarter', selectedQuarter);

      const response = await fetch(`/api/admin/prediction-settings/accuracy?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load accuracy data');
      }

      setAccuracyData(result.data);
    } catch (error) {
      console.error('Accuracy tracking error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load accuracy data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccuracyData();
  }, [selectedPeriod, selectedQuarter]);

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600';
    if (accuracy >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadgeVariant = (accuracy: number) => {
    if (accuracy >= 95) return 'default';
    if (accuracy >= 90) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading accuracy data...</span>
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

  if (!accuracyData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No accuracy data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <div className="flex gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Period</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Quarter</label>
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quarters</SelectItem>
              <SelectItem value="1">Q1</SelectItem>
              <SelectItem value="2">Q2</SelectItem>
              <SelectItem value="3">Q3</SelectItem>
              <SelectItem value="4">Q4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(accuracyData.overallAccuracy)}`}>
              {accuracyData.overallAccuracy.toFixed(1)}%
            </div>
            <Progress value={accuracyData.overallAccuracy} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {accuracyData.totalPredictions} predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Performance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>30 Days</span>
                <span className={getAccuracyColor(accuracyData.recentPerformance.last30Days)}>
                  {accuracyData.recentPerformance.last30Days.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>90 Days</span>
                <span className={getAccuracyColor(accuracyData.recentPerformance.last90Days)}>
                  {accuracyData.recentPerformance.last90Days.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>1 Year</span>
                <span className={getAccuracyColor(accuracyData.recentPerformance.lastYear)}>
                  {accuracyData.recentPerformance.lastYear.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Excellent</div>
            <p className="text-xs text-muted-foreground">
              All metrics performing well
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quarter Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quarter Performance
          </CardTitle>
          <CardDescription>
            Accuracy metrics by quarter with trend analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(quarter => {
              const stats = accuracyData.quarterStats[quarter];
              if (!stats) return null;

              return (
                <div key={quarter} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Q{quarter}</h4>
                    {getTrendIcon(stats.trend)}
                  </div>
                  <div className={`text-xl font-bold ${getAccuracyColor(stats.accuracy)}`}>
                    {stats.accuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stats.predictions} predictions
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg error: {stats.averageError.toFixed(0)} kg/ha
                  </div>
                  <Badge 
                    variant={getAccuracyBadgeVariant(stats.accuracy)}
                    className="mt-2"
                  >
                    {stats.trend}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>



      {/* Recommendations */}
      {accuracyData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Actionable insights based on accuracy analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accuracyData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
