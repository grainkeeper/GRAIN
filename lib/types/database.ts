// GrainKeeper Database Types
// Generated from lib/database/schema.sql

// ============================================================================
// BASE TYPES
// ============================================================================

export type UUID = string
export type Timestamp = string // ISO 8601 timestamp
export type DateString = string // YYYY-MM-DD format
export type TimeString = string // HH:MM:SS format

// ============================================================================
// ENUM TYPES
// ============================================================================

export type SeasonType = 'Wet Season' | 'Dry Season'
export type DataSource = 'PAGASA' | 'PSA' | 'PhilRice'
export type WeatherApiSource = 'OpenWeatherMap' | 'PAGASA' | 'AccuWeather'
export type ForecastPeriod = 'hourly' | 'daily' | 'weekly'
export type AlertSeverity = 'Low' | 'Moderate' | 'High' | 'Critical'
export type AgriculturalImpactLevel = 'Low' | 'Moderate' | 'High' | 'Severe'
export type ConversationType = 'general' | 'yield_advice' | 'weather_help' | 'pest_control'
export type MessageType = 'user' | 'bot' | 'system'
export type MessageRole = 'user' | 'assistant' | 'system'
export type BotResponseType = 'text' | 'recommendation' | 'chart' | 'link'
export type RuleType = 'keyword' | 'regex' | 'intent' | 'entity'
export type UserEngagementLevel = 'low' | 'medium' | 'high'
export type Language = 'en' | 'fil'
export type MeasurementUnit = 'metric' | 'imperial'
export type PredictionStatus = 'generated' | 'validated' | 'actual_recorded'

// ============================================================================
// JSONB INTERFACE TYPES
// ============================================================================

export interface NotificationPreferences {
  email?: boolean
  sms?: boolean
  push?: boolean
  frequency?: 'immediate' | 'daily' | 'weekly'
}

export interface WeatherForecastData {
  temperature?: {
    min: number
    max: number
    avg: number
  }
  rainfall?: {
    amount: number
    probability: number
  }
  humidity?: {
    min: number
    max: number
    avg: number
  }
  wind?: {
    speed: number
    direction: string
  }
  [key: string]: any
}

export interface HistoricalWeatherData {
  temperature_trends?: number[]
  rainfall_patterns?: number[]
  seasonal_averages?: {
    temperature: number
    rainfall: number
    humidity: number
  }
  [key: string]: any
}

export interface PredictionFactors {
  temperature_impact?: number
  rainfall_impact?: number
  soil_impact?: number
  variety_impact?: number
  historical_impact?: number
  [key: string]: any
}

export interface UserFarmContext {
  farm_size?: number
  soil_type?: string
  rice_variety?: string
  irrigation_type?: string
  elevation?: number
  [key: string]: any
}

export interface WeatherContext {
  current_temperature?: number
  current_humidity?: number
  rainfall_24h?: number
  forecast?: WeatherForecastData
  [key: string]: any
}

export interface MessageContext {
  attachments?: string[]
  metadata?: Record<string, any>
  [key: string]: any
}

export interface MessageEntities {
  location?: string
  crop_type?: string
  soil_type?: string
  weather_condition?: string
  [key: string]: any
}

export interface BotRecommendations {
  actions?: string[]
  resources?: string[]
  warnings?: string[]
  [key: string]: any
}

export interface RuleConditions {
  location?: string[]
  season?: string[]
  soil_type?: string[]
  [key: string]: any
}

export interface RuleActions {
  response_template?: string
  knowledge_base_ids?: UUID[]
  follow_up_questions?: string[]
  [key: string]: any
}

export interface InteractionContext {
  page?: string
  feature?: string
  user_agent?: string
  [key: string]: any
}

export interface DeviceInfo {
  browser?: string
  os?: string
  device_type?: string
  screen_resolution?: string
  [key: string]: any
}

export interface TrainingEntities {
  location?: string
  crop_type?: string
  soil_type?: string
  weather_condition?: string
  [key: string]: any
}

export interface CalculationFactors {
  temperature_weight?: number
  rainfall_weight?: number
  soil_weight?: number
  historical_weight?: number
  [key: string]: any
}

