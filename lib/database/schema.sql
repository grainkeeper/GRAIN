-- GrainKeeper Database Schema
-- Historical Geo-climatic Data (2010-2024)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Historical Geo-climatic Data Table
CREATE TABLE historical_geo_climatic_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    
    -- Weather Data (from PAGASA)
    temperature_avg DECIMAL(4,1), -- Average temperature in Celsius
    temperature_max DECIMAL(4,1), -- Maximum temperature in Celsius
    temperature_min DECIMAL(4,1), -- Minimum temperature in Celsius
    rainfall_mm DECIMAL(6,2), -- Rainfall in millimeters
    humidity_avg DECIMAL(4,1), -- Average humidity percentage
    wind_speed_avg DECIMAL(4,1), -- Average wind speed in km/h
    wind_direction VARCHAR(10), -- Wind direction (N, S, E, W, NE, etc.)
    dew_point DECIMAL(4,1), -- Dew point temperature in Celsius
    solar_radiation DECIMAL(6,2), -- Solar radiation in MJ/m²/day
    
    -- Agricultural Data (from PhilRice)
    rice_yield_actual DECIMAL(6,2), -- Actual rice yield in tons per hectare
    rice_area_planted DECIMAL(8,2), -- Area planted in hectares
    rice_area_harvested DECIMAL(8,2), -- Area harvested in hectares
    rice_production_volume DECIMAL(10,2), -- Total production volume in tons
    
    -- Soil Data
    soil_type VARCHAR(50), -- Clay Loam, Silty Clay, Loam, Sandy Loam
    soil_ph DECIMAL(3,1), -- Soil pH level
    soil_moisture DECIMAL(4,1), -- Soil moisture percentage
    
    -- Statistical Data (from PSA)
    population_density DECIMAL(8,2), -- Population per square kilometer
    agricultural_land_area DECIMAL(10,2), -- Total agricultural land in hectares
    irrigation_coverage DECIMAL(5,2), -- Percentage of irrigated land
    
    -- Metadata
    data_source VARCHAR(20) NOT NULL, -- 'PAGASA', 'PSA', 'PhilRice'
    data_quality_score DECIMAL(3,2), -- Data quality score (0.00-1.00)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Farm Profiles and Preferences Table
CREATE TABLE user_farm_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_name VARCHAR(200) NOT NULL,
    province VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    municipality VARCHAR(100),
    barangay VARCHAR(100),
    
    -- Farm Details
    farm_size_hectares DECIMAL(8,2) NOT NULL, -- Total farm size in hectares
    rice_area_hectares DECIMAL(8,2) NOT NULL, -- Area dedicated to rice in hectares
    soil_type VARCHAR(50) NOT NULL, -- Clay Loam, Silty Clay, Loam, Sandy Loam
    soil_ph DECIMAL(3,1), -- Soil pH level
    irrigation_type VARCHAR(50), -- Irrigated, Rainfed, Upland
    elevation_meters INTEGER, -- Elevation above sea level in meters
    
    -- Farming Practices
    preferred_rice_variety VARCHAR(100), -- IR64, NSIC Rc 160, PSB Rc 82, Mestizo 1
    planting_season VARCHAR(20), -- Wet Season, Dry Season, Both
    farming_experience_years INTEGER, -- Years of farming experience
    farming_method VARCHAR(50), -- Traditional, Modern, Organic, Hybrid
    
    -- Contact Information
    farmer_name VARCHAR(200),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    
    -- Preferences and Settings
    notification_preferences JSONB DEFAULT '{}', -- Email, SMS, Push notifications
    language_preference VARCHAR(10) DEFAULT 'en', -- en, fil (English, Filipino)
    measurement_unit VARCHAR(10) DEFAULT 'metric', -- metric, imperial
    timezone VARCHAR(50) DEFAULT 'Asia/Manila',
    
    -- Status and Metadata
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm Historical Performance Table
CREATE TABLE farm_historical_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_profile_id UUID NOT NULL REFERENCES user_farm_profiles(id) ON DELETE CASCADE,
    season_year INTEGER NOT NULL,
    season_type VARCHAR(20) NOT NULL, -- Wet Season, Dry Season
    
    -- Planting Information
    planting_date DATE,
    harvest_date DATE,
    rice_variety_used VARCHAR(100),
    area_planted_hectares DECIMAL(8,2),
    area_harvested_hectares DECIMAL(8,2),
    
    -- Yield Results
    actual_yield_tons_per_hectare DECIMAL(6,2),
    total_production_tons DECIMAL(8,2),
    predicted_yield_tons_per_hectare DECIMAL(6,2),
    prediction_accuracy_percentage DECIMAL(5,2),
    
    -- Farming Inputs
    fertilizer_usage_kg_per_hectare DECIMAL(6,2),
    pesticide_usage_liters_per_hectare DECIMAL(6,2),
    irrigation_hours_per_week DECIMAL(4,1),
    
    -- Weather Conditions
    avg_temperature_celsius DECIMAL(4,1),
    total_rainfall_mm DECIMAL(6,2),
    weather_conditions_rating INTEGER CHECK (weather_conditions_rating >= 1 AND weather_conditions_rating <= 5),
    
    -- Notes and Observations
    notes TEXT,
    challenges_faced TEXT,
    lessons_learned TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yield Predictions Table
