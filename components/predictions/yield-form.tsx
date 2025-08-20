'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
// Varieties are loaded from API at runtime
import CascadingDropdown from './cascading-dropdown';
import { 
  CalendarIcon, 
  ChartBarIcon, 
  CloudIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface PSGCItem {
  code: string;
  name: string;
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
}

interface PlantingWindow {
  startDate: string;
  endDate: string;
  score: number;
  conditions: {
    temperature: number;
    dewPoint: number;
    precipitation: number;
    windSpeed: number;
    humidity: number;
  };
  confidence: number;
  predictedYield: number;
  weatherStability: number;
  riskFactors: string[];
  weatherDescription: string;
  historicalInsights?: {
    historicalAverage: number;
    historicalBest: number;
    historicalWorst: number;
    successRate: number;
    performance: 'above_average' | 'average' | 'below_average';
    percentile: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
  };
}

interface QuarterAnalysis {
  quarter: number;
  predictedYield: number;
  weatherData: {
    temperature: number;
    dewPoint: number;
    precipitation: number;
    windSpeed: number;
    humidity: number;
  };
  confidence: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface IntegratedAnalysisResult {
  success: boolean;
  location: string;
  year: number;
  quarterAnalysis: QuarterAnalysis[];
  optimalQuarter: number;
  plantingWindows: PlantingWindow[];
  overallRecommendation: string;
  weatherTrend: string;
  riskAssessment: string;
  farmingAdvice: string[];
}

export default function YieldPredictionForm() {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear() + 1,
    quarter: 4, // Use current quarter (Q4 2024)
    riceVariety: '',
    includeAlternatives: true,
    useHistoricalData: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [varieties, setVarieties] = useState<{id:string;name:string;description?:string}[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    region: PSGCItem | null;
    province: PSGCItem | null;
    city: PSGCItem | null;
    barangay: PSGCItem | null;
  }>({
    region: null,
    province: null,
    city: null,
    barangay: null
  });

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/varieties', { cache: 'no-store' })
        const j = await r.json()
        if (r.ok) setVarieties(j.data || [])
      } catch {}
    })()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);

    // Build a more specific location string for Open-Meteo API
    let location = '';
    if (selectedLocation.barangay?.name && selectedLocation.city?.name && selectedLocation.province?.name) {
      location = `${selectedLocation.barangay.name}, ${selectedLocation.city.name}, ${selectedLocation.province.name}, Philippines`;
    } else if (selectedLocation.city?.name && selectedLocation.province?.name) {
      location = `${selectedLocation.city.name}, ${selectedLocation.province.name}, Philippines`;
    } else if (selectedLocation.province?.name) {
      location = `${selectedLocation.province.name}, Philippines`;
    } else if (selectedLocation.region?.name) {
      location = `${selectedLocation.region.name}, Philippines`;
    } else {
      location = 'Manila, Philippines'; // Fallback
    }

    try {
      const response = await fetch('/api/predictions/planting-window', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: formData.year,
          location: {
            name: location,
            region: selectedLocation.region?.name || '',
            province: selectedLocation.province?.name || '',
            city: selectedLocation.city?.name || '',
            barangay: selectedLocation.barangay?.name || ''
          },
          options: {
            includeAlternatives: formData.includeAlternatives,
            useHistoricalData: formData.useHistoricalData,
            overrideQuarter: formData.quarter
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get prediction');
      }

      setResults(data.data);
      setShowResultsModal(true);
      setActiveTab('summary');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <SparklesIcon className="h-5 w-5" />;
    if (score >= 60) return <CheckCircleIcon className="h-5 w-5" />;
    return <ExclamationTriangleIcon className="h-5 w-5" />;
  };

  const getQuarterInfo = (quarter: number) => {
    const quarters = {
      1: { name: 'Q1', period: 'Jan-Mar', icon: '🌱' },
      2: { name: 'Q2', period: 'Apr-Jun', icon: '🌿' },
      3: { name: 'Q3', period: 'Jul-Sep', icon: '🌾' },
      4: { name: 'Q4', period: 'Oct-Dec', icon: '🍂' }
    };
    return quarters[quarter as keyof typeof quarters];
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // New function to assess yield risk
  const assessYieldRisk = (predictedYield: number) => {
    const yieldInTons = predictedYield / 1000;
    
    if (yieldInTons > 0) {
      if (yieldInTons >= 4.0) return { level: 'excellent', color: 'green', label: 'High Yield Expected' };
      if (yieldInTons >= 2.0) return { level: 'good', color: 'green', label: 'Good Yield Expected' };
      if (yieldInTons >= 1.0) return { level: 'moderate', color: 'yellow', label: 'Moderate Yield Expected' };
      return { level: 'low', color: 'orange', label: 'Low Yield Expected' };
    } else {
      if (yieldInTons <= -5.0) return { level: 'critical', color: 'red', label: 'Critical Loss Risk' };
      if (yieldInTons <= -2.0) return { level: 'high', color: 'red', label: 'High Loss Risk' };
      return { level: 'moderate', color: 'orange', label: 'Moderate Loss Risk' };
    }
  };

  // New function to calculate financial impact with realistic figures
  const calculateFinancialImpact = (predictedYield: number, areaHectares: number = 1) => {
    const yieldInTons = predictedYield / 1000;
    
    // Realistic Philippine rice farming costs and prices (2024)
    const ricePricePerTon = 18000; // PHP per ton (farm gate price)
    const productionCostPerHectare = 35000; // PHP per hectare (seeds, fertilizer, labor, etc.)
    
    // For negative yields, we assume partial harvest or crop failure
    let actualRevenue = 0;
    if (yieldInTons > 0) {
      actualRevenue = yieldInTons * ricePricePerTon * areaHectares;
    } else if (yieldInTons > -2) {
      // Partial harvest scenario
      actualRevenue = Math.max(0, (yieldInTons + 2) * ricePricePerTon * areaHectares * 0.3);
    }
    // For yields <= -2, assume complete crop failure (no revenue)
    
    const costs = productionCostPerHectare * areaHectares;
    const profit = actualRevenue - costs;
    
    return {
      revenue: actualRevenue,
      costs: costs,
      profit: profit,
      profitPerHectare: profit / areaHectares,
      isProfitable: profit > 0,
      yieldInTons: yieldInTons,
      scenario: yieldInTons > 0 ? 'normal' : yieldInTons > -2 ? 'partial_harvest' : 'crop_failure'
    };
  };

  // New function to get risk consequences
  const getRiskConsequences = (predictedYield: number) => {
    const yieldInTons = predictedYield / 1000;
    
    if (yieldInTons > 0) {
      return {
        severity: 'positive',
        consequences: [
          'Expected profitable harvest',
          'Normal farming operations recommended',
          'Standard risk management practices apply'
        ]
      };
    } else {
      const severity = yieldInTons <= -5.0 ? 'critical' : yieldInTons <= -2.0 ? 'high' : 'moderate';
      const consequences = [
        'Potential crop failure or significant yield reduction',
        'High risk of financial losses',
        'May require alternative farming strategies',
        'Consider crop insurance or risk mitigation measures'
      ];
      
      if (yieldInTons <= -5.0) {
        consequences.push('Consider postponing planting to next quarter');
        consequences.push('Evaluate alternative crops or farming methods');
      }
      
      return { severity, consequences };
    }
  };

  // Derived fallbacks from API response shapes
  const effectiveAnalysis = results?.analysis ?? null;
  const optimalQuarter = results?.optimalQuarter ?? effectiveAnalysis?.optimalQuarter ?? null;
  const quarterCards = (results?.quarterAnalysis ?? (effectiveAnalysis?.quarterSelection ? [
    { quarter: 1, predictedYield: effectiveAnalysis.quarterSelection.quarterlyYields?.quarter1?.predictedYield, confidence: (effectiveAnalysis.quarterSelection.quarterlyYields?.quarter1?.confidence ?? 85) >= 85 ? 'high' : 'medium' },
    { quarter: 2, predictedYield: effectiveAnalysis.quarterSelection.quarterlyYields?.quarter2?.predictedYield, confidence: (effectiveAnalysis.quarterSelection.quarterlyYields?.quarter2?.confidence ?? 85) >= 85 ? 'high' : 'medium' },
    { quarter: 3, predictedYield: effectiveAnalysis.quarterSelection.quarterlyYields?.quarter3?.predictedYield, confidence: (effectiveAnalysis.quarterSelection.quarterlyYields?.quarter3?.confidence ?? 85) >= 85 ? 'high' : 'medium' },
    { quarter: 4, predictedYield: effectiveAnalysis.quarterSelection.quarterlyYields?.quarter4?.predictedYield, confidence: (effectiveAnalysis.quarterSelection.quarterlyYields?.quarter4?.confidence ?? 85) >= 85 ? 'high' : 'medium' },
  ] : [])).filter((q: any) => q && q.predictedYield != null);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-0 space-y-6">

      {/* Form Card */}
      <Card className="shadow-xl border-0 bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPinIcon className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Integrated Rice Yield Analysis</CardTitle>
              <CardDescription className="text-gray-600">
                Get quarter selection and 7-day planting windows using our 96.01% accurate MLR formulas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-green-700" />
                <h3 className="text-base font-semibold text-gray-900">Location Details</h3>
              </div>
              <CascadingDropdown onLocationChange={setSelectedLocation} />
            </div>

            {/* Analysis Options */}
            <div className="space-y-4">
                           <div className="flex items-center gap-2">
               <SparklesIcon className="h-4 w-4 text-green-700" />
               <h3 className="text-base font-semibold text-gray-900">Analysis Options</h3>
             </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-alternatives"
                    checked={formData.includeAlternatives}
                    onCheckedChange={(checked) => setFormData({...formData, includeAlternatives: checked})}
                  />
                  <Label htmlFor="include-alternatives" className="text-sm">Include alternative windows</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-historical"
                    checked={formData.useHistoricalData}
                    onCheckedChange={(checked) => setFormData({...formData, useHistoricalData: checked})}
                  />
                  <Label htmlFor="use-historical" className="text-sm">Use historical weather patterns</Label>
                </div>
              </div>
            </div>

            {/* Other Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-3">
                <Label htmlFor="year" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  Target Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  min={2025}
                  max={2100}
                  className="h-12 w-full text-base font-medium"
                />
                <p className="text-xs text-gray-500">Available: 2025-2100</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="quarter" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  Quarter (optional override)
                </Label>
                <Select value={String(formData.quarter)} onValueChange={(value) => setFormData({...formData, quarter: parseInt(value)})}>
                  <SelectTrigger className="h-12 w-full text-base font-medium truncate whitespace-nowrap">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[300px]">
                    {[1,2,3,4].map((q) => (
                      <SelectItem key={q} value={String(q)} className="py-3">
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-lg flex-shrink-0">{getQuarterInfo(q).icon}</span>
                          <div className="font-medium truncate">Q{q} ({getQuarterInfo(q).period})</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Leave as-is to auto-select using MLR. Pick a quarter to override.</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="riceVariety" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <SparklesIcon className="h-4 w-4 text-gray-500" />
                  Rice Variety (Optional)
                </Label>
                <Select value={formData.riceVariety} onValueChange={(value) => setFormData({...formData, riceVariety: value})}>
                  <SelectTrigger className="h-12 w-full text-base font-medium truncate whitespace-nowrap">
                    <SelectValue placeholder="Select rice variety" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[300px]">
                    {varieties.map((variety) => (
                      <SelectItem key={variety.id} value={variety.name} className="py-3">
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                          <div className="font-medium truncate">{variety.name}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ChartBarIcon className="h-4 w-4 text-gray-500" />
                  Analysis Type
                </Label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">Quarter + 7-Day Windows</p>
                  <p className="text-xs text-blue-600 mt-1">
                    MLR quarter selection + precise 7-day planting windows
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              📊 Uses 96.01% accurate MLR formulas for quarter selection + Open-Meteo API for precise 7-day weather analysis
            </p>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading || !selectedLocation.province}
                className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyzing Quarter Selection & 7-Day Windows...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5" />
                    Analyze & See Results
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {results && !showResultsModal && (
        <div className="mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Analysis Complete!</h3>
            <p className="text-green-700 mb-4">
              Your rice yield analysis is ready. Click below to view detailed results with quarter analysis, 
              7-day planting windows, and risk assessments.
            </p>
            <Button
              onClick={() => setShowResultsModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3"
            >
              📊 View Detailed Results
            </Button>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && results && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-[1200px] h-[600px] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">🌾 Analysis Results</h2>
                  <p className="text-green-100 mt-1">
                    {results?.location || results?.analysis?.location?.name || 'Location'} • {results?.year || results?.analysis?.year || 'Year'}
                  </p>
                </div>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                {[
                  { id: 'summary', label: '📊 Summary', icon: '📊' },
                  { id: 'quarters', label: '📈 Quarters', icon: '📈' },
                  { id: 'windows', label: '🏆 Windows', icon: '🏆' },
                  { id: 'risks', label: '⚠️ Risks', icon: '⚠️' },
                  { id: 'advice', label: '🌱 Advice', icon: '🌱' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto h-[400px]">
              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  {/* Quick Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-700">📍 Location:</span>
                        <p className="text-gray-700 truncate">{results?.location || results?.analysis?.location?.name || '—'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">📅 Target Year:</span>
                        <p className="text-gray-700">{results?.year || results?.analysis?.year || '—'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">🏆 Optimal Quarter:</span>
                        <p className="text-lg font-bold text-green-600">{results?.optimalQuarter ? `Q${results.optimalQuarter}` : (results?.analysis?.optimalQuarter ? `Q${results.analysis.optimalQuarter}` : '—')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">🎯 7-Day Windows:</span>
                        <p className="text-gray-700">{(results?.plantingWindows?.length ?? results?.analysis?.windowAnalysis?.windows?.length ?? 0)} found</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Findings */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">📈 Key Findings</h3>
                      <div className="space-y-2">
                        <p className="text-blue-700 text-sm">{results?.weatherTrend || results?.analysis?.recommendation?.windowReason || '—'}</p>
                        <p className="text-blue-700 text-sm">{results?.riskAssessment || results?.analysis?.recommendation?.riskLevel || '—'}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-green-800 mb-3">🌱 Top Recommendations</h3>
                      <div className="space-y-2">
                        {(results?.farmingAdvice || results?.analysis?.recommendation?.actionItems || results?.regionInfo?.recommendations || []).slice(0, 3).map((advice: string, index: number) => (
                          <p key={index} className="text-green-700 text-sm flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            {advice}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quarters Tab */}
              {activeTab === 'quarters' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">📊 Quarter Analysis (MLR 96.01% Accuracy)</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {quarterCards.map((quarter: any, index: number) => {
                      const yieldRisk = assessYieldRisk(quarter.predictedYield);
                      const financialImpact = calculateFinancialImpact(quarter.predictedYield);
                      const isNegativeYield = quarter.predictedYield < 0;
                      
                      return (
                        <div key={index} className={`p-4 rounded-lg border ${
                          quarter.quarter === optimalQuarter 
                            ? (isNegativeYield ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="text-center mb-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                              quarter.quarter === optimalQuarter 
                                ? (isNegativeYield ? 'bg-red-100' : 'bg-green-100')
                                : 'bg-gray-100'
                            }`}>
                              <span className={`font-bold text-sm ${
                                quarter.quarter === optimalQuarter 
                                  ? (isNegativeYield ? 'text-red-600' : 'text-green-600')
                                  : 'text-gray-600'
                              }`}>
                                {getQuarterInfo(quarter.quarter).icon}
                              </span>
                            </div>
                            <h4 className={`font-semibold text-sm ${
                              quarter.quarter === optimalQuarter 
                                ? (isNegativeYield ? 'text-red-800' : 'text-green-800')
                                : 'text-gray-800'
                            }`}>
                              Q{quarter.quarter}
                            </h4>
                            {quarter.quarter === optimalQuarter && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isNegativeYield 
                                  ? 'text-red-600 bg-red-100' 
                                  : 'text-green-600 bg-green-100'
                              }`}>
                                {isNegativeYield ? 'HIGH RISK' : 'OPTIMAL'}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-center mb-3">
                            <p className={`text-lg font-bold ${
                              isNegativeYield ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {(Number(quarter?.predictedYield) / 1000).toFixed(1)} t/ha
                            </p>
                            <p className="text-xs text-gray-500">Predicted Yield</p>
                            
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                yieldRisk.color === 'red' ? 'text-red-600 bg-red-100' :
                                yieldRisk.color === 'orange' ? 'text-orange-600 bg-orange-100' :
                                yieldRisk.color === 'yellow' ? 'text-yellow-600 bg-yellow-100' :
                                'text-green-600 bg-green-100'
                              }`}>
                                {yieldRisk.label}
                              </span>
                            </div>
                          </div>
                          
                          {isNegativeYield && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                              <h5 className="text-xs font-semibold text-red-800 mb-2">💰 Financial Impact (per hectare)</h5>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-red-700">Revenue:</span>
                                  <span className="text-red-600">₱{financialImpact.revenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-red-700">Costs:</span>
                                  <span className="text-red-600">₱{financialImpact.costs.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t border-red-200 pt-1">
                                  <span className="text-red-800">Net Loss:</span>
                                  <span className="text-red-600">₱{Math.abs(financialImpact.profit).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-2 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(String(quarter?.confidence || 'high'))}`}>
                              {String(quarter?.confidence || 'high').toUpperCase()} Confidence
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Windows Tab */}
              {activeTab === 'windows' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">🏆 Top 7-Day Planting Windows</h3>
                  
                  {/* Warning for Negative Yield Quarter */}
                  {optimalQuarter && quarterCards.find((q: any) => q.quarter === optimalQuarter)?.predictedYield < 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="text-lg font-semibold text-orange-800 mb-2">⚠️ Important Notice</h4>
                          <p className="text-orange-700 text-sm">
                            The selected optimal quarter (Q{optimalQuarter}) shows a <strong>negative predicted yield</strong>. 
                            While these 7-day windows represent the best timing within this quarter, they still carry significant risks.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-3 gap-4">
                    {(results?.plantingWindows || results?.analysis?.windowAnalysis?.windows || []).slice(0, 3).map((window: any, index: number) => {
                      const isNegativeQuarter = optimalQuarter && quarterCards.find((q: any) => q.quarter === optimalQuarter)?.predictedYield < 0;
                      
                      return (
                        <div key={index} className={`border rounded-lg p-4 shadow-sm ${
                          isNegativeQuarter ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                        }`}>
                          <div className="text-center mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                              isNegativeQuarter ? 'bg-orange-100' : 'bg-green-100'
                            }`}>
                              <span className={`font-bold text-lg ${
                                isNegativeQuarter ? 'text-orange-600' : 'text-green-600'
                              }`}>#{index + 1}</span>
                            </div>
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {formatDate(window.startDate)} - {formatDate(window.endDate)}
                            </h4>
                            <p className="text-xs text-gray-500">7-day planting window</p>
                            
                            {isNegativeQuarter && (
                              <div className="mt-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                  ⚠️ High Risk Quarter
                                </span>
                              </div>
                            )}
                          </div>

                          {window?.predictedYield != null && (
                            <div className="text-center mb-4">
                              <p className={`text-2xl font-bold ${
                                window.predictedYield < 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {(Number(window.predictedYield) / 1000).toFixed(1)} t/ha
                              </p>
                              <p className="text-xs text-gray-500">Predicted Yield</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="text-center">
                              <p className="text-lg font-bold text-green-600">{Number(window?.weatherStability ?? (window?.score?.overallScore != null ? window.score.overallScore * 100 : 0)).toFixed(0)}%</p>
                              <p className="text-xs text-gray-500">Stability</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-green-600">{Number(window?.confidence ?? 0).toFixed(0)}%</p>
                              <p className="text-xs text-gray-500">Confidence</p>
                            </div>
                          </div>

                          {isNegativeQuarter && (
                            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                              <h5 className="font-medium text-red-800 mb-2 text-sm">🎯 Risk Assessment</h5>
                              <div className="space-y-2 text-xs text-red-700">
                                <p><strong>Quarter Context:</strong> This window is within a quarter with negative predicted yield</p>
                                <p><strong>Risk Level:</strong> High - despite optimal timing, significant yield loss expected</p>
                                <p><strong>Recommendation:</strong> Consider alternative quarters or risk mitigation strategies</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Risks Tab */}
              {activeTab === 'risks' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">⚠️ Risk Assessment</h3>
                  
                  {quarterCards.some((q: any) => q.predictedYield < 0) ? (
                    <div className="space-y-4">
                      {quarterCards.filter((q: any) => q.predictedYield < 0).map((quarter: any, index: number) => {
                        const riskConsequences = getRiskConsequences(quarter.predictedYield);
                        const financialImpact = calculateFinancialImpact(quarter.predictedYield);
                        
                        return (
                          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-red-800 mb-2">Q{quarter.quarter} - {assessYieldRisk(quarter.predictedYield).label}</h4>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-red-700 mb-2">📊 Yield Analysis</h5>
                                    <ul className="text-sm text-red-700 space-y-1">
                                      <li>• <strong>Predicted Yield:</strong> {(quarter.predictedYield / 1000).toFixed(1)} t/ha</li>
                                      <li>• <strong>Risk Level:</strong> {assessYieldRisk(quarter.predictedYield).label}</li>
                                      <li>• <strong>Confidence:</strong> {String(quarter?.confidence || 'high').toUpperCase()}</li>
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium text-red-700 mb-2">💰 Financial Impact</h5>
                                    <ul className="text-sm text-red-700 space-y-1">
                                      <li>• <strong>Revenue:</strong> ₱{financialImpact.revenue.toLocaleString()}</li>
                                      <li>• <strong>Costs:</strong> ₱{financialImpact.costs.toLocaleString()}</li>
                                      <li>• <strong>Net Loss:</strong> ₱{Math.abs(financialImpact.profit).toLocaleString()}</li>
                                    </ul>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <h5 className="font-medium text-red-700 mb-2">🚨 Consequences & Recommendations</h5>
                                  <ul className="text-sm text-red-700 space-y-1">
                                    {riskConsequences.consequences.map((consequence: string, idx: number) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="text-red-600 mr-2">•</span>
                                        {consequence}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        <div>
                          <h4 className="text-lg font-semibold text-green-800">✅ Low Risk Assessment</h4>
                          <p className="text-green-700 text-sm mt-1">
                            All quarters show positive predicted yields. Standard farming practices and risk management are recommended.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Advice Tab */}
              {activeTab === 'advice' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">🌱 Farming Recommendations</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3">📋 Action Items</h4>
                      <div className="space-y-2">
                        {(results?.farmingAdvice || results?.analysis?.recommendation?.actionItems || results?.regionInfo?.recommendations || []).map((advice: string, index: number) => (
                          <p key={index} className="text-green-700 text-sm flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            {advice}
                          </p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-3">🌤️ Weather Considerations</h4>
                      <div className="space-y-2">
                        <p className="text-blue-700 text-sm">{results?.weatherTrend || results?.analysis?.recommendation?.windowReason || 'Monitor weather patterns for optimal planting conditions.'}</p>
                        <p className="text-blue-700 text-sm">{results?.riskAssessment || results?.analysis?.recommendation?.riskLevel || 'Standard risk management practices apply.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
