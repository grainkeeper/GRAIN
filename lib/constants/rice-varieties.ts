// Philippine Rice Varieties
// Key rice varieties for GrainKeeper

export interface RiceVariety {
  name: string
  code: string
  type: 'inbred' | 'hybrid' | 'GMO'
  maturity_days: number
  yield_potential_tons_per_hectare: number
  grain_quality: 'premium' | 'specialty' | 'ordinary'
  cooking_quality: 'soft' | 'medium' | 'hard'
  disease_resistance: string[]
  drought_tolerance: 'low' | 'medium' | 'high'
  submergence_tolerance: 'low' | 'medium' | 'high'
  salt_tolerance: 'low' | 'medium' | 'high'
  recommended_seasons: ('Wet Season' | 'Dry Season')[]
  recommended_regions: string[]
  release_year?: number
  developer: string
  description: string
}

export const RICE_VARIETIES: Record<string, RiceVariety> = {
  // Major NSIC Varieties
  'NSIC Rc 160': {
    name: 'NSIC Rc 160',
    code: 'NSIC Rc 160',
    type: 'inbred',
    maturity_days: 110,
    yield_potential_tons_per_hectare: 6.5,
    grain_quality: 'premium',
    cooking_quality: 'soft',
    disease_resistance: ['bacterial blight', 'tungro'],
    drought_tolerance: 'medium',
    submergence_tolerance: 'low',
    salt_tolerance: 'low',
    recommended_seasons: ['Wet Season', 'Dry Season'],
    recommended_regions: ['Region I', 'Region II', 'Region III'],
    release_year: 2010,
    developer: 'PhilRice',
    description: 'High-yielding inbred variety with premium grain quality.'
  },
  'NSIC Rc 222': {
    name: 'NSIC Rc 222',
    code: 'NSIC Rc 222',
    type: 'inbred',
    maturity_days: 115,
    yield_potential_tons_per_hectare: 7.0,
    grain_quality: 'premium',
    cooking_quality: 'soft',
    disease_resistance: ['bacterial blight', 'blast'],
    drought_tolerance: 'high',
    submergence_tolerance: 'medium',
    salt_tolerance: 'medium',
    recommended_seasons: ['Wet Season', 'Dry Season'],
    recommended_regions: ['Region I', 'Region II', 'Region III', 'Region V'],
    release_year: 2012,
    developer: 'PhilRice',
    description: 'Drought-tolerant variety with premium grain quality.'
  },
  'NSIC Rc 240': {
    name: 'NSIC Rc 240',
    code: 'NSIC Rc 240',
    type: 'inbred',
    maturity_days: 112,
    yield_potential_tons_per_hectare: 7.2,
    grain_quality: 'premium',
    cooking_quality: 'soft',
    disease_resistance: ['bacterial blight', 'blast'],
    drought_tolerance: 'high',
    submergence_tolerance: 'high',
    salt_tolerance: 'medium',
    recommended_seasons: ['Wet Season', 'Dry Season'],
    recommended_regions: ['Region I', 'Region II', 'Region III', 'Region V', 'Region VI'],
    release_year: 2014,
    developer: 'PhilRice',
    description: 'Climate-smart variety with high tolerance to drought and submergence.'
  },

  // PSB Varieties
  'PSB Rc 82': {
    name: 'PSB Rc 82',
    code: 'PSB Rc 82',
    type: 'inbred',
    maturity_days: 120,
    yield_potential_tons_per_hectare: 6.5,
    grain_quality: 'premium',
    cooking_quality: 'soft',
    disease_resistance: ['bacterial blight', 'blast'],
    drought_tolerance: 'medium',
    submergence_tolerance: 'low',
    salt_tolerance: 'low',
    recommended_seasons: ['Wet Season', 'Dry Season'],
    recommended_regions: ['Region I', 'Region II', 'Region III'],
    release_year: 2000,
    developer: 'PhilRice',
    description: 'Classic high-yielding variety with excellent grain quality.'
  },

  // IRRI Varieties
  'IR64': {
    name: 'IR64',
    code: 'IR64',
    type: 'inbred',
    maturity_days: 110,
    yield_potential_tons_per_hectare: 6.0,
    grain_quality: 'premium',
    cooking_quality: 'soft',
    disease_resistance: ['bacterial blight', 'blast'],
    drought_tolerance: 'medium',
    submergence_tolerance: 'low',
    salt_tolerance: 'low',
    recommended_seasons: ['Wet Season', 'Dry Season'],
    recommended_regions: ['Region I', 'Region II', 'Region III', 'Region V', 'Region VI'],
    release_year: 1985,
    developer: 'IRRI',
    description: 'Internationally popular variety with excellent grain quality.'
  },

  // Hybrid Varieties
  'Mestizo 1': {
    name: 'Mestizo 1',
    code: 'Mestizo 1',
    type: 'hybrid',
    maturity_days: 115,
    yield_potential_tons_per_hectare: 8.5,
    grain_quality: 'premium',
    cooking_quality: 'soft',
    disease_resistance: ['bacterial blight', 'blast'],
    drought_tolerance: 'medium',
    submergence_tolerance: 'low',
    salt_tolerance: 'low',
    recommended_seasons: ['Wet Season', 'Dry Season'],
    recommended_regions: ['Region I', 'Region II', 'Region III'],
    release_year: 2005,
    developer: 'SL Agritech',
    description: 'High-yielding hybrid variety with excellent grain quality.'
  },
  'Mestizo 3': {
    name: 'Mestizo 3',
    code: 'Mestizo 3',
    type: 'hybrid',
    maturity_days: 110,
    yield_potential_tons_per_hectare: 8.0,
    grain_quality: 'premium',
    cooking_quality: 'soft',
    disease_resistance: ['bacterial blight', 'blast', 'tungro'],
    drought_tolerance: 'high',
    submergence_tolerance: 'medium',
    salt_tolerance: 'medium',
    recommended_seasons: ['Wet Season', 'Dry Season'],
    recommended_regions: ['Region I', 'Region II', 'Region III', 'Region V'],
    release_year: 2008,
    developer: 'SL Agritech',
    description: 'Climate-smart hybrid with high tolerance to drought.'
  },

  // Specialty Varieties
  'Dinorado': {
    name: 'Dinorado',
    code: 'Dinorado',
    type: 'inbred',
    maturity_days: 130,
    yield_potential_tons_per_hectare: 4.5,
    grain_quality: 'specialty',
    cooking_quality: 'soft',
    disease_resistance: ['bacterial blight'],
    drought_tolerance: 'low',
    submergence_tolerance: 'low',
    salt_tolerance: 'low',
    recommended_seasons: ['Wet Season'],
    recommended_regions: ['Region I', 'Region II'],
    release_year: 1980,
    developer: 'Traditional',
    description: 'Traditional aromatic rice variety with distinctive red color.'
  },
  'Jasmine': {
    name: 'Jasmine',
    code: 'Jasmine',
    type: 'inbred',
    maturity_days: 125,
    yield_potential_tons_per_hectare: 5.0,
    grain_quality: 'specialty',
    cooking_quality: 'soft',
    disease_resistance: ['bacterial blight'],
    drought_tolerance: 'medium',
    submergence_tolerance: 'low',
    salt_tolerance: 'low',
    recommended_seasons: ['Wet Season', 'Dry Season'],
    recommended_regions: ['Region I', 'Region II', 'Region III'],
    release_year: 1990,
    developer: 'IRRI',
    description: 'Aromatic rice variety with jasmine-like fragrance.'
  }
}

