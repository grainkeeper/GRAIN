/**
 * Philippine Location Coordinates Utility
 * 
 * Provides coordinate mapping for major rice-growing regions in the Philippines
 * to support location-specific weather analysis and planting recommendations.
 */

import { LocationCoordinates } from '@/lib/services/open-meteo-api';

export interface PhilippineRegion {
  region: string;
  description: string;
  riceProduction: 'high' | 'medium' | 'low';
  mainSeasons: string[];
  coordinates: LocationCoordinates;
}

/**
 * Major rice-growing regions in the Philippines with their coordinates
 * Data sourced from Philippine Statistics Authority and Department of Agriculture
 */
export const PHILIPPINE_RICE_REGIONS: PhilippineRegion[] = [
  // Luzon - Major rice producing areas
  {
    region: 'Central Luzon',
    description: 'Rice granary of the Philippines, includes Nueva Ecija, Bulacan, Pampanga',
    riceProduction: 'high',
    mainSeasons: ['Dry season (Nov-Apr)', 'Wet season (May-Oct)'],
    coordinates: { latitude: 15.4817, longitude: 120.9730, name: 'Central Luzon' }
  },
  {
    region: 'Cagayan Valley',
    description: 'Second largest rice producing region, includes Cagayan, Isabela',
    riceProduction: 'high',
    mainSeasons: ['Dry season (Nov-Apr)', 'Wet season (Jun-Oct)'],
    coordinates: { latitude: 17.6156, longitude: 121.7279, name: 'Cagayan Valley' }
  },
  {
    region: 'Ilocos Region',
    description: 'Northwestern Luzon rice areas, includes Pangasinan, La Union',
    riceProduction: 'high',
    mainSeasons: ['Dry season (Dec-May)', 'Wet season (Jun-Nov)'],
    coordinates: { latitude: 16.0934, longitude: 120.3320, name: 'Ilocos Region' }
  },
  {
    region: 'CALABARZON',
    description: 'Southern Luzon region, includes Laguna, Batangas, Rizal',
    riceProduction: 'medium',
    mainSeasons: ['Dry season (Nov-Apr)', 'Wet season (May-Oct)'],
    coordinates: { latitude: 14.1000, longitude: 121.3000, name: 'CALABARZON' }
  },
  {
    region: 'Bicol Region',
    description: 'Southeastern Luzon, includes Camarines Sur, Albay',
    riceProduction: 'medium',
    mainSeasons: ['Wet season (May-Dec)', 'Dry season (Jan-Apr)'],
    coordinates: { latitude: 13.6218, longitude: 123.1944, name: 'Bicol Region' }
  },

  // Visayas - Island rice regions
  {
    region: 'Western Visayas',
    description: 'Includes Iloilo, Negros Occidental - major rice producer',
    riceProduction: 'high',
    mainSeasons: ['Dry season (Nov-Apr)', 'Wet season (May-Oct)'],
    coordinates: { latitude: 10.7202, longitude: 122.5621, name: 'Western Visayas' }
  },
  {
    region: 'Central Visayas',
    description: 'Includes Bohol, Cebu - moderate rice production',
    riceProduction: 'medium',
    mainSeasons: ['Dry season (Dec-May)', 'Wet season (Jun-Nov)'],
    coordinates: { latitude: 10.3157, longitude: 123.8854, name: 'Central Visayas' }
  },
  {
    region: 'Eastern Visayas',
    description: 'Includes Leyte, Samar - affected by typhoons',
    riceProduction: 'medium',
    mainSeasons: ['Wet season (May-Dec)', 'Dry season (Jan-Apr)'],
    coordinates: { latitude: 11.2421, longitude: 124.9754, name: 'Eastern Visayas' }
  },

  // Mindanao - Southern rice regions
  {
    region: 'Northern Mindanao',
    description: 'Includes Bukidnon, Misamis Oriental - highland rice areas',
    riceProduction: 'high',
    mainSeasons: ['Year-round production', 'Peak: Apr-Sep'],
    coordinates: { latitude: 8.4542, longitude: 124.6319, name: 'Northern Mindanao' }
  },
  {
    region: 'SOCCSKSARGEN',
    description: 'South Cotabato, Sultan Kudarat - major rice producer',
    riceProduction: 'high',
    mainSeasons: ['Dry season (Nov-May)', 'Wet season (Jun-Oct)'],
    coordinates: { latitude: 6.1164, longitude: 124.6549, name: 'SOCCSKSARGEN' }
  },
  {
    region: 'Davao Region',
    description: 'Includes Davao del Norte, Davao del Sur',
    riceProduction: 'medium',
    mainSeasons: ['Year-round production', 'Peak: Mar-Aug'],
    coordinates: { latitude: 7.0731, longitude: 125.6128, name: 'Davao Region' }
  },
  {
    region: 'Zamboanga Peninsula',
    description: 'Western Mindanao rice areas',
    riceProduction: 'medium',
    mainSeasons: ['Dry season (Dec-May)', 'Wet season (Jun-Nov)'],
    coordinates: { latitude: 8.0500, longitude: 123.2500, name: 'Zamboanga Peninsula' }
  },

  // ARMM/BARMM
  {
    region: 'BARMM',
    description: 'Bangsamoro Autonomous Region, includes Maguindanao, Lanao del Sur',
    riceProduction: 'medium',
    mainSeasons: ['Wet season (May-Oct)', 'Dry season (Nov-Apr)'],
    coordinates: { latitude: 7.2906, longitude: 124.2922, name: 'BARMM' }
  }
];

