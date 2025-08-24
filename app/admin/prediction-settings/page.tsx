/**
 * Admin Prediction Settings Page
 * 
 * Displays the MLR formulas used for rice yield prediction (read-only).
 * These formulas have been tested to provide 96.01% accuracy and cannot be modified.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TestTube, AlertTriangle, CheckCircle, Calculator, Lock, Eye, BarChart3, Info, Brain, Target, Database } from 'lucide-react';
import { QUARTERLY_FORMULAS } from '@/lib/constants/quarterly-formulas';
import AccuracyTracking from '@/components/admin/accuracy-tracking';

interface FormulaCoefficients {
  temperature: number;
  dewPoint: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  constant: number;
}

interface FormulaData {
  quarter: number;
  coefficients: FormulaCoefficients;
  accuracy: number;
  description: string;
}

export default function PredictionSettingsPage() {
  const [formulas, setFormulas] = useState<FormulaData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  // Initialize formulas from constants (read-only)
  useEffect(() => {
    const initialFormulas: FormulaData[] = QUARTERLY_FORMULAS.map(formula => ({
      quarter: formula.quarter,
      coefficients: formula.coefficients,
      accuracy: 96.01,
      description: formula.name
    }));
    setFormulas(initialFormulas);
  }, []);

  const handleTest = async () => {
    setIsTesting(true);
    setError(null);
    setSuccess(null);
    setTestResults(null);

    try {
      const response = await fetch('/api/admin/prediction-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formulas }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to test formulas');
      }

      setTestResults(result.data);
      setSuccess('Formula test completed successfully!');
    } catch (error) {
      console.error('Test error:', error);
      setError(error instanceof Error ? error.message : 'Failed to test formulas');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading prediction settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">MLR Prediction Model Settings</h1>
        <p className="text-muted-foreground text-lg">Multiple Linear Regression (MLR) formulas for rice yield prediction</p>
        <p className="text-sm text-muted-foreground">
          View and test the mathematical formulas that power the yield prediction system. These formulas use weather data to predict rice yields with 96.01% accuracy.
        </p>
      </div>

      {/* Model Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Type</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MLR</div>
            <p className="text-xs text-muted-foreground">
              Multiple Linear Regression
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">96.01%</div>
            <p className="text-xs text-muted-foreground">
              Tested accuracy rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Source</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CSV</div>
            <p className="text-xs text-muted-foreground">
              yield_output.csv (2025-2100)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About the MLR Model
          </CardTitle>
          <CardDescription>How the prediction system works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Model Components</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>4 Quarterly Formulas:</strong> Q1, Q2, Q3, Q4</li>
                <li>• <strong>Weather Variables:</strong> Temperature, Dew Point, Precipitation, Wind, Humidity</li>
                <li>• <strong>Data Range:</strong> 2025-2100 (76 years)</li>
                <li>• <strong>Region:</strong> Philippines (17 regions)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Formula Structure</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Yield = β₀ + β₁T + β₂D + β₃P + β₄W + β₅H</div>
                <div className="text-xs mt-2">
                  Where: T=Temperature, D=Dew Point, P=Precipitation, W=Wind, H=Humidity
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">Read-Only Configuration</div>
                <div>These formulas are optimized and tested. Modifying them could affect prediction accuracy. Use the test function to validate current performance.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Model Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Model Testing
          </CardTitle>
          <CardDescription>Validate the current MLR formulas with test data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test the current MLR formulas against historical data to verify accuracy and performance.
            </p>
            
            <Button 
              onClick={handleTest} 
              disabled={isTesting}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4" />
                  Test MLR Formulas
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Formulas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Quarterly MLR Formulas
          </CardTitle>
          <CardDescription>Mathematical formulas for each quarter (2025-2100)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="q1" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="q1">Q1 (Jan-Mar)</TabsTrigger>
              <TabsTrigger value="q2">Q2 (Apr-Jun)</TabsTrigger>
              <TabsTrigger value="q3">Q3 (Jul-Sep)</TabsTrigger>
              <TabsTrigger value="q4">Q4 (Oct-Dec)</TabsTrigger>
            </TabsList>

            {formulas.map((formula) => (
              <TabsContent key={formula.quarter} value={`q${formula.quarter}`} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{formula.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quarter {formula.quarter} formula for rice yield prediction
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {formula.accuracy}% Accuracy
                  </Badge>
                </div>

                <div className="p-4 bg-gray-50 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Formula Coefficients:</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Constant (β₀):</span>
                      <span className="font-mono">{formula.coefficients.constant.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperature (β₁):</span>
                      <span className="font-mono">{formula.coefficients.temperature.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dew Point (β₂):</span>
                      <span className="font-mono">{formula.coefficients.dewPoint.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precipitation (β₃):</span>
                      <span className="font-mono">{formula.coefficients.precipitation.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wind Speed (β₄):</span>
                      <span className="font-mono">{formula.coefficients.windSpeed.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Humidity (β₅):</span>
                      <span className="font-mono">{formula.coefficients.humidity.toFixed(6)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">Formula in Use:</span>
                  </div>
                  <div className="mt-1 text-sm font-mono text-green-700">
                    Yield = {formula.coefficients.constant.toFixed(6)} + {formula.coefficients.temperature.toFixed(6)}×T + {formula.coefficients.dewPoint.toFixed(6)}×D + {formula.coefficients.precipitation.toFixed(6)}×P + {formula.coefficients.windSpeed.toFixed(6)}×W + {formula.coefficients.humidity.toFixed(6)}×H
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test Results
            </CardTitle>
            <CardDescription>Latest model validation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm font-medium text-green-800">Overall Accuracy</div>
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.overallAccuracy?.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Test Cases</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {testResults.testCases || 0}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm font-medium text-purple-800">Average Error</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {testResults.averageError?.toFixed(2)}%
                  </div>
                </div>
              </div>

              {testResults.quarterResults && (
                <div className="space-y-3">
                  <h4 className="font-medium">Quarter-Specific Results:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {Object.entries(testResults.quarterResults).map(([quarter, data]: [string, any]) => (
                      <div key={quarter} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="text-sm font-medium">Q{quarter}</div>
                        <div className="text-lg font-bold text-green-600">
                          {data.accuracy?.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-600">
                          {data.testCases || 0} tests
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accuracy Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Historical Accuracy Tracking
          </CardTitle>
          <CardDescription>Long-term performance monitoring and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <AccuracyTracking />
        </CardContent>
      </Card>
    </div>
  );
}
