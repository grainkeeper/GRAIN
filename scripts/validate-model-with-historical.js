// Comprehensive Model Validation Script
// Tests MLR model accuracy with historical data

console.log('🧪 Comprehensive Model Validation with Historical Data\n');

// MLR Model Formulas
function predictQuarter1(temperature, dewPoint, precipitation, windSpeed, humidity) {
  return 8478.474259 * temperature - 16643.35313 * dewPoint + 36502.00765 * precipitation - 5998.639807 * windSpeed - 787.357142 * humidity + 420307.9461;
}

function predictQuarter2(temperature, dewPoint, precipitation, windSpeed, humidity) {
  return -3835.953799 * temperature - 6149.597523 * dewPoint - 4483.424128 * precipitation - 2593.991107 * windSpeed - 8024.420014 * humidity + 1067116.384;
}

function predictQuarter3(temperature, dewPoint, precipitation, windSpeed, humidity) {
  return 16630.77076 * temperature - 1018.254139 * dewPoint + 403.126612 * precipitation + 74623.00801 * windSpeed + 25918.43338 * humidity - 2410001.76;
}

function predictQuarter4(temperature, dewPoint, precipitation, windSpeed, humidity) {
  return 8993.693672 * temperature + 5844.061829 * dewPoint - 30748.53656 * precipitation - 33023.39764 * windSpeed - 1155.458549 * humidity + 410764.6506;
}

// Sample historical weather data (2010-2024)
const historicalWeatherData = [
  // 2020 - Sample data
  { year: 2020, quarter: 1, temperature: 26.5, dewPoint: 21.2, precipitation: 220, windSpeed: 3.1, humidity: 78 },
  { year: 2020, quarter: 2, temperature: 28.3, dewPoint: 22.8, precipitation: 320, windSpeed: 3.5, humidity: 82 },
  { year: 2020, quarter: 3, temperature: 30.1, dewPoint: 23.1, precipitation: 480, windSpeed: 2.8, humidity: 85 },
  { year: 2020, quarter: 4, temperature: 27.2, dewPoint: 20.1, precipitation: 380, windSpeed: 3.3, humidity: 79 },
  
  // 2021 - Sample data
  { year: 2021, quarter: 1, temperature: 26.8, dewPoint: 21.5, precipitation: 235, windSpeed: 3.2, humidity: 79 },
  { year: 2021, quarter: 2, temperature: 28.5, dewPoint: 22.9, precipitation: 325, windSpeed: 3.6, humidity: 83 },
  { year: 2021, quarter: 3, temperature: 30.3, dewPoint: 23.3, precipitation: 490, windSpeed: 2.9, humidity: 86 },
  { year: 2021, quarter: 4, temperature: 27.5, dewPoint: 20.3, precipitation: 385, windSpeed: 3.4, humidity: 80 },
  
  // 2022 - Sample data
  { year: 2022, quarter: 1, temperature: 27.1, dewPoint: 21.8, precipitation: 240, windSpeed: 3.3, humidity: 80 },
  { year: 2022, quarter: 2, temperature: 28.8, dewPoint: 23.1, precipitation: 330, windSpeed: 3.7, humidity: 84 },
  { year: 2022, quarter: 3, temperature: 30.6, dewPoint: 23.5, precipitation: 500, windSpeed: 3.0, humidity: 87 },
  { year: 2022, quarter: 4, temperature: 27.8, dewPoint: 20.5, precipitation: 390, windSpeed: 3.5, humidity: 81 },
  
  // 2023 - Sample data
  { year: 2023, quarter: 1, temperature: 27.4, dewPoint: 22.1, precipitation: 245, windSpeed: 3.4, humidity: 81 },
  { year: 2023, quarter: 2, temperature: 29.1, dewPoint: 23.3, precipitation: 335, windSpeed: 3.8, humidity: 85 },
  { year: 2023, quarter: 3, temperature: 30.9, dewPoint: 23.7, precipitation: 510, windSpeed: 3.1, humidity: 88 },
  { year: 2023, quarter: 4, temperature: 28.1, dewPoint: 20.7, precipitation: 395, windSpeed: 3.6, humidity: 82 },
  
  // 2024 - Sample data
  { year: 2024, quarter: 1, temperature: 27.7, dewPoint: 22.4, precipitation: 250, windSpeed: 3.5, humidity: 82 },
  { year: 2024, quarter: 2, temperature: 29.4, dewPoint: 23.5, precipitation: 340, windSpeed: 3.9, humidity: 86 },
  { year: 2024, quarter: 3, temperature: 31.2, dewPoint: 23.9, precipitation: 520, windSpeed: 3.2, humidity: 89 },
  { year: 2024, quarter: 4, temperature: 28.4, dewPoint: 20.9, precipitation: 400, windSpeed: 3.7, humidity: 83 }
];

