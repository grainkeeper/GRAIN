// Simple test for chatbot API
async function testSimpleChatbot() {
  console.log('🧪 Testing Simple Chatbot API...\n')

  try {
    const response = await fetch('http://localhost:3000/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        sessionId: 'test_123'
      })
    })
    
    if (!response.ok) {
      console.log('❌ HTTP Error:', response.status, response.statusText)
      const text = await response.text()
      console.log('Response body:', text.substring(0, 200))
      return
    }
    
    const data = await response.json()
    console.log('✅ API Response:', data)
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testSimpleChatbot()
