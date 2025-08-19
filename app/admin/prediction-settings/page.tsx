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
import { Loader2, TestTube, AlertTriangle, CheckCircle, Calculator, Lock, Eye } from 'lucide-react';
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Prediction Settings</h1>
        <p className="text-muted-foreground">
          View the MLR formulas used for rice yield prediction. 
          These formulas have been tested to provide 96.01% accuracy and are locked to prevent modification.
        </p>
      </div>

      {/* Read-Only Notice */}
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <strong>Read-Only Mode:</strong> These formulas are locked and cannot be modified to maintain system accuracy and integrity.
        </AlertDescription>
      </Alert>

      {/* Alerts */}
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

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={handleTest} disabled={isTesting}>
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Test Formulas
              </>
            )}
          </Button>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Read-Only
        </Badge>
      </div>

      {/* Formula Configuration */}
      <Tabs defaultValue="formulas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="formulas">Formulas</TabsTrigger>
          {formulas.map((formula) => (
            <TabsTrigger key={formula.quarter} value={`quarter${formula.quarter}`}>
              Q{formula.quarter}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="formulas">
          <Card>
            <CardHeader>
              <CardTitle>Formula Overview</CardTitle>
              <CardDescription>
                All MLR formulas with their coefficients and accuracy ratings (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formulas.map((formula) => (
                  <div key={formula.quarter} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Quarter {formula.quarter}</h4>
                      <Badge variant="secondary">
                        {formula.accuracy}% Accuracy
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{formula.description}</p>
                    <div className="text-xs font-mono bg-muted p-2 rounded">
                      Ŷ = {formula.coefficients.temperature}T + {formula.coefficients.dewPoint}D + {formula.coefficients.precipitation}P + {formula.coefficients.windSpeed}W + {formula.coefficients.humidity}H + {formula.coefficients.constant}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {formulas.map((formula) => (
          <TabsContent key={formula.quarter} value={`quarter${formula.quarter}`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quarter {formula.quarter} Formula</CardTitle>
                    <CardDescription>{formula.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {formula.accuracy}% Accuracy
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formula Display */}
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Current Formula:</h4>
                  <p className="text-sm font-mono">
                    Ŷ = {formula.coefficients.temperature}T + {formula.coefficients.dewPoint}D + {formula.coefficients.precipitation}P + {formula.coefficients.windSpeed}W + {formula.coefficients.humidity}H + {formula.coefficients.constant}
                  </p>
                </div>

                {/* Coefficient Display (Read-Only) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temperature Coefficient</label>
                    <div className="p-2 bg-muted rounded border font-mono text-sm">
                      {formula.coefficients.temperature}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dew Point Coefficient</label>
                    <div className="p-2 bg-muted rounded border font-mono text-sm">
                      {formula.coefficients.dewPoint}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Precipitation Coefficient</label>
                    <div className="p-2 bg-muted rounded border font-mono text-sm">
                      {formula.coefficients.precipitation}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Wind Speed Coefficient</label>
                    <div className="p-2 bg-muted rounded border font-mono text-sm">
                      {formula.coefficients.windSpeed}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Humidity Coefficient</label>
                    <div className="p-2 bg-muted rounded border font-mono text-sm">
                      {formula.coefficients.humidity}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Constant Term</label>
                    <div className="p-2 bg-muted rounded border font-mono text-sm">
                      {formula.coefficients.constant}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Test Results
            </CardTitle>
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
      <AccuracyTracking />
    </div>
  );
}
