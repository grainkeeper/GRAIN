/**
 * Planting Window Analysis Page
 * 
 * Provides the complete interface for integrated planting window analysis
 * combining quarter selection with 7-day window analysis.
 */

'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Calendar, Target } from 'lucide-react';
import PlantingWindowForm from '@/components/predictions/planting-window-form';
import PlantingWindowResults from '@/components/predictions/planting-window-results';

export default function PlantingWindowPage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setAnalysisResult(null);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Target className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Planting Window Analysis
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get precise 7-day planting windows using our 96.01% accurate MLR formulas 
              combined with location-specific weather analysis. Find the optimal time to plant 
              for maximum rice yield.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Analysis Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing planting windows...</p>
            </div>
          )}

          {/* Content */}
          {!analysisResult ? (
            <div className="space-y-8">
              {/* Features Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Quarter Selection</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Uses 96.01% accurate MLR formulas to identify the optimal 3-month planting quarter.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">7-Day Windows</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Analyzes weather stability within the quarter to find the best 7-day planting period.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Location-Specific</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Provides recommendations tailored to your specific Philippine rice region.
                  </p>
                </div>
              </div>

              {/* Analysis Form */}
              <PlantingWindowForm 
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
              />
            </div>
          ) : (
            /* Results Display */
            <PlantingWindowResults 
              result={analysisResult}
              onReset={handleReset}
            />
          )}
        </div>
      </div>

      {/* Footer Information */}
      {!analysisResult && (
        <div className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">1</span>
                    <span>Select your target year and Philippine rice region</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">2</span>
                    <span>Our MLR formulas analyze all quarters for optimal yield prediction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">3</span>
                    <span>Weather data is analyzed to find the most stable 7-day window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">4</span>
                    <span>Get comprehensive recommendations with confidence scores</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>96.01% accurate MLR-based quarter selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Location-specific weather analysis using Open-Meteo data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Comprehensive confidence scoring and risk assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Alternative options and fallback recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Philippine rice region database with 13 major regions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
