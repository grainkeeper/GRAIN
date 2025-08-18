'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatbotWidget } from './chatbot-widget'
import { logger } from '@/lib/utils/logger'

export function ChatbotWrapper() {
  const [userId, setUserId] = useState<string | null>(null)
  const [key, setKey] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      setKey(user?.id || 'anonymous')
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logger.info('ChatbotWrapper: Auth state changed', { event, userId: session?.user?.id })
      
      if (event === 'SIGNED_IN') {
        setUserId(session?.user?.id || null)
        setKey(session?.user?.id || 'anonymous')
      } else if (event === 'SIGNED_OUT') {
        setUserId(null)
        setKey('anonymous')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return <ChatbotWidget key={key} />
}
