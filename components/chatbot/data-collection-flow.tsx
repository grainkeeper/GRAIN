'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Wheat, Droplets, Thermometer, Calendar } from 'lucide-react'
import { PHILIPPINE_PROVINCES } from '@/lib/constants/provinces'
import { RICE_VARIETIES } from '@/lib/constants/rice-varieties'

interface FarmingData {
  location: {
    province: string
    city: string
    barangay?: string
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

export function DataCollectionFlow({ onComplete, onCancel }: DataCollectionFlowProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FarmingData>({
    location: {
      province: '',
      city: '',
      barangay: ''
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

  const updateData = (section: keyof FarmingData, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      onComplete(data)
    }
  }

  const prevStep = () => {
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
              <MapPin className="h-5 w-5" />
              <h3 className="font-semibold">Location Information</h3>
            </div>
            <p className="text-sm text-gray-600">
              Tell us about your farming location for personalized recommendations.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Province *</label>
                <Select value={data.location.province} onValueChange={(value) => updateData('location', 'province', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your province" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PHILIPPINE_PROVINCES).map((province) => (
                      <SelectItem key={province.name} value={province.name}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">City/Municipality *</label>
                <Input
                  value={data.location.city}
                  onChange={(e) => updateData('location', 'city', e.target.value)}
                  placeholder="Enter your city or municipality"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Barangay (Optional)</label>
                <Input
                  value={data.location.barangay}
                  onChange={(e) => updateData('location', 'barangay', e.target.value)}
                  placeholder="Enter your barangay"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Wheat className="h-5 w-5" />
              <h3 className="font-semibold">Crop Information</h3>
            </div>
            <p className="text-sm text-gray-600">
              Provide details about your rice crop for accurate recommendations.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Rice Variety *</label>
                <Select value={data.crop.variety} onValueChange={(value) => updateData('crop', 'variety', value)}>
                  <SelectTrigger>
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
              
              <div>
                <label className="text-sm font-medium">Planting Date *</label>
                <Input
                  type="date"
                  value={data.crop.plantingDate}
                  onChange={(e) => updateData('crop', 'plantingDate', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Current Growth Stage *</label>
                <Select value={data.crop.growthStage} onValueChange={(value) => updateData('crop', 'growthStage', value)}>
                  <SelectTrigger>
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
              <Droplets className="h-5 w-5" />
              <h3 className="font-semibold">Soil Conditions</h3>
            </div>
            <p className="text-sm text-gray-600">
              Help us understand your soil conditions for better recommendations.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Soil Type *</label>
                <Select value={data.soil.type} onValueChange={(value) => updateData('soil', 'type', value)}>
                  <SelectTrigger>
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
              
              <div>
                <label className="text-sm font-medium">Soil Moisture *</label>
                <Select value={data.soil.moisture} onValueChange={(value) => updateData('soil', 'moisture', value)}>
                  <SelectTrigger>
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
              
              <div>
                <label className="text-sm font-medium">Soil pH (Optional)</label>
                <Input
                  value={data.soil.ph}
                  onChange={(e) => updateData('soil', 'ph', e.target.value)}
                  placeholder="e.g., 6.5"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Thermometer className="h-5 w-5" />
              <h3 className="font-semibold">Weather Conditions</h3>
            </div>
            <p className="text-sm text-gray-600">
              Current weather information helps provide timely advice.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Current Weather *</label>
                <Select value={data.weather.currentConditions} onValueChange={(value) => updateData('weather', 'currentConditions', value)}>
                  <SelectTrigger>
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
              
              <div>
                <label className="text-sm font-medium">Recent Rainfall (Optional)</label>
                <Input
                  value={data.weather.rainfall}
                  onChange={(e) => updateData('weather', 'rainfall', e.target.value)}
                  placeholder="e.g., 25mm in last 24h"
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Farming Profile Setup</CardTitle>
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`h-2 flex-1 rounded-full ${
                stepNumber <= step ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : prevStep}
            className="flex-1 mr-2"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="flex-1 ml-2 bg-green-600 hover:bg-green-700"
          >
            {step === 4 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
