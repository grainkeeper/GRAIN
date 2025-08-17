// PSGC (Philippine Standard Geographic Code) API Service
// Provides accurate location data for Philippines with proper hierarchy

export interface PSGCProvince {
  code: string
  name: string
  region_code: string
}

export interface PSGCCity {
  code: string
  name: string
  province_code: string
  city_class: string
}

export interface PSGCBarangay {
  code: string
  name: string
  city_code: string
}

export interface PSGCLocation {
  province: PSGCProvince
  city: PSGCCity
  barangay?: PSGCBarangay
}

class PSGCService {
  private baseUrl = 'https://psgc.gitlab.io/api'

  async getProvinces(): Promise<PSGCProvince[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provinces`)
      if (!response.ok) throw new Error('Failed to fetch provinces')
      const data = await response.json()
      return data.map((item: any) => ({
        code: item.code,
        name: item.name,
        region_code: item.regionCode
      })).sort((a: PSGCProvince, b: PSGCProvince) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error fetching provinces:', error)
      return []
    }
  }

  async getCitiesByProvince(provinceCode: string): Promise<PSGCCity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provinces/${provinceCode}/cities`)
      if (!response.ok) {
        console.warn(`No cities found for province ${provinceCode}`)
        return []
      }
      const data = await response.json()
      return data.map((item: any) => ({
        code: item.code,
        name: item.name,
        province_code: item.provinceCode,
        city_class: item.cityClass || 'Component City'
      }))
    } catch (error) {
      console.error('Error fetching cities:', error)
      return []
    }
  }

  async getMunicipalitiesByProvince(provinceCode: string): Promise<PSGCCity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/provinces/${provinceCode}/municipalities`)
      if (!response.ok) {
        console.warn(`No municipalities found for province ${provinceCode}`)
        return []
      }
      const data = await response.json()
      return data.map((item: any) => ({
        code: item.code,
        name: item.name,
        province_code: item.provinceCode,
        city_class: 'Municipality'
      }))
    } catch (error) {
      console.error('Error fetching municipalities:', error)
      return []
    }
  }

  async getCitiesAndMunicipalitiesByProvince(provinceCode: string): Promise<PSGCCity[]> {
    try {
      const [cities, municipalities] = await Promise.allSettled([
        this.getCitiesByProvince(provinceCode),
        this.getMunicipalitiesByProvince(provinceCode)
      ])
      
      const citiesData = cities.status === 'fulfilled' ? cities.value : []
      const municipalitiesData = municipalities.status === 'fulfilled' ? municipalities.value : []
      
      return [...citiesData, ...municipalitiesData].sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error fetching cities and municipalities:', error)
      return []
    }
  }

  async getBarangaysByCity(cityCode: string): Promise<PSGCBarangay[]> {
    try {
      // Try cities endpoint first
      let response = await fetch(`${this.baseUrl}/cities/${cityCode}/barangays`)
      if (response.ok) {
        const data = await response.json()
        return data.map((item: any) => ({
          code: item.code,
          name: item.name,
          city_code: item.cityCode
        }))
      }
      
      // If cities endpoint fails, try municipalities endpoint
      response = await fetch(`${this.baseUrl}/municipalities/${cityCode}/barangays`)
      if (response.ok) {
        const data = await response.json()
        return data.map((item: any) => ({
          code: item.code,
          name: item.name,
          city_code: item.cityCode || item.municipalityCode
        }))
      }
      
      // If both fail, return empty array
      console.warn(`No barangays found for city/municipality ${cityCode}`)
      return []
    } catch (error) {
      console.error('Error fetching barangays:', error)
      return []
    }
  }

  // Cache for better performance
  private provinceCache: PSGCProvince[] | null = null
  private cityCache: Map<string, PSGCCity[]> = new Map()
  private barangayCache: Map<string, PSGCBarangay[]> = new Map()

  async getProvincesCached(): Promise<PSGCProvince[]> {
    if (this.provinceCache) return this.provinceCache
    this.provinceCache = await this.getProvinces()
    return this.provinceCache
  }

  async getCitiesAndMunicipalitiesCached(provinceCode: string): Promise<PSGCCity[]> {
    if (this.cityCache.has(provinceCode)) return this.cityCache.get(provinceCode)!
    const cities = await this.getCitiesAndMunicipalitiesByProvince(provinceCode)
    this.cityCache.set(provinceCode, cities)
    return cities
  }

  async getBarangaysCached(cityCode: string): Promise<PSGCBarangay[]> {
    if (this.barangayCache.has(cityCode)) return this.barangayCache.get(cityCode)!
    const barangays = await this.getBarangaysByCity(cityCode)
    this.barangayCache.set(cityCode, barangays)
    return barangays
  }

  // Clear cache when needed
  clearCache() {
    this.provinceCache = null
    this.cityCache.clear()
    this.barangayCache.clear()
  }
}

export const psgcService = new PSGCService()