/**
 * Find the closest Philippine rice region to given coordinates
 */
export function findClosestRegion(latitude: number, longitude: number): PhilippineRegion {
  let closestRegion = PHILIPPINE_RICE_REGIONS[0];
  let minDistance = calculateDistance(latitude, longitude, closestRegion.coordinates);

  for (const region of PHILIPPINE_RICE_REGIONS) {
    const distance = calculateDistance(latitude, longitude, region.coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  }

  return closestRegion;
}

/**
 * Get region by name (case-insensitive)
 */
export function getRegionByName(name: string): PhilippineRegion | null {
  const normalizedName = name.toLowerCase().trim();
  
  return PHILIPPINE_RICE_REGIONS.find(region => 
    region.region.toLowerCase().includes(normalizedName) ||
    region.coordinates.name.toLowerCase().includes(normalizedName)
  ) || null;
}

/**
 * Get all regions by rice production level
 */
export function getRegionsByProduction(level: 'high' | 'medium' | 'low'): PhilippineRegion[] {
  return PHILIPPINE_RICE_REGIONS.filter(region => region.riceProduction === level);
}

/**
 * Get regions suitable for specific planting seasons
 */
export function getRegionsBySeasonType(seasonType: 'dry' | 'wet' | 'year-round'): PhilippineRegion[] {
  return PHILIPPINE_RICE_REGIONS.filter(region => {
    const seasons = region.mainSeasons.join(' ').toLowerCase();
    
    switch (seasonType) {
      case 'dry':
        return seasons.includes('dry season');
      case 'wet':
        return seasons.includes('wet season');
      case 'year-round':
        return seasons.includes('year-round') || (seasons.includes('dry') && seasons.includes('wet'));
      default:
        return false;
    }
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, coords: LocationCoordinates): number {
  const lat2 = coords.latitude;
  const lon2 = coords.longitude;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate if coordinates are within Philippine boundaries
 */
export function isWithinPhilippines(latitude: number, longitude: number): boolean {
  // Approximate boundaries of the Philippines
  const PHILIPPINES_BOUNDS = {
    north: 21.0,
    south: 4.5,
    east: 127.0,
    west: 116.0
  };
  
  return latitude >= PHILIPPINES_BOUNDS.south &&
         latitude <= PHILIPPINES_BOUNDS.north &&
         longitude >= PHILIPPINES_BOUNDS.west &&
         longitude <= PHILIPPINES_BOUNDS.east;
}

/**
 * Get location coordinates with validation
 */
export function createLocationCoordinates(
  latitude: number,
  longitude: number,
  name: string
): LocationCoordinates {
  if (!isWithinPhilippines(latitude, longitude)) {
    throw new Error(`Coordinates (${latitude}, ${longitude}) are outside Philippine boundaries`);
  }
  
  if (!name || name.trim().length === 0) {
    throw new Error('Location name is required');
  }
  
  return {
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
    name: name.trim()
  };
}

/**
 * Get region-specific planting recommendations
 */
export function getRegionPlantingInfo(region: PhilippineRegion) {
  const recommendations: string[] = [];
  
  // Production-based recommendations
  if (region.riceProduction === 'high') {
    recommendations.push('High-yield region with established rice infrastructure');
    recommendations.push('Consider intensive farming practices');
  } else if (region.riceProduction === 'medium') {
    recommendations.push('Moderate yield potential, focus on efficiency');
    recommendations.push('Monitor weather patterns closely');
  }
  
  // Season-based recommendations
  const seasons = region.mainSeasons.join(' ').toLowerCase();
  if (seasons.includes('year-round')) {
    recommendations.push('Year-round production possible - plan multiple crops');
  }
  if (seasons.includes('typhoon') || region.region.includes('Eastern')) {
    recommendations.push('Monitor typhoon season (Jun-Nov) for weather disruptions');
  }
  
  // Regional climate considerations
  if (region.region.includes('Mindanao')) {
    recommendations.push('Tropical climate - monitor for drought and flooding');
  } else if (region.region.includes('Luzon')) {
    recommendations.push('Seasonal monsoons - align planting with weather patterns');
  }
  
  return {
    region: region.region,
    coordinates: region.coordinates,
    riceProduction: region.riceProduction,
    mainSeasons: region.mainSeasons,
    recommendations
  };
}
