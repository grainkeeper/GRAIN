# Grain - Rice Yield Prediction System

A comprehensive rice yield prediction system for the Philippines, featuring AI-powered predictions, historical data analysis, and interactive mapping.

## Features

- **AI-Powered Predictions**: Machine learning models for rice yield forecasting
- **Historical Data Analysis**: Comprehensive yield data management and analysis
- **Interactive Mapping**: Province/district-level rice yield visualization
- **Admin Dashboard**: Complete management interface for data and settings
- **Multi-language Support**: Filipino and English interface
- **Mobile Responsive**: Optimized for all device sizes

## Map Feature

The system includes an interactive map showing rice yield data by province/district:

### Public Map (`/map`)
- Interactive Leaflet map with OpenStreetMap tiles
- Click provinces/districts to view rice yield data
- Responsive design for mobile and desktop
- Global popup templates with variable substitution

### Admin Management (`/admin/map`)
- Inline editing of yield data, colors, and names
- Search and filter by region
- Pagination for large datasets
- Live map preview
- PSGC code autofill for province names

### Global Popup Templates (`/admin/map/settings`)
- Configure popup content templates
- Variable substitution (e.g., `{{name}}`, `{{yield_t_ha}}`)
- Per-district overrides available

### Technical Details
- **Data Source**: 2023 PSGC province/district GeoJSON (medium resolution)
- **Map Library**: Leaflet with OpenStreetMap tiles
- **Database**: Supabase with `map_overlays` and `map_settings` tables
- **Performance**: Optimized for sub-2s load times on desktop broadband

### Future Enhancements
- TopoJSON compression for faster loading
- Caching layer for improved performance
- Bulk import/export functionality
- Additional map layers (weather, soil data)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations
5. Start development server: `npm run dev`

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Maps**: Leaflet, OpenStreetMap
- **Testing**: Jest
- **Deployment**: Vercel

## License

MIT License - see LICENSE file for details.
