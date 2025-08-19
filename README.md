# 🌾 GrainKeeper - AI-Powered Rice Yield Prediction System

A comprehensive rice farming advisory platform that combines advanced MLR (Multiple Linear Regression) prediction models with real-time weather analysis to provide accurate yield forecasts and optimal planting window recommendations for Philippine rice farmers.

## 🚀 Features

### Core Prediction System
- **Quarterly Yield Prediction**: MLR-based system with 96.01% accuracy for determining optimal 3-month planting periods
- **7-Day Planting Window Analysis**: Advanced weather stability scoring to identify the best 7-day planting windows within selected quarters
- **Real-time Weather Integration**: Open-Meteo API integration for historical and forecast weather data
- **Location-Specific Analysis**: Philippine geographic data integration with PSGC (Philippine Standard Geographic Code)

### Admin Management System
- **MLR Formula Management**: Real-time coefficient adjustment and validation
- **Accuracy Tracking**: Performance monitoring and historical accuracy analysis
- **System Health Monitoring**: Real-time system status and component health checks
- **Data Import/Export**: CSV/Excel data management for yield datasets
- **Rice Varieties Management**: Comprehensive variety database management

### User Interface
- **Modern React/Next.js UI**: Built with Tailwind CSS and Shadcn UI components
- **Responsive Design**: Mobile-friendly interface for field use
- **Interactive Maps**: Geographic visualization of predictions and data
- **AI Chatbot**: Integrated farming advisory system

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Shadcn UI components
- **Backend**: Next.js API routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Weather Data**: Open-Meteo API (no API key required)
- **AI Integration**: Google Gemini API for chatbot functionality

### Core Services
- `lib/services/rice-yield-prediction.ts` - MLR prediction engine
- `lib/services/planting-window-analysis.ts` - 7-day window analysis
- `lib/services/open-meteo-api.ts` - Weather data integration
- `lib/utils/weather-stability.ts` - Weather stability scoring algorithms

## 📊 Prediction System

### MLR Formulas (96.01% Accuracy)
The system uses four quarterly MLR formulas optimized for Philippine rice farming:

- **Q1 (Jan-Mar)**: Optimal for early season planting
- **Q2 (Apr-Jun)**: Peak growing season analysis
- **Q3 (Jul-Sep)**: Late season optimization
- **Q4 (Oct-Dec)**: Off-season planning

### Weather Stability Analysis
Advanced algorithms score 7-day planting windows based on:
- Temperature stability (optimal range: 25-30°C)
- Precipitation patterns (avoiding excessive rainfall)
- Wind speed consistency (minimizing crop damage)
- Humidity levels (disease prevention)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd grain
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# Open-Meteo API (no API key required)
# Weather data is fetched automatically

# Database Configuration
DATABASE_URL=your_database_url
```

4. **Database Setup**
```bash
# Run database migration
node scripts/run-migration.js
```

5. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 🧪 Testing

Run the comprehensive test suite:
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Test Coverage**: 108 tests covering prediction algorithms, API endpoints, admin functionality, and data validation.

## 📁 Project Structure

```
grain/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel pages
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   └── predictions/              # Prediction pages
├── components/                   # React components
│   ├── admin/                    # Admin components
│   ├── predictions/              # Prediction components
│   ├── chatbot/                  # AI chatbot components
│   └── ui/                       # Shadcn UI components
├── lib/                          # Core libraries
│   ├── services/                 # Business logic services
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript type definitions
│   └── database/                 # Database schema and utilities
├── __tests__/                    # Test files
└── tasks/                        # Project documentation
```

## 🔧 Configuration

### Admin Panel Access
- Navigate to `/admin` for system management
- Configure MLR formulas, monitor accuracy, manage data
- System health monitoring and performance analytics

### API Endpoints
- `/api/predictions` - Yield prediction endpoints
- `/api/predictions/quarter-selection` - Quarter analysis
- `/api/predictions/planting-window` - 7-day window analysis
- `/api/admin/*` - Admin management endpoints

## 📈 Performance

- **Prediction Accuracy**: 96.01% (MLR model validation)
- **Response Time**: <2 seconds for complete analysis
- **Weather Data**: Real-time Open-Meteo integration
- **System Uptime**: 99.9% (with health monitoring)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Review [PRODUCTION.md](PRODUCTION.md) for deployment guidance
- Contact the development team

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced ML model integration
- [ ] Multi-crop support
- [ ] IoT sensor integration
- [ ] Blockchain-based data verification

---

**Built with ❤️ for Philippine rice farmers**
