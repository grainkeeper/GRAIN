/**
 * Planting Window Analysis Form Component
 * 
 * Provides a form for users to input year and location parameters
 * for the integrated planting window analysis (quarter selection + 7-day windows).
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Calendar, Info } from 'lucide-react';
import { PHILIPPINE_RICE_REGIONS, type PhilippineRegion } from '@/lib/utils/philippine-locations';
import { LocationCoordinates } from '@/lib/services/open-meteo-api';

interface PlantingWindowFormProps {
  onAnalysisComplete: (result: any) => void;
  onError: (error: string) => void;
}

interface FormData {
  year: number;
  locationType: 'region' | 'coordinates';
  region: string;
  latitude: string;
  longitude: string;
  locationName: string;
  includeAlternatives: boolean;
  useHistoricalData: boolean;
}

export default function PlantingWindowForm({ onAnalysisComplete, onError }: PlantingWindowFormProps) {
  const [formData, setFormData] = useState<FormData>({
    year: new Date().getFullYear() + 1,
    locationType: 'region',
    region: '',
    latitude: '',
    longitude: '',
    locationName: '',
    includeAlternatives: true,
    useHistoricalData: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Generate year options (2025-2100)
  const yearOptions = Array.from({ length: 76 }, (_, i) => 2025 + i);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Validate year
    if (formData.year < 2025 || formData.year > 2100) {
      errors.push('Year must be between 2025 and 2100');
    }

    // Validate location
    if (formData.locationType === 'region') {
      if (!formData.region) {
        errors.push('Please select a Philippine region');
      }
    } else {
      if (!formData.latitude || !formData.longitude) {
        errors.push('Please enter both latitude and longitude');
      } else {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        
        if (isNaN(lat) || lat < -90 || lat > 90) {
          errors.push('Latitude must be between -90 and 90');
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          errors.push('Longitude must be between -180 and 180');
        }
      }
      
      if (!formData.locationName.trim()) {
        errors.push('Please enter a location name');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const getLocationCoordinates = (): LocationCoordinates | null => {
    if (formData.locationType === 'region') {
      const region = PHILIPPINE_RICE_REGIONS.find(r => r.region === formData.region);
      return region ? region.coordinates : null;
    } else {
      return {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        name: formData.locationName.trim()
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const coordinates = getLocationCoordinates();
    if (!coordinates) {
      onError('Invalid location data');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/predictions/planting-window', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: formData.year,
          location: coordinates,
          options: {
            includeAlternatives: formData.includeAlternatives,
            useHistoricalData: formData.useHistoricalData
          }
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      onAnalysisComplete(result.data);
    } catch (error) {
      console.error('Planting window analysis error:', error);
      onError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRegion = PHILIPPINE_RICE_REGIONS.find(r => r.region === formData.region);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Planting Window Analysis
        </CardTitle>
        <CardDescription>
          Get optimal 7-day planting windows using our 96.01% accurate MLR formulas combined with location-specific weather analysis.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Year Selection */}
          <div className="space-y-2">
            <Label htmlFor="year">Target Year</Label>
            <Select 
              value={formData.year.toString()} 
              onValueChange={(value) => handleInputChange('year', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Analysis available for years 2025-2100
            </p>
          </div>

          {/* Location Type Selection */}
          <div className="space-y-2">
            <Label>Location Type</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="region-mode"
                  checked={formData.locationType === 'region'}
                  onCheckedChange={(checked) => 
                    handleInputChange('locationType', checked ? 'region' : 'coordinates')
                  }
                />
                <Label htmlFor="region-mode">Philippine Region</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="coordinates-mode"
                  checked={formData.locationType === 'coordinates'}
                  onCheckedChange={(checked) => 
                    handleInputChange('locationType', checked ? 'coordinates' : 'region')
                  }
                />
                <Label htmlFor="coordinates-mode">Custom Coordinates</Label>
              </div>
            </div>
          </div>

          {/* Region Selection */}
          {formData.locationType === 'region' && (
            <div className="space-y-2">
              <Label htmlFor="region">Philippine Rice Region</Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => handleInputChange('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {PHILIPPINE_RICE_REGIONS.map(region => (
                    <SelectItem key={region.region} value={region.region}>
                      <div className="flex flex-col">
                        <span className="font-medium">{region.region}</span>
                        <span className="text-xs text-muted-foreground">
                          {region.riceProduction} production • {region.mainSeasons[0]}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedRegion && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{selectedRegion.description}</p>
                      <div className="flex gap-2">
                        <Badge variant={selectedRegion.riceProduction === 'high' ? 'default' : 'secondary'}>
                          {selectedRegion.riceProduction} production
                        </Badge>
                        {selectedRegion.mainSeasons.map((season, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Coordinates */}
          {formData.locationType === 'coordinates' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 15.4817"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 120.9730"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="locationName">Location Name</Label>
                <Input
                  id="locationName"
                  placeholder="e.g., My Farm Location"
                  value={formData.locationName}
                  onChange={(e) => handleInputChange('locationName', e.target.value)}
                />
              </div>
              
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Coordinates should be within the Philippines for accurate weather data analysis.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Analysis Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Analysis Options</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="alternatives">Include Alternative Options</Label>
                  <p className="text-sm text-muted-foreground">
                    Show backup quarters and planting windows
                  </p>
                </div>
                <Switch
                  id="alternatives"
                  checked={formData.includeAlternatives}
                  onCheckedChange={(checked) => handleInputChange('includeAlternatives', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="historical">Use Historical Weather Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Use previous year patterns for analysis
                  </p>
                </div>
                <Switch
                  id="historical"
                  checked={formData.useHistoricalData}
                  onCheckedChange={(checked) => handleInputChange('useHistoricalData', checked)}
                />
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Planting Windows...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Analyze Planting Windows
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
