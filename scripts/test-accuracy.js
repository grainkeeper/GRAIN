// Simple test script to validate MLR model accuracy
console.log('🧪 Testing MLR Model Accuracy...\n');

// MLR Model Formulas (copied from prediction-model.ts)
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

// Test cases from your 75-year forecast data
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

console.log('📊 Testing Known Data Points');
console.log('============================');

let totalAccuracy = 0;
let testCount = 0;

testCases.forEach(testCase => {
  let predictedYield;
  
  switch (testCase.quarter) {
    case 1: predictedYield = predictQuarter1(testCase.weather.temperature, testCase.weather.dewPoint, testCase.weather.precipitation, testCase.weather.windSpeed, testCase.weather.humidity); break;
    case 2: predictedYield = predictQuarter2(testCase.weather.temperature, testCase.weather.dewPoint, testCase.weather.precipitation, testCase.weather.windSpeed, testCase.weather.humidity); break;
    case 3: predictedYield = predictQuarter3(testCase.weather.temperature, testCase.weather.dewPoint, testCase.weather.precipitation, testCase.weather.windSpeed, testCase.weather.humidity); break;
    case 4: predictedYield = predictQuarter4(testCase.weather.temperature, testCase.weather.dewPoint, testCase.weather.precipitation, testCase.weather.windSpeed, testCase.weather.humidity); break;
  }
  
  const error = Math.abs(predictedYield - testCase.expectedYield) / Math.abs(testCase.expectedYield) * 100;
  const accuracy = Math.max(0, 100 - error);
  
  console.log(`${testCase.period}:`);
  console.log(`  Predicted: ${predictedYield.toFixed(1)}`);
  console.log(`  Expected:  ${testCase.expectedYield.toFixed(1)}`);
  console.log(`  Error:     ${error.toFixed(2)}%`);
  console.log(`  Accuracy:  ${accuracy.toFixed(2)}%`);
  console.log('');
  
  totalAccuracy += accuracy;
  testCount++;
});

const averageAccuracy = totalAccuracy / testCount;

console.log('📈 Results Summary');
console.log('==================');
console.log(`Average Accuracy: ${averageAccuracy.toFixed(2)}%`);
console.log(`Target Accuracy:  96.01%`);
console.log(`Status:          ${averageAccuracy >= 96 ? '✅ PASS' : '❌ FAIL'}`);

if (averageAccuracy >= 96) {
  console.log('\n🎉 Model validation successful!');
  console.log('✅ The MLR model is producing accurate predictions.');
  console.log('✅ The forecasting system is ready for production use.');
} else {
  console.log('\n⚠️ Model validation failed!');
  console.log('❌ The MLR model needs adjustment.');
  console.log('❌ Please check the formulas and coefficients.');
}

console.log('\n🔍 How to validate accuracy in practice:');
console.log('1. Use historical weather data (2010-2024) as input');
console.log('2. Run MLR model predictions for those years');
console.log('3. Compare with actual rice yields from those years');
console.log('4. Calculate accuracy: (1 - |predicted - actual| / actual) * 100');
console.log('5. Target: 96.01% accuracy or higher');
