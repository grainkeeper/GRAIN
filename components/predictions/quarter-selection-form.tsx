/**
 * Quarter Selection Form Component
 * 
 * UI component for selecting a year and displaying quarter selection analysis
 * using the 96.01% accurate MLR formulas and historical weather data (2025-2100).
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Calendar, Target, Info } from 'lucide-react';

// Types for the API response
interface QuarterSelectionResponse {
  success: boolean;
  data?: {
    year: number;
    optimalQuarter: {
      number: 1 | 2 | 3 | 4;
      name: string;
      months: { start: string; end: string };
      predictedYield: number;
      confidence: number;
    };
    allQuarters: Array<{
      quarter: number;
      name: string;
      predictedYield: number;
      confidence: number;
      weatherData: {
        temperature: number;
        dewPoint: number;
        precipitation: number;
        windSpeed: number;
        humidity: number;
      };
    }>;
    analyzedAt: string;
    accuracy: {
      overallAccuracy: number;
      accuracySource: string;
      confidenceFactors: string[];
      limitations: string[];
    };
  };
  error?: string;
  details?: string[];
  timestamp: string;
}

export default function QuarterSelectionForm() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<QuarterSelectionResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate years from 2025 to 2100
  const years = Array.from({ length: 76 }, (_, i) => 2025 + i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedYear) {
      setError('Please select a year');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/predictions/quarter-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year: selectedYear }),
      });

      const data: QuarterSelectionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze quarter selection');
      }

      if (data.success && data.data) {
        setResults(data.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getQuarterColor = (quarter: number) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-purple-100 text-purple-800'
    };
    return colors[quarter as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quarter Selection Analysis
          </CardTitle>
          <CardDescription>
            Select a year to analyze the optimal planting quarter using our 96.01% accurate MLR formulas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year">Select Year (2025-2100)</Label>
              <Select value={selectedYear?.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a year..." />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={!selectedYear || isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze Quarter Selection
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Optimal Quarter Highlight */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Target className="h-5 w-5" />
                Optimal Planting Quarter
              </CardTitle>
              <CardDescription className="text-green-700">
                Based on 96.01% accurate MLR formulas and historical weather data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getQuarterColor(results.optimalQuarter.number)}>
                      {results.optimalQuarter.name}
                    </Badge>
                    <Badge className={getConfidenceColor(results.optimalQuarter.confidence)}>
                      {results.optimalQuarter.confidence}% Confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {results.optimalQuarter.months.start} - {results.optimalQuarter.months.end}
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {results.optimalQuarter.predictedYield.toLocaleString()} kg/ha
                  </p>
                  <p className="text-sm text-gray-600">Predicted Yield</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Accuracy Information</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>{results.accuracy.overallAccuracy}%</strong> overall accuracy
                  </p>
                  <p className="text-xs text-gray-500">{results.accuracy.accuracySource}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Quarters Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Quarters Comparison
              </CardTitle>
              <CardDescription>
                Detailed analysis of all four quarters for {results.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {results.allQuarters.map((quarter) => (
                  <Card 
                    key={quarter.quarter} 
                    className={`${
                      quarter.quarter === results.optimalQuarter.number 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getQuarterColor(quarter.quarter)}>
                          {quarter.name}
                        </Badge>
                        {quarter.quarter === results.optimalQuarter.number && (
                          <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div>
                          <p className="text-lg font-bold">
                            {quarter.predictedYield.toLocaleString()} kg/ha
                          </p>
                          <p className="text-xs text-gray-500">Predicted Yield</p>
                        </div>
                        <div>
                          <Badge className={getConfidenceColor(quarter.confidence)}>
                            {quarter.confidence}% Confidence
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p><strong>Weather Data:</strong></p>
                          <p>Temp: {quarter.weatherData.temperature}°C</p>
                          <p>Dew: {quarter.weatherData.dewPoint}°C</p>
                          <p>Precip: {quarter.weatherData.precipitation}mm</p>
                          <p>Wind: {quarter.weatherData.windSpeed} km/h</p>
                          <p>Humidity: {quarter.weatherData.humidity}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Analysis Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Analyzed:</strong> {new Date(results.analyzedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Year:</strong> {results.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Confidence Factors:</strong>
                  </p>
                  <ul className="text-xs text-gray-500 list-disc list-inside">
                    {results.accuracy.confidenceFactors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
