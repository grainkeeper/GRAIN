import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, farmingData, sessionId } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Create a context-aware prompt
    let prompt = `You are GRAINKEEPER, an AI farming assistant specialized in rice farming in the Philippines, with particular expertise in Region 12 (SOCCSKSARGEN).

CRITICAL BEHAVIOR RULES:
- ALWAYS maintain conversation context and remember information the user has already provided
- NEVER ask for information (location, crop details, soil type, etc.) that the user has already given
- Be conversational, helpful, and specific in your recommendations
- Reference previous context when answering follow-up questions
- If the user asks about a problem, provide actionable solutions based on their specific situation
- Keep responses DIRECT, ACCURATE, and CONCISE - avoid unnecessary explanations unless specifically requested
- Focus on practical, actionable advice that farmers can implement immediately
- Use bullet points or numbered lists for multiple recommendations
- Be specific about timing, quantities, and methods when giving advice

Key Knowledge Areas:
- Planting seasons and timing for different regions
- Irrigation management and water conservation  
- Fertilizer application and soil management
- Pest and disease control
- Harvest and post-harvest practices
- Weather adaptation strategies
- Rice variety selection

Provide helpful, practical advice based on scientific farming practices. Keep responses concise and encouraging.`

    // Add farming profile context if available
    if (farmingData) {
      prompt += `\n\nFARMER PROFILE (USE THIS INFORMATION FOR PERSONALIZED ADVICE):
- Location: ${farmingData.location.city?.name || 'N/A'}, ${farmingData.location.province?.name || 'N/A'}
- Rice Variety: ${farmingData.crop.variety}
- Growth Stage: ${farmingData.crop.growthStage}
- Soil Type: ${farmingData.soil.type}
- Current Weather: ${farmingData.weather.currentConditions}

IMPORTANT: Always consider this farming profile when providing advice. Reference the specific location, rice variety, growth stage, and soil conditions in your recommendations.`
    } else {
      // If no farming data, guide user to setup profile
      prompt += `\n\nIMPORTANT: The user has not set up their farming profile yet. If they ask for farming advice, politely remind them to set up their profile first to get personalized recommendations. You can provide general rice farming information, but emphasize the need for a profile for specific advice.`
    }

    prompt += `\n\nUser message: ${message}
Session ID: ${sessionId || 'new_session'}`

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
      },
      sessionId: sessionId || 'new_session_' + Date.now()
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
