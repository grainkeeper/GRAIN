import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's conversations
    const { data: conversations, error: convError } = await supabase
      .from('chatbot_conversations')
      .select(`
        id,
        session_id,
        conversation_title,
        conversation_type,
        is_active,
        created_at,
        last_activity,
        total_messages,
        user_location_province,
        user_location_region,
        user_farming_data
      `)
      .eq('user_id', user.id)
      .order('last_activity', { ascending: false })

    if (convError) {
      console.error('Error fetching conversations:', convError)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      conversations: conversations || []
    })

  } catch (error) {
    console.error('Conversations API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get messages for specific conversation
    const { data: messages, error: msgError } = await supabase
      .from('chatbot_messages')
      .select(`
        id,
        message_text,
        message_type,
        message_role,
        message_timestamp,
        message_context,
        bot_response_data
      `)
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .order('message_timestamp', { ascending: true })

    if (msgError) {
      console.error('Error fetching messages:', msgError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    })

  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
