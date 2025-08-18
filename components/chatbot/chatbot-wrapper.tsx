'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatbotWidget } from './chatbot-widget'
import { logger } from '@/lib/utils/logger'

export function ChatbotWrapper() {
  const [key, setKey] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setKey(user?.id || 'anonymous')
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logger.info('ChatbotWrapper: Auth state changed', { event, userId: session?.user?.id })
      if (event === 'SIGNED_IN') {
        setKey(session?.user?.id || 'anonymous')
      } else if (event === 'SIGNED_OUT') {
        setKey('anonymous')
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return <ChatbotWidget key={key} />
}
