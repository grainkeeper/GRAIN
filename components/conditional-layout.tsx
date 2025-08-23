'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { ChatbotWrapper } from "@/components/chatbot/chatbot-wrapper"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  if (isAdminPage) {
    // Admin pages get clean layout without navbar and chatbot
    return <>{children}</>
  }

  // Non-admin pages get the full layout with navbar and chatbot
  return (
    <>
      <Navbar />
      {children}
      <ChatbotWrapper />
    </>
  )
}
