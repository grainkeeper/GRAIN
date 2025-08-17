// Validate MLR Model with Real PSA Data
// Using actual Philippine rice production data

console.log('🧪 Validating MLR Model with Real PSA Data\n');

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

// Real PSA Data (from the image you provided)
const psaData = [
  // 2023 Q4 (Oct-Dec)
  {
    year: 2023,
    quarter: 4,
    actualYield: 7235520.22, // metric tons from PSA
    period: 'Oct-Dec 2023',
    description: 'Total Palay Production'
  },
  // 2024 Q1 (Jan-Mar) 
  {
    year: 2024,
    quarter: 1,
    actualYield: 4685040.07, // metric tons from PSA
    period: 'Jan-Mar 2024',
    description: 'Total Palay Production'
  },
  // 2024 Q4 (Oct-Dec)
  {
    year: 2024,
    quarter: 4,
    actualYield: 7227593.75, // metric tons from PSA
    period: 'Oct-Dec 2024',
    description: 'Total Palay Production'
  },
  // 2025 Q1 (Jan-Mar) - Preliminary
  {
    year: 2025,
    quarter: 1,
    actualYield: 4698708.11, // metric tons from PSA
    period: 'Jan-Mar 2025P',
    description: 'Total Palay Production (Preliminary)'
  }
];

// Sample weather data for these periods (you'll need to get real historical weather)
const weatherData = [
  // 2023 Q4 - Sample weather (replace with real data)
  {
    year: 2023,
    quarter: 4,
    temperature: 27.5,
    dewPoint: 20.5,
    precipitation: 380,
    windSpeed: 3.3,
    humidity: 79
  },
  // 2024 Q1 - Sample weather (replace with real data)
  {
    year: 2024,
    quarter: 1,
    temperature: 26.8,
    dewPoint: 21.2,
    precipitation: 235,
    windSpeed: 3.2,
    humidity: 78
  },
  // 2024 Q4 - Sample weather (replace with real data)
  {
    year: 2024,
    quarter: 4,
    temperature: 27.8,
    dewPoint: 20.8,
    precipitation: 385,
    windSpeed: 3.4,
    humidity: 80
  },
  // 2025 Q1 - Sample weather (replace with real data)
  {
    year: 2025,
    quarter: 1,
    temperature: 27.0,
    dewPoint: 21.5,
    precipitation: 240,
    windSpeed: 3.3,
    humidity: 79
  }
];

// Validation function
function validateWithPSAData() {
  console.log('📊 Testing MLR Model with Real PSA Data');
  console.log('========================================\n');
  
  const results = [];
  let totalAccuracy = 0;
  let testCount = 0;
  
  psaData.forEach(psaRecord => {
    const weather = weatherData.find(w => w.year === psaRecord.year && w.quarter === psaRecord.quarter);
    
    if (weather) {
      let predictedYield;
      
      // Run MLR model
      switch (psaRecord.quarter) {
        case 1: predictedYield = predictQuarter1(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity); break;
        case 2: predictedYield = predictQuarter2(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity); break;
        case 3: predictedYield = predictQuarter3(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity); break;
        case 4: predictedYield = predictQuarter4(weather.temperature, weather.dewPoint, weather.precipitation, weather.windSpeed, weather.humidity); break;
      }
      
      // Convert PSA data from metric tons to kg/ha for comparison
      // Assuming average rice area in Philippines (rough estimate)
      const averageRiceArea = 4500000; // hectares (approximate)
      const actualYieldKgHa = (psaRecord.actualYield * 1000) / averageRiceArea; // Convert to kg/ha
      
      // Calculate accuracy
      const error = Math.abs(predictedYield - actualYieldKgHa) / actualYieldKgHa * 100;
      const accuracy = Math.max(0, 100 - error);
      
      results.push({
        period: psaRecord.period,
        predictedYield: predictedYield.toFixed(0),
        actualYield: actualYieldKgHa.toFixed(0),
        actualYieldTons: psaRecord.actualYield.toFixed(0),
        error: error.toFixed(2),
        accuracy: accuracy.toFixed(2),
        description: psaRecord.description
      });
      
      totalAccuracy += accuracy;
      testCount++;
    }
  });
  
  // Display results
  results.forEach(result => {
    console.log(`${result.period} (${result.description}):`);
    console.log(`  Predicted: ${result.predictedYield} kg/ha`);
    console.log(`  Actual:    ${result.actualYield} kg/ha (${result.actualYieldTons} metric tons total)`);
    console.log(`  Error:     ${result.error}%`);
    console.log(`  Accuracy:  ${result.accuracy}%`);
    console.log('');
  });
  
  const averageAccuracy = totalAccuracy / testCount;
  
  console.log('📈 PSA Data Validation Results');
  console.log('==============================');
  console.log(`Average Accuracy: ${averageAccuracy.toFixed(2)}%`);
  console.log(`Target Accuracy:  96.01%`);
  console.log(`Status:          ${averageAccuracy >= 96 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Data Points:     ${testCount}`);
  console.log(`Data Source:     Philippine Statistics Authority (PSA)`);
  
  if (averageAccuracy >= 96) {
    console.log('\n🎉 PSA validation successful!');
    console.log('✅ Your MLR model matches real Philippine rice production data.');
    console.log('✅ The forecasting system is validated with official government data.');
  } else {
    console.log('\n⚠️ PSA validation needs improvement!');
    console.log('❌ Model may need adjustment for Philippine conditions.');
    console.log('❌ Consider using region-specific weather data.');
  }
  
  return { averageAccuracy, results };
}

// Run validation
const psaResults = validateWithPSAData();

console.log('\n🔍 Next Steps:');
console.log('==============');
console.log('1. Get real historical weather data for these periods');
console.log('2. Use region-specific weather data (not national averages)');
console.log('3. Adjust for rice area variations by region');
console.log('4. Consider seasonal planting patterns');
console.log('\n📝 Note: This uses estimated rice area. For better accuracy, use actual planted area data from PSA.');