CREATE TABLE yield_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_profile_id UUID NOT NULL REFERENCES user_farm_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Prediction Request Details
    prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_season_year INTEGER NOT NULL,
    target_season_type VARCHAR(20) NOT NULL, -- Wet Season, Dry Season
    target_planting_date DATE,
    target_harvest_date DATE,
    
    -- Input Parameters
    rice_variety VARCHAR(100) NOT NULL,
    soil_type VARCHAR(50) NOT NULL,
    soil_ph DECIMAL(3,1),
    farm_size_hectares DECIMAL(8,2) NOT NULL,
    rice_area_hectares DECIMAL(8,2) NOT NULL,
    irrigation_type VARCHAR(50),
    elevation_meters INTEGER,
    
    -- Weather Forecast Data (JSONB for flexibility)
    weather_forecast_data JSONB DEFAULT '{}', -- Temperature, rainfall, humidity forecasts
    historical_weather_data JSONB DEFAULT '{}', -- Historical weather patterns
    
    -- Prediction Results
    predicted_yield_tons_per_hectare DECIMAL(6,2) NOT NULL,
    confidence_interval_lower DECIMAL(6,2),
    confidence_interval_upper DECIMAL(6,2),
    confidence_level DECIMAL(3,2), -- 0.00-1.00 (e.g., 0.95 for 95% confidence)
    
    -- Model Information
    model_version VARCHAR(50) NOT NULL, -- ML model version used
    model_accuracy_score DECIMAL(3,2), -- R² score or similar accuracy metric
    prediction_factors JSONB DEFAULT '{}', -- Factors that influenced the prediction
    
    -- Status and Metadata
    prediction_status VARCHAR(20) DEFAULT 'generated', -- generated, validated, actual_recorded
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prediction Factor Explanations Table
CREATE TABLE prediction_factor_explanations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID NOT NULL REFERENCES yield_predictions(id) ON DELETE CASCADE,
    
    -- Factor Details
    factor_name VARCHAR(100) NOT NULL, -- e.g., 'temperature', 'rainfall', 'soil_type'
    factor_value DECIMAL(8,4), -- Numerical value of the factor
    factor_unit VARCHAR(20), -- Unit of measurement
    factor_description TEXT, -- Human-readable description
    
    -- Impact Analysis
    impact_score DECIMAL(3,2), -- -1.00 to 1.00 (negative = negative impact, positive = positive impact)
    impact_percentage DECIMAL(5,2), -- Percentage contribution to final prediction
    impact_explanation TEXT, -- Why this factor has this impact
    
    -- Factor Category
    factor_category VARCHAR(50), -- weather, soil, farming_practice, historical
    factor_importance_rank INTEGER, -- Rank of importance (1 = most important)
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prediction Accuracy Tracking Table
CREATE TABLE prediction_accuracy_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID NOT NULL REFERENCES yield_predictions(id) ON DELETE CASCADE,
    farm_profile_id UUID NOT NULL REFERENCES user_farm_profiles(id) ON DELETE CASCADE,
    
    -- Actual Results (filled after harvest)
    actual_yield_tons_per_hectare DECIMAL(6,2),
    actual_harvest_date DATE,
    actual_planting_date DATE,
    
    -- Accuracy Metrics
    prediction_error DECIMAL(6,2), -- Difference between predicted and actual
    prediction_error_percentage DECIMAL(5,2), -- Percentage error
    accuracy_score DECIMAL(3,2), -- 0.00-1.00 accuracy score
    
    -- Validation Data
    validation_notes TEXT,
    validation_date TIMESTAMP WITH TIME ZONE,
    validated_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Weather Data Table
