'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface PredictionResult {
  success: boolean;
  location: string;
  year: number;
  quarter: number;
  plantingWindows: PlantingWindow[];
  message: string;
}

interface PlantingWindowResponse {
  location: string;
  year: number;
  quarter: number;
  riceVariety: string;
  optimalWindows: {
    startDate: string;
    endDate: string;
    averageYield: number;
    dailyYields: number[];
    weatherStability: number;
    confidence: number;
    riskFactors: string[];
    recommendations: string[];
  }[];
  quarterAverage: number;
  analysis: {
    bestMonth: string;
    weatherTrend: string;
    riskAssessment: string;
    farmingAdvice: string[];
  };
}

export default function YieldPredictionForm() {
  const [formData, setFormData] = useState({
    location: '',
    year: new Date().getFullYear(),
    quarter: 4, // Use current quarter (Q4 2024)
    riceVariety: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PlantingWindowResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
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
          location: {
            region: selectedLocation.region?.name || '',
            province: selectedLocation.province?.name || '',
            city: selectedLocation.city?.name || '',
            barangay: selectedLocation.barangay?.name || ''
          },
          year: formData.year,
          quarter: formData.quarter,
          riceVariety: formData.riceVariety || 'Basag'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get prediction');
      }

      setResults(data.data);
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
               <CardTitle className="text-xl text-gray-900">Farm Information</CardTitle>
               <CardDescription className="text-gray-600">
                 Enter your farm details to get personalized predictions
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

             {/* Other Form Fields */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
               <div className="space-y-3">
                 <Label htmlFor="year" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                   <CalendarIcon className="h-4 w-4 text-gray-500" />
                   Year
                 </Label>
                 <Input
                   id="year"
                   type="number"
                   value={formData.year}
                   onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                   min={new Date().getFullYear()}
                   max={new Date().getFullYear() + 1}
                   className="h-12 w-full text-base font-medium"
                 />
               </div>

               <div className="space-y-3">
                 <Label htmlFor="quarter" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                   <ClockIcon className="h-4 w-4 text-gray-500" />
                   Planting Quarter
                 </Label>
                 <Select value={formData.quarter.toString()} onValueChange={(value) => setFormData({...formData, quarter: parseInt(value)})}>
                   <SelectTrigger className="h-12 w-full text-base font-medium truncate whitespace-nowrap">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[300px]">
                     {[1, 2, 3, 4].map((q) => {
                       const info = getQuarterInfo(q);
                       return (
                         <SelectItem key={q} value={q.toString()} className="py-3">
                           <div className="flex items-center gap-3 w-full">
                             <span className="text-lg flex-shrink-0">{info.icon}</span>
                             <div className="font-medium truncate">{info.name} ({info.period})</div>
                           </div>
                         </SelectItem>
                       );
                     })}
                   </SelectContent>
                 </Select>
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
             </div>
             <p className="text-xs text-gray-500">
               📊 Next 14 days: Live forecast. Future quarters: Historical patterns from same quarter.
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
                     Analyzing Weather Data...
                   </div>
                 ) : (
                   <div className="flex items-center gap-2">
                     <ChartBarIcon className="h-5 w-5" />
                     Get Planting Windows
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

       {/* Results Display */}
       {results && (
         <div className="mt-8 space-y-4">
           {/* Summary Card */}
           <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
             <div className="flex items-center justify-between mb-3">
               <h3 className="text-lg font-semibold text-green-800">🌾 Optimal Planting Windows Found</h3>
               <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                 {results.optimalWindows.length} windows
               </span>
             </div>

             <div className="grid md:grid-cols-4 gap-4 text-sm">
               <div>
                 <span className="font-medium text-green-700">📍 Location:</span>
                 <p className="text-gray-700 truncate">{results.location}</p>
               </div>
               <div>
                 <span className="font-medium text-green-700">📅 Period:</span>
                 <p className="text-gray-700">Q{results.quarter} {results.year}</p>
               </div>
               <div>
                 <span className="font-medium text-green-700">📊 Quarter Avg:</span>
                 <p className="text-lg font-bold text-green-600">{(results.quarterAverage / 1000).toFixed(1)} t/ha</p>
               </div>
               <div>
                 <span className="font-medium text-green-700">🎯 Best Month:</span>
                 <p className="text-gray-700">{results.analysis.bestMonth}</p>
               </div>
             </div>
           </div>

           {/* Top 3 Optimal Windows - Column Cards */}
           <div className="space-y-3">
             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
               🏆 Top 3 Optimal 7-Day Windows
               <span className="text-sm font-normal text-gray-500">(click to expand)</span>
             </h3>

             <div className="grid md:grid-cols-3 gap-4">
               {results.optimalWindows.slice(0, 3).map((window: any, index: number) => (
                 <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                   {/* Card Header */}
                   <div className="text-center mb-4">
                     <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                       <span className="text-green-600 font-bold text-lg">#{index + 1}</span>
                     </div>
                     <h4 className="font-semibold text-gray-800 text-sm">
                       {new Date(window.startDate).toLocaleDateString()} - {new Date(window.endDate).toLocaleDateString()}
                     </h4>
                     <p className="text-xs text-gray-500">7-day planting window</p>
                   </div>

                   {/* Yield Display */}
                   <div className="text-center mb-4">
                     <p className="text-2xl font-bold text-green-600">{(window.averageYield / 1000).toFixed(1)} t/ha</p>
                     <p className="text-xs text-gray-500">Average Yield</p>
                   </div>

                   {/* Metrics */}
                   <div className="grid grid-cols-2 gap-3 mb-4">
                     <div className="text-center">
                       <p className="text-lg font-bold text-green-600">{window.weatherStability.toFixed(0)}%</p>
                       <p className="text-xs text-gray-500">Stability</p>
                     </div>
                     <div className="text-center">
                       <p className="text-lg font-bold text-green-600">{window.confidence.toFixed(0)}%</p>
                       <p className="text-xs text-gray-500">Confidence</p>
                     </div>
                   </div>

                   {/* Collapsible Details */}
                   <details className="mt-3">
                     <summary className="cursor-pointer text-sm text-green-700 hover:text-green-800 font-medium">
                       📋 View Details & Recommendations
                     </summary>
                     <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                       {window.riskFactors.length > 0 && (
                         <div>
                           <h5 className="font-medium text-red-700 mb-2 text-sm">⚠️ Risk Factors</h5>
                           <div className="flex flex-wrap gap-1">
                             {window.riskFactors.map((risk: string, riskIndex: number) => (
                               <span key={riskIndex} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                 {risk}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}

                       <div>
                         <h5 className="font-medium text-green-700 mb-2 text-sm">💡 Recommendations</h5>
                         <ul className="space-y-1">
                           {window.recommendations.map((rec: string, recIndex: number) => (
                             <li key={recIndex} className="text-sm text-gray-700 flex items-start">
                               <span className="text-green-600 mr-2">•</span>
                               {rec}
                             </li>
                           ))}
                         </ul>
                       </div>
                     </div>
                   </details>
                 </div>
               ))}
             </div>
           </div>

           {/* Quick Farming Advice */}
           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
             <h3 className="text-lg font-semibold text-green-800 mb-3">🌱 Quick Farming Advice</h3>
             <div className="grid md:grid-cols-2 gap-3">
               {results.analysis.farmingAdvice.slice(0, 4).map((advice: string, index: number) => (
                 <p key={index} className="text-green-700 text-sm flex items-start">
                   <span className="text-green-600 mr-2">•</span>
                   {advice}
                 </p>
               ))}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
