'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/utils/logger'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        logger.error('Logout error:', error)
        return
      }

      // Clear any local storage data
      localStorage.removeItem('grainkeeper_session_id')
      localStorage.removeItem('grainkeeper_farming_data')
      
      // Force a hard redirect to login page
      window.location.href = '/auth/login'
    } catch (error) {
      logger.error('Logout error:', error)
      // Fallback to hard redirect
      window.location.href = '/auth/login'
    }
  }

  return <Button onClick={logout}>Logout</Button>
}
