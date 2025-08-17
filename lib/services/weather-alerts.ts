export interface WeatherAlert {
  id: string
  type: 'warning' | 'alert' | 'info' | 'emergency'
  title: string
  description: string
  recommendations: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  applicableConditions: string[]
  farmingStage?: string[]
}

export interface WeatherCondition {
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  forecast: string
  season: 'dry' | 'wet' | 'transition'
}

export const WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: 'heavy-rain-alert',
    type: 'warning',
    title: 'Heavy Rainfall Alert',
    description: 'Heavy rainfall expected - may affect rice farming operations',
    recommendations: [
      'Ensure proper field drainage is maintained',
      'Postpone fertilizer application until rain stops',
      'Monitor for rice blast disease development',
      'Protect harvested grains from moisture',
      'Check irrigation systems for damage'
    ],
    severity: 'high',
    applicableConditions: ['heavy rain', 'continuous rain', 'flooding'],
    farmingStage: ['vegetative', 'flowering', 'harvest']
  },
  {
    id: 'drought-warning',
    type: 'alert',
    title: 'Drought Conditions Warning',
    description: 'Extended dry period detected - water conservation needed',
    recommendations: [
      'Implement alternate wetting and drying (AWD)',
      'Use drought-tolerant rice varieties',
      'Apply mulch to conserve soil moisture',
      'Schedule irrigation during early morning',
      'Monitor soil moisture levels regularly'
    ],
    severity: 'high',
    applicableConditions: ['drought', 'low rainfall', 'high temperature'],
    farmingStage: ['seedling', 'vegetative', 'flowering']
  },
  {
    id: 'high-temperature-alert',
    type: 'warning',
    title: 'High Temperature Alert',
    description: 'High temperatures may stress rice plants',
    recommendations: [
      'Maintain adequate water levels in fields',
      'Avoid fertilizer application during peak heat',
      'Monitor for heat stress symptoms',
      'Consider early morning or evening field work',
      'Use shade nets for seedlings if available'
    ],
    severity: 'medium',
    applicableConditions: ['high temperature', 'heat wave', 'low humidity'],
    farmingStage: ['seedling', 'vegetative', 'flowering']
  },
  {
    id: 'typhoon-emergency',
    type: 'emergency',
    title: 'Typhoon Emergency Alert',
    description: 'Typhoon approaching - immediate action required',
    recommendations: [
      'Harvest mature crops immediately if possible',
      'Secure farm equipment and structures',
      'Drain fields to prevent flooding damage',
      'Move livestock to higher ground',
      'Monitor official weather updates'
    ],
    severity: 'critical',
    applicableConditions: ['typhoon', 'strong winds', 'storm surge'],
    farmingStage: ['all stages']
  },
  {
    id: 'pest-outbreak-warning',
    type: 'alert',
    title: 'Pest Outbreak Warning',
    description: 'Weather conditions favorable for pest outbreaks',
    recommendations: [
      'Monitor fields daily for pest presence',
      'Use light traps for early detection',
      'Apply preventive pest control measures',
      'Maintain field sanitation',
      'Consider biological control methods'
    ],
    severity: 'medium',
    applicableConditions: ['high humidity', 'warm temperature', 'wet conditions'],
    farmingStage: ['vegetative', 'flowering']
  },
  {
    id: 'optimal-planting-window',
    type: 'info',
    title: 'Optimal Planting Window',
    description: 'Weather conditions are ideal for rice planting',
    recommendations: [
      'Prepare seedbeds for transplanting',
      'Ensure irrigation water is available',
      'Use certified seeds for best results',
      'Monitor weather forecast for next 7 days',
      'Plan field preparation activities'
    ],
    severity: 'low',
    applicableConditions: ['moderate temperature', 'adequate rainfall', 'stable weather'],
    farmingStage: ['planning', 'preparation']
  },
  {
    id: 'flash-flood-emergency',
    type: 'emergency',
    title: 'Flash Flood Emergency Alert',
    description: 'Flash flood warning - immediate evacuation may be required',
    recommendations: [
      'Evacuate to higher ground immediately',
      'Secure farm equipment and livestock',
      'Turn off electrical systems',
      'Monitor official emergency broadcasts',
      'Do not attempt to cross flooded areas'
    ],
    severity: 'critical',
    applicableConditions: ['flash flood', 'rapid water rise', 'heavy rainfall'],
    farmingStage: ['all stages']
  },
  {
    id: 'landslide-warning',
    type: 'emergency',
    title: 'Landslide Warning Alert',
    description: 'High risk of landslides due to heavy rainfall',
    recommendations: [
      'Evacuate to safe areas immediately',
      'Avoid steep slopes and riverbanks',
      'Monitor for signs of ground movement',
      'Stay informed through official channels',
      'Prepare emergency supplies'
    ],
    severity: 'critical',
    applicableConditions: ['heavy rainfall', 'steep slopes', 'saturated soil'],
    farmingStage: ['all stages']
  },
  {
    id: 'extreme-heat-emergency',
    type: 'emergency',
    title: 'Extreme Heat Emergency Alert',
    description: 'Extreme heat conditions - risk to crops and workers',
    recommendations: [
      'Limit outdoor work during peak hours',
      'Ensure adequate hydration for workers',
      'Provide shade for livestock',
      'Monitor crops for heat stress',
      'Consider early harvesting if crops are mature'
    ],
    severity: 'high',
    applicableConditions: ['extreme heat', 'heat wave', 'high temperature'],
    farmingStage: ['all stages']
  },
  {
    id: 'drought-emergency',
    type: 'emergency',
    title: 'Drought Emergency Alert',
    description: 'Severe drought conditions - water conservation critical',
    recommendations: [
      'Implement strict water conservation measures',
      'Prioritize water for essential crops only',
      'Consider early harvesting of mature crops',
      'Prepare for crop insurance claims',
      'Monitor government drought assistance programs'
    ],
    severity: 'high',
    applicableConditions: ['severe drought', 'water shortage', 'extended dry period'],
    farmingStage: ['all stages']
  },
  {
    id: 'storm-surge-warning',
    type: 'emergency',
    title: 'Storm Surge Warning Alert',
    description: 'Storm surge expected - coastal areas at risk',
    recommendations: [
      'Evacuate coastal areas immediately',
      'Move livestock to higher ground',
      'Secure farm equipment and structures',
      'Monitor official storm surge updates',
      'Prepare for potential flooding'
    ],
    severity: 'critical',
    applicableConditions: ['storm surge', 'coastal flooding', 'typhoon'],
    farmingStage: ['all stages']
  }
]

