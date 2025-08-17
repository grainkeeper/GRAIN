'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/auth/logout-button'
import { Wheat, Home, BarChart3, MessageSquare, MapPin } from 'lucide-react'

const navItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home
  },
  {
    title: 'Yield Predictions',
    href: '/predictions',
    icon: Wheat
  },
  {
    title: 'Map',
    href: '/map',
    icon: MapPin
  }
]

export function Navbar() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return (
    <nav className={cn(
      "transition-all duration-300",
      isHomePage 
        ? "bg-transparent border-transparent absolute top-0 left-0 right-0 z-50" 
        : "border-b bg-white/95 backdrop-blur-sm dark:bg-gray-950/95"
    )}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Wheat className={cn("h-6 w-6", isHomePage ? "text-white" : "")} />
              <span className={cn("text-xl font-bold", isHomePage ? "text-white" : "")}>GrainKeeper</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                      isHomePage 
                        ? pathname === item.href
                          ? "text-white"
                          : "text-white/80 hover:text-white"
                        : pathname === item.href
                          ? "text-black dark:text-white"
                          : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