CREATE TABLE real_time_weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    municipality VARCHAR(100),
    
    -- Weather Data
    temperature_current DECIMAL(4,1) NOT NULL, -- Current temperature in Celsius
    temperature_feels_like DECIMAL(4,1), -- Feels like temperature
    temperature_max DECIMAL(4,1), -- Maximum temperature for the day
    temperature_min DECIMAL(4,1), -- Minimum temperature for the day
    humidity_percentage DECIMAL(4,1) NOT NULL, -- Current humidity percentage
    pressure_hpa DECIMAL(6,1), -- Atmospheric pressure in hectopascals
    visibility_km DECIMAL(4,1), -- Visibility in kilometers
    
    -- Wind Data
    wind_speed_kmh DECIMAL(4,1), -- Wind speed in km/h
    wind_direction_degrees INTEGER, -- Wind direction in degrees
    wind_direction_cardinal VARCHAR(10), -- Wind direction (N, S, E, W, NE, etc.)
    wind_gust_kmh DECIMAL(4,1), -- Wind gust speed in km/h
    
    -- Precipitation Data
    rainfall_1h_mm DECIMAL(6,2), -- Rainfall in last hour in mm
    rainfall_3h_mm DECIMAL(6,2), -- Rainfall in last 3 hours in mm
    rainfall_24h_mm DECIMAL(6,2), -- Rainfall in last 24 hours in mm
    precipitation_probability DECIMAL(3,1), -- Probability of precipitation (0-100%)
    
    -- Additional Weather Data
    uv_index DECIMAL(3,1), -- UV index
    cloud_cover_percentage DECIMAL(4,1), -- Cloud cover percentage
    dew_point_celsius DECIMAL(4,1), -- Dew point in Celsius
    sunrise_time TIME, -- Sunrise time
    sunset_time TIME, -- Sunset time
    
    -- Data Source and Quality
    weather_api_source VARCHAR(50) NOT NULL, -- OpenWeatherMap, PAGASA, etc.
    data_quality_score DECIMAL(3,2), -- Data quality score (0.00-1.00)
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather Forecast Data Table
CREATE TABLE weather_forecast_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    municipality VARCHAR(100),
    forecast_date DATE NOT NULL,
    forecast_hour INTEGER, -- Hour of the day (0-23), NULL for daily forecasts
    
    -- Forecast Weather Data
    temperature_avg DECIMAL(4,1), -- Average temperature
    temperature_max DECIMAL(4,1), -- Maximum temperature
    temperature_min DECIMAL(4,1), -- Minimum temperature
    humidity_percentage DECIMAL(4,1), -- Humidity percentage
    pressure_hpa DECIMAL(6,1), -- Atmospheric pressure
    
    -- Wind Forecast
    wind_speed_kmh DECIMAL(4,1), -- Wind speed
    wind_direction_degrees INTEGER, -- Wind direction in degrees
    wind_direction_cardinal VARCHAR(10), -- Wind direction cardinal
    
    -- Precipitation Forecast
    rainfall_probability DECIMAL(3,1), -- Probability of rainfall (0-100%)
    rainfall_amount_mm DECIMAL(6,2), -- Expected rainfall amount
    precipitation_type VARCHAR(20), -- Rain, Snow, Sleet, etc.
    
    -- Additional Forecast Data
    uv_index DECIMAL(3,1), -- UV index
    cloud_cover_percentage DECIMAL(4,1), -- Cloud cover
    visibility_km DECIMAL(4,1), -- Visibility
    
    -- Forecast Metadata
    forecast_period VARCHAR(20) NOT NULL, -- hourly, daily, weekly
    weather_api_source VARCHAR(50) NOT NULL, -- Data source
    confidence_level DECIMAL(3,2), -- Forecast confidence (0.00-1.00)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planting Windows Table
CREATE TABLE planting_windows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    season_year INTEGER NOT NULL,
    season_type VARCHAR(20) NOT NULL, -- Wet Season, Dry Season
    
    -- Optimal Planting Window
    optimal_start_date DATE NOT NULL,
    optimal_end_date DATE NOT NULL,
    optimal_duration_days INTEGER NOT NULL, -- Duration of optimal window in days
    
    -- Alternative Windows
    early_start_date DATE, -- Early planting window start
    early_end_date DATE, -- Early planting window end
    late_start_date DATE, -- Late planting window start
    late_end_date DATE, -- Late planting window end
    
    -- Weather Conditions During Window
    avg_temperature_during_window DECIMAL(4,1), -- Average temperature during optimal window
    total_rainfall_during_window DECIMAL(6,2), -- Total rainfall during optimal window
    weather_conditions_rating INTEGER CHECK (weather_conditions_rating >= 1 AND weather_conditions_rating <= 5),
    
    -- Yield Impact Analysis
    expected_yield_impact DECIMAL(3,2), -- Expected yield impact (0.00-1.00)
    yield_impact_explanation TEXT, -- Explanation of yield impact
    
    -- Calculation Factors
    calculation_factors JSONB DEFAULT '{}', -- Factors used in calculation
    model_version VARCHAR(50) NOT NULL, -- Model version used for calculation
    confidence_score DECIMAL(3,2), -- Confidence in the planting window (0.00-1.00)
    
    -- Status and Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather Alerts Table
