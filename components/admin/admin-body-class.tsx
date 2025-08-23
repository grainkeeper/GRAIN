'use client'

import { useEffect } from 'react'

export default function AdminBodyClass() {
  useEffect(() => {
    // Add admin-page class to body
    document.body.classList.add('admin-page')
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('admin-page')
    }
  }, [])

  return null
}