export function getRiceVariety(varietyName: string): RiceVariety | undefined {
  return RICE_VARIETIES[varietyName]
}

export function getVarietiesByType(type: 'inbred' | 'hybrid' | 'GMO'): RiceVariety[] {
  return Object.values(RICE_VARIETIES).filter(variety => variety.type === type)
}

export function getVarietiesByRegion(region: string): RiceVariety[] {
  return Object.values(RICE_VARIETIES).filter(variety => 
    variety.recommended_regions.includes(region)
  )
}

export function getHighYieldingVarieties(minYield: number = 7.0): RiceVariety[] {
  return Object.values(RICE_VARIETIES).filter(variety => 
    variety.yield_potential_tons_per_hectare >= minYield
  )
}

export function getDroughtTolerantVarieties(): RiceVariety[] {
  return Object.values(RICE_VARIETIES).filter(variety => 
    variety.drought_tolerance === 'high'
  )
}

export const MAJOR_RICE_VARIETIES = [
  'NSIC Rc 160',
  'NSIC Rc 222',
  'NSIC Rc 240',
  'PSB Rc 82',
  'IR64',
  'Mestizo 1',
  'Mestizo 3'
]

export const PREMIUM_VARIETIES = [
  'NSIC Rc 160',
  'NSIC Rc 222',
  'NSIC Rc 240',
  'PSB Rc 82',
  'IR64',
  'Mestizo 1',
  'Mestizo 3'
]

export const SPECIALTY_VARIETIES = [
  'Dinorado',
  'Jasmine'
]

export const CLIMATE_SMART_VARIETIES = [
  'NSIC Rc 222',
  'NSIC Rc 240',
  'Mestizo 3'
]

export const HIGH_YIELDING_VARIETIES = [
  'NSIC Rc 240',
  'Mestizo 1',
  'Mestizo 3'
]