// ============================================================================
// DATABASE TABLE TYPES
// ============================================================================

// Historical Geo-climatic Data
export interface HistoricalGeoClimaticData {
  id: UUID
  province: string
  region: string
  date: DateString
  year: number
  month: number
  
  // Weather Data
  temperature_avg?: number
  temperature_max?: number
  temperature_min?: number
  rainfall_mm?: number
  humidity_avg?: number
  wind_speed_avg?: number
  wind_direction?: string
  dew_point?: number
  solar_radiation?: number
  
  // Agricultural Data
  rice_yield_actual?: number
  rice_area_planted?: number
  rice_area_harvested?: number
  rice_production_volume?: number
  
  // Soil Data
  soil_type?: string
  soil_ph?: number
  soil_moisture?: number
  
  // Statistical Data
  population_density?: number
  agricultural_land_area?: number
  irrigation_coverage?: number
  
  // Metadata
  data_source: DataSource
  data_quality_score?: number
  created_at: Timestamp
  updated_at: Timestamp
}

// User Farm Profiles
export interface UserFarmProfile {
  id: UUID
  user_id: UUID
  farm_name: string
  province: string
  region: string
  municipality?: string
  barangay?: string
  
  // Farm Details
  farm_size_hectares: number
  rice_area_hectares: number
  soil_type: string
  soil_ph?: number
  irrigation_type?: string
  elevation_meters?: number
  
  // Farming Practices
  preferred_rice_variety?: string
  planting_season?: SeasonType
  farming_experience_years?: number
  farming_method?: string
  
  // Contact Information
  farmer_name?: string
  contact_number?: string
  email?: string
  address?: string
  
  // Preferences and Settings
  notification_preferences: NotificationPreferences
  language_preference: Language
  measurement_unit: MeasurementUnit
  timezone: string
  
  // Status and Metadata
  is_active: boolean
  is_verified: boolean
  verification_date?: Timestamp
  created_at: Timestamp
  updated_at: Timestamp
}

// Farm Historical Performance
export interface FarmHistoricalPerformance {
  id: UUID
  farm_profile_id: UUID
  season_year: number
  season_type: SeasonType
  
  // Planting Information
  planting_date?: DateString
  harvest_date?: DateString
  rice_variety_used?: string
  area_planted_hectares?: number
  area_harvested_hectares?: number
  
  // Yield Results
  actual_yield_tons_per_hectare?: number
  total_production_tons?: number
  predicted_yield_tons_per_hectare?: number
  prediction_accuracy_percentage?: number
  
  // Farming Inputs
  fertilizer_usage_kg_per_hectare?: number
  pesticide_usage_liters_per_hectare?: number
  irrigation_hours_per_week?: number
  
  // Weather Conditions
  avg_temperature_celsius?: number
  total_rainfall_mm?: number
  weather_conditions_rating?: number
  
  // Notes and Observations
  notes?: string
  challenges_faced?: string
  lessons_learned?: string
  
  // Metadata
  created_at: Timestamp
  updated_at: Timestamp
}

// Yield Predictions
export interface YieldPrediction {
  id: UUID
  farm_profile_id: UUID
  user_id: UUID
  
  // Prediction Request Details
  prediction_date: Timestamp
  target_season_year: number
  target_season_type: SeasonType
  target_planting_date?: DateString
  target_harvest_date?: DateString
  
  // Input Parameters
  rice_variety: string
  soil_type: string
  soil_ph?: number
  farm_size_hectares: number
  rice_area_hectares: number
  irrigation_type?: string
  elevation_meters?: number
  
  // Weather Forecast Data
  weather_forecast_data: WeatherForecastData
  historical_weather_data: HistoricalWeatherData
  
  // Prediction Results
  predicted_yield_tons_per_hectare: number
  confidence_interval_lower?: number
  confidence_interval_upper?: number
  confidence_level?: number
  
  // Model Information
  model_version: string
  model_accuracy_score?: number
  prediction_factors: PredictionFactors
  
  // Status and Metadata
  prediction_status: PredictionStatus
  is_archived: boolean
  created_at: Timestamp
  updated_at: Timestamp
}