CREATE TABLE weather_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    municipality VARCHAR(100),
    
    -- Alert Details
    alert_type VARCHAR(50) NOT NULL, -- Heavy Rain, Drought, Typhoon, Heat Wave, etc.
    alert_severity VARCHAR(20) NOT NULL, -- Low, Moderate, High, Critical
    alert_title VARCHAR(200) NOT NULL,
    alert_description TEXT NOT NULL,
    
    -- Alert Timing
    alert_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    alert_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    alert_duration_hours INTEGER, -- Duration in hours
    
    -- Impact Assessment
    agricultural_impact_level VARCHAR(20), -- Low, Moderate, High, Severe
    impact_description TEXT, -- Description of agricultural impact
    recommended_actions TEXT, -- Recommended actions for farmers
    
    -- Data Source
    alert_source VARCHAR(50) NOT NULL, -- PAGASA, OpenWeatherMap, etc.
    external_alert_id VARCHAR(100), -- External alert ID from source
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_sent_to_users BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_historical_data_province ON historical_geo_climatic_data(province);
CREATE INDEX idx_historical_data_date ON historical_geo_climatic_data(date);
CREATE INDEX idx_historical_data_year ON historical_geo_climatic_data(year);
CREATE INDEX idx_historical_data_region ON historical_geo_climatic_data(region);

CREATE INDEX idx_farm_profiles_province ON user_farm_profiles(province);
CREATE INDEX idx_farm_profiles_region ON user_farm_profiles(region);
CREATE INDEX idx_farm_profiles_soil_type ON user_farm_profiles(soil_type);
CREATE INDEX idx_farm_profiles_rice_variety ON user_farm_profiles(preferred_rice_variety);

CREATE INDEX idx_farm_performance_farm_id ON farm_historical_performance(farm_profile_id);
CREATE INDEX idx_farm_performance_season_year ON farm_historical_performance(season_year);
CREATE INDEX idx_farm_performance_yield ON farm_historical_performance(actual_yield_tons_per_hectare);

CREATE INDEX idx_yield_predictions_user_id ON yield_predictions(user_id);
CREATE INDEX idx_yield_predictions_farm_id ON yield_predictions(farm_profile_id);
CREATE INDEX idx_yield_predictions_season ON yield_predictions(target_season_year, target_season_type);
CREATE INDEX idx_yield_predictions_date ON yield_predictions(prediction_date);
CREATE INDEX idx_yield_predictions_status ON yield_predictions(prediction_status);

CREATE INDEX idx_prediction_factors_prediction_id ON prediction_factor_explanations(prediction_id);
CREATE INDEX idx_prediction_factors_category ON prediction_factor_explanations(factor_category);

CREATE INDEX idx_accuracy_tracking_farm_id ON prediction_accuracy_tracking(farm_profile_id);
CREATE INDEX idx_accuracy_tracking_accuracy ON prediction_accuracy_tracking(accuracy_score);

CREATE INDEX idx_weather_data_province ON real_time_weather_data(province);
CREATE INDEX idx_weather_data_region ON real_time_weather_data(region);
CREATE INDEX idx_weather_data_updated ON real_time_weather_data(last_updated);

CREATE INDEX idx_forecast_data_province ON weather_forecast_data(province);
CREATE INDEX idx_forecast_data_date ON weather_forecast_data(forecast_date);
CREATE INDEX idx_forecast_data_period ON weather_forecast_data(forecast_period);

CREATE INDEX idx_planting_windows_province ON planting_windows(province);
CREATE INDEX idx_planting_windows_season ON planting_windows(season_year, season_type);
CREATE INDEX idx_planting_windows_dates ON planting_windows(optimal_start_date, optimal_end_date);

CREATE INDEX idx_weather_alerts_province ON weather_alerts(province);
CREATE INDEX idx_weather_alerts_type ON weather_alerts(alert_type);
CREATE INDEX idx_weather_alerts_severity ON weather_alerts(alert_severity);
CREATE INDEX idx_weather_alerts_time ON weather_alerts(alert_start_time, alert_end_time);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_historical_data_updated_at 
    BEFORE UPDATE ON historical_geo_climatic_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_profiles_updated_at 
    BEFORE UPDATE ON user_farm_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_performance_updated_at 
    BEFORE UPDATE ON farm_historical_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_yield_predictions_updated_at 
    BEFORE UPDATE ON yield_predictions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accuracy_tracking_updated_at 
    BEFORE UPDATE ON prediction_accuracy_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planting_windows_updated_at 
    BEFORE UPDATE ON planting_windows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_alerts_updated_at 
    BEFORE UPDATE ON weather_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE historical_geo_climatic_data IS 'Historical geo-climatic data from 2010-2024 from PAGASA, PSA, and PhilRice sources';
COMMENT ON COLUMN historical_geo_climatic_data.temperature_avg IS 'Average daily temperature in Celsius';
COMMENT ON COLUMN historical_geo_climatic_data.rainfall_mm IS 'Daily rainfall in millimeters';
COMMENT ON COLUMN historical_geo_climatic_data.rice_yield_actual IS 'Actual rice yield in tons per hectare';
COMMENT ON COLUMN historical_geo_climatic_data.data_quality_score IS 'Data quality assessment score (0.00-1.00)';

