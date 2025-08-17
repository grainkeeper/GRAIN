import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { RICE_FARMING_KNOWLEDGE_BASE, searchAdvice, getAdviceByCategory } from '@/lib/data/rice-farming-knowledge-base'
import { getWeatherAlerts, getWeatherRecommendations, WeatherCondition } from '@/lib/services/weather-alerts'
import { getSystemPrompt, Language } from '@/lib/translations/chatbot-translations'
import { sessionManager, buildContextPrompt, updateContextFromResponse } from '@/lib/services/session-management'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, action, farmingData, language = 'en', sessionId } = body

    if (!message && !action) {
      return NextResponse.json({ error: 'Message or action is required' }, { status: 400 })
    }

    // Handle session management
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const newSession = sessionManager.createSession()
      currentSessionId = newSession.sessionId
    } else {
      const session = sessionManager.getSession(currentSessionId)
      if (!session) {
        const newSession = sessionManager.createSession()
        currentSessionId = newSession.sessionId
      }
    }

    // Update session with farming data and language preference
    if (farmingData) {
      sessionManager.updateFarmingData(currentSessionId, farmingData)
    }
    sessionManager.setUserPreferences(currentSessionId, { language })

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
      const systemPrompt = getSystemPrompt(language as Language)
      
      // Get session context for better responses
      const session = sessionManager.getSession(currentSessionId)
      if (session) {
        sessionManager.addMessage(currentSessionId, message)
        const contextPrompt = buildContextPrompt(session, message)
        prompt = `${systemPrompt}\n\n${contextPrompt}`
      } else {
        prompt = `${systemPrompt}\n\nUser message: ${message}`
      }
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
      
      // Add Region 12 specific knowledge if applicable
      if (farmingData.location.province.toLowerCase().includes('cotabato') || 
          farmingData.location.province.toLowerCase().includes('sarangani') ||
          farmingData.location.province.toLowerCase().includes('sultan kudarat') ||
          farmingData.location.province.toLowerCase().includes('general santos')) {
        
        const region12Advice = searchAdvice(farmingData.crop.growthStage)
        if (region12Advice.length > 0) {
          prompt += `\n\nRegion 12 Specific Knowledge for ${farmingData.crop.growthStage} stage:
          ${region12Advice.slice(0, 2).map(advice => 
            `- ${advice.title}: ${advice.recommendations.slice(0, 2).join(', ')}`
          ).join('\n')}`
        }
      }
      
      // Add weather-based recommendations
      const weatherCondition: WeatherCondition = {
        temperature: 30, // Default values - in real app, get from weather API
        humidity: 70,
        rainfall: 20,
        windSpeed: 10,
        forecast: farmingData.weather.currentConditions,
        season: farmingData.weather.currentConditions.includes('rain') ? 'wet' : 'dry'
      }
      
      const weatherRecommendations = getWeatherRecommendations(weatherCondition, farmingData.crop.growthStage)
      if (weatherRecommendations.length > 0) {
        prompt += `\n\nWeather-Based Recommendations for ${farmingData.crop.growthStage} stage:
        ${weatherRecommendations.map(rec => `- ${rec}`).join('\n')}`
      }
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Update session context with response
    if (currentSessionId && message) {
      updateContextFromResponse(currentSessionId, text)
    }

    return NextResponse.json({
      success: true,
      response: {
        text,
        confidence: 0.8,
        recommendations: [],
        weatherAlert: false,
        nextActions: []
      },
      sessionId: currentSessionId
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