// Prediction Factor Explanations
export interface PredictionFactorExplanation {
  id: UUID
  prediction_id: UUID
  
  // Factor Details
  factor_name: string
  factor_value?: number
  factor_unit?: string
  factor_description?: string
  
  // Impact Analysis
  impact_score?: number
  impact_percentage?: number
  impact_explanation?: string
  
  // Factor Category
  factor_category?: string
  factor_importance_rank?: number
  
  // Metadata
  created_at: Timestamp
}

// Prediction Accuracy Tracking
export interface PredictionAccuracyTracking {
  id: UUID
  prediction_id: UUID
  farm_profile_id: UUID
  
  // Actual Results
  actual_yield_tons_per_hectare?: number
  actual_harvest_date?: DateString
  actual_planting_date?: DateString
  
  // Accuracy Metrics
  prediction_error?: number
  prediction_error_percentage?: number
  accuracy_score?: number
  
  // Validation Data
  validation_notes?: string
  validation_date?: Timestamp
  validated_by?: UUID
  
  // Metadata
  created_at: Timestamp
  updated_at: Timestamp
}

// Real-time Weather Data
export interface RealTimeWeatherData {
  id: UUID
  province: string
  region: string
  municipality?: string
  
  // Weather Data
  temperature_current: number
  temperature_feels_like?: number
  temperature_max?: number
  temperature_min?: number
  humidity_percentage: number
  pressure_hpa?: number
  visibility_km?: number
  
  // Wind Data
  wind_speed_kmh?: number
  wind_direction_degrees?: number
  wind_direction_cardinal?: string
  wind_gust_kmh?: number
  
  // Precipitation Data
  rainfall_1h_mm?: number
  rainfall_3h_mm?: number
  rainfall_24h_mm?: number
  precipitation_probability?: number
  
  // Additional Weather Data
  uv_index?: number
  cloud_cover_percentage?: number
  dew_point_celsius?: number
  sunrise_time?: TimeString
  sunset_time?: TimeString
  
  // Data Source and Quality
  weather_api_source: WeatherApiSource
  data_quality_score?: number
  last_updated: Timestamp
  created_at: Timestamp
}

// Weather Forecast Data
export interface WeatherForecastData {
  id: UUID
  province: string
  region: string
  municipality?: string
  forecast_date: DateString
  forecast_hour?: number
  
  // Forecast Weather Data
  temperature_avg?: number
  temperature_max?: number
  temperature_min?: number
  humidity_percentage?: number
  pressure_hpa?: number
  
  // Wind Forecast
  wind_speed_kmh?: number
  wind_direction_degrees?: number
  wind_direction_cardinal?: string
  
  // Precipitation Forecast
  rainfall_probability?: number
  rainfall_amount_mm?: number
  precipitation_type?: string
  
  // Additional Forecast Data
  uv_index?: number
  cloud_cover_percentage?: number
  visibility_km?: number
  
  // Forecast Metadata
  forecast_period: ForecastPeriod
  weather_api_source: WeatherApiSource
  confidence_level?: number
  created_at: Timestamp
}

// Planting Windows
export interface PlantingWindow {
  id: UUID
  province: string
  region: string
  season_year: number
  season_type: SeasonType
  
  // Optimal Planting Window
  optimal_start_date: DateString
  optimal_end_date: DateString
  optimal_duration_days: number
  
  // Alternative Windows
  early_start_date?: DateString
  early_end_date?: DateString
  late_start_date?: DateString
  late_end_date?: DateString
  
  // Weather Conditions During Window
  avg_temperature_during_window?: number
  total_rainfall_during_window?: number
  weather_conditions_rating?: number
  
  // Yield Impact Analysis
  expected_yield_impact?: number
  yield_impact_explanation?: string
  
  // Calculation Factors
  calculation_factors: CalculationFactors
  model_version: string
  confidence_score?: number
  
  // Status and Metadata
  is_active: boolean
  created_at: Timestamp
  updated_at: Timestamp
}

// Weather Alerts
export interface WeatherAlert {
  id: UUID
  province: string
  region: string
  municipality?: string
  
  // Alert Details
  alert_type: string
  alert_severity: AlertSeverity
  alert_title: string
  alert_description: string
  