COMMENT ON TABLE user_farm_profiles IS 'User farm profiles and preferences for personalized predictions';
COMMENT ON COLUMN user_farm_profiles.farm_size_hectares IS 'Total farm size in hectares';
COMMENT ON COLUMN user_farm_profiles.rice_area_hectares IS 'Area dedicated to rice cultivation in hectares';
COMMENT ON COLUMN user_farm_profiles.preferred_rice_variety IS 'Preferred rice variety for cultivation';
COMMENT ON COLUMN user_farm_profiles.notification_preferences IS 'JSON object containing notification preferences';

COMMENT ON TABLE farm_historical_performance IS 'Historical performance data for individual farms';
COMMENT ON COLUMN farm_historical_performance.actual_yield_tons_per_hectare IS 'Actual yield achieved in tons per hectare';
COMMENT ON COLUMN farm_historical_performance.prediction_accuracy_percentage IS 'Accuracy of yield prediction compared to actual yield';
COMMENT ON COLUMN farm_historical_performance.weather_conditions_rating IS 'Farmer rating of weather conditions (1-5 scale)';

COMMENT ON TABLE yield_predictions IS 'Yield predictions generated by ML model for individual farms';
COMMENT ON COLUMN yield_predictions.predicted_yield_tons_per_hectare IS 'Predicted yield in tons per hectare';
COMMENT ON COLUMN yield_predictions.confidence_level IS 'Confidence level of the prediction (0.00-1.00)';
COMMENT ON COLUMN yield_predictions.prediction_factors IS 'JSON object containing factors that influenced the prediction';

COMMENT ON TABLE prediction_factor_explanations IS 'Detailed explanations of factors that influenced yield predictions';
COMMENT ON COLUMN prediction_factor_explanations.impact_score IS 'Impact score of the factor (-1.00 to 1.00)';
COMMENT ON COLUMN prediction_factor_explanations.impact_percentage IS 'Percentage contribution to final prediction';

COMMENT ON TABLE prediction_accuracy_tracking IS 'Tracking of prediction accuracy compared to actual harvest results';
COMMENT ON COLUMN prediction_accuracy_tracking.prediction_error IS 'Difference between predicted and actual yield';
COMMENT ON COLUMN prediction_accuracy_tracking.accuracy_score IS 'Overall accuracy score (0.00-1.00)';

COMMENT ON TABLE real_time_weather_data IS 'Real-time weather data from weather APIs';
COMMENT ON COLUMN real_time_weather_data.temperature_current IS 'Current temperature in Celsius';
COMMENT ON COLUMN real_time_weather_data.humidity_percentage IS 'Current humidity percentage';
COMMENT ON COLUMN real_time_weather_data.last_updated IS 'Timestamp of last weather data update';

COMMENT ON TABLE weather_forecast_data IS 'Weather forecast data for future planning';
COMMENT ON COLUMN weather_forecast_data.forecast_period IS 'Forecast period (hourly, daily, weekly)';
COMMENT ON COLUMN weather_forecast_data.confidence_level IS 'Confidence level of the forecast (0.00-1.00)';

COMMENT ON TABLE planting_windows IS 'Optimal planting windows calculated based on weather forecasts';
COMMENT ON COLUMN planting_windows.optimal_start_date IS 'Start date of optimal planting window';
COMMENT ON COLUMN planting_windows.optimal_end_date IS 'End date of optimal planting window';
COMMENT ON COLUMN planting_windows.expected_yield_impact IS 'Expected impact on yield (0.00-1.00)';

COMMENT ON TABLE weather_alerts IS 'Weather alerts and warnings for farmers';
COMMENT ON COLUMN weather_alerts.alert_severity IS 'Alert severity level (Low, Moderate, High, Critical)';
COMMENT ON COLUMN weather_alerts.agricultural_impact_level IS 'Impact level on agriculture (Low, Moderate, High, Severe)';
COMMENT ON COLUMN weather_alerts.recommended_actions IS 'Recommended actions for farmers during the alert';

-- Chatbot Conversations Table
CREATE TABLE chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_profile_id UUID REFERENCES user_farm_profiles(id) ON DELETE SET NULL,
    
    -- Conversation Details
    conversation_title VARCHAR(200), -- Auto-generated title based on first message
    conversation_type VARCHAR(50) DEFAULT 'general', -- general, yield_advice, weather_help, pest_control, etc.
    language VARCHAR(10) DEFAULT 'en', -- en, fil (English, Filipino)
    
    -- Context Information
    user_location_province VARCHAR(100),
    user_location_region VARCHAR(50),
    user_farm_context JSONB DEFAULT '{}', -- Farm details, soil type, rice variety, etc.
    weather_context JSONB DEFAULT '{}', -- Current weather conditions
    
    -- Conversation Status
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    total_messages INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Messages Table
CREATE TABLE chatbot_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message Content
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL, -- user, bot, system
    message_role VARCHAR(20) NOT NULL, -- user, assistant, system
    
    -- Message Context
    message_context JSONB DEFAULT '{}', -- Additional context, attachments, etc.
    message_intent VARCHAR(100), -- Detected intent (yield_prediction, weather_help, pest_control, etc.)
    message_entities JSONB DEFAULT '{}', -- Extracted entities (location, crop_type, etc.)
    
    -- Bot Response Data (for bot messages)
    bot_response_type VARCHAR(50), -- text, recommendation, chart, link, etc.
    bot_confidence_score DECIMAL(3,2), -- Confidence in the response (0.00-1.00)
    bot_knowledge_source VARCHAR(100), -- Source of knowledge used (rule_base, ml_model, etc.)
    bot_recommendations JSONB DEFAULT '{}', -- Structured recommendations
    
    -- User Feedback (for bot messages)
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5), -- 1-5 star rating
    user_feedback TEXT, -- User feedback on the response
    is_helpful BOOLEAN, -- User marked as helpful/not helpful
    
    -- Message Metadata
    message_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_time_ms INTEGER, -- Time taken to process the message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Knowledge Base Table
