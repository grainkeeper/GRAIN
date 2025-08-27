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
    riceVariety: '',
    hectares: '',
    includeAlternatives: true,
    useHistoricalData: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [dailyForecast, setDailyForecast] = useState<any>(null);
  const [dailyForecastLoading, setDailyForecastLoading] = useState(false);
  const [expandedRisks, setExpandedRisks] = useState<number[]>([]);
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
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Load saved analyses on component mount
  useEffect(() => {
    loadSavedAnalyses();
  }, []);

  const loadSavedAnalyses = async () => {
    try {
      const response = await fetch('/api/predictions/get-saved-analyses');
      if (response.ok) {
        const data = await response.json();
        setSavedAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to load saved analyses:', error);
    }
  };

  const saveAnalysis = async () => {
    if (!dailyForecast) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const response = await fetch('/api/predictions/save-planting-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: dailyForecast })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSaveMessage(data.message);
        // Reload saved analyses
        await loadSavedAnalyses();
      } else {
        const error = await response.json();
        setSaveMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setSaveMessage('Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

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
    setError('');
    setResults(null);

    try {
      // Validate form data
      if (!formData.year || !formData.riceVariety) {
        throw new Error('Please fill in all required fields');
      }

      if (!selectedLocation.region?.name) {
        throw new Error('Please select a region');
      }

      // Get coordinates for the selected location
      const regionCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
        'Cagayan Valley': { latitude: 17.5, longitude: 121.8 },
        'Central Luzon': { latitude: 15.5, longitude: 120.5 },
        'Calabarzon': { latitude: 14.0, longitude: 121.0 },
        'Mimaropa': { latitude: 13.0, longitude: 121.0 },
        'Bicol Region': { latitude: 13.5, longitude: 123.0 },
        'Western Visayas': { latitude: 11.0, longitude: 122.5 },
        'Central Visayas': { latitude: 10.5, longitude: 124.0 },
        'Eastern Visayas': { latitude: 11.5, longitude: 125.0 },
        'Zamboanga Peninsula': { latitude: 7.0, longitude: 122.0 },
        'Northern Mindanao': { latitude: 8.5, longitude: 124.5 },
        'Davao Region': { latitude: 7.0, longitude: 125.5 },
        'Soccsksargen': { latitude: 6.0, longitude: 125.0 },
        'Caraga': { latitude: 9.0, longitude: 125.5 },
        'Cordillera Administrative Region': { latitude: 16.5, longitude: 120.5 },
        'National Capital Region': { latitude: 14.6, longitude: 121.0 },
        'Ilocos Region': { latitude: 16.0, longitude: 120.5 }
      };

      const coordinates = regionCoordinates[selectedLocation.region.name] || 
                         regionCoordinates['National Capital Region'];

      // Submit the main analysis
      const response = await fetch('/api/predictions/planting-window', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: formData.year,
          riceVariety: formData.riceVariety,
            includeAlternatives: formData.includeAlternatives,
            useHistoricalData: formData.useHistoricalData,
          location: {
            region: selectedLocation.region?.name,
            province: selectedLocation.province?.name,
            city: selectedLocation.city?.name,
            coordinates: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze planting windows');
      }

      const result = await response.json();
      console.log('Analysis result:', result); // Debug log
      setResults(result);
      setShowResultsModal(true);
      setActiveTab('summary');

      // Automatically fetch 16-day forecast
      await fetchDailyForecast(coordinates, selectedLocation.region.name);

    } catch (error: any) {
      setError(error.message);
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

  // Derived fallbacks from API response shapes - Updated for new integrated analysis structure
  const effectiveAnalysis = results?.data?.analysis ?? results?.analysis ?? results ?? null;
  const optimalQuarter = effectiveAnalysis?.optimalQuarter ?? null;
  
  console.log('Results:', results); // Debug log
  console.log('Results.data:', results?.data); // Debug log
  console.log('Effective Analysis:', effectiveAnalysis); // Debug log
  console.log('Optimal Quarter:', optimalQuarter); // Debug log

  // Extract quarter data from the new integrated analysis structure
  const quarterCards = effectiveAnalysis?.quarterSelection?.quarters?.map((q: any) => ({
    quarter: q.quarter,
    predictedYield: q.predictedYield,
    confidence: q.confidence >= 85 ? 'high' : q.confidence >= 70 ? 'medium' : 'low',
    weatherData: q.weatherData,
    quarterName: q.quarterName,
    quarterMonths: q.quarterMonths
  })) || [];

  const fetchDailyForecast = async (coordinates?: { latitude: number; longitude: number }, locationName?: string) => {
    if (!coordinates || !locationName) {
      // Fallback to current selected location
      if (!selectedLocation.province) {
        setError('Please select a location first');
        return;
      }

      // Philippine region coordinates mapping
      const regionCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
        'Cagayan Valley': { latitude: 17.5, longitude: 121.8 },
        'Ilocos Region': { latitude: 16.5, longitude: 120.5 },
        'Central Luzon': { latitude: 15.5, longitude: 120.5 },
        'CALABARZON': { latitude: 14.5, longitude: 121.0 },
        'MIMAROPA Region': { latitude: 13.0, longitude: 121.5 },
        'Bicol Region': { latitude: 13.5, longitude: 123.5 },
        'Western Visayas': { latitude: 11.0, longitude: 122.5 },
        'Central Visayas': { latitude: 10.5, longitude: 124.0 },
        'Eastern Visayas': { latitude: 11.5, longitude: 125.0 },
        'Zamboanga Peninsula': { latitude: 7.5, longitude: 122.5 },
        'Northern Mindanao': { latitude: 8.5, longitude: 124.5 },
        'Davao Region': { latitude: 7.0, longitude: 125.5 },
        'SOCCSKSARGEN': { latitude: 6.5, longitude: 124.5 },
        'Caraga': { latitude: 9.0, longitude: 125.5 },
        'Cordillera Administrative Region': { latitude: 16.5, longitude: 120.8 },
        'National Capital Region': { latitude: 14.6, longitude: 121.0 },
        'Bangsamoro Autonomous Region in Muslim Mindanao': { latitude: 7.0, longitude: 124.0 }
      };

      coordinates = regionCoordinates[selectedLocation.region?.name || ''] || 
                   regionCoordinates['National Capital Region'];
      locationName = selectedLocation.region?.name || 'Philippines';
    }

    setDailyForecastLoading(true);
    setDailyForecast(null);

    try {
      const response = await fetch('/api/predictions/daily-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            name: locationName
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch daily forecast');
      }

      const data = await response.json();
      setDailyForecast(data.analysis);
    } catch (error: any) {
      console.error('Daily forecast error:', error);
      setError(`Daily forecast error: ${error.message}`);
    } finally {
      setDailyForecastLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-6 w-6 text-primary" />
            Rice Yield and Planting Window Analysis
          </CardTitle>
          <CardDescription>
            Analyze optimal planting windows and yield predictions for your location
              </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
                         {/* Form fields */}
             <div className="grid md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="year">Target Year</Label>
                 <Input
                   id="year"
                   type="number"
                   value={formData.year}
                   onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                   min={new Date().getFullYear()}
                   max={2100}
                   required
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="riceVariety" className="flex items-center">
                   Rice Variety
                   <span className="text-red-500 ml-1">*</span>
                 </Label>
                 <Select value={formData.riceVariety} onValueChange={(value) => setFormData({ ...formData, riceVariety: value })}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select rice variety" />
                   </SelectTrigger>
                   <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100]">
                     {varieties.map((variety) => (
                       <SelectItem key={variety.id} value={variety.id}>
                         {variety.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

                               <div className="space-y-2">
                  <Label htmlFor="hectares">
                    Farm Size (Hectares)
                    <span className="text-gray-500 ml-1 text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="hectares"
                    type="number"
                    value={formData.hectares}
                    onChange={(e) => setFormData({ ...formData, hectares: e.target.value })}
                    placeholder="Enter farm size in hectares"
                    min="0.1"
                    step="0.1"
                  />
                </div>
             </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <Label>Location</Label>
              <CascadingDropdown onLocationChange={setSelectedLocation} />
                </div>

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeAlternatives"
                  checked={formData.includeAlternatives}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeAlternatives: checked })}
                />
                <Label htmlFor="includeAlternatives">Include alternative planting windows</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="useHistoricalData"
                  checked={formData.useHistoricalData}
                  onCheckedChange={(checked) => setFormData({ ...formData, useHistoricalData: checked })}
                />
                <Label htmlFor="useHistoricalData">Use historical weather data</Label>
            </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                <>
                  <ClockIcon className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Planting Windows...
                </>
              ) : (
                <>
                  <ChartBarIcon className="mr-2 h-4 w-4" />
                  Analyze Planting Windows
                </>
                )}
              </Button>

      {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
            </div>
            )}
          </form>
          </CardContent>
        </Card>

      {/* Results Modal */}
      {showResultsModal && results && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
                <div>
                <h2 className="text-xl font-bold">Analysis Results</h2>
                <p className="text-sm opacity-90">
                  {selectedLocation.region?.name} • {formData.year}
                  </p>
                </div>
                <button
                  onClick={() => setShowResultsModal(false)}
                className="text-white hover:text-gray-200"
                >
                ✕
                </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
              {/* Sidebar */}
              <div className="lg:w-64 w-full bg-gray-50 lg:border-r border-gray-200 p-2 lg:p-4 lg:border-b-0 border-b">
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-1 lg:gap-2">
                  {[
                    { id: 'summary', label: 'Summary', icon: '📊' },
                    { id: 'quarters', label: 'Quarters', icon: '📈' },
                    { id: 'windows', label: 'Windows', icon: '🏆' },
                    { id: 'daily-forecast', label: '16-Day', icon: '🌤️' },
                    { id: 'risks', label: 'Risks', icon: '⚠️' },
                    { id: 'advice', label: 'Advice', icon: '🌱' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-2 lg:px-4 py-1.5 lg:py-3 text-xs lg:text-sm font-medium rounded-md lg:rounded-lg transition-colors ${
                      activeTab === tab.id
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                      <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-1 lg:space-y-0 lg:space-x-3">
                        <span className="text-sm lg:text-lg">{tab.icon}</span>
                        <span className="truncate text-center lg:text-left">{tab.label}</span>
                      </div>
                  </button>
                ))}
              </div>
            </div>

              {/* Content Area */}
              <div className="flex-1 p-4 lg:p-6 overflow-y-auto">

              {/* Tab Content */}
              {activeTab === 'summary' && (
                <div className="space-y-6 lg:space-y-8">
                  {/* Key Metrics Dashboard */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base lg:text-lg flex items-center">
                          <span className="text-xl lg:text-2xl mr-2">🏆</span>
                          Optimal Windows
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                                                    <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                            {effectiveAnalysis?.windowAnalysis?.windows?.length || 0}
                          </div>
                          <p className="text-xs lg:text-sm text-green-700 font-medium">7-Day Planting Windows</p>
                          <div className="mt-2 text-xs text-green-600">
                            Best opportunities for planting
              </div>
              </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base lg:text-lg flex items-center">
                          <span className="text-xl lg:text-2xl mr-2">📊</span>
                          Prediction Confidence
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                                                    <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                            {effectiveAnalysis?.overallConfidence || 0}%
                          </div>
                          <p className="text-xs lg:text-sm text-blue-700 font-medium">Model Accuracy</p>
                          <div className="mt-2 text-xs text-blue-600">
                            Based on historical data analysis
            </div>
                        </div>
                      </CardContent>
                    </Card>
          </div>

                  {/* Key Insights */}
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-amber-800">
                        <span className="text-xl lg:text-2xl mr-2">💡</span>
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                                                <div className="text-center p-3 lg:p-4 bg-white rounded-lg border border-amber-200">
                          <div className="text-xl lg:text-2xl font-bold text-amber-600 mb-1">
                            {optimalQuarter ? `Q${optimalQuarter}` : 'N/A'}
                          </div>
                          <div className="text-xs lg:text-sm text-amber-700 font-medium">Best Quarter</div>
                        </div>
                                                <div className="text-center p-3 lg:p-4 bg-white rounded-lg border border-amber-200">
                          <div className="text-xl lg:text-2xl font-bold text-amber-600 mb-1">
                            {effectiveAnalysis?.quarterSelection?.optimalQuarter?.predictedYield 
                              ? `${(effectiveAnalysis.quarterSelection.optimalQuarter.predictedYield / 1000).toFixed(1)}`
                              : 'N/A'
                            }
                          </div>
                          <div className="text-xs lg:text-sm text-amber-700 font-medium">Tons/ha</div>
                        </div>
                                                <div className="text-center p-3 lg:p-4 bg-white rounded-lg border border-amber-200">
                          <div className="text-xl lg:text-2xl font-bold text-amber-600 mb-1">
                            {effectiveAnalysis?.overallConfidence || 0}%
                          </div>
                          <div className="text-xs lg:text-sm text-amber-700 font-medium">Confidence</div>
                        </div>
                                                {formData.hectares && parseFloat(formData.hectares) > 0 && (
                          <div className="text-center p-3 lg:p-4 bg-white rounded-lg border border-green-200">
                            <div className="text-xl lg:text-2xl font-bold text-green-600 mb-1">
                              {effectiveAnalysis?.quarterSelection?.optimalQuarter?.predictedYield 
                                ? `${((effectiveAnalysis.quarterSelection.optimalQuarter.predictedYield / 1000) * parseFloat(formData.hectares)).toFixed(1)}`
                                : 'N/A'
                              }
                            </div>
                            <div className="text-xs lg:text-sm text-green-700 font-medium">Total Tons</div>
                            <div className="text-xs text-green-600">({formData.hectares} ha)</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(effectiveAnalysis?.quarterSelection?.recommendations || []).slice(0, 3).map((rec: string, index: number) => (
                          <div key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">💡</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                        {formData.hectares && parseFloat(formData.hectares) > 0 && effectiveAnalysis?.quarterSelection?.optimalQuarter?.predictedYield && (
                          <div className="flex items-start">
                            <span className="text-green-600 mr-2">🌾</span>
                            <span className="text-green-700 font-medium">
                              Expected total yield: {((effectiveAnalysis.quarterSelection.optimalQuarter.predictedYield / 1000) * parseFloat(formData.hectares)).toFixed(1)} tons for your {formData.hectares} hectare farm
                            </span>
                          </div>
                        )}
                        {(!effectiveAnalysis?.quarterSelection?.recommendations || effectiveAnalysis.quarterSelection.recommendations.length === 0) && (
                          <p className="text-gray-500 italic">No recommendations available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Daily Forecast Tab */}
              {activeTab === 'daily-forecast' && (
          <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">🌤️ 16-Day Planting Window Analysis</h3>
                    <div className="flex items-center space-x-2">
                      {dailyForecast && (
                        <button
                          onClick={() => fetchDailyForecast()}
                          disabled={isSaving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                          {isSaving ? 'Saving...' : '💾 Save Analysis'}
                        </button>
                      )}
                      <button
                        onClick={() => fetchDailyForecast()}
                        disabled={dailyForecastLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        {dailyForecastLoading ? 'Loading...' : 'Refresh Forecast'}
                      </button>
                    </div>
                  </div>

                  {saveMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      saveMessage.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {saveMessage}
                    </div>
                  )}

                  {dailyForecastLoading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Analyzing 16-day planting windows...</p>
                  </div>
                  )}

                  {dailyForecast && !dailyForecastLoading && (
                    <div className="space-y-8">
                      {/* Header */}
                                        <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">16-Day Planting Analysis</h2>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-green-600 font-medium">Real-time Forecast</p>
                    </div>
                    <p className="text-gray-600">{dailyForecast.forecastPeriod}</p>
                  </div>

                      {/* Key Metrics Dashboard */}
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Plantable Days */}
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <span className="text-2xl mr-2">🌱</span>
                              Plantable Days
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="text-4xl font-bold text-green-600 mb-2">
                                {dailyForecast.summary.plantableDays}/{dailyForecast.summary.totalDays}
                              </div>
                              <p className="text-sm text-green-700 font-medium">Available for Planting</p>
                              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                                dailyForecast.summary.plantableDays >= 10 ? 'bg-green-100 text-green-700' :
                                dailyForecast.summary.plantableDays >= 7 ? 'bg-yellow-100 text-yellow-700' :
                                dailyForecast.summary.plantableDays >= 4 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {dailyForecast.summary.plantableDays >= 10 ? 'Excellent' :
                                 dailyForecast.summary.plantableDays >= 7 ? 'Good' :
                                 dailyForecast.summary.plantableDays >= 4 ? 'Moderate' : 'Poor'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Excellent Days */}
                        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <span className="text-2xl mr-2">🏆</span>
                              Excellent Days
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="text-4xl font-bold text-blue-600 mb-2">
                                {dailyForecast.summary.bestPlantingDays.length}
                              </div>
                              <p className="text-sm text-blue-700 font-medium">85%+ Suitability</p>
                              <div className="mt-2 text-xs text-blue-600">
                                Optimal conditions
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Next Update */}
                        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <span className="text-2xl mr-2">🔄</span>
                              Next Update
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600 mb-2">
                                {new Date(dailyForecast.summary.nextUpdateDate).toLocaleDateString()}
                              </div>
                              <p className="text-sm text-purple-700 font-medium">Fresh Forecast</p>
                              <div className="mt-2 text-xs text-purple-600">
                                Check back for updates
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Overall Recommendation */}
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardHeader>
                          <CardTitle className="flex items-center text-green-800">
                            <span className="text-2xl mr-2">💡</span>
                            Overall Recommendation
                            <div className="ml-2 flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600">Live</span>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-green-700 text-lg font-medium">{dailyForecast.summary.overallRecommendation}</p>
                        </CardContent>
                      </Card>

                      {/* Weather Trends */}
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center text-blue-800">
                            <span className="text-2xl mr-2">🌡️</span>
                            Weather Trends (16-Day Period)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                              <div className="text-3xl mb-2">🌡️</div>
                              <p className="font-medium text-gray-800">Temperature</p>
                              <p className={`text-lg font-bold capitalize ${
                                dailyForecast.summary.weatherTrends.temperatureTrend === 'stable' ? 'text-green-600' :
                                dailyForecast.summary.weatherTrends.temperatureTrend === 'rising' ? 'text-orange-600' : 'text-blue-600'
                              }`}>
                                {dailyForecast.summary.weatherTrends.temperatureTrend}
                              </p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                              <div className="text-3xl mb-2">🌧️</div>
                              <p className="font-medium text-gray-800">Precipitation</p>
                              <p className={`text-lg font-bold capitalize ${
                                dailyForecast.summary.weatherTrends.precipitationTrend === 'moderate' ? 'text-green-600' :
                                dailyForecast.summary.weatherTrends.precipitationTrend === 'dry' ? 'text-orange-600' : 'text-blue-600'
                              }`}>
                                {dailyForecast.summary.weatherTrends.precipitationTrend}
                              </p>
                          </div>
                            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                              <div className="text-3xl mb-2">💨</div>
                              <p className="font-medium text-gray-800">Wind</p>
                              <p className={`text-lg font-bold capitalize ${
                                dailyForecast.summary.weatherTrends.windTrend === 'calm' ? 'text-green-600' :
                                dailyForecast.summary.weatherTrends.windTrend === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {dailyForecast.summary.weatherTrends.windTrend}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Best Planting Days Summary */}
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center text-blue-800">
                            <span className="text-2xl mr-2">🏆</span>
                            Best Planting Days
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {dailyForecast.summary.bestPlantingDays.length > 0 ? (
                            <div className="grid md:grid-cols-3 gap-4">
                              {dailyForecast.summary.bestPlantingDays.map((day: any, index: number) => (
                                <div key={index} className="bg-white border border-blue-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                                  <div className="text-sm font-medium text-blue-800 mb-2">{day.date}</div>
                                  <div className="text-2xl font-bold text-green-600 mb-3">{day.suitabilityScore}%</div>
                                  <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex justify-between">
                                      <span>🌡️ {day.weatherSummary.temperature}</span>
                                      <span>🌧️ {day.weatherSummary.precipitation}</span>
                                </div>
                                <div className="flex justify-between">
                                      <span>💨 {day.weatherSummary.windSpeed}</span>
                                      <span>💧 {day.weatherSummary.humidity}</span>
                                </div>
                                </div>
                              </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <div className="text-4xl mb-2">📊</div>
                              <p className="text-gray-600 mb-2">No days meet the "excellent" criteria (≥85%)</p>
                              <p className="text-sm text-gray-500">Check the daily analysis below for all available options</p>
                  </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Daily Analysis - All Days */}
                      <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
                        <CardHeader>
                          <CardTitle className="flex items-center text-gray-800">
                            <span className="text-2xl mr-2">📅</span>
                            Daily Analysis (All 16 Days)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-4 gap-3">
                            {dailyForecast.dailyAnalysis.map((day: any, index: number) => {
                              const getScoreColor = (score: number) => {
                                if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
                                if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
                                if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                                return 'text-red-600 bg-red-50 border-red-200';
                              };
                              
                              return (
                                <div key={index} className={`bg-white border rounded-lg p-3 text-center hover:shadow-md transition-shadow ${getScoreColor(day.suitabilityScore)}`}>
                                  <div className="text-xs font-medium mb-1">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                  <div className="text-lg font-bold mb-2">{day.suitabilityScore}%</div>
                                  <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                      <span>🌡️ {day.weatherSummary.temperature}</span>
                                      <span>🌧️ {day.weatherSummary.precipitation}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>💨 {day.weatherSummary.windSpeed}</span>
                                      <span>💧 {day.weatherSummary.humidity}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs mt-2 font-medium">
                                    {day.canPlant ? '✅ Plantable' : '❌ Avoid'}
                  </div>
                </div>
                      );
                    })}
            </div>
                        </CardContent>
                      </Card>

                      {/* Quick Stats */}
                      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                        <CardHeader>
                          <CardTitle className="flex items-center text-amber-800">
                            <span className="text-2xl mr-2">📈</span>
                            Quick Statistics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                                <div className="text-2xl font-bold text-amber-600">
                                  {Math.round((dailyForecast.summary.plantableDays / dailyForecast.summary.totalDays) * 100)}%
          </div>
                                <div className="text-sm text-amber-700 font-medium">Success Rate</div>
                </div>
                              <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                                <div className="text-2xl font-bold text-amber-600">
                                  {dailyForecast.summary.bestPlantingDays.length}
            </div>
                                <div className="text-sm text-amber-700 font-medium">Excellent Days</div>
          </div>
                            </div>
                            <div className="space-y-3">
                              <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                                <div className="text-2xl font-bold text-amber-600">
                                  {dailyForecast.summary.totalDays}
                                </div>
                                <div className="text-sm text-amber-700 font-medium">Forecast Days</div>
                              </div>
                              <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
                                <div className="text-lg font-bold text-amber-600">
                                  Open-Meteo
                                </div>
                                <div className="text-sm text-amber-700 font-medium">Data Source</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Saved Analyses */}
                      {savedAnalyses.length > 0 && (
                        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                          <CardHeader>
                            <CardTitle className="flex items-center text-purple-800">
                              <span className="text-2xl mr-2">💾</span>
                              Saved Analyses
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
          <div className="space-y-4">
                              {savedAnalyses.slice(0, 3).map((analysis: any, index: number) => (
                                <div key={analysis.id} className="bg-white border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium text-purple-800 text-lg">{analysis.location_name}</h5>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {new Date(analysis.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="text-center p-2 bg-green-50 rounded">
                                      <div className="text-lg font-bold text-green-600">{analysis.plantable_days}/{analysis.total_days}</div>
                                      <div className="text-xs text-green-700">Plantable</div>
                                    </div>
                                    <div className="text-center p-2 bg-blue-50 rounded">
                                      <div className="text-lg font-bold text-blue-600">{analysis.excellent_days}</div>
                                      <div className="text-xs text-blue-700">Excellent</div>
                                    </div>
                                    <div className="text-center p-2 bg-amber-50 rounded">
                                      <div className={`text-lg font-bold ${
                                        analysis.plantable_days >= 10 ? 'text-green-600' :
                                        analysis.plantable_days >= 7 ? 'text-yellow-600' :
                                        analysis.plantable_days >= 4 ? 'text-orange-600' : 'text-red-600'
                                      }`}>
                                        {analysis.plantable_days >= 10 ? 'Excellent' :
                                         analysis.plantable_days >= 7 ? 'Good' :
                                         analysis.plantable_days >= 4 ? 'Moderate' : 'Poor'}
                                      </div>
                                      <div className="text-xs text-amber-700">Status</div>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 italic">{analysis.overall_recommendation}</p>
                                </div>
                              ))}
                              {savedAnalyses.length > 3 && (
                                <div className="text-center py-3">
                                  <p className="text-sm text-purple-600 font-medium">
                                    +{savedAnalyses.length - 3} more saved analyses
                          </p>
                        </div>
                              )}
                      </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {!dailyForecast && !dailyForecastLoading && (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Get 16-day planting window analysis for your location</p>
                      <button
                        onClick={() => fetchDailyForecast()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Load Planting Analysis
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Other tabs would go here */}
                            {activeTab === 'quarters' && (
                <div className="space-y-6 lg:space-y-8">
                  <div className="text-center">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">Quarterly Yield Analysis</h2>
                    <p className="text-sm lg:text-base text-gray-600">Compare yields across all quarters</p>
                  </div>
                  
                  {quarterCards.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      {quarterCards.map((quarter: any, index: number) => {
                        const yieldValue = quarter.predictedYield ? (quarter.predictedYield / 1000).toFixed(1) : 'N/A';
                        const isOptimal = optimalQuarter === quarter.quarter;
                        
                        return (
                          <Card key={index} className={`relative overflow-hidden ${isOptimal ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-white'}`}>
                            {isOptimal && (
                              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                                BEST
                              </div>
                            )}
                            <CardHeader className="pb-4">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="text-3xl mr-3">{getQuarterInfo(quarter.quarter).icon}</span>
                                  <div>
                                    <div className="text-xl font-bold">{quarter.quarterName}</div>
                                    <div className="text-sm text-gray-600">{getQuarterInfo(quarter.quarter).period}</div>
                                  </div>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="text-center">
                                  <div className={`text-4xl font-bold ${isOptimal ? 'text-green-600' : 'text-gray-800'} mb-1`}>
                                    {yieldValue}
                                  </div>
                                  <div className="text-sm text-gray-600 font-medium">tons/ha</div>
                  </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-lg font-bold text-blue-600">
                                      {quarter.weatherData?.temperature?.toFixed(1) || 'N/A'}°
                                    </div>
                                    <div className="text-xs text-gray-600">Temperature</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-lg font-bold text-blue-600">
                                      {quarter.weatherData?.precipitation?.toFixed(1) || 'N/A'}mm
                                    </div>
                                    <div className="text-xs text-gray-600">Rainfall</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-lg font-bold text-blue-600">
                                      {quarter.weatherData?.windSpeed?.toFixed(1) || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-600">Wind km/h</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-lg font-bold text-blue-600">
                                      {quarter.weatherData?.humidity?.toFixed(0) || 'N/A'}%
                                    </div>
                                    <div className="text-xs text-gray-600">Humidity</div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📊</div>
                      <p className="text-gray-500 text-lg">No quarterly data available</p>
                    </div>
                  )}
                    </div>
                  )}

              {activeTab === 'windows' && (
                <div className="space-y-8">
                    <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Optimal Planting Windows</h2>
                    <p className="text-gray-600">7-day periods with ideal conditions</p>
                    </div>
                  
                  {(effectiveAnalysis?.windowAnalysis?.windows || []).length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {(effectiveAnalysis?.windowAnalysis?.windows || []).map((window: any, index: number) => {
                        const score = window.score?.overallScore || window.weatherStability || 0;
                        const getScoreColor = (score: number) => {
                          const percentageScore = Math.round(score * 100);
                          if (percentageScore >= 85) return 'bg-green-50 border-green-200 text-green-800';
                          if (percentageScore >= 70) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
                          return 'bg-red-50 border-red-200 text-red-800';
                        };
                        
                        return (
                          <Card key={index} className={`${getScoreColor(score)} border-2`}>
                            <CardHeader className="pb-4">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="text-2xl mr-3">🏆</span>
                                  <div>
                                    <div className="text-xl font-bold">Window {index + 1}</div>
                                    <div className="text-sm opacity-75">
                                      {window.startDate && window.endDate ? `${formatDate(window.startDate)} - ${formatDate(window.endDate)}` : 'Not available'}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold">{Math.round(score * 100)}%</div>
                                  <div className="text-xs opacity-75">Score</div>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="text-center p-3 bg-white rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">
                                      {window.weatherData?.[0]?.temperature?.toFixed(1) || 'N/A'}°
                                    </div>
                                    <div className="text-xs text-gray-600">Temperature</div>
                                  </div>
                                  <div className="text-center p-3 bg-white rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">
                                      {window.weatherData?.[0]?.precipitation?.toFixed(1) || 'N/A'}mm
                                    </div>
                                    <div className="text-xs text-gray-600">Rainfall</div>
                    </div>
                  </div>

                                                                <div className="text-center p-3 bg-white rounded-lg">
                                  <div className="text-lg font-bold text-blue-600">
                                    {window.confidence || 'N/A'}%
                          </div>
                                  <div className="text-xs text-gray-600">Confidence Level</div>
                                  {window.confidence === 100 && (
                                    <div className="text-xs text-amber-600 mt-1">
                                      ⚠️ Model confidence
                        </div>
                      )}
                      </div>
                      </div>
                            </CardContent>
                          </Card>
                      );
                    })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🏆</div>
                      <p className="text-gray-500 text-lg">No planting windows available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'risks' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Risk Assessment</h2>
                    <p className="text-gray-600">Potential challenges and mitigation strategies</p>
                  </div>
                  
                  {quarterCards.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {quarterCards.map((quarter: any, index: number) => {
                        const riskAssessment = assessYieldRisk(quarter.predictedYield || 0);
                        const consequences = getRiskConsequences(quarter.predictedYield || 0);
                        const yieldValue = quarter.predictedYield ? (quarter.predictedYield / 1000).toFixed(1) : 'N/A';
                        
                        const getRiskColor = (severity: string) => {
                          switch (severity) {
                            case 'critical': return 'bg-red-50 border-red-300 text-red-800';
                            case 'high': return 'bg-orange-50 border-orange-300 text-orange-800';
                            case 'moderate': return 'bg-yellow-50 border-yellow-300 text-yellow-800';
                            case 'positive': return 'bg-green-50 border-green-300 text-green-800';
                            default: return 'bg-gray-50 border-gray-300 text-gray-800';
                          }
                        };
                        
                        return (
                          <Card key={index} className={`${getRiskColor(consequences.severity)} border-2`}>
                            <CardHeader className="pb-4">
                              <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="text-2xl mr-3">⚠️</span>
                                  <div>
                                    <div className="text-xl font-bold">{quarter.quarterName}</div>
                                    <div className="text-sm opacity-75">{riskAssessment.label}</div>
                                  </div>
            </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold">{yieldValue}</div>
                                  <div className="text-xs opacity-75">tons/ha</div>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="text-center p-3 bg-white rounded-lg">
                                  <div className="text-lg font-bold uppercase">
                                    {consequences.severity}
                                  </div>
                                  <div className="text-xs text-gray-600">Risk Level</div>
          </div>

                                <div className="space-y-2">
                                                                    {consequences.consequences.slice(0, 3).map((consequence: string, idx: number) => (
                                    <div key={idx} className="flex items-start p-2 bg-white rounded">
                                      <span className="text-red-500 mr-2 mt-0.5">•</span>
                                      <span className="text-sm">{consequence}</span>
                                    </div>
                                  ))}
                                  {consequences.consequences.length > 3 && (
                                    <button
                                      onClick={() => {
                                        const expanded = expandedRisks.includes(index);
                                        if (expanded) {
                                          setExpandedRisks(expandedRisks.filter(i => i !== index));
                                        } else {
                                          setExpandedRisks([...expandedRisks, index]);
                                        }
                                      }}
                                      className="text-center text-xs text-blue-600 hover:text-blue-800 font-medium py-2 w-full"
                                    >
                                      {expandedRisks.includes(index) ? 'Show less' : `+${consequences.consequences.length - 3} more items`}
                                    </button>
                                  )}
                                  {expandedRisks.includes(index) && consequences.consequences.slice(3).map((consequence: string, idx: number) => (
                                    <div key={idx + 3} className="flex items-start p-2 bg-white rounded">
                                      <span className="text-red-500 mr-2 mt-0.5">•</span>
                                      <span className="text-sm">{consequence}</span>
                                </div>
                                  ))}
                              </div>
                            </div>
                            </CardContent>
                          </Card>
                        );
                      })}
              </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⚠️</div>
                      <p className="text-gray-500 text-lg">No risk assessment data available</p>
          </div>
                  )}
                </div>
              )}

              {activeTab === 'advice' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Farming Recommendations</h2>
                    <p className="text-gray-600">Expert advice for optimal crop management</p>
                  </div>
                  
                  {effectiveAnalysis?.recommendation?.actionItems ? (
                  <div className="grid md:grid-cols-2 gap-6">
                      {effectiveAnalysis.recommendation.actionItems.map((advice: string, index: number) => (
                        <Card key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 text-lg">🌱</span>
                      </div>
                    </div>
                              <div className="flex-1">
                                <div className="text-sm text-green-600 font-medium mb-1">
                                  Tip #{index + 1}
                      </div>
                                <p className="text-gray-800 leading-relaxed">{advice}</p>
                    </div>
                  </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🌱</div>
                      <p className="text-gray-500 text-lg">No farming advice available</p>
                </div>
              )}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}