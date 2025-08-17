import { WeatherData } from './prediction-model';

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.weatherapi.com/v1';

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('WEATHER_API_KEY environment variable is required. Please set it in your .env.local file.');
    }
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    const response = await fetch(
      `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      date: new Date().toISOString().split('T')[0],
      temp_c: data.current.temp_c,
      dewpoint_c: data.current.dewpoint_c,
      precip_mm: data.current.precip_mm,
      wind_kph: data.current.wind_kph,
      humidity: data.current.humidity,
      text: data.current.condition.text,
      icon: data.current.condition.icon
    };
  }

  async getWeatherForecast(location: string, days: number = 14): Promise<WeatherData[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&days=${days}&aqi=no`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GrainKeeper/1.0'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        temp_c: day.day.avgtemp_c,
        dewpoint_c: this.estimateDewPoint(day.day.avgtemp_c, day.day.avghumidity),
        precip_mm: day.day.totalprecip_mm,
        wind_kph: day.day.maxwind_kph,
        humidity: day.day.avghumidity,
        text: day.day.condition.text,
        icon: day.day.condition.icon,
        daily_chance_of_rain: day.day.daily_chance_of_rain
      }));
    } catch (error) {
      console.error('WeatherAPI fetch error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Weather API request timed out. Please check your internet connection and try again.');
        }
        
        if ('code' in error && error.code === 'UND_ERR_CONNECT_TIMEOUT') {
          throw new Error('Unable to connect to Weather API. Please check your internet connection and try again.');
        }
        
        throw new Error(`Weather API error: ${error.message}`);
      }
      
      throw new Error('Weather API error: Unknown error occurred');
    }
  }

  async getHistoricalWeather(location: string, date: string): Promise<WeatherData> {
    const response = await fetch(
      `${this.baseUrl}/history.json?key=${this.apiKey}&q=${encodeURIComponent(location)}&dt=${date}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const day = data.forecast.forecastday[0];
    
    return {
      date: day.date,
      temp_c: day.day.avgtemp_c,
      dewpoint_c: this.estimateDewPoint(day.day.avgtemp_c, day.day.avghumidity),
      precip_mm: day.day.totalprecip_mm,
      wind_kph: day.day.maxwind_kph,
      humidity: day.day.avghumidity,
      text: day.day.condition.text,
      icon: day.day.condition.icon
    };
  }

  // Estimate dew point from temperature and humidity
  private estimateDewPoint(temperature: number, humidity: number): number {
    // Magnus formula approximation
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  }


}
