// Data Import/Export Utilities
// Utilities for importing and exporting data in CSV/Excel formats

import { createClient } from '@/lib/supabase/server'
import { 
  InsertHistoricalGeoClimaticData,
  InsertUserFarmProfile,
  InsertYieldPrediction,
  InsertRealTimeWeatherData,
  InsertChatbotKnowledgeBase
} from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

export interface ImportResult {
  success: boolean
  totalRecords: number
  importedRecords: number
  failedRecords: number
  errors: ImportError[]
  warnings: string[]
}

export interface ImportError {
  row: number
  field: string
  value: any
  error: string
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json'
  includeHeaders?: boolean
  dateFormat?: string
  encoding?: string
}

export interface ValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'date' | 'boolean' | 'email'
  minLength?: number
  maxLength?: number
  minValue?: number
  maxValue?: number
  pattern?: RegExp
  enum?: string[]
  custom?: (value: any) => boolean | string
}

// ============================================================================
// CSV UTILITIES
// ============================================================================

export function parseCSV(csvContent: string, delimiter: string = ','): any[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length === 0) return []

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''))
  const data: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''))
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || null
    })
    
    data.push(row)
  }

  return data
}

export function generateCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return ''

  const csvHeaders = headers || Object.keys(data[0])
  const csvRows = [csvHeaders.join(',')]

  data.forEach(row => {
    const values = csvHeaders.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return String(value)
    })
    csvRows.push(values.join(','))
  })

  return csvRows.join('\n')
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export function validateData(data: any[], rules: ValidationRule[]): ImportError[] {
  const errors: ImportError[] = []

  data.forEach((row, rowIndex) => {
    rules.forEach(rule => {
      const value = row[rule.field]
      
      // Required field check
      if (rule.required && (value === null || value === undefined || value === '')) {
        errors.push({
          row: rowIndex + 1,
          field: rule.field,
          value,
          error: `${rule.field} is required`
        })
        return
      }

      if (value === null || value === undefined || value === '') return

      // Type validation
      if (rule.type) {
        const typeError = validateType(value, rule.type, rule.field)
        if (typeError) {
          errors.push({
            row: rowIndex + 1,
            field: rule.field,
            value,
            error: typeError
          })
          return
        }
      }

      // Length validation
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push({
            row: rowIndex + 1,
            field: rule.field,
            value,
            error: `${rule.field} must be at least ${rule.minLength} characters`
          })
          return
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push({
            row: rowIndex + 1,
            field: rule.field,
            value,
            error: `${rule.field} must be at most ${rule.maxLength} characters`
          })
          return
        }
      }

      // Numeric validation
      if (typeof value === 'number') {
        if (rule.minValue !== undefined && value < rule.minValue) {
          errors.push({
            row: rowIndex + 1,
            field: rule.field,
            value,
            error: `${rule.field} must be at least ${rule.minValue}`
          })
          return
        }
        if (rule.maxValue !== undefined && value > rule.maxValue) {
          errors.push({
            row: rowIndex + 1,
            field: rule.field,
            value,
            error: `${rule.field} must be at most ${rule.maxValue}`
          })
          return
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push({
          row: rowIndex + 1,
          field: rule.field,
          value,
          error: `${rule.field} format is invalid`
        })
        return
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          row: rowIndex + 1,
          field: rule.field,
          value,
          error: `${rule.field} must be one of: ${rule.enum.join(', ')}`
        })
        return
      }

      // Custom validation
      if (rule.custom) {
        const customResult = rule.custom(value)
        if (customResult !== true) {
          errors.push({
            row: rowIndex + 1,
            field: rule.field,
            value,
            error: typeof customResult === 'string' ? customResult : `${rule.field} validation failed`
          })
          return
        }
      }
    })
  })

  return errors
}

