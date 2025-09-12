'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/auth/logout-button'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText,
  BarChart3,
  Bot,
  MapPin,
  Database,
  Menu,
  X
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Varieties',
    href: '/admin/varieties',
    icon: Database
  },
  {
    title: 'Chatbot',
    href: '/admin/chatbot',
    icon: Bot
  },
  {
    title: 'Prediction',
    href: '/admin/prediction-settings',
    icon: BarChart3
  },
  {
    title: 'Map',
    href: '/admin/map',
    icon: MapPin
  },
  {
    title: 'Map Popup Template',
    href: '/admin/map/settings',
    icon: Settings
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
]

interface AdminSidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col bg-gradient-to-b from-green-800 via-green-500 to-yellow-400 text-white border-r transition-all duration-300 h-full",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Image 
            src="/Images/chatbot.png" 
            alt="GR-AI-N Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8"
          />
          {!isCollapsed && (
            <span className="font-arigato text-xl font-bold text-white">GR-AI-N</span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          {/* Mobile close button */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                isCollapsed ? "justify-center" : "justify-start",
                pathname === item.href
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t flex-shrink-0">
        {!isCollapsed && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        )}
        <LogoutButton />
      </div>
    </div>
  )
}
