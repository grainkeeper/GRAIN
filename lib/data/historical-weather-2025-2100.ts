/**
 * Historical Weather Data Access Functions (2025-2100)
 * 
 * This module provides access to historical weather data for rice yield prediction.
 * The data contains geoclimatic variables (T, D, P, W, H) used in the MLR formulas.
 * 
 * Note: This currently uses mock data structure. Replace with actual 2025-2100 dataset.
 */

import { 
  HistoricalWeatherData, 
  QuarterlyWeatherData, 
  HistoricalWeatherDataset,
  Quarter,
  HistoricalYear 
} from '@/lib/types/prediction';

// ============================================================================
// MOCK DATA STRUCTURE (Replace with actual 2025-2100 dataset)
// ============================================================================

/**
 * Generate mock historical weather data for testing and development
 * This should be replaced with actual 2025-2100 weather data
 */
function generateMockHistoricalData(): HistoricalWeatherDataset {
  const dataset: HistoricalWeatherDataset = {
    startYear: 2025,
    endYear: 2100,
    data: {},
    metadata: {
      source: 'Mock Data - Replace with actual 2025-2100 dataset',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      coverage: {
        years: 76, // 2025-2100
        quarters: 304, // 76 years * 4 quarters
        regions: ['Philippines']
      }
    }
  };

  // Generate mock data for each year (2025-2100)
  for (let year = 2025; year <= 2100; year++) {
    const quarterlyData: QuarterlyWeatherData = {
      year,
      quarter1: generateMockQuarterData(year, 1),
      quarter2: generateMockQuarterData(year, 2),
      quarter3: generateMockQuarterData(year, 3),
      quarter4: generateMockQuarterData(year, 4)
    };
    
    dataset.data[year] = quarterlyData;
  }

  return dataset;
}

/**
 * Generate mock weather data for a specific quarter
 */
function generateMockQuarterData(year: number, quarter: Quarter): HistoricalWeatherData {
  // Base values with seasonal variations
  const baseTemp = 25 + (quarter - 2) * 2; // Q1: 23°C, Q2: 25°C, Q3: 27°C, Q4: 25°C
  const baseDewPoint = baseTemp - 5;
  const basePrecip = 100 + (quarter - 1) * 50; // Q1: 100mm, Q2: 150mm, Q3: 200mm, Q4: 150mm
  const baseWindSpeed = 10 + (quarter - 2) * 2;
  const baseHumidity = 70 + (quarter - 2) * 5;

  // Add some year-to-year variation
  const yearVariation = (year - 2025) * 0.1;

  return {
    temperature: baseTemp + yearVariation + (Math.random() - 0.5) * 2,
    dewPoint: baseDewPoint + yearVariation + (Math.random() - 0.5) * 2,
    precipitation: basePrecip + (Math.random() - 0.5) * 20,
    windSpeed: baseWindSpeed + (Math.random() - 0.5) * 3,
    humidity: baseHumidity + (Math.random() - 0.5) * 10,
    date: `${year}-${quarter * 3}-15`, // Middle of each quarter
    location: 'Philippines'
  };
}

// ============================================================================
// DATA ACCESS FUNCTIONS
// ============================================================================

// Initialize the dataset (replace with actual data loading)
let historicalDataset: HistoricalWeatherDataset;

/**
 * Initialize the historical weather dataset
 * This should be called once when the application starts
 */
export function initializeHistoricalDataset(): void {
  if (!historicalDataset) {
    historicalDataset = generateMockHistoricalData();
    console.log('Historical weather dataset initialized (2025-2100)');
  }
}

/**
 * Get the complete historical weather dataset
 * @returns The complete dataset for 2025-2100
 */
export function getHistoricalDataset(): HistoricalWeatherDataset {
  if (!historicalDataset) {
    initializeHistoricalDataset();
  }
  return historicalDataset;
}

/**
 * Get weather data for a specific year and quarter
 * @param year - Year to retrieve (2025-2100)
 * @param quarter - Quarter to retrieve (1-4)
 * @returns Weather data for the specified year and quarter
 * @throws Error if year or quarter is invalid
 */
export function getQuarterlyWeatherData(year: HistoricalYear, quarter: Quarter): HistoricalWeatherData {
  if (!historicalDataset) {
    initializeHistoricalDataset();
  }

  // Validate year range
  if (year < 2025 || year > 2100) {
    throw new Error(`Invalid year: ${year}. Must be between 2025 and 2100.`);
  }

  // Validate quarter
  if (quarter < 1 || quarter > 4) {
    throw new Error(`Invalid quarter: ${quarter}. Must be 1, 2, 3, or 4.`);
  }

  const yearData = historicalDataset.data[year];
  if (!yearData) {
    throw new Error(`No data available for year: ${year}`);
  }

  switch (quarter) {
    case 1:
      return yearData.quarter1;
    case 2:
      return yearData.quarter2;
    case 3:
      return yearData.quarter3;
    case 4:
      return yearData.quarter4;
    default:
      throw new Error(`Invalid quarter: ${quarter}`);
  }
}

/**
 * Get all quarterly weather data for a specific year
 * @param year - Year to retrieve (2025-2100)
 * @returns All quarterly data for the specified year
 * @throws Error if year is invalid
 */