  // Alert Timing
  alert_start_time: Timestamp
  alert_end_time: Timestamp
  alert_duration_hours?: number
  
  // Impact Assessment
  agricultural_impact_level?: AgriculturalImpactLevel
  impact_description?: string
  recommended_actions?: string
  
  // Data Source
  alert_source: WeatherApiSource
  external_alert_id?: string
  
  // Status
  is_active: boolean
  is_sent_to_users: boolean
  created_at: Timestamp
  updated_at: Timestamp
}

// Chatbot Conversations
export interface ChatbotConversation {
  id: UUID
  user_id: UUID
  farm_profile_id?: UUID
  
  // Conversation Details
  conversation_title?: string
  conversation_type: ConversationType
  language: Language
  
  // Context Information
  user_location_province?: string
  user_location_region?: string
  user_farm_context: UserFarmContext
  weather_context: WeatherContext
  
  // Conversation Status
  is_active: boolean
  is_archived: boolean
  total_messages: number
  last_activity: Timestamp
  
  // Metadata
  created_at: Timestamp
  updated_at: Timestamp
}

// Chatbot Messages
export interface ChatbotMessage {
  id: UUID
  conversation_id: UUID
  user_id: UUID
  
  // Message Content
  message_text: string
  message_type: MessageType
  message_role: MessageRole
  
  // Message Context
  message_context: MessageContext
  message_intent?: string
  message_entities: MessageEntities
  
  // Bot Response Data
  bot_response_type?: BotResponseType
  bot_confidence_score?: number
  bot_knowledge_source?: string
  bot_recommendations: BotRecommendations
  
  // User Feedback
  user_rating?: number
  user_feedback?: string
  is_helpful?: boolean
  
  // Message Metadata
  message_timestamp: Timestamp
  processing_time_ms?: number
  created_at: Timestamp
}

// Chatbot Knowledge Base
export interface ChatbotKnowledgeBase {
  id: UUID
  
  // Knowledge Content
  knowledge_title: string
  knowledge_content: string
  knowledge_summary?: string
  knowledge_category: string
  knowledge_subcategory?: string
  
  // Knowledge Context
  applicable_provinces?: string[]
  applicable_seasons?: string[]
  applicable_soil_types?: string[]
  applicable_rice_varieties?: string[]
  
  // Knowledge Metadata
  knowledge_source: string
  knowledge_author?: string
  knowledge_version?: string
  knowledge_quality_score?: number
  
  // Usage Tracking
  usage_count: number
  last_used?: Timestamp
  effectiveness_score?: number
  
  // Status
  is_active: boolean
  is_verified: boolean
  verified_by?: UUID
  verified_date?: Timestamp
  
  // Metadata
  created_at: Timestamp
  updated_at: Timestamp
}

// Chatbot Rules and Patterns
export interface ChatbotRulesPatterns {
  id: UUID
  
  // Rule Definition
  rule_name: string
  rule_description?: string
  rule_pattern: string
  rule_type: RuleType
  
  // Rule Response
  rule_response: string
  rule_response_template: Record<string, any>
  rule_confidence_threshold: number
  
  // Rule Context
  rule_category?: string
  rule_priority: number
  rule_conditions: RuleConditions
  
  // Rule Actions
  rule_actions: RuleActions
  rule_follow_up_questions?: string[]
  rule_knowledge_base_ids?: UUID[]
  
  // Usage and Performance
  usage_count: number
  success_rate?: number
  average_response_time_ms?: number
  
  // Status
  is_active: boolean
  is_testing: boolean
  
  // Metadata
  created_at: Timestamp
  updated_at: Timestamp
}

// User Interaction Analytics
export interface UserInteractionAnalytics {
  id: UUID
  user_id: UUID
  farm_profile_id?: UUID
  
  // Interaction Details
  interaction_type: string
  interaction_subtype?: string
  interaction_session_id?: UUID
  
  // Interaction Context
  user_location_province?: string
  user_location_region?: string
  interaction_context: InteractionContext
  device_info: DeviceInfo
  
  // Interaction Metrics
  interaction_duration_seconds?: number
  interaction_success?: boolean
  user_satisfaction_score?: number
  