CREATE TABLE chatbot_knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Knowledge Content
    knowledge_title VARCHAR(200) NOT NULL,
    knowledge_content TEXT NOT NULL,
    knowledge_summary TEXT, -- Brief summary for quick reference
    knowledge_category VARCHAR(100) NOT NULL, -- rice_cultivation, pest_control, weather, soil_management, etc.
    knowledge_subcategory VARCHAR(100), -- More specific categorization
    
    -- Knowledge Context
    applicable_provinces TEXT[], -- Array of applicable provinces
    applicable_seasons TEXT[], -- Array of applicable seasons (Wet, Dry)
    applicable_soil_types TEXT[], -- Array of applicable soil types
    applicable_rice_varieties TEXT[], -- Array of applicable rice varieties
    
    -- Knowledge Metadata
    knowledge_source VARCHAR(100) NOT NULL, -- PhilRice, PAGASA, expert_knowledge, etc.
    knowledge_author VARCHAR(200), -- Author or source organization
    knowledge_version VARCHAR(20), -- Version of the knowledge
    knowledge_quality_score DECIMAL(3,2), -- Quality assessment score (0.00-1.00)
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0, -- Number of times this knowledge was used
    last_used TIMESTAMP WITH TIME ZONE,
    effectiveness_score DECIMAL(3,2), -- Average effectiveness based on user feedback
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Rules and Patterns Table
CREATE TABLE chatbot_rules_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Rule Definition
    rule_name VARCHAR(200) NOT NULL,
    rule_description TEXT,
    rule_pattern TEXT NOT NULL, -- Pattern or trigger condition
    rule_type VARCHAR(50) NOT NULL, -- keyword, regex, intent, entity, etc.
    
    -- Rule Response
    rule_response TEXT NOT NULL, -- Default response text
    rule_response_template JSONB DEFAULT '{}', -- Template for dynamic responses
    rule_confidence_threshold DECIMAL(3,2) DEFAULT 0.7, -- Minimum confidence to trigger
    
    -- Rule Context
    rule_category VARCHAR(100), -- Category this rule belongs to
    rule_priority INTEGER DEFAULT 1, -- Priority order (1 = highest)
    rule_conditions JSONB DEFAULT '{}', -- Additional conditions (location, season, etc.)
    
    -- Rule Actions
    rule_actions JSONB DEFAULT '[]', -- Actions to take when rule matches
    rule_follow_up_questions TEXT[], -- Array of follow-up questions
    rule_knowledge_base_ids UUID[], -- Array of knowledge base IDs to reference
    
    -- Usage and Performance
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2), -- Success rate based on user feedback
    average_response_time_ms INTEGER, -- Average response time
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_testing BOOLEAN DEFAULT false, -- For A/B testing new rules
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Interaction Analytics Table
CREATE TABLE user_interaction_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_profile_id UUID REFERENCES user_farm_profiles(id) ON DELETE SET NULL,
    
    -- Interaction Details
    interaction_type VARCHAR(50) NOT NULL, -- chatbot_message, yield_prediction, weather_check, map_view, etc.
    interaction_subtype VARCHAR(50), -- More specific interaction type
    interaction_session_id UUID, -- Session identifier for grouping related interactions
    
    -- Interaction Context
    user_location_province VARCHAR(100),
    user_location_region VARCHAR(50),
    interaction_context JSONB DEFAULT '{}', -- Additional context data
    device_info JSONB DEFAULT '{}', -- Device and browser information
    
    -- Interaction Metrics
    interaction_duration_seconds INTEGER, -- Time spent on interaction
    interaction_success BOOLEAN, -- Whether interaction was successful
    user_satisfaction_score INTEGER CHECK (user_satisfaction_score >= 1 AND user_satisfaction_score <= 5),
    
    -- Feature Usage
    feature_used VARCHAR(100), -- Specific feature used
    feature_version VARCHAR(20), -- Version of the feature
    feature_performance_ms INTEGER, -- Performance metrics
    
    -- User Behavior
    user_intent VARCHAR(100), -- Detected user intent
    user_flow_path TEXT[], -- Array of pages/features visited
    user_engagement_level VARCHAR(20), -- low, medium, high
    
    -- Timestamp
    interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Training Data Table
