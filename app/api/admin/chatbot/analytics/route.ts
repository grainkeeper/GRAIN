import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get conversation stats
  const { data: conversations, error: convError } = await supabase
    .from('chatbot_conversations')
    .select('id, created_at, total_messages, is_active')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

  if (convError) return NextResponse.json({ error: convError.message }, { status: 500 })

  // Get message stats
  const { data: messages, error: msgError } = await supabase
    .from('chatbot_messages')
    .select('id, message_type, created_at, user_rating, is_helpful')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 })

  // Calculate analytics
  const totalConversations = conversations?.length || 0
  const activeConversations = conversations?.filter(c => c.is_active).length || 0
  const totalMessages = messages?.length || 0
  const botMessages = messages?.filter(m => m.message_type === 'bot').length || 0
  const userMessages = messages?.filter(m => m.message_type === 'user').length || 0
  
  // Calculate basic metrics (ratings and helpful rates not implemented)
  const avgRating = 0
  const helpfulRate = 0

  return NextResponse.json({
    overview: {
      totalConversations,
      activeConversations,
      totalMessages,
      botMessages,
      userMessages
    }
  })
}
