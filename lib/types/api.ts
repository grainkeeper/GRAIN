// GrainKeeper API Types
// Type definitions for API requests and responses

import { 
  UUID, 
  SeasonType, 
  Language, 
  MeasurementUnit,
  WeatherForecastData,
  HistoricalWeatherData,
  PredictionFactors,
  UserFarmContext,
  WeatherContext,
  MessageContext,
  MessageEntities,
  BotRecommendations,
  InteractionContext,
  DeviceInfo
} from './database'

// ============================================================================
// BASE API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// ============================================================================
// YIELD PREDICTION API TYPES
// ============================================================================

// Request to generate yield prediction
export interface YieldPredictionRequest {
  // Farm Details
  farm_profile_id: UUID
  target_season_year: number
  target_season_type: SeasonType
  target_planting_date?: string
  target_harvest_date?: string
  
  // Input Parameters
  rice_variety: string
  soil_type: string
  soil_ph?: number
  farm_size_hectares: number
  rice_area_hectares: number
  irrigation_type?: string
  elevation_meters?: number
  
  // Optional overrides
  weather_forecast_override?: WeatherForecastData
  historical_weather_override?: HistoricalWeatherData
}

// Response from yield prediction
export interface YieldPredictionResponse {
  prediction_id: UUID
  predicted_yield_tons_per_hectare: number
  confidence_interval_lower?: number
  confidence_interval_upper?: number
  confidence_level: number
  model_version: string
  model_accuracy_score?: number
  prediction_factors: PredictionFactors
  prediction_status: string
  created_at: string
}

// Request to get prediction factors explanation
export interface PredictionFactorsRequest {
  prediction_id: UUID
}

// Response with prediction factors explanation
export interface PredictionFactorsResponse {
  prediction_id: UUID
  factors: Array<{
    factor_name: string
    factor_value?: number
    factor_unit?: string
    factor_description?: string
    impact_score?: number
    impact_percentage?: number
    impact_explanation?: string
    factor_category?: string
    factor_importance_rank?: number
  }>
}

// Request to validate prediction accuracy
export interface PredictionAccuracyRequest {
  prediction_id: UUID
  actual_yield_tons_per_hectare: number
  actual_harvest_date: string
  actual_planting_date?: string
  validation_notes?: string
}

// Response from prediction accuracy validation
export interface PredictionAccuracyResponse {
  prediction_id: UUID
  prediction_error: number
  prediction_error_percentage: number
  accuracy_score: number
  validation_date: string
}

// ============================================================================
// WEATHER API TYPES
// ============================================================================

// Request to get current weather
export interface CurrentWeatherRequest {
  province: string
  region: string
  municipality?: string
}

// Response with current weather data
export interface CurrentWeatherResponse {
  province: string
  region: string
  municipality?: string
  temperature_current: number
  temperature_feels_like?: number
  temperature_max?: number
  temperature_min?: number
  humidity_percentage: number
  pressure_hpa?: number
  visibility_km?: number
  wind_speed_kmh?: number
  wind_direction_cardinal?: string
  rainfall_24h_mm?: number
  precipitation_probability?: number
  uv_index?: number
  cloud_cover_percentage?: number
  dew_point_celsius?: number
  sunrise_time?: string
  sunset_time?: string
  weather_api_source: string
  last_updated: string
}

// Request to get weather forecast
export interface WeatherForecastRequest {
  province: string
  region: string
  municipality?: string
  forecast_period: 'hourly' | 'daily' | 'weekly'
  days?: number // Number of days to forecast
}

// Response with weather forecast data
export interface WeatherForecastResponse {
  province: string
  region: string
  municipality?: string
  forecast_period: string
  forecasts: Array<{
    forecast_date: string
    forecast_hour?: number
    temperature_avg?: number
    temperature_max?: number
    temperature_min?: number
    humidity_percentage?: number
    pressure_hpa?: number
    wind_speed_kmh?: number
    wind_direction_cardinal?: string
    rainfall_probability?: number
    rainfall_amount_mm?: number
    precipitation_type?: string
    uv_index?: number
    cloud_cover_percentage?: number
    visibility_km?: number
    confidence_level?: number
  }>
  weather_api_source: string
}

// Request to get planting windows
export interface PlantingWindowsRequest {
  province: string
  region: string
  season_year: number
  season_type: SeasonType
}

// Response with planting windows
export interface PlantingWindowsResponse {
  province: string
  region: string
  season_year: number
  season_type: SeasonType
  optimal_start_date: string
  optimal_end_date: string
  optimal_duration_days: number
  early_start_date?: string
  early_end_date?: string
  late_start_date?: string
  late_end_date?: string
  avg_temperature_during_window?: number
  total_rainfall_during_window?: number
  weather_conditions_rating?: number
  expected_yield_impact?: number
  yield_impact_explanation?: string
  confidence_score?: number
  model_version: string
}

// Request to get weather alerts
export interface WeatherAlertsRequest {
  province?: string
  region?: string
  alert_type?: string
  severity?: string
  active_only?: boolean
}

