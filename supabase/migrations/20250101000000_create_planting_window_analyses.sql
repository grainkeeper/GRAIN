-- Create planting_window_analyses table
CREATE TABLE IF NOT EXISTS planting_window_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  forecast_period TEXT NOT NULL,
  plantable_days INTEGER NOT NULL,
  total_days INTEGER NOT NULL,
  excellent_days INTEGER NOT NULL,
  overall_recommendation TEXT NOT NULL,
  next_update_date TEXT NOT NULL,
  weather_trends JSONB NOT NULL,
  best_planting_days JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_planting_window_analyses_user_id ON planting_window_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_planting_window_analyses_created_at ON planting_window_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_planting_window_analyses_location ON planting_window_analyses(location_name, latitude, longitude);

-- Enable RLS (Row Level Security)
ALTER TABLE planting_window_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own planting window analyses" ON planting_window_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planting window analyses" ON planting_window_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planting window analyses" ON planting_window_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planting window analyses" ON planting_window_analyses
  FOR DELETE USING (auth.uid() = user_id);
