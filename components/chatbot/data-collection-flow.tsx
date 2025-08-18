'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Wheat, Droplets, Thermometer, Calendar } from 'lucide-react'
import { RICE_VARIETIES } from '@/lib/constants/rice-varieties'
import { psgcService, PSGCProvince, PSGCCity, PSGCBarangay } from '@/lib/services/psgc-api'
import { logger } from '@/lib/utils/logger'

interface FarmingData {
  location: {
    province: PSGCProvince | null
    city: PSGCCity | null
    barangay: PSGCBarangay | null
  }
  crop: {
    variety: string
    plantingDate: string
    growthStage: string
  }
  soil: {
    type: string
    moisture: string
    ph: string
  }
  weather: {
    currentConditions: string
    rainfall: string
  }
}

interface DataCollectionFlowProps {
  onComplete: (data: FarmingData) => void
  onCancel: () => void
  existingData?: FarmingData
}

const soilTypes = [
  'Clay Loam',
  'Sandy Loam',
  'Silt Loam',
  'Clay',
  'Sandy Clay',
  'Silty Clay',
  'Loam'
]

const moistureLevels = [
  'Very Dry',
  'Dry',
  'Moderate',
  'Moist',
  'Very Moist',
  'Saturated'
]

const growthStages = [
  'Seedling',
  'Vegetative',
  'Tillering',
  'Panicle Initiation',
  'Flowering',
  'Grain Filling',
  'Maturity'
]

const weatherConditions = [
  'Sunny',
  'Partly Cloudy',
  'Cloudy',
  'Light Rain',
  'Heavy Rain',
  'Overcast'
]