function validateType(value: any, type: string, fieldName: string): string | null {
  switch (type) {
    case 'string':
      return typeof value === 'string' ? null : `${fieldName} must be a string`
    case 'number':
      return !isNaN(Number(value)) ? null : `${fieldName} must be a number`
    case 'date':
      return !isNaN(Date.parse(value)) ? null : `${fieldName} must be a valid date`
    case 'boolean':
      return ['true', 'false', '1', '0', true, false].includes(value) ? null : `${fieldName} must be a boolean`
    case 'email':
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(value) ? null : `${fieldName} must be a valid email`
    default:
      return null
  }
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

export function transformHistoricalData(rawData: any[]): InsertHistoricalGeoClimaticData[] {
  return rawData.map(row => ({
    province: row.province || row.Province || '',
    region: row.region || row.Region || '',
    date: row.date || row.Date || '',
    year: parseInt(row.year || row.Year || '0'),
    month: parseInt(row.month || row.Month || '0'),
    temperature_avg: parseFloat(row.temperature_avg || row['Temperature Avg'] || '0'),
    temperature_max: parseFloat(row.temperature_max || row['Temperature Max'] || '0'),
    temperature_min: parseFloat(row.temperature_min || row['Temperature Min'] || '0'),
    rainfall_mm: parseFloat(row.rainfall_mm || row['Rainfall (mm)'] || '0'),
    humidity_avg: parseFloat(row.humidity_avg || row['Humidity Avg'] || '0'),
    wind_speed_avg: parseFloat(row.wind_speed_avg || row['Wind Speed Avg'] || '0'),
    wind_direction: row.wind_direction || row['Wind Direction'] || null,
    dew_point: parseFloat(row.dew_point || row['Dew Point'] || '0'),
    solar_radiation: parseFloat(row.solar_radiation || row['Solar Radiation'] || '0'),
    rice_yield_actual: parseFloat(row.rice_yield_actual || row['Rice Yield Actual'] || '0'),
    rice_area_planted: parseFloat(row.rice_area_planted || row['Rice Area Planted'] || '0'),
    rice_area_harvested: parseFloat(row.rice_area_harvested || row['Rice Area Harvested'] || '0'),
    rice_production_volume: parseFloat(row.rice_production_volume || row['Rice Production Volume'] || '0'),
    soil_type: row.soil_type || row['Soil Type'] || null,
    soil_ph: parseFloat(row.soil_ph || row['Soil pH'] || '0'),
    soil_moisture: parseFloat(row.soil_moisture || row['Soil Moisture'] || '0'),
    population_density: parseFloat(row.population_density || row['Population Density'] || '0'),
    agricultural_land_area: parseFloat(row.agricultural_land_area || row['Agricultural Land Area'] || '0'),
    irrigation_coverage: parseFloat(row.irrigation_coverage || row['Irrigation Coverage'] || '0'),
    data_source: row.data_source || row['Data Source'] || 'PAGASA',
    data_quality_score: parseFloat(row.data_quality_score || row['Data Quality Score'] || '0.8')
  }))
}

export function transformFarmProfiles(rawData: any[]): InsertUserFarmProfile[] {
  return rawData.map(row => ({
    user_id: row.user_id || row['User ID'] || '',
    farm_name: row.farm_name || row['Farm Name'] || '',
    province: row.province || row.Province || '',
    region: row.region || row.Region || '',
    municipality: row.municipality || row.Municipality || null,
    barangay: row.barangay || row.Barangay || null,
    farm_size_hectares: parseFloat(row.farm_size_hectares || row['Farm Size (ha)'] || '0'),
    rice_area_hectares: parseFloat(row.rice_area_hectares || row['Rice Area (ha)'] || '0'),
    soil_type: row.soil_type || row['Soil Type'] || '',
    soil_ph: parseFloat(row.soil_ph || row['Soil pH'] || '0'),
    irrigation_type: row.irrigation_type || row['Irrigation Type'] || null,
    elevation_meters: parseInt(row.elevation_meters || row['Elevation (m)'] || '0'),
    preferred_rice_variety: row.preferred_rice_variety || row['Preferred Rice Variety'] || null,
    planting_season: row.planting_season || row['Planting Season'] || null,
    farming_experience_years: parseInt(row.farming_experience_years || row['Farming Experience (years)'] || '0'),
    farming_method: row.farming_method || row['Farming Method'] || null,
    farmer_name: row.farmer_name || row['Farmer Name'] || null,
    contact_number: row.contact_number || row['Contact Number'] || null,
    email: row.email || row.Email || null,
    address: row.address || row.Address || null,
    notification_preferences: JSON.parse(row.notification_preferences || row['Notification Preferences'] || '{}'),
    language_preference: row.language_preference || row['Language Preference'] || 'en',
    measurement_unit: row.measurement_unit || row['Measurement Unit'] || 'metric',
    timezone: row.timezone || row.Timezone || 'Asia/Manila',
    is_active: row.is_active === 'true' || row.is_active === true,
    is_verified: row.is_verified === 'true' || row.is_verified === true
  }))
}

export function transformWeatherData(rawData: any[]): InsertRealTimeWeatherData[] {
  return rawData.map(row => ({
    province: row.province || row.Province || '',
    region: row.region || row.Region || '',
    municipality: row.municipality || row.Municipality || null,
    temperature_current: parseFloat(row.temperature_current || row['Temperature Current'] || '0'),
    temperature_feels_like: parseFloat(row.temperature_feels_like || row['Temperature Feels Like'] || '0'),
    temperature_max: parseFloat(row.temperature_max || row['Temperature Max'] || '0'),
    temperature_min: parseFloat(row.temperature_min || row['Temperature Min'] || '0'),
    humidity_percentage: parseFloat(row.humidity_percentage || row['Humidity (%)'] || '0'),
    pressure_hpa: parseFloat(row.pressure_hpa || row['Pressure (hPa)'] || '0'),
    visibility_km: parseFloat(row.visibility_km || row['Visibility (km)'] || '0'),
    wind_speed_kmh: parseFloat(row.wind_speed_kmh || row['Wind Speed (km/h)'] || '0'),
    wind_direction_degrees: parseInt(row.wind_direction_degrees || row['Wind Direction (degrees)'] || '0'),
    wind_direction_cardinal: row.wind_direction_cardinal || row['Wind Direction Cardinal'] || null,
    wind_gust_kmh: parseFloat(row.wind_gust_kmh || row['Wind Gust (km/h)'] || '0'),
    rainfall_1h_mm: parseFloat(row.rainfall_1h_mm || row['Rainfall 1h (mm)'] || '0'),
    rainfall_3h_mm: parseFloat(row.rainfall_3h_mm || row['Rainfall 3h (mm)'] || '0'),
    rainfall_24h_mm: parseFloat(row.rainfall_24h_mm || row['Rainfall 24h (mm)'] || '0'),
    precipitation_probability: parseFloat(row.precipitation_probability || row['Precipitation Probability'] || '0'),
    uv_index: parseFloat(row.uv_index || row['UV Index'] || '0'),
    cloud_cover_percentage: parseFloat(row.cloud_cover_percentage || row['Cloud Cover (%)'] || '0'),
    dew_point_celsius: parseFloat(row.dew_point_celsius || row['Dew Point (°C)'] || '0'),
    sunrise_time: row.sunrise_time || row['Sunrise Time'] || null,
    sunset_time: row.sunset_time || row['Sunset Time'] || null,
    weather_api_source: row.weather_api_source || row['Weather API Source'] || 'OpenWeatherMap',
    data_quality_score: parseFloat(row.data_quality_score || row['Data Quality Score'] || '0.8'),
    last_updated: row.last_updated || row['Last Updated'] || new Date().toISOString()
  }))
}

export function transformChatbotKnowledge(rawData: any[]): InsertChatbotKnowledgeBase[] {
  return rawData.map(row => ({
    knowledge_title: row.knowledge_title || row['Knowledge Title'] || '',
    knowledge_content: row.knowledge_content || row['Knowledge Content'] || '',
    knowledge_summary: row.knowledge_summary || row['Knowledge Summary'] || null,
    knowledge_category: row.knowledge_category || row['Knowledge Category'] || '',
    knowledge_subcategory: row.knowledge_subcategory || row['Knowledge Subcategory'] || null,
    applicable_provinces: row.applicable_provinces ? row.applicable_provinces.split(',').map((p: string) => p.trim()) : null,
    applicable_seasons: row.applicable_seasons ? row.applicable_seasons.split(',').map((s: string) => s.trim()) : null,
    applicable_soil_types: row.applicable_soil_types ? row.applicable_soil_types.split(',').map((s: string) => s.trim()) : null,
    applicable_rice_varieties: row.applicable_rice_varieties ? row.applicable_rice_varieties.split(',').map((v: string) => v.trim()) : null,
    knowledge_source: row.knowledge_source || row['Knowledge Source'] || '',
    knowledge_author: row.knowledge_author || row['Knowledge Author'] || null,
    knowledge_version: row.knowledge_version || row['Knowledge Version'] || null,
    knowledge_quality_score: parseFloat(row.knowledge_quality_score || row['Knowledge Quality Score'] || '0.8'),
    usage_count: parseInt(row.usage_count || row['Usage Count'] || '0'),
    effectiveness_score: parseFloat(row.effectiveness_score || row['Effectiveness Score'] || '0.8'),
    is_active: row.is_active === 'true' || row.is_active === true,
    is_verified: row.is_verified === 'true' || row.is_verified === true
  }))
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

export async function importHistoricalData(data: InsertHistoricalGeoClimaticData[]): Promise<ImportResult> {
  const supabase = await createClient()
  const result: ImportResult = {
    success: true,
    totalRecords: data.length,
    importedRecords: 0,
    failedRecords: 0,
    errors: [],
    warnings: []
  }

  for (let i = 0; i < data.length; i++) {
    try {
      const { error } = await supabase
        .from('historical_geo_climatic_data')
        .insert(data[i])

      if (error) {
        result.failedRecords++
        result.errors.push({
          row: i + 1,
          field: 'all',
          value: data[i],
          error: error.message
        })
      } else {
        result.importedRecords++
      }
    } catch (error) {
      result.failedRecords++
      result.errors.push({
        row: i + 1,
        field: 'all',
        value: data[i],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  result.success = result.failedRecords === 0
  return result
}

export async function importFarmProfiles(data: InsertUserFarmProfile[]): Promise<ImportResult> {
  const supabase = await createClient()
  const result: ImportResult = {
    success: true,
    totalRecords: data.length,
    importedRecords: 0,
    failedRecords: 0,
    errors: [],
    warnings: []
  }

  for (let i = 0; i < data.length; i++) {
    try {
      const { error } = await supabase
        .from('user_farm_profiles')
        .insert(data[i])

      if (error) {
        result.failedRecords++
        result.errors.push({
          row: i + 1,
          field: 'all',
          value: data[i],
          error: error.message
        })
      } else {
        result.importedRecords++
      }
    } catch (error) {
      result.failedRecords++
      result.errors.push({
        row: i + 1,
        field: 'all',
        value: data[i],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  result.success = result.failedRecords === 0
  return result
}

export async function importWeatherData(data: InsertRealTimeWeatherData[]): Promise<ImportResult> {
  const supabase = await createClient()
  const result: ImportResult = {
    success: true,
    totalRecords: data.length,
    importedRecords: 0,
    failedRecords: 0,
    errors: [],
    warnings: []
  }

  for (let i = 0; i < data.length; i++) {
    try {
      const { error } = await supabase
        .from('real_time_weather_data')
        .insert(data[i])

      if (error) {
        result.failedRecords++
        result.errors.push({
          row: i + 1,
          field: 'all',
          value: data[i],
          error: error.message
        })
      } else {
        result.importedRecords++
      }
    } catch (error) {
      result.failedRecords++
      result.errors.push({
        row: i + 1,
        field: 'all',
        value: data[i],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  result.success = result.failedRecords === 0
  return result
}

export async function importChatbotKnowledge(data: InsertChatbotKnowledgeBase[]): Promise<ImportResult> {
  const supabase = await createClient()
  const result: ImportResult = {
    success: true,
    totalRecords: data.length,
    importedRecords: 0,
    failedRecords: 0,
    errors: [],
    warnings: []
  }

  for (let i = 0; i < data.length; i++) {
    try {
      const { error } = await supabase
        .from('chatbot_knowledge_base')
        .insert(data[i])

      if (error) {
        result.failedRecords++
        result.errors.push({
          row: i + 1,
          field: 'all',
          value: data[i],
          error: error.message
        })
      } else {
        result.importedRecords++
      }
    } catch (error) {
      result.failedRecords++
      result.errors.push({
        row: i + 1,
        field: 'all',
        value: data[i],
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  result.success = result.failedRecords === 0
  return result
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export async function exportHistoricalData(filters?: any, options?: ExportOptions): Promise<string> {
  const supabase = await createClient()
  
  let query = supabase
    .from('historical_geo_climatic_data')
    .select('*')

  if (filters) {
    if (filters.province) query = query.eq('province', filters.province)
    if (filters.region) query = query.eq('region', filters.region)
    if (filters.start_date) query = query.gte('date', filters.start_date)
    if (filters.end_date) query = query.lte('date', filters.end_date)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Export failed: ${error.message}`)
  }

  if (options?.format === 'csv') {
    return generateCSV(data || [])
  } else if (options?.format === 'json') {
    return JSON.stringify(data || [], null, 2)
  }

  return generateCSV(data || [])
}

export async function exportFarmProfiles(filters?: any, options?: ExportOptions): Promise<string> {
  const supabase = await createClient()
  
  let query = supabase
    .from('user_farm_profiles')
    .select('*')

  if (filters) {
    if (filters.province) query = query.eq('province', filters.province)
    if (filters.region) query = query.eq('region', filters.region)
    if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Export failed: ${error.message}`)
  }

  if (options?.format === 'csv') {
    return generateCSV(data || [])
  } else if (options?.format === 'json') {
    return JSON.stringify(data || [], null, 2)
  }

  return generateCSV(data || [])
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const HISTORICAL_DATA_RULES: ValidationRule[] = [
  { field: 'province', required: true, type: 'string', maxLength: 100 },
  { field: 'region', required: true, type: 'string', maxLength: 50 },
  { field: 'date', required: true, type: 'date' },
  { field: 'year', required: true, type: 'number', minValue: 2010, maxValue: 2024 },
  { field: 'month', required: true, type: 'number', minValue: 1, maxValue: 12 },
  { field: 'temperature_avg', type: 'number', minValue: -50, maxValue: 60 },
  { field: 'rainfall_mm', type: 'number', minValue: 0, maxValue: 10000 },
  { field: 'data_source', required: true, enum: ['PAGASA', 'PSA', 'PhilRice'] }
]

export const FARM_PROFILE_RULES: ValidationRule[] = [
  { field: 'user_id', required: true, type: 'string' },
  { field: 'farm_name', required: true, type: 'string', maxLength: 200 },
  { field: 'province', required: true, type: 'string', maxLength: 100 },
  { field: 'region', required: true, type: 'string', maxLength: 50 },
  { field: 'farm_size_hectares', required: true, type: 'number', minValue: 0.01, maxValue: 10000 },
  { field: 'rice_area_hectares', required: true, type: 'number', minValue: 0.01, maxValue: 10000 },
  { field: 'soil_type', required: true, type: 'string', maxLength: 50 },
  { field: 'email', type: 'email' },
  { field: 'language_preference', enum: ['en', 'fil'] },
  { field: 'measurement_unit', enum: ['metric', 'imperial'] }
]

export const WEATHER_DATA_RULES: ValidationRule[] = [
  { field: 'province', required: true, type: 'string', maxLength: 100 },
  { field: 'region', required: true, type: 'string', maxLength: 50 },
  { field: 'temperature_current', required: true, type: 'number', minValue: -50, maxValue: 60 },
  { field: 'humidity_percentage', required: true, type: 'number', minValue: 0, maxValue: 100 },
  { field: 'weather_api_source', required: true, type: 'string', maxLength: 50 },
  { field: 'last_updated', required: true, type: 'date' }
]

export const CHATBOT_KNOWLEDGE_RULES: ValidationRule[] = [
  { field: 'knowledge_title', required: true, type: 'string', maxLength: 200 },
  { field: 'knowledge_content', required: true, type: 'string' },
  { field: 'knowledge_category', required: true, type: 'string', maxLength: 100 },
  { field: 'knowledge_source', required: true, type: 'string', maxLength: 100 },
  { field: 'knowledge_quality_score', type: 'number', minValue: 0, maxValue: 1 }
]

