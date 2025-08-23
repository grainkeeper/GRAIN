import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, farmingData, sessionId, userId, conversationId } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Initialize Supabase
    const supabase = await createClient()

    // Verify user authentication (optional for chatbot)
    const { data: { user } } = await supabase.auth.getUser()
    // Note: We allow unauthenticated users to use the chatbot, but they won't have persistent storage

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Create a context-aware prompt
    let prompt = `You are GRAINKEEPER, an AI farming assistant for rice farming in the Philippines.

RESPONSE RULES:
- Keep responses SHORT and CONCISE (2-3 sentences max)
- Use simple, direct language
- Focus on actionable advice only
- No greetings unless user initiates
- Be specific and practical
- Use line breaks when switching between different topics or advice
- Don't cram everything into one paragraph

CONTENT RULES:
- Never ask for information already provided
- Give specific, practical advice based on user's situation
- Reference their location, crop, and conditions when relevant
- Be direct and to the point`

    // Add farming profile context if available
    if (farmingData) {
      prompt += `\n\nFARMER DATA: ${farmingData.location.city?.name || 'N/A'}, ${farmingData.location.province?.name || 'N/A'} | ${farmingData.crop.variety} | ${farmingData.crop.growthStage} | ${farmingData.soil.type} | ${farmingData.weather.currentConditions}`
    }

    prompt += `\n\nUser message: ${message}
Session ID: ${sessionId || 'new_session'}
User ID: ${userId || 'anonymous'}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Save bot response to database if conversationId is provided and user is authenticated
    if (conversationId && user) {
      try {
        const { error: dbError } = await supabase
          .from('chatbot_messages')
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            message_text: text,
            message_type: 'bot',
            message_role: 'recommendation',
            message_timestamp: new Date().toISOString(),
            message_context: {
              farming_data: farmingData,
              session_id: sessionId
            },
            bot_confidence_score: 0.8,
            bot_response_type: 'recommendation',
            bot_knowledge_source: 'rule_base'
          })

        if (dbError) {
          logger.error('Error saving bot message to database:', dbError)
        }

        // Update conversation metadata
        await supabase
          .from('chatbot_conversations')
          .update({
            last_activity: new Date().toISOString(),
            total_messages: (await supabase
              .from('chatbot_messages')
              .select('id', { count: 'exact' })
              .eq('conversation_id', conversationId)
            ).count || 0
          })
          .eq('id', conversationId)

      } catch (dbError) {
        logger.error('Database error:', dbError)
      }
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
      sessionId: sessionId || 'new_session',
      conversationId: conversationId
    })

  } catch (error) {
    logger.error('Chatbot API error:', error)
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