export function DataCollectionFlow({ onComplete, onCancel, existingData }: DataCollectionFlowProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FarmingData>(existingData || {
    location: {
      province: null,
      city: null,
      barangay: null
    },
    crop: {
      variety: '',
      plantingDate: '',
      growthStage: ''
    },
    soil: {
      type: '',
      moisture: '',
      ph: ''
    },
    weather: {
      currentConditions: '',
      rainfall: ''
    }
  })

  // PSGC Data states
  const [provinces, setProvinces] = useState<PSGCProvince[]>([])
  const [cities, setCities] = useState<PSGCCity[]>([])
  const [barangays, setBarangays] = useState<PSGCBarangay[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load cities when province changes
  useEffect(() => {
    if (data.location.province) {
      loadCities(data.location.province.code)
    } else {
      setCities([])
      setData(prev => ({
        ...prev,
        location: { ...prev.location, city: null, barangay: null }
      }))
    }
  }, [data.location.province])

  // Load barangays when city changes
  useEffect(() => {
    if (data.location.city) {
      loadBarangays(data.location.city.code)
    } else {
      setBarangays([])
      setData(prev => ({
        ...prev,
        location: { ...prev.location, barangay: null }
      }))
    }
  }, [data.location.city])

  const loadProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const provincesData = await psgcService.getProvincesCached()
      setProvinces(provincesData)
            } catch (error) {
          logger.error('Error loading provinces:', error)
        } finally {
      setLoadingProvinces(false)
    }
  }

  const loadCities = async (provinceCode: string) => {
    setLoadingCities(true)
    try {
      const citiesData = await psgcService.getCitiesAndMunicipalitiesCached(provinceCode)
      setCities(citiesData)
            } catch (error) {
          logger.error('Error loading cities:', error)
        } finally {
      setLoadingCities(false)
    }
  }

  const loadBarangays = async (cityCode: string) => {
    setLoadingBarangays(true)
    try {
      const barangaysData = await psgcService.getBarangaysCached(cityCode)
      setBarangays(barangaysData)
            } catch (error) {
          logger.error('Error loading barangays:', error)
        } finally {
      setLoadingBarangays(false)
    }
  }

  const updateData = (section: keyof FarmingData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const nextStep = () => {
    logger.debug('Next step clicked', { step, isValid: isStepValid() })
    if (step < 4) {
      setStep(step + 1)
    } else {
      logger.info('Completing profile setup with data:', data)
      onComplete(data)
    }
  }

  const prevStep = () => {
    logger.debug('Previous step clicked', { step })
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return data.location.province && data.location.city
      case 2:
        return data.crop.variety && data.crop.plantingDate && data.crop.growthStage
      case 3:
        return data.soil.type && data.soil.moisture
      case 4:
        return data.weather.currentConditions
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <MapPin className="h-4 w-4" />
              <h3 className="font-semibold text-base">Location Information</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tell us about your farming location for personalized recommendations.
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Province *</label>
                <Select 
                  value={data.location.province?.code || ''} 
                  onValueChange={(provinceCode) => {
                    const province = provinces.find(p => p.code === provinceCode)
                    updateData('location', 'province', province)
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={loadingProvinces ? "Loading provinces..." : "Select your province"} />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.code} value={province.code}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">City/Municipality *</label>
                <Select 
                  value={data.location.city?.code || ''} 
                  onValueChange={(cityCode) => {
                    const city = cities.find(c => c.code === cityCode)
                    updateData('location', 'city', city)
                  }}
                  disabled={!data.location.province || loadingCities}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={
                      !data.location.province ? "Select province first" : 
                      loadingCities ? "Loading cities..." : 
                      "Select your city or municipality"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.code} value={city.code}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Barangay (Optional)</label>
                <Select 
                  value={data.location.barangay?.code || ''} 
                  onValueChange={(barangayCode) => {
                    const barangay = barangays.find(b => b.code === barangayCode)
                    updateData('location', 'barangay', barangay)
                  }}
                  disabled={!data.location.city || loadingBarangays}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={
                      !data.location.city ? "Select city first" : 
                      loadingBarangays ? "Loading barangays..." : 
                      "Select your barangay"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {barangays.map((barangay) => (
                      <SelectItem key={barangay.code} value={barangay.code}>
                        {barangay.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Wheat className="h-4 w-4" />
              <h3 className="font-semibold text-base">Crop Information</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Provide details about your rice crop for accurate recommendations.
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Rice Variety *</label>
                <Select value={data.crop.variety} onValueChange={(value) => updateData('crop', 'variety', value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select rice variety" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(RICE_VARIETIES).map((variety) => (
                      <SelectItem key={variety.code} value={variety.name}>
                        {variety.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Planting Date *</label>
                <Input
                  value={data.crop.plantingDate}
                  onChange={(e) => updateData('crop', 'plantingDate', e.target.value)}
                  placeholder="YYYY-MM-DD"
                  type="date"
                  className="h-9 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Current Growth Stage *</label>
                <Select value={data.crop.growthStage} onValueChange={(value) => updateData('crop', 'growthStage', value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select growth stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {growthStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Droplets className="h-4 w-4" />
              <h3 className="font-semibold text-base">Soil Information</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Soil conditions affect crop growth and fertilizer recommendations.
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Soil Type *</label>
                <Select value={data.soil.type} onValueChange={(value) => updateData('soil', 'type', value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Soil Moisture *</label>
                <Select value={data.soil.moisture} onValueChange={(value) => updateData('soil', 'moisture', value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select moisture level" />
                  </SelectTrigger>
                  <SelectContent>
                    {moistureLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Soil pH (Optional)</label>
                <Input
                  value={data.soil.ph}
                  onChange={(e) => updateData('soil', 'ph', e.target.value)}
                  placeholder="e.g., 6.5"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Thermometer className="h-4 w-4" />
              <h3 className="font-semibold text-base">Weather Conditions</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Current weather information helps provide timely advice.
            </p>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Current Weather *</label>
                <Select value={data.weather.currentConditions} onValueChange={(value) => updateData('weather', 'currentConditions', value)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select current weather" />
                  </SelectTrigger>
                  <SelectContent>
                    {weatherConditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Recent Rainfall (Optional)</label>
                <Input
                  value={data.weather.rainfall}
                  onChange={(e) => updateData('weather', 'rainfall', e.target.value)}
                  placeholder="e.g., 25mm in last 24h"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto h-full flex flex-col">
      <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
        <CardTitle className="text-base mb-3">Farming Profile Setup</CardTitle>
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`h-1.5 flex-1 rounded-full ${
                stepNumber <= step ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col px-4 pb-4">
        <div className="flex-1">
          <div className="space-y-4">
            {renderStep()}
          </div>
        </div>
        
        <div className="flex justify-between pt-4 border-t border-gray-100 flex-shrink-0">
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : prevStep}
            className="flex-1 mr-2 h-8 text-sm"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="flex-1 ml-2 bg-green-600 hover:bg-green-700 h-8 text-sm"
          >
            {step === 4 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
