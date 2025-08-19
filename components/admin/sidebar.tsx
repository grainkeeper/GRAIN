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
  Wheat,
  Bot,
  MapPin,
  Database,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Yield Data',
    href: '/admin/yield-data',
    icon: Wheat
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
    title: 'Prediction Settings',
    href: '/admin/prediction-settings',
    icon: BarChart3
  },
  {
    title: 'Map',
    href: '/admin/map',
    icon: MapPin
  },
  {
    title: 'Map Settings',
    href: '/admin/map/settings',
    icon: Settings
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col bg-white dark:bg-gray-950 border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">GrainKeeper</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
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
