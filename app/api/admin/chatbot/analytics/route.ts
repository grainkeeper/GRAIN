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
  
  // Calculate satisfaction metrics
  const ratedMessages = messages?.filter(m => m.user_rating) || []
  const avgRating = ratedMessages.length > 0 
    ? ratedMessages.reduce((sum, m) => sum + (m.user_rating || 0), 0) / ratedMessages.length 
    : 0
  const helpfulCount = messages?.filter(m => m.is_helpful === true).length || 0
  const helpfulRate = messages?.length > 0 ? (helpfulCount / messages.length) * 100 : 0

  // Daily activity for last 7 days
  const dailyStats = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
    
    const dayMessages = messages?.filter(m => {
      const msgDate = new Date(m.created_at)
      return msgDate >= dayStart && msgDate < dayEnd
    }).length || 0

    dailyStats.push({
      date: dayStart.toISOString().split('T')[0],
      messages: dayMessages
    })
  }

  return NextResponse.json({
    overview: {
      totalConversations,
      activeConversations,
      totalMessages,
      botMessages,
      userMessages
    },
    satisfaction: {
      averageRating: Math.round(avgRating * 10) / 10,
      ratedMessages: ratedMessages.length,
      helpfulRate: Math.round(helpfulRate * 10) / 10
    },
    dailyActivity: dailyStats
  })
}
