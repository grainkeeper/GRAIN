export interface PhilippineProvince {
  id: string;
  name: string;
  region: string;
  region_name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  population?: number;
  area_km2?: number;
  capital?: string;
  rice_producing?: boolean;
  rice_area_hectares?: number;
  avg_yield_tons_per_hectare?: number;
}

export interface PhilippineRegion {
  id: string;
  name: string;
  full_name: string;
  provinces: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export class PhilippineGeoService {
  private baseUrl = 'https://ph-locations-api.buonzz.com/v1';
  private fallbackUrl = 'https://raw.githubusercontent.com/geojson/philippine-provinces/master/provinces.json';

  async getAllProvinces(): Promise<PhilippineProvince[]> {
    try {
      // Try the primary API first
      const response = await fetch(`${this.baseUrl}/provinces`);
      
      if (response.ok) {
        const data = await response.json();
        return this.transformProvinceData(data.data || data);
      }
    } catch (error) {
      console.warn('Primary Philippine API failed, using fallback:', error);
    }

    // Fallback to GitHub GeoJSON data
    return this.getFallbackProvinces();
  }

  async getProvincesByRegion(regionId: string): Promise<PhilippineProvince[]> {
    try {
      const response = await fetch(`${this.baseUrl}/regions/${regionId}/provinces`);
      
      if (response.ok) {
        const data = await response.json();
        return this.transformProvinceData(data.data || data);
      }
    } catch (error) {
      console.warn('Failed to fetch provinces by region:', error);
    }

    // Fallback: filter all provinces by region
    const allProvinces = await this.getAllProvinces();
    return allProvinces.filter(province => province.region === regionId);
  }

  async getAllRegions(): Promise<PhilippineRegion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/regions`);
      
      if (response.ok) {
        const data = await response.json();
        return this.transformRegionData(data.data || data);
      }
    } catch (error) {
      console.warn('Failed to fetch regions:', error);
    }

    // Return default regions
    return this.getDefaultRegions();
  }

  async searchProvinces(query: string): Promise<PhilippineProvince[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provinces?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        return this.transformProvinceData(data.data || data);
      }
    } catch (error) {
      console.warn('Failed to search provinces:', error);
    }

    // Fallback: filter all provinces
    const allProvinces = await this.getAllProvinces();
    return allProvinces.filter(province => 
      province.name.toLowerCase().includes(query.toLowerCase()) ||
      province.region_name.toLowerCase().includes(query.toLowerCase())
    );
  }

  private transformProvinceData(data: any[]): PhilippineProvince[] {
    return data.map(item => ({
      id: item.id?.toString() || item.name,
      name: item.name,
      region: item.region_id?.toString() || item.region,
      region_name: item.region_name || this.getRegionName(item.region_id),
      coordinates: {
        lat: parseFloat(item.latitude) || 0,
        lng: parseFloat(item.longitude) || 0
      },
      population: item.population,
      area_km2: item.area_km2,
      capital: item.capital,
      rice_producing: this.isRiceProducingProvince(item.name),
      rice_area_hectares: this.getRiceArea(item.name),
      avg_yield_tons_per_hectare: this.getAverageYield(item.name)
    }));
  }

  private transformRegionData(data: any[]): PhilippineRegion[] {
    return data.map(item => ({
      id: item.id?.toString() || item.name,
      name: item.name,
      full_name: item.full_name || this.getRegionFullName(item.name),
      provinces: item.provinces || [],
      coordinates: {
        lat: parseFloat(item.latitude) || 0,
        lng: parseFloat(item.longitude) || 0
      }
    }));
  }

  private async getFallbackProvinces(): Promise<PhilippineProvince[]> {
    try {
      const response = await fetch(this.fallbackUrl);
      const data = await response.json();
      
      return data.features.map((feature: any) => ({
        id: feature.properties.ADMIN1_PCODE,
        name: feature.properties.ADMIN1_NAME,
        region: this.mapProvinceToRegion(feature.properties.ADMIN1_NAME),
        region_name: this.getRegionName(this.mapProvinceToRegion(feature.properties.ADMIN1_NAME)),
        coordinates: {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0]
        },
        rice_producing: this.isRiceProducingProvince(feature.properties.ADMIN1_NAME),
        rice_area_hectares: this.getRiceArea(feature.properties.ADMIN1_NAME),
        avg_yield_tons_per_hectare: this.getAverageYield(feature.properties.ADMIN1_NAME)
      }));
    } catch (error) {
      console.error('Fallback API also failed:', error);
      return this.getDefaultProvinces();
    }
  }

  private getDefaultRegions(): PhilippineRegion[] {
    return [
      { id: '1', name: 'Region I', full_name: 'Ilocos Region', provinces: [], coordinates: { lat: 16.5, lng: 120.5 } },
      { id: '2', name: 'Region II', full_name: 'Cagayan Valley', provinces: [], coordinates: { lat: 17.5, lng: 121.5 } },
      { id: '3', name: 'Region III', full_name: 'Central Luzon', provinces: [], coordinates: { lat: 15.5, lng: 120.5 } },
      { id: '4', name: 'Region IV-A', full_name: 'Calabarzon', provinces: [], coordinates: { lat: 14.5, lng: 121.0 } },
      { id: '5', name: 'Region IV-B', full_name: 'Mimaropa', provinces: [], coordinates: { lat: 13.0, lng: 121.0 } },
      { id: '6', name: 'Region V', full_name: 'Bicol Region', provinces: [], coordinates: { lat: 13.5, lng: 123.0 } },
      { id: '7', name: 'Region VI', full_name: 'Western Visayas', provinces: [], coordinates: { lat: 11.0, lng: 122.5 } },
      { id: '8', name: 'Region VII', full_name: 'Central Visayas', provinces: [], coordinates: { lat: 10.5, lng: 123.5 } },
      { id: '9', name: 'Region VIII', full_name: 'Eastern Visayas', provinces: [], coordinates: { lat: 11.0, lng: 124.5 } },
      { id: '10', name: 'Region IX', full_name: 'Zamboanga Peninsula', provinces: [], coordinates: { lat: 7.5, lng: 122.5 } },
      { id: '11', name: 'Region X', full_name: 'Northern Mindanao', provinces: [], coordinates: { lat: 8.5, lng: 124.5 } },
      { id: '12', name: 'Region XI', full_name: 'Davao Region', provinces: [], coordinates: { lat: 7.0, lng: 125.5 } },
      { id: '13', name: 'Region XII', full_name: 'Soccsksargen', provinces: [], coordinates: { lat: 6.5, lng: 124.5 } },
      { id: '14', name: 'Region XIII', full_name: 'Caraga', provinces: [], coordinates: { lat: 9.0, lng: 125.5 } },
      { id: '15', name: 'NCR', full_name: 'National Capital Region', provinces: [], coordinates: { lat: 14.5, lng: 121.0 } },
      { id: '16', name: 'CAR', full_name: 'Cordillera Administrative Region', provinces: [], coordinates: { lat: 16.5, lng: 120.5 } },
      { id: '17', name: 'BARMM', full_name: 'Bangsamoro Autonomous Region in Muslim Mindanao', provinces: [], coordinates: { lat: 7.0, lng: 124.0 } }
    ];
  }

  private getDefaultProvinces(): PhilippineProvince[] {
    // Return the hardcoded provinces as fallback
    return [
      {
        id: 'nueva-ecija',
        name: 'Nueva Ecija',
        region: '3',
        region_name: 'Central Luzon',
        coordinates: { lat: 15.5833, lng: 120.7500 },
        rice_producing: true,
        rice_area_hectares: 280000,
        avg_yield_tons_per_hectare: 4.6
      },
      {
        id: 'isabela',
        name: 'Isabela',
        region: '2',
        region_name: 'Cagayan Valley',
        coordinates: { lat: 16.7500, lng: 121.7500 },
        rice_producing: true,
        rice_area_hectares: 280000,
        avg_yield_tons_per_hectare: 4.8
      },
      {
        id: 'cagayan',
        name: 'Cagayan',
        region: '2',
        region_name: 'Cagayan Valley',
        coordinates: { lat: 17.6167, lng: 121.7167 },
        rice_producing: true,
        rice_area_hectares: 220000,
        avg_yield_tons_per_hectare: 4.5
      }
    ];
  }

  private mapProvinceToRegion(provinceName: string): string {
    const regionMap: Record<string, string> = {
      'Nueva Ecija': '3',
      'Isabela': '2',
      'Cagayan': '2',
      'Pangasinan': '1',
      'Tarlac': '3',
      'Camarines Sur': '5',
      'Iloilo': '6',
      'Leyte': '8',
      'Negros Occidental': '6',
      'Bukidnon': '10',
      'Cotabato': '12',
      'South Cotabato': '12',
      'Davao del Norte': '11',
      'Agusan del Sur': '13',
      'Maguindanao': '17'
    };
    
    return regionMap[provinceName] || '3';
  }

  private getRegionName(regionId: string): string {
    const regions: Record<string, string> = {
      '1': 'Ilocos Region',
      '2': 'Cagayan Valley',
      '3': 'Central Luzon',
      '4': 'Calabarzon',
      '5': 'Bicol Region',
      '6': 'Western Visayas',
      '7': 'Central Visayas',
      '8': 'Eastern Visayas',
      '9': 'Zamboanga Peninsula',
      '10': 'Northern Mindanao',
      '11': 'Davao Region',
      '12': 'Soccsksargen',
      '13': 'Caraga',
      '15': 'National Capital Region',
      '16': 'Cordillera Administrative Region',
      '17': 'Bangsamoro Autonomous Region in Muslim Mindanao'
    };
    
    return regions[regionId] || 'Central Luzon';
  }

  private getRegionFullName(regionName: string): string {
    const fullNames: Record<string, string> = {
      'Region I': 'Ilocos Region',
      'Region II': 'Cagayan Valley',
      'Region III': 'Central Luzon',
      'Region IV-A': 'Calabarzon',
      'Region IV-B': 'Mimaropa',
      'Region V': 'Bicol Region',
      'Region VI': 'Western Visayas',
      'Region VII': 'Central Visayas',
      'Region VIII': 'Eastern Visayas',
      'Region IX': 'Zamboanga Peninsula',
      'Region X': 'Northern Mindanao',
      'Region XI': 'Davao Region',
      'Region XII': 'Soccsksargen',
      'Region XIII': 'Caraga',
      'NCR': 'National Capital Region',
      'CAR': 'Cordillera Administrative Region',
      'BARMM': 'Bangsamoro Autonomous Region in Muslim Mindanao'
    };
    
    return fullNames[regionName] || regionName;
  }

  private isRiceProducingProvince(provinceName: string): boolean {
    const riceProvinces = [
      'Nueva Ecija', 'Isabela', 'Cagayan', 'Pangasinan', 'Tarlac',
      'Camarines Sur', 'Iloilo', 'Leyte', 'Negros Occidental',
      'Bukidnon', 'Cotabato', 'South Cotabato', 'Davao del Norte',
      'Agusan del Sur', 'Maguindanao'
    ];
    
    return riceProvinces.includes(provinceName);
  }

  private getRiceArea(provinceName: string): number | undefined {
    const riceAreas: Record<string, number> = {
      'Nueva Ecija': 280000,
      'Isabela': 280000,
      'Cagayan': 220000,
      'Pangasinan': 180000,
      'Tarlac': 85000,
      'Camarines Sur': 85000,
      'Iloilo': 85000,
      'Leyte': 85000,
      'Negros Occidental': 65000,
      'Bukidnon': 55000,
      'Cotabato': 65000,
      'South Cotabato': 40000,
      'Davao del Norte': 45000,
      'Agusan del Sur': 45000,
      'Maguindanao': 55000
    };
    
    return riceAreas[provinceName];
  }

  private getAverageYield(provinceName: string): number | undefined {
    const yields: Record<string, number> = {
      'Nueva Ecija': 4.6,
      'Isabela': 4.8,
      'Cagayan': 4.5,
      'Pangasinan': 4.2,
      'Tarlac': 4.4,
      'Camarines Sur': 4.0,
      'Iloilo': 4.1,
      'Leyte': 4.0,
      'Negros Occidental': 3.9,
      'Bukidnon': 4.2,
      'Cotabato': 4.3,
      'South Cotabato': 4.0,
      'Davao del Norte': 4.1,
      'Agusan del Sur': 4.1,
      'Maguindanao': 3.9
    };
    
    return yields[provinceName];
  }
}