  // Feature Usage
  feature_used?: string
  feature_version?: string
  feature_performance_ms?: number
  
  // User Behavior
  user_intent?: string
  user_flow_path?: string[]
  user_engagement_level?: UserEngagementLevel
  
  // Timestamp
  interaction_timestamp: Timestamp
  created_at: Timestamp
}

// Chatbot Training Data
export interface ChatbotTrainingData {
  id: UUID
  
  // Training Data
  training_question: string
  training_answer: string
  training_intent: string
  training_entities: TrainingEntities
  
  // Data Context
  data_category?: string
  data_subcategory?: string
  data_language: Language
  
  // Data Quality
  data_source?: string
  data_quality_score?: number
  data_verified: boolean
  
  // Usage Tracking
  usage_count: number
  last_used_in_training?: Timestamp
  training_effectiveness?: number
  
  // Status
  is_active: boolean
  is_archived: boolean
  
  // Metadata
  created_at: Timestamp
  updated_at: Timestamp
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type InsertHistoricalGeoClimaticData = Omit<HistoricalGeoClimaticData, 'id' | 'created_at' | 'updated_at'>
export type InsertUserFarmProfile = Omit<UserFarmProfile, 'id' | 'created_at' | 'updated_at'>
export type InsertFarmHistoricalPerformance = Omit<FarmHistoricalPerformance, 'id' | 'created_at' | 'updated_at'>
export type InsertYieldPrediction = Omit<YieldPrediction, 'id' | 'created_at' | 'updated_at'>
export type InsertPredictionFactorExplanation = Omit<PredictionFactorExplanation, 'id' | 'created_at'>
export type InsertPredictionAccuracyTracking = Omit<PredictionAccuracyTracking, 'id' | 'created_at' | 'updated_at'>
export type InsertRealTimeWeatherData = Omit<RealTimeWeatherData, 'id' | 'created_at'>
export type InsertWeatherForecastData = Omit<WeatherForecastData, 'id' | 'created_at'>
export type InsertPlantingWindow = Omit<PlantingWindow, 'id' | 'created_at' | 'updated_at'>
export type InsertWeatherAlert = Omit<WeatherAlert, 'id' | 'created_at' | 'updated_at'>
export type InsertChatbotConversation = Omit<ChatbotConversation, 'id' | 'created_at' | 'updated_at'>
export type InsertChatbotMessage = Omit<ChatbotMessage, 'id' | 'created_at'>
export type InsertChatbotKnowledgeBase = Omit<ChatbotKnowledgeBase, 'id' | 'created_at' | 'updated_at'>
export type InsertChatbotRulesPatterns = Omit<ChatbotRulesPatterns, 'id' | 'created_at' | 'updated_at'>
export type InsertUserInteractionAnalytics = Omit<UserInteractionAnalytics, 'id' | 'created_at'>
export type InsertChatbotTrainingData = Omit<ChatbotTrainingData, 'id' | 'created_at' | 'updated_at'>

// ============================================================================
// UPDATE TYPES (for updating existing records)
// ============================================================================

export type UpdateHistoricalGeoClimaticData = Partial<Omit<HistoricalGeoClimaticData, 'id' | 'created_at' | 'updated_at'>>
export type UpdateUserFarmProfile = Partial<Omit<UserFarmProfile, 'id' | 'created_at' | 'updated_at'>>
export type UpdateFarmHistoricalPerformance = Partial<Omit<FarmHistoricalPerformance, 'id' | 'created_at' | 'updated_at'>>
export type UpdateYieldPrediction = Partial<Omit<YieldPrediction, 'id' | 'created_at' | 'updated_at'>>
export type UpdatePredictionFactorExplanation = Partial<Omit<PredictionFactorExplanation, 'id' | 'created_at'>>
export type UpdatePredictionAccuracyTracking = Partial<Omit<PredictionAccuracyTracking, 'id' | 'created_at' | 'updated_at'>>
export type UpdateRealTimeWeatherData = Partial<Omit<RealTimeWeatherData, 'id' | 'created_at'>>
export type UpdateWeatherForecastData = Partial<Omit<WeatherForecastData, 'id' | 'created_at'>>
export type UpdatePlantingWindow = Partial<Omit<PlantingWindow, 'id' | 'created_at' | 'updated_at'>>
export type UpdateWeatherAlert = Partial<Omit<WeatherAlert, 'id' | 'created_at' | 'updated_at'>>
export type UpdateChatbotConversation = Partial<Omit<ChatbotConversation, 'id' | 'created_at' | 'updated_at'>>
export type UpdateChatbotMessage = Partial<Omit<ChatbotMessage, 'id' | 'created_at'>>
export type UpdateChatbotKnowledgeBase = Partial<Omit<ChatbotKnowledgeBase, 'id' | 'created_at' | 'updated_at'>>
export type UpdateChatbotRulesPatterns = Partial<Omit<ChatbotRulesPatterns, 'id' | 'created_at' | 'updated_at'>>
export type UpdateUserInteractionAnalytics = Partial<Omit<UserInteractionAnalytics, 'id' | 'created_at'>>
export type UpdateChatbotTrainingData = Partial<Omit<ChatbotTrainingData, 'id' | 'created_at' | 'updated_at'>>

// ============================================================================
// DATABASE SCHEMA TYPE (for Supabase)
// ============================================================================

export interface DatabaseSchema {
  public: {
    Tables: {
      historical_geo_climatic_data: {
        Row: HistoricalGeoClimaticData
        Insert: InsertHistoricalGeoClimaticData
        Update: UpdateHistoricalGeoClimaticData
      }
      user_farm_profiles: {
        Row: UserFarmProfile
        Insert: InsertUserFarmProfile
        Update: UpdateUserFarmProfile
      }
      farm_historical_performance: {
        Row: FarmHistoricalPerformance
        Insert: InsertFarmHistoricalPerformance
        Update: UpdateFarmHistoricalPerformance
      }
      yield_predictions: {
        Row: YieldPrediction
        Insert: InsertYieldPrediction
        Update: UpdateYieldPrediction
      }
      prediction_factor_explanations: {
        Row: PredictionFactorExplanation
        Insert: InsertPredictionFactorExplanation
        Update: UpdatePredictionFactorExplanation
      }
      prediction_accuracy_tracking: {
        Row: PredictionAccuracyTracking
        Insert: InsertPredictionAccuracyTracking
        Update: UpdatePredictionAccuracyTracking
      }
      real_time_weather_data: {
        Row: RealTimeWeatherData
        Insert: InsertRealTimeWeatherData
        Update: UpdateRealTimeWeatherData
      }
      weather_forecast_data: {
        Row: WeatherForecastData
        Insert: InsertWeatherForecastData
        Update: UpdateWeatherForecastData
      }
      planting_windows: {
        Row: PlantingWindow
        Insert: InsertPlantingWindow
        Update: UpdatePlantingWindow
      }
      weather_alerts: {
        Row: WeatherAlert
        Insert: InsertWeatherAlert
        Update: UpdateWeatherAlert
      }
      chatbot_conversations: {
        Row: ChatbotConversation
        Insert: InsertChatbotConversation
        Update: UpdateChatbotConversation
      }
      chatbot_messages: {
        Row: ChatbotMessage
        Insert: InsertChatbotMessage
        Update: UpdateChatbotMessage
      }
      chatbot_knowledge_base: {
        Row: ChatbotKnowledgeBase
        Insert: InsertChatbotKnowledgeBase
        Update: UpdateChatbotKnowledgeBase
      }
      chatbot_rules_patterns: {
        Row: ChatbotRulesPatterns
        Insert: InsertChatbotRulesPatterns
        Update: UpdateChatbotRulesPatterns
      }
      user_interaction_analytics: {
        Row: UserInteractionAnalytics
        Insert: InsertUserInteractionAnalytics
        Update: UpdateUserInteractionAnalytics
      }
      chatbot_training_data: {
        Row: ChatbotTrainingData
        Insert: InsertChatbotTrainingData
        Update: UpdateChatbotTrainingData
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Type for database client with our schema
export type DatabaseClient = any

// Type for table names
export type TableName = keyof DatabaseSchema['public']['Tables']

// Type for getting table row type
export type TableRow<T extends TableName> = DatabaseSchema['public']['Tables'][T]['Row']

// Type for getting table insert type
export type TableInsert<T extends TableName> = DatabaseSchema['public']['Tables'][T]['Insert']

// Type for getting table update type
export type TableUpdate<T extends TableName> = DatabaseSchema['public']['Tables'][T]['Update']

// Type for database query results
export type QueryResult<T> = {
  data: T[] | null
  error: any
  count: number | null
}

// Type for single record query results
export type SingleQueryResult<T> = {
  data: T | null
  error: any
}

// Type for database operations
export type DatabaseOperation = 'select' | 'insert' | 'update' | 'delete' | 'upsert'

// Type for filter conditions
export type FilterCondition<T> = {
  column: keyof T
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'not.in'
  value: any
}

// Type for sort options
export type SortOption<T> = {
  column: keyof T
  ascending?: boolean
}

// Type for pagination
export type PaginationOptions = {
  page?: number
  pageSize?: number
  limit?: number
  offset?: number
}

// Type for query options
export type QueryOptions<T> = {
  filters?: FilterCondition<T>[]
  sort?: SortOption<T>[]
  pagination?: PaginationOptions
  select?: (keyof T)[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TABLE_NAMES = {
  HISTORICAL_GEO_CLIMATIC_DATA: 'historical_geo_climatic_data',
  USER_FARM_PROFILES: 'user_farm_profiles',
  FARM_HISTORICAL_PERFORMANCE: 'farm_historical_performance',
  YIELD_PREDICTIONS: 'yield_predictions',
  PREDICTION_FACTOR_EXPLANATIONS: 'prediction_factor_explanations',
  PREDICTION_ACCURACY_TRACKING: 'prediction_accuracy_tracking',
  REAL_TIME_WEATHER_DATA: 'real_time_weather_data',
  WEATHER_FORECAST_DATA: 'weather_forecast_data',
  PLANTING_WINDOWS: 'planting_windows',
  WEATHER_ALERTS: 'weather_alerts',
  CHATBOT_CONVERSATIONS: 'chatbot_conversations',
  CHATBOT_MESSAGES: 'chatbot_messages',
  CHATBOT_KNOWLEDGE_BASE: 'chatbot_knowledge_base',
  CHATBOT_RULES_PATTERNS: 'chatbot_rules_patterns',
  USER_INTERACTION_ANALYTICS: 'user_interaction_analytics',
  CHATBOT_TRAINING_DATA: 'chatbot_training_data'
} as const

export const SEASON_TYPES: SeasonType[] = ['Wet Season', 'Dry Season']
export const DATA_SOURCES: DataSource[] = ['PAGASA', 'PSA', 'PhilRice']
export const WEATHER_API_SOURCES: WeatherApiSource[] = ['OpenWeatherMap', 'PAGASA', 'AccuWeather']
export const FORECAST_PERIODS: ForecastPeriod[] = ['hourly', 'daily', 'weekly']
export const ALERT_SEVERITIES: AlertSeverity[] = ['Low', 'Moderate', 'High', 'Critical']
export const AGRICULTURAL_IMPACT_LEVELS: AgriculturalImpactLevel[] = ['Low', 'Moderate', 'High', 'Severe']
export const CONVERSATION_TYPES: ConversationType[] = ['general', 'yield_advice', 'weather_help', 'pest_control']
export const MESSAGE_TYPES: MessageType[] = ['user', 'bot', 'system']
export const MESSAGE_ROLES: MessageRole[] = ['user', 'assistant', 'system']
export const BOT_RESPONSE_TYPES: BotResponseType[] = ['text', 'recommendation', 'chart', 'link']
export const RULE_TYPES: RuleType[] = ['keyword', 'regex', 'intent', 'entity']
export const USER_ENGAGEMENT_LEVELS: UserEngagementLevel[] = ['low', 'medium', 'high']
export const LANGUAGES: Language[] = ['en', 'fil']
export const MEASUREMENT_UNITS: MeasurementUnit[] = ['metric', 'imperial']
export const PREDICTION_STATUSES: PredictionStatus[] = ['generated', 'validated', 'actual_recorded']