CREATE TABLE chatbot_training_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Training Data
    training_question TEXT NOT NULL,
    training_answer TEXT NOT NULL,
    training_intent VARCHAR(100) NOT NULL, -- Intent classification
    training_entities JSONB DEFAULT '{}', -- Named entities in the question
    
    -- Data Context
    data_category VARCHAR(100), -- Category of training data
    data_subcategory VARCHAR(100), -- Subcategory for more specific classification
    data_language VARCHAR(10) DEFAULT 'en', -- Language of the training data
    
    -- Data Quality
    data_source VARCHAR(100), -- Source of the training data
    data_quality_score DECIMAL(3,2), -- Quality assessment score
    data_verified BOOLEAN DEFAULT false, -- Whether data has been verified
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0, -- Number of times used in training
    last_used_in_training TIMESTAMP WITH TIME ZONE,
    training_effectiveness DECIMAL(3,2), -- Effectiveness in improving bot responses
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conversations_type ON chatbot_conversations(conversation_type);
CREATE INDEX idx_chatbot_conversations_activity ON chatbot_conversations(last_activity);
CREATE INDEX idx_chatbot_conversations_location ON chatbot_conversations(user_location_province, user_location_region);

CREATE INDEX idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX idx_chatbot_messages_user_id ON chatbot_messages(user_id);
CREATE INDEX idx_chatbot_messages_type ON chatbot_messages(message_type);
CREATE INDEX idx_chatbot_messages_intent ON chatbot_messages(message_intent);
CREATE INDEX idx_chatbot_messages_timestamp ON chatbot_messages(message_timestamp);

CREATE INDEX idx_knowledge_base_category ON chatbot_knowledge_base(knowledge_category);
CREATE INDEX idx_knowledge_base_subcategory ON chatbot_knowledge_base(knowledge_subcategory);
CREATE INDEX idx_knowledge_base_provinces ON chatbot_knowledge_base USING GIN(applicable_provinces);
CREATE INDEX idx_knowledge_base_usage ON chatbot_knowledge_base(usage_count);
CREATE INDEX idx_knowledge_base_quality ON chatbot_knowledge_base(knowledge_quality_score);

CREATE INDEX idx_rules_patterns_type ON chatbot_rules_patterns(rule_type);
CREATE INDEX idx_rules_patterns_category ON chatbot_rules_patterns(rule_category);
CREATE INDEX idx_rules_patterns_priority ON chatbot_rules_patterns(rule_priority);
CREATE INDEX idx_rules_patterns_usage ON chatbot_rules_patterns(usage_count);

CREATE INDEX idx_user_analytics_user_id ON user_interaction_analytics(user_id);
CREATE INDEX idx_user_analytics_type ON user_interaction_analytics(interaction_type);
CREATE INDEX idx_user_analytics_timestamp ON user_interaction_analytics(interaction_timestamp);
CREATE INDEX idx_user_analytics_feature ON user_interaction_analytics(feature_used);
CREATE INDEX idx_user_analytics_location ON user_interaction_analytics(user_location_province, user_location_region);

CREATE INDEX idx_training_data_intent ON chatbot_training_data(training_intent);
CREATE INDEX idx_training_data_category ON chatbot_training_data(data_category);
CREATE INDEX idx_training_data_language ON chatbot_training_data(data_language);
CREATE INDEX idx_training_data_quality ON chatbot_training_data(data_quality_score);

-- Add unique constraints where needed
ALTER TABLE historical_geo_climatic_data ADD CONSTRAINT idx_historical_data_province_date UNIQUE (province, date);
ALTER TABLE user_farm_profiles ADD CONSTRAINT idx_user_farm_profiles_user_id UNIQUE (user_id);
ALTER TABLE farm_historical_performance ADD CONSTRAINT idx_farm_performance_season UNIQUE (farm_profile_id, season_year, season_type);
ALTER TABLE yield_predictions ADD CONSTRAINT idx_yield_predictions_farm_season UNIQUE (farm_profile_id, target_season_year, target_season_type);
ALTER TABLE prediction_accuracy_tracking ADD CONSTRAINT idx_accuracy_tracking_prediction_id UNIQUE (prediction_id);
ALTER TABLE real_time_weather_data ADD CONSTRAINT idx_weather_data_location_time UNIQUE (province, municipality, last_updated);
ALTER TABLE weather_forecast_data ADD CONSTRAINT idx_forecast_data_location_date UNIQUE (province, municipality, forecast_date, forecast_hour);
ALTER TABLE planting_windows ADD CONSTRAINT idx_planting_windows_location_season UNIQUE (province, season_year, season_type);
ALTER TABLE weather_alerts ADD CONSTRAINT idx_weather_alerts_location_time UNIQUE (province, municipality, alert_type, alert_start_time);
ALTER TABLE chatbot_conversations ADD CONSTRAINT idx_chatbot_conversations_user_active UNIQUE (user_id, is_active);
ALTER TABLE chatbot_knowledge_base ADD CONSTRAINT idx_knowledge_base_category_active UNIQUE (knowledge_category, is_active);
ALTER TABLE chatbot_rules_patterns ADD CONSTRAINT idx_rules_patterns_category_priority UNIQUE (rule_category, rule_priority);
ALTER TABLE user_interaction_analytics ADD CONSTRAINT idx_user_analytics_user_timestamp UNIQUE (user_id, interaction_timestamp);
ALTER TABLE chatbot_training_data ADD CONSTRAINT idx_training_data_intent_category UNIQUE (training_intent, data_category);

