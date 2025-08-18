'use client'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/utils/logger'

export function LogoutButton() {
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        logger.error('Logout error:', error)
        return
      }
      localStorage.removeItem('grainkeeper_session_id')
      localStorage.removeItem('grainkeeper_farming_data')
      window.location.href = '/auth/login' // Force a hard redirect
    } catch (error) {
      logger.error('Logout error:', error)
      window.location.href = '/auth/login' // Fallback
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  )
}
