// Test script to validate MLR model accuracy
const { ModelValidationService } = require('../lib/services/model-validation.ts');

async function testModelAccuracy() {
  console.log('🧪 Testing MLR Model Accuracy...\n');
  
  const validationService = new ModelValidationService();
  
  // Test 1: Known data points validation
  console.log('📊 Test 1: Known Data Points Validation');
  console.log('=====================================');
  
  const knownDataResults = validationService.testKnownDataPoints();
  
  knownDataResults.forEach(result => {
    console.log(`${result.period}:`);
    console.log(`  Predicted: ${result.predictedYield.toFixed(1)}`);
    console.log(`  Expected:  ${result.actualYield.toFixed(1)}`);
    console.log(`  Error:     ${result.error.toFixed(2)}%`);
    console.log(`  Accuracy:  ${result.accuracy.toFixed(2)}%`);
    console.log('');
  });
  
  const avgAccuracy = knownDataResults.reduce((sum, r) => sum + r.accuracy, 0) / knownDataResults.length;
  console.log(`📈 Average Accuracy: ${avgAccuracy.toFixed(2)}%`);
  console.log(`🎯 Target Accuracy: 96.01%`);
  console.log(`✅ Status: ${avgAccuracy >= 96 ? 'PASS' : 'FAIL'}\n`);
  
  // Test 2: Forecast data validation
  console.log('📊 Test 2: Forecast Data Validation');
  console.log('==================================');
  
  try {
    const forecastResults = validationService.validateForecastAccuracy();
    
    if (forecastResults.length > 0) {
      const forecastAccuracy = forecastResults.reduce((sum, r) => sum + r.accuracy, 0) / forecastResults.length;
      console.log(`📈 Forecast Data Accuracy: ${forecastAccuracy.toFixed(2)}%`);
      console.log(`📊 Data Points Tested: ${forecastResults.length}`);
      
      // Show worst and best predictions
      const worst = forecastResults.reduce((worst, current) => current.accuracy < worst.accuracy ? current : worst);
      const best = forecastResults.reduce((best, current) => current.accuracy > best.accuracy ? current : best);
      
      console.log(`🔴 Worst Prediction: ${worst.period} (${worst.accuracy.toFixed(2)}%)`);
      console.log(`🟢 Best Prediction:  ${best.period} (${best.accuracy.toFixed(2)}%)`);
    } else {
      console.log('⚠️ No forecast data available for testing');
    }
  } catch (error) {
    console.log('❌ Error testing forecast data:', error.message);
  }
  
  console.log('\n🎯 Validation Complete!');
}

// Run the test
testModelAccuracy().catch(console.error);
