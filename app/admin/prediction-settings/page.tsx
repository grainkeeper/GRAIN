/**
 * Admin Prediction Settings Page
 * 
 * Allows administrators to adjust MLR formulas with validation and preview functionality.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, TestTube, AlertTriangle, CheckCircle, Calculator } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  // Initialize formulas from constants
  useEffect(() => {
    const initialFormulas: FormulaData[] = [
      {
        quarter: 1,
        coefficients: QUARTERLY_FORMULAS.quarter1,
        accuracy: 96.01,
        description: 'Q1 (January-March) - Optimal for early planting season'
      },
      {
        quarter: 2,
        coefficients: QUARTERLY_FORMULAS.quarter2,
        accuracy: 96.01,
        description: 'Q2 (April-June) - Peak growing season'
      },
      {
        quarter: 3,
        coefficients: QUARTERLY_FORMULAS.quarter3,
        accuracy: 96.01,
        description: 'Q3 (July-September) - Late growing season'
      },
      {
        quarter: 4,
        coefficients: QUARTERLY_FORMULAS.quarter4,
        accuracy: 96.01,
        description: 'Q4 (October-December) - Harvest preparation'
      }
    ];
    setFormulas(initialFormulas);
  }, []);

  const handleCoefficientChange = (quarterIndex: number, field: keyof FormulaCoefficients, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormulas(prev => prev.map((formula, index) => 
      index === quarterIndex 
        ? { ...formula, coefficients: { ...formula.coefficients, [field]: numValue } }
        : formula
    ));
    setError(null);
    setSuccess(null);
  };

  const validateFormulas = (): boolean => {
    for (const formula of formulas) {
      const { coefficients } = formula;
      
      // Check for extreme values that might indicate errors
      if (Math.abs(coefficients.temperature) > 100000) {
        setError(`Q${formula.quarter}: Temperature coefficient seems too large`);
        return false;
      }
      if (Math.abs(coefficients.dewPoint) > 100000) {
        setError(`Q${formula.quarter}: Dew point coefficient seems too large`);
        return false;
      }
      if (Math.abs(coefficients.precipitation) > 100000) {
        setError(`Q${formula.quarter}: Precipitation coefficient seems too large`);
        return false;
      }
      if (Math.abs(coefficients.windSpeed) > 100000) {
        setError(`Q${formula.quarter}: Wind speed coefficient seems too large`);
        return false;
      }
      if (Math.abs(coefficients.humidity) > 100000) {
        setError(`Q${formula.quarter}: Humidity coefficient seems too large`);
        return false;
      }
      if (Math.abs(coefficients.constant) > 1000000) {
        setError(`Q${formula.quarter}: Constant term seems too large`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateFormulas()) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/prediction-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formulas }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save formulas');
      }

      setSuccess('Formulas saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save formulas');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!validateFormulas()) return;

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

  const resetToDefaults = () => {
    const defaultFormulas: FormulaData[] = [
      {
        quarter: 1,
        coefficients: QUARTERLY_FORMULAS.quarter1,
        accuracy: 96.01,
        description: 'Q1 (January-March) - Optimal for early planting season'
      },
      {
        quarter: 2,
        coefficients: QUARTERLY_FORMULAS.quarter2,
        accuracy: 96.01,
        description: 'Q2 (April-June) - Peak growing season'
      },
      {
        quarter: 3,
        coefficients: QUARTERLY_FORMULAS.quarter3,
        accuracy: 96.01,
        description: 'Q3 (July-September) - Late growing season'
      },
      {
        quarter: 4,
        coefficients: QUARTERLY_FORMULAS.quarter4,
        accuracy: 96.01,
        description: 'Q4 (October-December) - Harvest preparation'
      }
    ];
    setFormulas(defaultFormulas);
    setError(null);
    setSuccess(null);
    setTestResults(null);
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
          Configure and validate the MLR formulas used for rice yield prediction. 
          These formulas have been tested to provide 96.01% accuracy.
        </p>
      </div>

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
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
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
                   All MLR formulas with their current coefficients and accuracy ratings
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

                  {/* Coefficient Inputs */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`temp-${formula.quarter}`}>Temperature Coefficient</Label>
                      <Input
                        id={`temp-${formula.quarter}`}
                        type="number"
                        step="0.000001"
                        value={formula.coefficients.temperature}
                        onChange={(e) => handleCoefficientChange(formula.quarter - 1, 'temperature', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`dew-${formula.quarter}`}>Dew Point Coefficient</Label>
                      <Input
                        id={`dew-${formula.quarter}`}
                        type="number"
                        step="0.000001"
                        value={formula.coefficients.dewPoint}
                        onChange={(e) => handleCoefficientChange(formula.quarter - 1, 'dewPoint', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`precip-${formula.quarter}`}>Precipitation Coefficient</Label>
                      <Input
                        id={`precip-${formula.quarter}`}
                        type="number"
                        step="0.000001"
                        value={formula.coefficients.precipitation}
                        onChange={(e) => handleCoefficientChange(formula.quarter - 1, 'precipitation', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`wind-${formula.quarter}`}>Wind Speed Coefficient</Label>
                      <Input
                        id={`wind-${formula.quarter}`}
                        type="number"
                        step="0.000001"
                        value={formula.coefficients.windSpeed}
                        onChange={(e) => handleCoefficientChange(formula.quarter - 1, 'windSpeed', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`humidity-${formula.quarter}`}>Humidity Coefficient</Label>
                      <Input
                        id={`humidity-${formula.quarter}`}
                        type="number"
                        step="0.000001"
                        value={formula.coefficients.humidity}
                        onChange={(e) => handleCoefficientChange(formula.quarter - 1, 'humidity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`constant-${formula.quarter}`}>Constant Term</Label>
                      <Input
                        id={`constant-${formula.quarter}`}
                        type="number"
                        step="0.000001"
                        value={formula.coefficients.constant}
                        onChange={(e) => handleCoefficientChange(formula.quarter - 1, 'constant', e.target.value)}
                      />
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
                    <div className="text-sm font-medium text-purple-800">Status</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {testResults.status || 'Passed'}
                    </div>
                  </div>
                </div>

                {testResults.quarterResults && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Quarter-by-Quarter Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(testResults.quarterResults).map(([quarter, result]: [string, any]) => (
                        <div key={quarter} className="p-2 bg-gray-50 rounded border">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{quarter}</span>
                            <Badge variant={result.accuracy >= 90 ? 'default' : 'secondary'}>
                              {result.accuracy?.toFixed(2)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {testResults.recommendations && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recommendations</h4>
                    <ul className="space-y-1 text-sm">
                      {testResults.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
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
               <Calculator className="h-5 w-5" />
               Accuracy Tracking & Performance Monitoring
             </CardTitle>
             <CardDescription>
               Monitor prediction accuracy over time and track performance metrics
             </CardDescription>
           </CardHeader>
           <CardContent>
             <AccuracyTracking />
           </CardContent>
         </Card>
       </div>
     );
   }
