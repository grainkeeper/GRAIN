import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, action, farmingData } = body

    if (!message && !action) {
      return NextResponse.json({ error: 'Message or action is required' }, { status: 400 })
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    let prompt: string

    if (action) {
      // Handle quick actions
      const actionPrompts: Record<string, string> = {
        weather: 'Provide a weather forecast and planting window advice for rice farming in the Philippines.',
        location: 'Ask for the farmer\'s location to provide personalized advice.',
        irrigation: 'Provide irrigation advice for rice farming based on current conditions.',
        yield: 'Provide yield prediction advice and optimization tips for rice farming.',
        profile: 'Thank the farmer for completing their profile and offer personalized assistance.'
      }
      prompt = actionPrompts[action] || 'Provide general rice farming advice.'
    } else {
      // Handle regular messages
      prompt = `You are GRAINKEEPER, an AI farming assistant specialized in rice farming in the Philippines. 
      Provide helpful, practical advice. Keep responses concise and encouraging.
      
      User message: ${message}`
    }

    // Add farming data context if available
    if (farmingData) {
      prompt += `\n\nFarmer Profile:
      - Location: ${farmingData.location.city}, ${farmingData.location.province}
      - Rice Variety: ${farmingData.crop.variety}
      - Growth Stage: ${farmingData.crop.growthStage}
      - Soil Type: ${farmingData.soil.type}
      - Current Weather: ${farmingData.weather.currentConditions}
      
      Use this information to provide personalized recommendations.`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      success: true,
      response: {
        text,
        confidence: 0.8,
        recommendations: [],
        weatherAlert: false,
        nextActions: []
      }
    })

  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process message',
        response: {
          text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
          confidence: 0.3,
          recommendations: [],
          weatherAlert: false,
          nextActions: []
        }
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Chatbot API is working' })
}
