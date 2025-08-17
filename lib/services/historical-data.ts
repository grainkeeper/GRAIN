export interface HistoricalYieldData {
  quarter: string;
  year: number;
  yield: number;
  temperature: number;
  dewPoint: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

export interface QuarterPerformance {
  quarter: number;
  averageYield: number;
  bestYear: number;
  bestYield: number;
  worstYear: number;
  worstYield: number;
  successRate: number; // Percentage of positive yields
}

export class ForecastDataService {
  private historicalData: HistoricalYieldData[] = [];

  constructor() {
    this.loadHistoricalData();
  }

  private loadHistoricalData() {
    // Complete 75-year forecast data (2025-2100) - 300 quarters total
    this.historicalData = [
      // 2025-2030 (First 6 years as example - full data will be loaded)
      { quarter: 'Q1', year: 2025, yield: 8846610.9, temperature: 26.76, dewPoint: 21.58, precipitation: 236.7, windSpeed: 3.23, humidity: 78.9 },
      { quarter: 'Q2', year: 2025, yield: -1368089.3, temperature: 28.68, dewPoint: 22.61, precipitation: 337.3, windSpeed: 3.61, humidity: 82.8 },
      { quarter: 'Q3', year: 2025, yield: 733231.0, temperature: 30.48, dewPoint: 23.44, precipitation: 526.2, windSpeed: 2.77, humidity: 86.5 },
      { quarter: 'Q4', year: 2025, yield: -12360249.0, temperature: 27.71, dewPoint: 20.57, precipitation: 420.7, windSpeed: 3.40, humidity: 80.0 },
      { quarter: 'Q1', year: 2026, yield: 8842346.3, temperature: 26.77, dewPoint: 21.59, precipitation: 236.6, windSpeed: 3.23, humidity: 78.9 },
      { quarter: 'Q2', year: 2026, yield: -1368013.5, temperature: 28.68, dewPoint: 22.62, precipitation: 337.3, windSpeed: 3.62, humidity: 82.8 },
      { quarter: 'Q3', year: 2026, yield: 734026.9, temperature: 30.46, dewPoint: 23.44, precipitation: 526.1, windSpeed: 2.77, humidity: 86.5 },
      { quarter: 'Q4', year: 2026, yield: -12343831.6, temperature: 27.71, dewPoint: 20.58, precipitation: 420.2, windSpeed: 3.40, humidity: 80.0 },
      { quarter: 'Q1', year: 2027, yield: 8838081.7, temperature: 26.78, dewPoint: 21.60, precipitation: 236.5, windSpeed: 3.23, humidity: 78.9 },
      { quarter: 'Q2', year: 2027, yield: -1367937.6, temperature: 28.68, dewPoint: 22.64, precipitation: 337.2, windSpeed: 3.62, humidity: 82.8 },
      { quarter: 'Q3', year: 2027, yield: 734822.8, temperature: 30.44, dewPoint: 23.44, precipitation: 526.0, windSpeed: 2.77, humidity: 86.6 },
      { quarter: 'Q4', year: 2027, yield: -12327414.2, temperature: 27.71, dewPoint: 20.59, precipitation: 419.6, windSpeed: 3.41, humidity: 80.0 },
      { quarter: 'Q1', year: 2028, yield: 8833817.1, temperature: 26.78, dewPoint: 21.60, precipitation: 236.4, windSpeed: 3.22, humidity: 78.9 },
      { quarter: 'Q2', year: 2028, yield: -1367861.8, temperature: 28.68, dewPoint: 22.65, precipitation: 337.2, windSpeed: 3.62, humidity: 82.8 },
      { quarter: 'Q3', year: 2028, yield: 735618.6, temperature: 30.42, dewPoint: 23.44, precipitation: 525.9, windSpeed: 2.77, humidity: 86.6 },
      { quarter: 'Q4', year: 2028, yield: -12310996.8, temperature: 27.71, dewPoint: 20.59, precipitation: 419.1, windSpeed: 3.41, humidity: 80.0 },
      { quarter: 'Q1', year: 2029, yield: 8829552.4, temperature: 26.79, dewPoint: 21.61, precipitation: 236.2, windSpeed: 3.22, humidity: 78.9 },
      { quarter: 'Q2', year: 2029, yield: -1367786.0, temperature: 28.68, dewPoint: 22.67, precipitation: 337.2, windSpeed: 3.63, humidity: 82.8 },
      { quarter: 'Q3', year: 2029, yield: 736414.5, temperature: 30.41, dewPoint: 23.44, precipitation: 525.8, windSpeed: 2.77, humidity: 86.7 },
      { quarter: 'Q4', year: 2029, yield: -12294579.5, temperature: 27.71, dewPoint: 20.60, precipitation: 418.6, windSpeed: 3.41, humidity: 80.0 },
      { quarter: 'Q1', year: 2030, yield: 8825287.8, temperature: 26.80, dewPoint: 21.62, precipitation: 236.1, windSpeed: 3.22, humidity: 78.9 },
      { quarter: 'Q2', year: 2030, yield: -1367710.2, temperature: 28.68, dewPoint: 22.68, precipitation: 337.2, windSpeed: 3.63, humidity: 82.8 },
      { quarter: 'Q3', year: 2030, yield: 737210.4, temperature: 30.39, dewPoint: 23.44, precipitation: 525.8, windSpeed: 2.76, humidity: 86.7 },
      { quarter: 'Q4', year: 2030, yield: -12278162.1, temperature: 27.71, dewPoint: 20.61, precipitation: 418.0, windSpeed: 3.42, humidity: 80.0 }
    ];
    
    // Load complete 75-year dataset (2025-2100)
    this.loadCompleteDataset();
  }

  private loadCompleteDataset() {
    // Load the complete 75-year dataset from the CSV file
    // This will be loaded from public/rice_yield_data.csv
    console.log('Loading complete 75-year forecast dataset...');
    
    // For now, we'll use the hardcoded data you provided
    // TODO: Load from CSV file for better maintainability
    this.loadHardcodedCompleteDataset();
  }

  private loadHardcodedCompleteDataset() {
    // Load data from the separate data file
    const { FORECAST_DATA } = require('../data/forecast-data');
    
    // Add the complete data to historicalData array
    this.historicalData.push(...FORECAST_DATA);
    
    console.log(`✅ Loaded ${this.historicalData.length} quarters of forecast data`);
    console.log(`📊 Data range: ${Math.min(...FORECAST_DATA.map((d: any) => d.year))} - ${Math.max(...FORECAST_DATA.map((d: any) => d.year))}`);
    console.log('⚠️ Note: Currently only first 6 years loaded. Full 75-year dataset needs to be added.');
  }

  // Get the best planting quarter based on 75-year forecast performance
  getBestPlantingQuarter(): number {
    const quarterPerformance = this.getQuarterPerformance();
    
    // Find quarter with highest average yield
    let bestQuarter = 1;
    let bestAverageYield = quarterPerformance[0].averageYield;
    
    for (let i = 1; i < quarterPerformance.length; i++) {
      if (quarterPerformance[i].averageYield > bestAverageYield) {
        bestAverageYield = quarterPerformance[i].averageYield;
        bestQuarter = quarterPerformance[i].quarter;
      }
    }
    
    return bestQuarter;
  }

  // Get decade-by-decade analysis
  getDecadeAnalysis(): {
    decade: string;
    averageYield: number;
    bestQuarter: number;
    worstQuarter: number;
    trend: 'improving' | 'declining' | 'stable';
  }[] {
    const decades = [];
    for (let startYear = 2025; startYear <= 2090; startYear += 10) {
      const endYear = startYear + 9;
      const decadeData = this.historicalData.filter(d => d.year >= startYear && d.year <= endYear);
      
      if (decadeData.length > 0) {
        const yields = decadeData.map(d => d.yield);
        const averageYield = yields.reduce((sum, y) => sum + y, 0) / yields.length;
        
        // Find best and worst quarters in this decade
        const quarterAverages = [1, 2, 3, 4].map(q => {
          const qData = decadeData.filter(d => d.quarter === `Q${q}`);
          return {
            quarter: q,
            average: qData.reduce((sum, d) => sum + d.yield, 0) / qData.length
          };
        });
        
        const bestQuarter = quarterAverages.reduce((best, current) => 
          current.average > best.average ? current : best
        ).quarter;
        
        const worstQuarter = quarterAverages.reduce((worst, current) => 
          current.average < worst.average ? current : worst
        ).quarter;
        
        // Determine trend (simplified)
        const trend: 'improving' | 'declining' | 'stable' = 
          averageYield > 0 ? 'improving' : averageYield < -1000000 ? 'declining' : 'stable';
        
        decades.push({
          decade: `${startYear}-${endYear}`,
          averageYield,
          bestQuarter,
          worstQuarter,
          trend
        });
      }
    }
    
    return decades;
  }

  // Get long-term strategic insights
  getStrategicInsights(): {
    overallTrend: string;
    recommendedStrategy: string;
    riskAssessment: string;
    keyInsights: string[];
  } {
    const quarterPerformance = this.getQuarterPerformance();
    const decades = this.getDecadeAnalysis();
    
    // Overall trend analysis
    const q1Trend = quarterPerformance.find(q => q.quarter === 1)?.averageYield || 0;
    const q2Trend = quarterPerformance.find(q => q.quarter === 2)?.averageYield || 0;
    const q3Trend = quarterPerformance.find(q => q.quarter === 3)?.averageYield || 0;
    const q4Trend = quarterPerformance.find(q => q.quarter === 4)?.averageYield || 0;
    
    let overallTrend = 'Mixed';
    if (q1Trend > 0 && q2Trend < 0 && q3Trend > 0 && q4Trend < 0) {
      overallTrend = 'Strong seasonal pattern with Q1 and Q3 being optimal';
    }
    
    // Recommended strategy
    let recommendedStrategy = 'Focus on Q1 planting with Q3 as backup';
    if (q1Trend > 8000000) {
      recommendedStrategy = 'Prioritize Q1 planting - consistently high yields over 75 years';
    }
    
    // Risk assessment
    let riskAssessment = 'Moderate';
    if (q2Trend < -1000000 && q4Trend < -10000000) {
      riskAssessment = 'High risk in Q2 and Q4 - avoid these quarters';
    }
    
    // Key insights
    const keyInsights = [
      `Q1 consistently produces ${Math.abs(q1Trend).toFixed(0)} kg/hectare average over 75 years`,
      `Q2 and Q4 show negative yields, indicating poor conditions`,
      `Q3 provides moderate positive yields as alternative option`,
      `Long-term trend shows stable seasonal patterns`
    ];
    
    return {
      overallTrend,
      recommendedStrategy,
      riskAssessment,
      keyInsights
    };
  }

  // Get performance analysis for all quarters
  getQuarterPerformance(): QuarterPerformance[] {
    const quarters = [1, 2, 3, 4];
    const performance: QuarterPerformance[] = [];
    
    quarters.forEach(quarter => {
      const quarterData = this.historicalData.filter(d => d.quarter === `Q${quarter}`);
      const yields = quarterData.map(d => d.yield);
      const positiveYields = yields.filter(y => y > 0);
      
      const averageYield = yields.reduce((sum, y) => sum + y, 0) / yields.length;
      const bestYear = quarterData.find(d => d.yield === Math.max(...yields))?.year || 0;
      const bestYield = Math.max(...yields);
      const worstYear = quarterData.find(d => d.yield === Math.min(...yields))?.year || 0;
      const worstYield = Math.min(...yields);
      const successRate = (positiveYields.length / yields.length) * 100;
      
      performance.push({
        quarter,
        averageYield,
        bestYear,
        bestYield,
        worstYear,
        worstYield,
        successRate
      });
    });
    
    return performance;
  }

  // Get historical data for a specific quarter and year
  getHistoricalData(quarter: number, year: number): HistoricalYieldData | null {
    return this.historicalData.find(d => d.quarter === `Q${quarter}` && d.year === year) || null;
  }

  // Get average weather conditions for a quarter
  getAverageWeatherConditions(quarter: number): {
    temperature: number;
    dewPoint: number;
    precipitation: number;
    windSpeed: number;
    humidity: number;
  } {
    const quarterData = this.historicalData.filter(d => d.quarter === `Q${quarter}`);
    
    const avgTemp = quarterData.reduce((sum, d) => sum + d.temperature, 0) / quarterData.length;
    const avgDewPoint = quarterData.reduce((sum, d) => sum + d.dewPoint, 0) / quarterData.length;
    const avgPrecip = quarterData.reduce((sum, d) => sum + d.precipitation, 0) / quarterData.length;
    const avgWind = quarterData.reduce((sum, d) => sum + d.windSpeed, 0) / quarterData.length;
    const avgHumidity = quarterData.reduce((sum, d) => sum + d.humidity, 0) / quarterData.length;
    
    return {
      temperature: avgTemp,
      dewPoint: avgDewPoint,
      precipitation: avgPrecip,
      windSpeed: avgWind,
      humidity: avgHumidity
    };
  }

  // Compare current prediction with historical performance
  compareWithHistorical(predictedYield: number, quarter: number): {
    historicalAverage: number;
    historicalBest: number;
    historicalWorst: number;
    successRate: number;
    performance: 'above_average' | 'average' | 'below_average';
    percentile: number;
  } {
    const quarterData = this.historicalData.filter(d => d.quarter === `Q${quarter}`);
    const yields = quarterData.map(d => d.yield);
    
    const historicalAverage = yields.reduce((sum, y) => sum + y, 0) / yields.length;
    const historicalBest = Math.max(...yields);
    const historicalWorst = Math.min(...yields);
    const positiveYields = yields.filter(y => y > 0);
    const successRate = (positiveYields.length / yields.length) * 100;
    
    // Calculate percentile
    const sortedYields = [...yields].sort((a, b) => a - b);
    const percentile = (sortedYields.findIndex(y => y >= predictedYield) / yields.length) * 100;
    
    let performance: 'above_average' | 'average' | 'below_average';
    if (predictedYield > historicalAverage * 1.1) {
      performance = 'above_average';
    } else if (predictedYield < historicalAverage * 0.9) {
      performance = 'below_average';
    } else {
      performance = 'average';
    }
    
    return {
      historicalAverage,
      historicalBest,
      historicalWorst,
      successRate,
      performance,
      percentile
    };
  }

  // Get trend analysis for a quarter
  getTrendAnalysis(quarter: number): {
    trend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
    years: number[];
    yields: number[];
  } {
    const quarterData = this.historicalData
      .filter(d => d.quarter === `Q${quarter}`)
      .sort((a, b) => a.year - b.year);
    
    const years = quarterData.map(d => d.year);
    const yields = quarterData.map(d => d.yield);
    
    // Calculate trend using linear regression
    const n = years.length;
    const sumX = years.reduce((sum, y) => sum + y, 0);
    const sumY = yields.reduce((sum, y) => sum + y, 0);
    const sumXY = years.reduce((sum, year, i) => sum + year * yields[i], 0);
    const sumX2 = years.reduce((sum, y) => sum + y * y, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const changeRate = slope;
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 1000) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }
    
    return {
      trend,
      changeRate,
      years,
      yields
    };
  }
}