export function getYearlyWeatherData(year: HistoricalYear): QuarterlyWeatherData {
  if (!historicalDataset) {
    initializeHistoricalDataset();
  }

  // Validate year range
  if (year < 2025 || year > 2100) {
    throw new Error(`Invalid year: ${year}. Must be between 2025 and 2100.`);
  }

  const yearData = historicalDataset.data[year];
  if (!yearData) {
    throw new Error(`No data available for year: ${year}`);
  }

  return yearData;
}

/**
 * Get weather data for a range of years
 * @param startYear - Start year (2025-2100)
 * @param endYear - End year (2025-2100)
 * @returns Weather data for the specified year range
 * @throws Error if year range is invalid
 */
export function getYearRangeWeatherData(startYear: HistoricalYear, endYear: HistoricalYear): Record<number, QuarterlyWeatherData> {
  if (!historicalDataset) {
    initializeHistoricalDataset();
  }

  // Validate year range
  if (startYear < 2025 || endYear > 2100 || startYear > endYear) {
    throw new Error(`Invalid year range: ${startYear}-${endYear}. Must be between 2025 and 2100, with start <= end.`);
  }

  const rangeData: Record<number, QuarterlyWeatherData> = {};
  
  for (let year = startYear; year <= endYear; year++) {
    const yearData = historicalDataset.data[year];
    if (yearData) {
      rangeData[year] = yearData;
    }
  }

  return rangeData;
}

/**
 * Get available years in the dataset
 * @returns Array of available years
 */
export function getAvailableYears(): HistoricalYear[] {
  if (!historicalDataset) {
    initializeHistoricalDataset();
  }

  return Object.keys(historicalDataset.data).map(Number).sort((a, b) => a - b);
}

/**
 * Check if data is available for a specific year
 * @param year - Year to check
 * @returns True if data is available
 */
export function isYearAvailable(year: HistoricalYear): boolean {
  if (!historicalDataset) {
    initializeHistoricalDataset();
  }

  return year >= 2025 && year <= 2100 && !!historicalDataset.data[year];
}

/**
 * Get dataset metadata
 * @returns Dataset metadata information
 */
export function getDatasetMetadata() {
  if (!historicalDataset) {
    initializeHistoricalDataset();
  }

  return historicalDataset.metadata;
}

// ============================================================================
// DATA VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate weather data values are within reasonable ranges
 * @param data - Weather data to validate
 * @returns True if data is valid
 */
export function validateWeatherData(data: HistoricalWeatherData): boolean {
  return (
    data.temperature >= -50 && data.temperature <= 60 && // Reasonable temperature range
    data.dewPoint >= -60 && data.dewPoint <= 50 && // Reasonable dew point range
    data.precipitation >= 0 && data.precipitation <= 10000 && // Reasonable precipitation range
    data.windSpeed >= 0 && data.windSpeed <= 200 && // Reasonable wind speed range
    data.humidity >= 0 && data.humidity <= 100 // Humidity percentage
  );
}

/**
 * Validate a year is within the supported range
 * @param year - Year to validate
 * @returns True if year is valid
 */
export function validateYear(year: number): year is HistoricalYear {
  return year >= 2025 && year <= 2100 && Number.isInteger(year);
}

/**
 * Validate a quarter is valid
 * @param quarter - Quarter to validate
 * @returns True if quarter is valid
 */
export function validateQuarter(quarter: number): quarter is Quarter {
  return quarter >= 1 && quarter <= 4 && Number.isInteger(quarter);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get quarter name from quarter number
 * @param quarter - Quarter number (1-4)
 * @returns Quarter name
 */
export function getQuarterName(quarter: Quarter): string {
  const names = {
    1: 'Q1 (January-March)',
    2: 'Q2 (April-June)',
    3: 'Q3 (July-September)',
    4: 'Q4 (October-December)'
  };
  return names[quarter];
}

/**
 * Get quarter start and end months
 * @param quarter - Quarter number (1-4)
 * @returns Object with start and end months
 */
export function getQuarterMonths(quarter: Quarter): { start: string; end: string } {
  const months = {
    1: { start: 'January', end: 'March' },
    2: { start: 'April', end: 'June' },
    3: { start: 'July', end: 'September' },
    4: { start: 'October', end: 'December' }
  };
  return months[quarter];
}

/**
 * Calculate average weather data from multiple data points
 * @param dataPoints - Array of weather data points
 * @returns Averaged weather data
 */
export function calculateAverageWeatherData(dataPoints: HistoricalWeatherData[]): HistoricalWeatherData {
  if (dataPoints.length === 0) {
    throw new Error('Cannot calculate average from empty data array');
  }

  const sum = dataPoints.reduce((acc, data) => ({
    temperature: acc.temperature + data.temperature,
    dewPoint: acc.dewPoint + data.dewPoint,
    precipitation: acc.precipitation + data.precipitation,
    windSpeed: acc.windSpeed + data.windSpeed,
    humidity: acc.humidity + data.humidity
  }), {
    temperature: 0,
    dewPoint: 0,
    precipitation: 0,
    windSpeed: 0,
    humidity: 0
  });

  const count = dataPoints.length;
  
  return {
    temperature: sum.temperature / count,
    dewPoint: sum.dewPoint / count,
    precipitation: sum.precipitation / count,
    windSpeed: sum.windSpeed / count,
    humidity: sum.humidity / count,
    date: dataPoints[0].date, // Use first date as reference
    location: dataPoints[0].location
  };
}