export function getWeatherAlerts(weatherCondition: WeatherCondition): WeatherAlert[] {
  const alerts: WeatherAlert[] = []
  
  // Check for heavy rain conditions
  if (weatherCondition.rainfall > 50 || weatherCondition.forecast.includes('heavy rain')) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'heavy-rain-alert')!)
  }
  
  // Check for drought conditions
  if (weatherCondition.rainfall < 10 && weatherCondition.temperature > 35) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'drought-warning')!)
  }
  
  // Check for high temperature
  if (weatherCondition.temperature > 35) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'high-temperature-alert')!)
  }
  
  // Check for typhoon conditions
  if (weatherCondition.windSpeed > 60 || weatherCondition.forecast.includes('typhoon')) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'typhoon-emergency')!)
  }
  
  // Check for pest outbreak conditions
  if (weatherCondition.humidity > 80 && weatherCondition.temperature > 25) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'pest-outbreak-warning')!)
  }
  
  // Check for optimal planting conditions
  if (weatherCondition.temperature >= 20 && weatherCondition.temperature <= 30 && 
      weatherCondition.rainfall >= 10 && weatherCondition.rainfall <= 30) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'optimal-planting-window')!)
  }
  
  // Emergency weather alerts
  // Flash flood emergency
  if (weatherCondition.rainfall > 100 || weatherCondition.forecast.includes('flash flood')) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'flash-flood-emergency')!)
  }
  
  // Landslide warning
  if (weatherCondition.rainfall > 80 && weatherCondition.humidity > 90) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'landslide-warning')!)
  }
  
  // Extreme heat emergency
  if (weatherCondition.temperature > 40) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'extreme-heat-emergency')!)
  }
  
  // Drought emergency
  if (weatherCondition.rainfall < 5 && weatherCondition.temperature > 38) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'drought-emergency')!)
  }
  
  // Storm surge warning
  if (weatherCondition.windSpeed > 80 || weatherCondition.forecast.includes('storm surge')) {
    alerts.push(WEATHER_ALERTS.find(alert => alert.id === 'storm-surge-warning')!)
  }
  
  return alerts
}

export function getWeatherRecommendations(weatherCondition: WeatherCondition, farmingStage?: string): string[] {
  const alerts = getWeatherAlerts(weatherCondition)
  const recommendations: string[] = []
  
  alerts.forEach(alert => {
    if (!farmingStage || alert.farmingStage?.includes('all stages') || alert.farmingStage?.includes(farmingStage)) {
      recommendations.push(...alert.recommendations)
    }
  })
  
  return recommendations.slice(0, 5) // Limit to 5 recommendations
}

export function formatWeatherAlert(alert: WeatherAlert): string {
  return `${alert.title}: ${alert.description}\n\nRecommendations:\n${alert.recommendations.map(rec => `• ${rec}`).join('\n')}`
}

export function getSeverityColor(severity: WeatherAlert['severity']): string {
  switch (severity) {
    case 'low': return 'text-blue-600'
    case 'medium': return 'text-yellow-600'
    case 'high': return 'text-orange-600'
    case 'critical': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

export function getEmergencyAlerts(alerts: WeatherAlert[]): WeatherAlert[] {
  return alerts.filter(alert => alert.type === 'emergency')
}

export function getAlertPriority(alerts: WeatherAlert[]): WeatherAlert[] {
  // Sort by severity: critical > high > medium > low
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
  return alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
}

export function formatEmergencyAlert(alert: WeatherAlert): string {
  return `🚨 EMERGENCY ALERT: ${alert.title}\n\n${alert.description}\n\nIMMEDIATE ACTIONS REQUIRED:\n${alert.recommendations.map(rec => `• ${rec}`).join('\n')}`
}