// Sample actual yield data (2010-2024) - Replace with real data
// Note: Converting to kg/ha to match MLR model output
const actualYieldData = [
  // 2020
  { year: 2020, quarter: 1, actualYield: 4800 }, // 4.8 tons/ha * 1000
  { year: 2020, quarter: 2, actualYield: 4200 },
  { year: 2020, quarter: 3, actualYield: 5100 },
  { year: 2020, quarter: 4, actualYield: 3900 },
  
  // 2021
  { year: 2021, quarter: 1, actualYield: 4900 },
  { year: 2021, quarter: 2, actualYield: 4300 },
  { year: 2021, quarter: 3, actualYield: 5200 },
  { year: 2021, quarter: 4, actualYield: 4000 },
  
  // 2022
  { year: 2022, quarter: 1, actualYield: 5000 },
  { year: 2022, quarter: 2, actualYield: 4400 },
  { year: 2022, quarter: 3, actualYield: 5300 },
  { year: 2022, quarter: 4, actualYield: 4100 },
  
  // 2023
  { year: 2023, quarter: 1, actualYield: 5100 },
  { year: 2023, quarter: 2, actualYield: 4500 },
  { year: 2023, quarter: 3, actualYield: 5400 },
  { year: 2023, quarter: 4, actualYield: 4200 },
  
  // 2024
  { year: 2024, quarter: 1, actualYield: 5200 },
  { year: 2024, quarter: 2, actualYield: 4600 },
  { year: 2024, quarter: 3, actualYield: 5500 },
  { year: 2024, quarter: 4, actualYield: 4300 }
];

// Validation function
function validateModelWithHistoricalData() {
  console.log('📊 Testing MLR Model with Historical Data (2020-2024)');
  console.log('===================================================\n');
  
  const results = [];
  let totalAccuracy = 0;
  let testCount = 0;
  
  // Test each historical data point
  historicalWeatherData.forEach(weather => {
    const actualYield = actualYieldData.find(y => y.year === weather.year && y.quarter === weather.quarter);
    
    if (actualYield) {
      let predictedYield;
      
      // Run MLR model
      switch (weather.quarter) {
        case 1: predictedYield = predictQuarter1(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity); break;
        case 2: predictedYield = predictQuarter2(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity); break;
        case 3: predictedYield = predictQuarter3(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity); break;
        case 4: predictedYield = predictQuarter4(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity); break;
      }
      
      // Model outputs are in kg/ha, keep in same units for comparison
      const predictedYieldKg = predictedYield;
      
      // Calculate accuracy
      const error = Math.abs(predictedYieldKg - actualYield.actualYield) / actualYield.actualYield * 100;
      const accuracy = Math.max(0, 100 - error);
      
      results.push({
        period: `Q${weather.quarter} ${weather.year}`,
        predictedYield: predictedYieldKg.toFixed(0),
        actualYield: actualYield.actualYield.toFixed(0),
        error: error.toFixed(2),
        accuracy: accuracy.toFixed(2)
      });
      
      totalAccuracy += accuracy;
      testCount++;
    }
  });
  
  // Display results
  results.forEach(result => {
    console.log(`${result.period}:`);
    console.log(`  Predicted: ${result.predictedYield} kg/ha`);
    console.log(`  Actual:    ${result.actualYield} kg/ha`);
    console.log(`  Error:     ${result.error}%`);
    console.log(`  Accuracy:  ${result.accuracy}%`);
    console.log('');
  });
  
  const averageAccuracy = totalAccuracy / testCount;
  
  console.log('📈 Historical Validation Results');
  console.log('================================');
  console.log(`Average Accuracy: ${averageAccuracy.toFixed(2)}%`);
  console.log(`Target Accuracy:  96.01%`);
  console.log(`Status:          ${averageAccuracy >= 96 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Data Points:     ${testCount}`);
  
  if (averageAccuracy >= 96) {
    console.log('\n🎉 Historical validation successful!');
    console.log('✅ The MLR model performs well with historical data.');
    console.log('✅ The forecasting system is validated for real-world use.');
  } else {
    console.log('\n⚠️ Historical validation needs improvement!');
    console.log('❌ The model may need adjustment for historical conditions.');
    console.log('❌ Consider retraining with more historical data.');
  }
  
  return { averageAccuracy, results };
}

// Run validation
const validationResults = validateModelWithHistoricalData();

console.log('\n🔍 Data Sources for Historical Validation:');
console.log('==========================================');
console.log('1. WeatherAPI.com - Historical weather data (2010-present)');
console.log('2. PAGASA - Philippine weather records');
console.log('3. PhilRice - Rice yield statistics');
console.log('4. PSA - Agricultural production data');
console.log('5. Department of Agriculture - Official yield records');
console.log('\n📝 Note: This test uses sample data. Replace with actual historical data for production validation.');