-- =====================================================================
-- Admin Additions (Yield datasets, Rice varieties, Chatbot/Weather settings)
-- =====================================================================

-- Stores uploaded yield dataset versions; only one can be active
CREATE TABLE IF NOT EXISTS yield_dataset_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    checksum TEXT NOT NULL,
    row_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_yield_dataset_versions_checksum
  ON yield_dataset_versions(checksum);

CREATE INDEX IF NOT EXISTS idx_yield_dataset_versions_active
  ON yield_dataset_versions(is_active);

-- Rice varieties managed in admin; public app reads only active ones
CREATE TABLE IF NOT EXISTS rice_varieties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_rice_varieties_updated_at 
    BEFORE UPDATE ON rice_varieties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Chatbot runtime settings (singleton)
CREATE TABLE IF NOT EXISTS chatbot_settings (
    id INT PRIMARY KEY DEFAULT 1,
    widget_enabled BOOLEAN NOT NULL DEFAULT true,
    system_prompt TEXT,
    temperature DOUBLE PRECISION DEFAULT 0.7,
    top_p DOUBLE PRECISION DEFAULT 1.0,
    max_tokens INTEGER DEFAULT 512,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- App-level settings incl. weather provider/key (singleton)
CREATE TABLE IF NOT EXISTS app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    weather_provider TEXT NOT NULL DEFAULT 'WeatherAPI',
    weather_api_key TEXT,
    weather_last_ok_at TIMESTAMP WITH TIME ZONE
);

-- Global map UI settings (singleton)
CREATE TABLE IF NOT EXISTS map_settings (
    id INT PRIMARY KEY DEFAULT 1,
    popup_title_template TEXT,        -- e.g., "{{name}}"
    popup_subtitle_template TEXT,     -- e.g., "Province {{psgc_code}}"
    popup_body_template TEXT,         -- e.g., HTML snippet with variables
    choropleth_ranges JSONB DEFAULT '[
      {"min": 0, "max": 1, "color": "#fef3c7", "label": "< 1.0"},
      {"min": 1, "max": 2, "color": "#fde68a", "label": "1.0 - 1.9"},
      {"min": 2, "max": 3, "color": "#fbbf24", "label": "2.0 - 2.9"},
      {"min": 3, "max": 4, "color": "#f59e0b", "label": "3.0 - 3.9"},
      {"min": 4, "max": 5, "color": "#d97706", "label": "4.0 - 4.9"},
      {"min": 5, "max": 6, "color": "#b45309", "label": "5.0 - 5.9"},
      {"min": 6, "max": 7, "color": "#92400e", "label": "6.0 - 6.9"},
      {"min": 7, "max": 8, "color": "#78350f", "label": "7.0 - 7.9"},
      {"min": 8, "max": 9, "color": "#451a03", "label": "8.0 - 8.9"},
      {"min": 9, "max": 10, "color": "#1c1917", "label": "≥ 9.0"}
    ]',                               -- Choropleth color ranges configuration
    no_data_color TEXT DEFAULT '#f3f4f6', -- Color for areas without yield data
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TRIGGER update_map_settings_updated_at
    BEFORE UPDATE ON map_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Map overlays keyed by PSGC (ADM levels). Used to annotate GeoJSON features with admin-managed data
CREATE TABLE IF NOT EXISTS map_overlays (
    psgc_code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 2, -- ADM level: 2 for province/district
    parent_psgc_code TEXT,            -- Optional PSGC of parent (e.g., ADM1 region)
    yield_t_ha DECIMAL(6,2),          -- Rice yield in tons per hectare
    color_override TEXT,              -- Optional HEX/RGBA for map styling
    notes TEXT,                       -- Free-form notes
    popup_title TEXT,                 -- Admin-managed popup title
    popup_subtitle TEXT,              -- Admin-managed popup subtitle
    popup_fields JSONB DEFAULT '[]',  -- Array of {label, value}
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_map_overlays_level
  ON map_overlays(level);

CREATE INDEX IF NOT EXISTS idx_map_overlays_parent
  ON map_overlays(parent_psgc_code);

-- Keep updated_at fresh
CREATE TRIGGER update_map_overlays_updated_at
    BEFORE UPDATE ON map_overlays
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
