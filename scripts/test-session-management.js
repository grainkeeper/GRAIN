// Test session management functionality without external dependencies
async function testSessionManagement() {
  console.log('🧪 Testing Session Management Improvements...\n')

  try {
    // Test 1: Create a session
    console.log('1. Testing session creation...')
    const response1 = await fetch('http://localhost:3001/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, I am a farmer from Cotabato',
        sessionId: 'test_session_123'
      })
    })
    
    const data1 = await response1.json()
    console.log('✅ Session created:', data1.sessionId ? 'Yes' : 'No')
    console.log('Response:', data1.response.text.substring(0, 100) + '...')

    // Test 2: Send follow-up message with context
    console.log('\n2. Testing context retention...')
    const response2 = await fetch('http://localhost:3001/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What rice variety should I plant?',
        sessionId: data1.sessionId
      })
    })
    
    const data2 = await response2.json()
    console.log('✅ Context maintained:', data2.response.text.includes('Cotabato') ? 'Yes' : 'No')
    console.log('Response:', data2.response.text.substring(0, 100) + '...')

    // Test 3: Test with farming data
    console.log('\n3. Testing farming data integration...')
    const farmingData = {
      location: { city: 'Koronadal', province: 'South Cotabato' },
      crop: { variety: 'IR64', growthStage: 'vegetative' },
      soil: { type: 'clay loam', moisture: 'moderate', ph: '6.5' },
      weather: { currentConditions: 'sunny', rainfall: 'low' }
    }
    
    const response3 = await fetch('http://localhost:3001/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'How should I manage irrigation?',
        sessionId: data1.sessionId,
        farmingData
      })
    })
    
    const data3 = await response3.json()
    console.log('✅ Farming data used:', data3.response.text.includes('IR64') || data3.response.text.includes('vegetative') ? 'Yes' : 'No')
    console.log('Response:', data3.response.text.substring(0, 100) + '...')

    // Test 4: Test follow-up without repeating information
    console.log('\n4. Testing no repetition of provided info...')
    const response4 = await fetch('http://localhost:3001/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What about fertilizer application?',
        sessionId: data1.sessionId
      })
    })
    
    const data4 = await response4.json()
    const asksForLocation = data4.response.text.toLowerCase().includes('where are you') || 
                           data4.response.text.toLowerCase().includes('what is your location') ||
                           data4.response.text.toLowerCase().includes('tell me about your farm')
    console.log('✅ No repetitive questions:', !asksForLocation ? 'Yes' : 'No')
    console.log('Response:', data4.response.text.substring(0, 100) + '...')

    console.log('\n🎉 Session management test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Wait for server to start
setTimeout(testSessionManagement, 3000)