// Response with weather alerts
export interface WeatherAlertsResponse {
  alerts: Array<{
    id: UUID
    province: string
    region: string
    municipality?: string
    alert_type: string
    alert_severity: string
    alert_title: string
    alert_description: string
    alert_start_time: string
    alert_end_time: string
    alert_duration_hours?: number
    agricultural_impact_level?: string
    impact_description?: string
    recommended_actions?: string
    alert_source: string
    is_active: boolean
  }>
}

// ============================================================================
// CHATBOT API TYPES
// ============================================================================

// Request to start a new conversation
export interface StartConversationRequest {
  user_id: UUID
  farm_profile_id?: UUID
  conversation_type?: string
  language?: Language
  user_location_province?: string
  user_location_region?: string
  user_farm_context?: UserFarmContext
  weather_context?: WeatherContext
}

// Response from starting conversation
export interface StartConversationResponse {
  conversation_id: UUID
  conversation_title?: string
  conversation_type: string
  language: string
  is_active: boolean
  total_messages: number
  created_at: string
}

// Request to send a message
export interface SendMessageRequest {
  conversation_id: UUID
  user_id: UUID
  message_text: string
  message_context?: MessageContext
  message_entities?: MessageEntities
}

// Response from sending message
export interface SendMessageResponse {
  message_id: UUID
  conversation_id: UUID
  message_text: string
  message_type: string
  message_role: string
  message_intent?: string
  bot_response_type?: string
  bot_confidence_score?: number
  bot_knowledge_source?: string
  bot_recommendations: BotRecommendations
  processing_time_ms?: number
  message_timestamp: string
}

// Request to get conversation history
export interface ConversationHistoryRequest {
  conversation_id: UUID
  user_id: UUID
  limit?: number
  offset?: number
}

// Response with conversation history
export interface ConversationHistoryResponse {
  conversation_id: UUID
  conversation_title?: string
  conversation_type: string
  language: string
  is_active: boolean
  total_messages: number
  last_activity: string
  messages: Array<{
    id: UUID
    message_text: string
    message_type: string
    message_role: string
    message_intent?: string
    bot_response_type?: string
    bot_confidence_score?: number
    bot_recommendations: BotRecommendations
    user_rating?: number
    user_feedback?: string
    is_helpful?: boolean
    message_timestamp: string
  }>
}

// Request to rate a bot response
export interface RateBotResponseRequest {
  message_id: UUID
  user_id: UUID
  rating: number // 1-5
  feedback?: string
  is_helpful?: boolean
}

// Response from rating bot response
export interface RateBotResponseResponse {
  message_id: UUID
  rating: number
  feedback?: string
  is_helpful?: boolean
  updated_at: string
}

// Request to get chatbot knowledge
export interface ChatbotKnowledgeRequest {
  category?: string
  subcategory?: string
  province?: string
  season?: string
  soil_type?: string
  rice_variety?: string
  limit?: number
  offset?: number
}

// Response with chatbot knowledge
export interface ChatbotKnowledgeResponse {
  knowledge: Array<{
    id: UUID
    knowledge_title: string
    knowledge_content: string
    knowledge_summary?: string
    knowledge_category: string
    knowledge_subcategory?: string
    applicable_provinces?: string[]
    applicable_seasons?: string[]
    applicable_soil_types?: string[]
    applicable_rice_varieties?: string[]
    knowledge_source: string
    knowledge_author?: string
    knowledge_version?: string
    knowledge_quality_score?: number
    usage_count: number
    effectiveness_score?: number
    is_active: boolean
    is_verified: boolean
  }>
}

// ============================================================================
// USER FARM PROFILE API TYPES
// ============================================================================

// Request to create farm profile
export interface CreateFarmProfileRequest {
  user_id: UUID
  farm_name: string
  province: string
  region: string
  municipality?: string
  barangay?: string
  farm_size_hectares: number
  rice_area_hectares: number
  soil_type: string
  soil_ph?: number
  irrigation_type?: string
  elevation_meters?: number
  preferred_rice_variety?: string
  planting_season?: SeasonType
  farming_experience_years?: number
  farming_method?: string
  farmer_name?: string
  contact_number?: string
  email?: string
  address?: string
  notification_preferences?: {
    email?: boolean
    sms?: boolean
    push?: boolean
    frequency?: string
  }
  language_preference?: Language
  measurement_unit?: MeasurementUnit
  timezone?: string
}

