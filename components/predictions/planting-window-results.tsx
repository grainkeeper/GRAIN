/**
 * Planting Window Analysis Results Component
 * 
 * Displays comprehensive results from the integrated planting window analysis
 * including quarter selection, 7-day windows, confidence scores, and recommendations.
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  Gauge
} from 'lucide-react';

interface PlantingWindowResultsProps {
  result: any;
  onReset: () => void;
}

export default function PlantingWindowResults({ result, onReset }: PlantingWindowResultsProps) {
  const { analysis, regionInfo } = result;
  
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getQuarterName = (quarter: number) => {
    const names = {
      1: 'Q1 (January-March)',
      2: 'Q2 (April-June)',
      3: 'Q3 (July-September)',
      4: 'Q4 (October-December)'
    };
    return names[quarter as keyof typeof names] || `Q${quarter}`;
  };

  return (
    <div className="space-y-6">
      {/* Main Recommendation Card */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle className="text-green-800">Optimal Planting Recommendation</CardTitle>
                <CardDescription className="text-green-700">
                  {analysis.location.name} • {analysis.year}
                </CardDescription>
              </div>
            </div>
            <Badge 
              className={`${getRiskLevelColor(analysis.recommendation.riskLevel)} border`}
            >
              {analysis.recommendation.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Planting Period */}
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-green-700 mb-2">
              {analysis.recommendation.plantingPeriod}
            </div>
            <div className="text-sm text-muted-foreground">
              Optimal 7-day planting window
            </div>
          </div>

          {/* Overall Confidence */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Overall Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${getConfidenceColor(analysis.overallConfidence)}`}>
                {analysis.overallConfidence.toFixed(1)}%
              </span>
              <Progress 
                value={analysis.overallConfidence} 
                className="w-20 h-2"
              />
            </div>
          </div>

          {/* Action Items */}
          {analysis.recommendation.actionItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">Key Recommendations</h4>
              <div className="space-y-2">
                {analysis.recommendation.actionItems.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarter Selection Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quarter Selection Analysis
            </CardTitle>
            <CardDescription>
              MLR formula results with 96.01% accuracy
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Optimal Quarter */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-800">
                    Optimal Quarter: {getQuarterName(analysis.optimalQuarter)}
                  </div>
                  <div className="text-sm text-blue-600">
                    Predicted Yield: {analysis.quarterSelection.optimalYield.toLocaleString()} kg/ha
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {analysis.quarterConfidence.toFixed(1)}% Confidence
                </Badge>
              </div>
            </div>

            {/* Quarter Reasoning */}
            <div className="space-y-2">
              <h4 className="font-medium">Analysis Reasoning</h4>
              <p className="text-sm text-muted-foreground">
                {analysis.recommendation.quarterReason}
              </p>
            </div>

            {/* All Quarters Comparison */}
            <div className="space-y-2">
              <h4 className="font-medium">All Quarters Comparison</h4>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(quarter => {
                  const quarterData = analysis.quarterSelection.quarterlyYields[`quarter${quarter}` as keyof typeof analysis.quarterSelection.quarterlyYields];
                  const isOptimal = quarter === analysis.optimalQuarter;
                  
                  return (
                    <div 
                      key={quarter} 
                      className={`p-2 rounded border ${
                        isOptimal ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getQuarterName(quarter)}</span>
                          {isOptimal && <Badge className="bg-green-100 text-green-800">OPTIMAL</Badge>}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {quarterData.predictedYield.toLocaleString()} kg/ha
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {quarterData.confidence}% confidence
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7-Day Window Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              7-Day Window Analysis
            </CardTitle>
            <CardDescription>
              Weather stability analysis for optimal planting period
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {analysis.optimalWindow ? (
              <>
                {/* Optimal Window */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-green-800">Optimal Window</div>
                    <Badge className="bg-green-100 text-green-800">
                      {analysis.windowConfidence.toFixed(1)}% Confidence
                    </Badge>
                  </div>
                  <div className="text-sm text-green-700">
                    {formatDate(analysis.optimalWindow.startDate)} - {formatDate(analysis.optimalWindow.endDate)}
                  </div>
                </div>

                {/* Weather Stability Scores */}
                <div className="space-y-3">
                  <h4 className="font-medium">Weather Stability Scores</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Temperature</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {(analysis.optimalWindow.score.temperatureStability * 100).toFixed(1)}%
                        </span>
                        <Progress 
                          value={analysis.optimalWindow.score.temperatureStability * 100} 
                          className="w-16 h-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Precipitation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {(analysis.optimalWindow.score.precipitationScore * 100).toFixed(1)}%
                        </span>
                        <Progress 
                          value={analysis.optimalWindow.score.precipitationScore * 100} 
                          className="w-16 h-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Wind</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {(analysis.optimalWindow.score.windStability * 100).toFixed(1)}%
                        </span>
                        <Progress 
                          value={analysis.optimalWindow.score.windStability * 100} 
                          className="w-16 h-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Humidity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {(analysis.optimalWindow.score.humidityStability * 100).toFixed(1)}%
                        </span>
                        <Progress 
                          value={analysis.optimalWindow.score.humidityStability * 100} 
                          className="w-16 h-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Window Reasoning */}
                <div className="space-y-2">
                  <h4 className="font-medium">Analysis Reasoning</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysis.recommendation.windowReason}
                  </p>
                </div>
              </>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No optimal 7-day window found. Using quarter-level recommendation only.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Quality & Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Analysis Metadata
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Data Quality */}
            <div className="space-y-2">
              <h4 className="font-medium">Data Quality</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quarter Data:</span>
                  <Badge className={getDataQualityColor(analysis.dataQuality.quarterData)}>
                    {analysis.dataQuality.quarterData}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weather Data:</span>
                  <Badge className={getDataQualityColor(analysis.dataQuality.weatherData)}>
                    {analysis.dataQuality.weatherData}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall:</span>
                  <Badge className={getDataQualityColor(analysis.dataQuality.overall)}>
                    {analysis.dataQuality.overall}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Analysis Info */}
            <div className="space-y-2">
              <h4 className="font-medium">Analysis Information</h4>
              <div className="space-y-1 text-sm">
                <div>Location: {analysis.location.name}</div>
                <div>Year: {analysis.year}</div>
                <div>Analysis Date: {formatDate(analysis.analysisDate)}</div>
              </div>
            </div>

            {/* Region Info */}
            {regionInfo && (
              <div className="space-y-2">
                <h4 className="font-medium">Region Information</h4>
                <div className="space-y-1 text-sm">
                  <div>Region: {regionInfo.region.region}</div>
                  <div>Production: {regionInfo.region.riceProduction}</div>
                  <div>Seasons: {regionInfo.region.mainSeasons.join(', ')}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Options */}
      {analysis.fallbackOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alternative Options
            </CardTitle>
            <CardDescription>
              Backup recommendations in case the optimal window is not available
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Alternative Quarters */}
            {analysis.fallbackOptions.alternativeQuarters.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Alternative Quarters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {analysis.fallbackOptions.alternativeQuarters.map((alt: any, index: number) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{getQuarterName(alt.quarter)}</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {alt.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Windows */}
            {analysis.fallbackOptions.alternativeWindows.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Alternative 7-Day Windows</h4>
                <div className="space-y-2">
                  {analysis.fallbackOptions.alternativeWindows.slice(0, 3).map((window: any, index: number) => (
                    <div key={index} className="p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {formatDate(window.startDate)} - {formatDate(window.endDate)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Score: {(window.score.overallScore * 100).toFixed(1)}%
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {window.confidence.toFixed(1)}% confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Start New Analysis
        </button>
      </div>
    </div>
  );
}
