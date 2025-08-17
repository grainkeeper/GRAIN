// Model Validation Service
// Tests the accuracy of the MLR model predictions

export interface ValidationResult {
  period: string;
  predictedYield: number;
  actualYield: number;
  error: number;
  accuracy: number;
}

export interface ModelAccuracy {
  overallAccuracy: number;
  quarterAccuracies: { [quarter: number]: number };
  periodAccuracies: ValidationResult[];
  confidenceInterval: { lower: number; upper: number };
}

export class ModelValidationService {
  private predictionModel: any;
  
  constructor() {
    // Import the prediction model
    const { YieldPredictionModel } = require('./prediction-model');
    this.predictionModel = new YieldPredictionModel();
  }

  // Validate model against historical data
  async validateHistoricalAccuracy(startYear: number, endYear: number): Promise<ModelAccuracy> {
    const results: ValidationResult[] = [];
    
    for (let year = startYear; year <= endYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        // Get historical weather data for this quarter/year
        const weatherData = await this.getHistoricalWeather(year, quarter);
        
        if (weatherData) {
          // Make prediction using MLR model
          const predictedYield = this.predictYield(weatherData, quarter);
          
          // Get actual yield (if available)
          const actualYield = await this.getActualYield(year, quarter);
          
          if (actualYield !== null) {
            const error = Math.abs(predictedYield - actualYield) / actualYield * 100;
            const accuracy = Math.max(0, 100 - error);
            
            results.push({
              period: `Q${quarter} ${year}`,
              predictedYield,
              actualYield,
              error,
              accuracy
            });
          }
        }
      }
    }
    
    return this.calculateOverallAccuracy(results);
  }

  // Test model with known data points
  testKnownDataPoints(): ValidationResult[] {
    // Test with sample data points where we know the expected results
    const testCases = [
      {
        period: 'Q1 2025',
        weather: { temperature: 26.76, dewPoint: 21.58, precipitation: 236.7, windSpeed: 3.23, humidity: 78.9 },
        quarter: 1,
        expectedYield: 8846610.9
      },
      {
        period: 'Q2 2025', 
        weather: { temperature: 28.68, dewPoint: 22.61, precipitation: 337.3, windSpeed: 3.61, humidity: 82.8 },
        quarter: 2,
        expectedYield: -1368089.3
      },
      {
        period: 'Q3 2025',
        weather: { temperature: 30.48, dewPoint: 23.44, precipitation: 526.2, windSpeed: 2.77, humidity: 86.5 },
        quarter: 3,
        expectedYield: 733231.0
      },
      {
        period: 'Q4 2025',
        weather: { temperature: 27.71, dewPoint: 20.57, precipitation: 420.7, windSpeed: 3.40, humidity: 80.0 },
        quarter: 4,
        expectedYield: -12360249.0
      }
    ];

    return testCases.map(testCase => {
      const predictedYield = this.predictYield(testCase.weather, testCase.quarter);
      const error = Math.abs(predictedYield - testCase.expectedYield) / Math.abs(testCase.expectedYield) * 100;
      const accuracy = Math.max(0, 100 - error);
      
      return {
        period: testCase.period,
        predictedYield,
        actualYield: testCase.expectedYield,
        error,
        accuracy
      };
    });
  }

  // Validate forecast accuracy using your 75-year data
  validateForecastAccuracy(): ValidationResult[] {
    const { FORECAST_DATA } = require('../data/forecast-data');
    const results: ValidationResult[] = [];
    
    FORECAST_DATA.forEach(dataPoint => {
      const quarter = parseInt(dataPoint.quarter.substring(1));
      const weather = {
        temperature: dataPoint.temperature,
        dewPoint: dataPoint.dewPoint,
        precipitation: dataPoint.precipitation,
        windSpeed: dataPoint.windSpeed,
        humidity: dataPoint.humidity
      };
      
      const predictedYield = this.predictYield(weather, quarter);
      const expectedYield = dataPoint.yield;
      
      const error = Math.abs(predictedYield - expectedYield) / Math.abs(expectedYield) * 100;
      const accuracy = Math.max(0, 100 - error);
      
      results.push({
        period: `${dataPoint.quarter} ${dataPoint.year}`,
        predictedYield,
        actualYield: expectedYield,
        error,
        accuracy
      });
    });
    
    return results;
  }

  // Calculate overall accuracy metrics
  private calculateOverallAccuracy(results: ValidationResult[]): ModelAccuracy {
    const overallAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;
    
    // Calculate accuracy by quarter
    const quarterAccuracies: { [quarter: number]: number } = {};
    for (let q = 1; q <= 4; q++) {
      const quarterResults = results.filter(r => r.period.includes(`Q${q}`));
      if (quarterResults.length > 0) {
        quarterAccuracies[q] = quarterResults.reduce((sum, r) => sum + r.accuracy, 0) / quarterResults.length;
      }
    }
    
    // Calculate confidence interval (95%)
    const errors = results.map(r => r.error);
    const meanError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
    const stdError = Math.sqrt(errors.reduce((sum, e) => sum + Math.pow(e - meanError, 2), 0) / errors.length);
    const confidenceInterval = {
      lower: Math.max(0, overallAccuracy - 1.96 * stdError),
      upper: Math.min(100, overallAccuracy + 1.96 * stdError)
    };
    
    return {
      overallAccuracy,
      quarterAccuracies,
      periodAccuracies: results,
      confidenceInterval
    };
  }

  // Predict yield using MLR model
  private predictYield(weather: any, quarter: number): number {
    switch (quarter) {
      case 1: return this.predictionModel.predictQuarter1(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity);
      case 2: return this.predictionModel.predictQuarter2(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity);
      case 3: return this.predictionModel.predictQuarter3(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity);
      case 4: return this.predictionModel.predictQuarter4(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity);
      default: return 0;
    }
  }

  // Get historical weather data (placeholder)
  private async getHistoricalWeather(year: number, quarter: number): Promise<any> {
    // This would fetch actual historical weather data
    // For now, return null to indicate no historical data available
    return null;
  }

  // Get actual yield data (placeholder)
  private async getActualYield(year: number, quarter: number): Promise<number | null> {
    // This would fetch actual yield data
    // For now, return null to indicate no actual data available
    return null;
  }
}
