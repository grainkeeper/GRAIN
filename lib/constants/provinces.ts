// Philippine Provinces Data
// Key rice-producing provinces for GrainKeeper

export interface ProvinceData {
  name: string
  region: string
  coordinates: {
    lat: number
    lng: number
  }
  rice_producing: boolean
  rice_area_hectares?: number
  avg_yield_tons_per_hectare?: number
}

export const PHILIPPINE_PROVINCES: Record<string, ProvinceData> = {
  // Major Rice Producing Provinces
  'Nueva Ecija': {
    name: 'Nueva Ecija',
    region: 'Region III',
    coordinates: { lat: 15.5833, lng: 120.7500 },
    rice_producing: true,
    rice_area_hectares: 280000,
    avg_yield_tons_per_hectare: 4.6
  },
  'Isabela': {
    name: 'Isabela',
    region: 'Region II',
    coordinates: { lat: 16.7500, lng: 121.7500 },
    rice_producing: true,
    rice_area_hectares: 280000,
    avg_yield_tons_per_hectare: 4.8
  },
  'Cagayan': {
    name: 'Cagayan',
    region: 'Region II',
    coordinates: { lat: 17.6167, lng: 121.7167 },
    rice_producing: true,
    rice_area_hectares: 220000,
    avg_yield_tons_per_hectare: 4.5
  },
  'Cotabato': {
    name: 'Cotabato',
    region: 'Region XII',
    coordinates: { lat: 7.1667, lng: 124.9167 },
    rice_producing: true,
    rice_area_hectares: 65000,
    avg_yield_tons_per_hectare: 4.3
  },
  'Iloilo': {
    name: 'Iloilo',
    region: 'Region VI',
    coordinates: { lat: 10.7000, lng: 122.5667 },
    rice_producing: true,
    rice_area_hectares: 85000,
    avg_yield_tons_per_hectare: 4.1
  },
  'Pangasinan': {
    name: 'Pangasinan',
    region: 'Region I',
    coordinates: { lat: 15.9167, lng: 120.3333 },
    rice_producing: true,
    rice_area_hectares: 180000,
    avg_yield_tons_per_hectare: 4.2
  },
  'Tarlac': {
    name: 'Tarlac',
    region: 'Region III',
    coordinates: { lat: 15.4833, lng: 120.6000 },
    rice_producing: true,
    rice_area_hectares: 85000,
    avg_yield_tons_per_hectare: 4.4
  },
  'Camarines Sur': {
    name: 'Camarines Sur',
    region: 'Region V',
    coordinates: { lat: 13.5833, lng: 123.1667 },
    rice_producing: true,
    rice_area_hectares: 85000,
    avg_yield_tons_per_hectare: 4.0
  },
  'Leyte': {
    name: 'Leyte',
    region: 'Region VIII',
    coordinates: { lat: 11.0000, lng: 124.8333 },
    rice_producing: true,
    rice_area_hectares: 85000,
    avg_yield_tons_per_hectare: 4.0
  },
  'Negros Occidental': {
    name: 'Negros Occidental',
    region: 'Region VI',
    coordinates: { lat: 10.6667, lng: 122.9500 },
    rice_producing: true,
    rice_area_hectares: 65000,
    avg_yield_tons_per_hectare: 3.9
  },
  'Bukidnon': {
    name: 'Bukidnon',
    region: 'Region X',
    coordinates: { lat: 7.9167, lng: 125.0833 },
    rice_producing: true,
    rice_area_hectares: 55000,
    avg_yield_tons_per_hectare: 4.2
  },
  'Agusan del Sur': {
    name: 'Agusan del Sur',
    region: 'Region XIII',
    coordinates: { lat: 8.5000, lng: 125.7500 },
    rice_producing: true,
    rice_area_hectares: 45000,
    avg_yield_tons_per_hectare: 4.1
  },
  'South Cotabato': {
    name: 'South Cotabato',
    region: 'Region XII',
    coordinates: { lat: 6.1667, lng: 125.0000 },
    rice_producing: true,
    rice_area_hectares: 40000,
    avg_yield_tons_per_hectare: 4.0
  },
  'Davao del Norte': {
    name: 'Davao del Norte',
    region: 'Region XI',
    coordinates: { lat: 7.2500, lng: 125.6667 },
    rice_producing: true,
    rice_area_hectares: 45000,
    avg_yield_tons_per_hectare: 4.1
  },
  'Maguindanao': {
    name: 'Maguindanao',
    region: 'BARMM',
    coordinates: { lat: 7.1667, lng: 124.2500 },
    rice_producing: true,
    rice_area_hectares: 55000,
    avg_yield_tons_per_hectare: 3.9
  }
}

export const REGIONS = {
  'Region I': 'Ilocos Region',
  'Region II': 'Cagayan Valley',
  'Region III': 'Central Luzon',
  'Region V': 'Bicol Region',
  'Region VI': 'Western Visayas',
  'Region VIII': 'Eastern Visayas',
  'Region X': 'Northern Mindanao',
  'Region XI': 'Davao Region',
  'Region XII': 'Soccsksargen',
  'Region XIII': 'Caraga',
  'BARMM': 'Bangsamoro Autonomous Region in Muslim Mindanao'
} as const

export function getProvinceData(provinceName: string): ProvinceData | undefined {
  return PHILIPPINE_PROVINCES[provinceName]
}

export function getProvincesByRegion(region: string): ProvinceData[] {
  return Object.values(PHILIPPINE_PROVINCES).filter(province => province.region === region)
}

export function getRiceProducingProvinces(): ProvinceData[] {
  return Object.values(PHILIPPINE_PROVINCES).filter(province => province.rice_producing)
}

export const MAJOR_RICE_PRODUCING_PROVINCES = Object.keys(PHILIPPINE_PROVINCES)
