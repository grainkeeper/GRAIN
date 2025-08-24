-- Add choropleth configuration fields to map_settings table
-- This migration adds fields for configurable choropleth color ranges and no-data color

-- Add choropleth_ranges field (JSONB array of color ranges)
ALTER TABLE map_settings 
ADD COLUMN IF NOT EXISTS choropleth_ranges JSONB DEFAULT '[
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
]';

-- Add no_data_color field (TEXT for hex color)
ALTER TABLE map_settings 
ADD COLUMN IF NOT EXISTS no_data_color TEXT DEFAULT '#f3f4f6';

-- Add comment to document the new fields
COMMENT ON COLUMN map_settings.choropleth_ranges IS 'JSONB array of choropleth color ranges with min, max, color, and label properties';
COMMENT ON COLUMN map_settings.no_data_color IS 'Hex color for areas without yield data';

-- Ensure the default record exists
INSERT INTO map_settings (id, popup_title_template, popup_subtitle_template, popup_body_template, choropleth_ranges, no_data_color)
VALUES (1, '{{name}}', 'Philippine Province', '<div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f0fdf4; border-radius: 8px;"><div style="width: 10px; height: 10px; background: #16a34a; border-radius: 50%;"></div><span style="font-weight: 600; color: #166534; font-size: 14px;">Rice Yield: {{yield_t_ha}} t/ha</span></div>', 
  '[
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
  ]',
  '#f3f4f6'
)
ON CONFLICT (id) DO UPDATE SET
  popup_title_template = EXCLUDED.popup_title_template,
  popup_subtitle_template = EXCLUDED.popup_subtitle_template,
  popup_body_template = EXCLUDED.popup_body_template,
  choropleth_ranges = EXCLUDED.choropleth_ranges,
  no_data_color = EXCLUDED.no_data_color,
  updated_at = NOW();
