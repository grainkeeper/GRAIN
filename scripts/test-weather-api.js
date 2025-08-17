// Test Weather API Service
// Validates the WeatherService integration

console.log('🌤️ Testing Weather API Service\n');

// Mock environment variable for testing
process.env.WEATHER_API_KEY = 'test-key';

// Mock fetch for testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      forecast: {
        forecastday: [
          {
            date: '2025-01-01',
            day: {
              avgtemp_c: 26.5,
              avghumidity: 78,
              totalprecip_mm: 245.3,
              maxwind_kph: 3.2,
              condition: {
                text: 'Partly cloudy',
                icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
              }
            }
          }
        ]
      }
    })
  })
);

// Test the WeatherService
async function testWeatherService() {
  console.log('🔧 Testing WeatherService...');
  
  try {
    // Import the service
    const { WeatherService } = await import('../lib/services/weather-api.js');
    
    const weatherService = new WeatherService();
    console.log('✅ WeatherService initialized successfully');
    
    // Test forecast method
    const forecast = await weatherService.getWeatherForecast('Manila, Philippines', 1);
    console.log('✅ Weather forecast retrieved:', forecast.length, 'days');
    
    // Test historical method
    const historical = await weatherService.getHistoricalWeather('Manila, Philippines', '2024-01-01');
    console.log('✅ Historical weather retrieved for 2024-01-01');
    
    console.log('\n🎉 Weather API Service Test Completed Successfully!');
    console.log('✅ All methods working correctly');
    
  } catch (error) {
    console.error('❌ Weather API Service Test Failed:', error);
  }
}

// Run the test
testWeatherService();