// Response from creating farm profile
export interface CreateFarmProfileResponse {
  farm_profile_id: UUID
  farm_name: string
  province: string
  region: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

// Request to update farm profile
export interface UpdateFarmProfileRequest {
  farm_profile_id: UUID
  updates: Partial<Omit<CreateFarmProfileRequest, 'user_id'>>
}

// Response from updating farm profile
export interface UpdateFarmProfileResponse {
  farm_profile_id: UUID
  updated_at: string
  message: string
}

// Request to get farm profile
export interface GetFarmProfileRequest {
  user_id: UUID
}

// Response with farm profile
export interface GetFarmProfileResponse {
  farm_profile: {
    id: UUID
    user_id: UUID
    farm_name: string
    province: string
    region: string
    municipality?: string
    barangay?: string
    farm_size_hectares: number
    rice_area_hectares: number
    soil_type: string
    soil_ph?: number
    irrigation_type?: string
    elevation_meters?: number
    preferred_rice_variety?: string
    planting_season?: SeasonType
    farming_experience_years?: number
    farming_method?: string
    farmer_name?: string
    contact_number?: string
    email?: string
    address?: string
    notification_preferences: any
    language_preference: Language
    measurement_unit: MeasurementUnit
    timezone: string
    is_active: boolean
    is_verified: boolean
    verification_date?: string
    created_at: string
    updated_at: string
  }
}

// ============================================================================
// ANALYTICS API TYPES
// ============================================================================

// Request to track user interaction
export interface TrackInteractionRequest {
  user_id: UUID
  farm_profile_id?: UUID
  interaction_type: string
  interaction_subtype?: string
  interaction_session_id?: UUID
  user_location_province?: string
  user_location_region?: string
  interaction_context?: InteractionContext
  device_info?: DeviceInfo
  interaction_duration_seconds?: number
  interaction_success?: boolean
  user_satisfaction_score?: number
  feature_used?: string
  feature_version?: string
  feature_performance_ms?: number
  user_intent?: string
  user_flow_path?: string[]
  user_engagement_level?: string
}

// Response from tracking interaction
export interface TrackInteractionResponse {
  interaction_id: UUID
  interaction_timestamp: string
  message: string
}

// Request to get analytics
export interface GetAnalyticsRequest {
  user_id?: UUID
  farm_profile_id?: UUID
  interaction_type?: string
  feature_used?: string
  start_date?: string
  end_date?: string
  group_by?: string
  limit?: number
  offset?: number
}

// Response with analytics data
export interface GetAnalyticsResponse {
  analytics: Array<{
    interaction_type: string
    feature_used?: string
    count: number
    avg_duration?: number
    avg_satisfaction?: number
    success_rate?: number
    engagement_level?: string
  }>
  summary: {
    total_interactions: number
    unique_users: number
    avg_satisfaction: number
    most_used_feature: string
    most_engaged_users: number
  }
}

// ============================================================================
// DATA IMPORT/EXPORT API TYPES
// ============================================================================

// Request to import data
export interface ImportDataRequest {
  data_type: 'historical_geo_climatic' | 'farm_profiles' | 'weather_data' | 'chatbot_knowledge'
  file_format: 'csv' | 'excel' | 'json'
  file_data: string // Base64 encoded file data
  options?: {
    overwrite_existing?: boolean
    validate_data?: boolean
    skip_errors?: boolean
    batch_size?: number
  }
}

// Response from data import
export interface ImportDataResponse {
  import_id: UUID
  data_type: string
  total_records: number
  imported_records: number
  failed_records: number
  errors?: Array<{
    row: number
    field: string
    error: string
  }>
  import_status: 'completed' | 'processing' | 'failed'
  created_at: string
}

// Request to export data
export interface ExportDataRequest {
  data_type: 'historical_geo_climatic' | 'farm_profiles' | 'weather_data' | 'chatbot_knowledge'
  file_format: 'csv' | 'excel' | 'json'
  filters?: {
    province?: string
    region?: string
    start_date?: string
    end_date?: string
    [key: string]: any
  }
  columns?: string[]
}

// Response from data export
export interface ExportDataResponse {
  export_id: UUID
  data_type: string
  file_format: string
  total_records: number
  file_url?: string
  file_size?: number
  export_status: 'completed' | 'processing' | 'failed'
  expires_at: string
  created_at: string
}

// ============================================================================
// MAP API TYPES
// ============================================================================

// Request to get map data
export interface MapDataRequest {
  province?: string
  region?: string
  data_type: 'yield_predictions' | 'weather_data' | 'farm_profiles' | 'planting_windows'
  year?: number
  season?: SeasonType
}

// Response with map data
export interface MapDataResponse {
  data_type: string
  year?: number
  season?: SeasonType
  provinces: Array<{
    province: string
    region: string
    coordinates: {
      lat: number
      lng: number
    }
    data: {
      [key: string]: any
    }
    summary: {
      total_farms?: number
      avg_yield?: number
      total_area?: number
      weather_rating?: number
    }
  }>
  regional_summaries: Array<{
    region: string
    total_provinces: number
    total_farms: number
    avg_yield: number
    total_area: number
    weather_rating: number
  }>
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const API_ENDPOINTS = {
  // Yield Predictions
  YIELD_PREDICTIONS: '/api/predictions',
  PREDICTION_FACTORS: '/api/predictions/factors',
  PREDICTION_ACCURACY: '/api/predictions/accuracy',
  
  // Weather - Now using Open-Meteo API directly
  
  // Farm Profiles
  FARM_PROFILES: '/api/farm-profiles',
  
  // Analytics
  ANALYTICS_TRACK: '/api/analytics/track',
  ANALYTICS_GET: '/api/analytics',
  
  // Data Import/Export
  DATA_IMPORT: '/api/data/import',
  DATA_EXPORT: '/api/data/export',
  
  // Map
  MAP_DATA: '/api/map/data'
} as const

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
} as const

export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

