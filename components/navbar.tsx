'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/auth/logout-button'
import { BarChart3, MessageSquare, Sprout, Target, MapPin, Menu, X, User, ChevronDown, Settings, LogOut, Activity } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'

const navItems = [
  {
    title: 'Yield Predictions',
    href: '/predictions',
    icon: Sprout
  },
  {
    title: 'Growth Tracker',
    href: '/predictions/growth-tracker',
    icon: Target
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
  const isAuthPage = pathname.startsWith('/auth')
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Check if user is admin
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          setIsAdmin(profile?.role === 'admin')
        } catch (error) {
          // If profiles table doesn't exist or user has no profile, default to non-admin
          setIsAdmin(false)
        }
      }
      
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Check admin status when user changes
        const checkAdminStatus = async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single()
            
            setIsAdmin(profile?.role === 'admin')
          } catch (error) {
            setIsAdmin(false)
          }
        }
        checkAdminStatus()
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Don't show navbar on auth pages
  if (isAuthPage) {
    return null
  }

  return (
    <nav className={cn(
      "transition-all duration-300 text-white absolute top-0 left-0 right-0 z-50"
    )}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center ">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/Images/logo.png" 
                alt="GR-AI-N Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8 rounded-full"
              />
              <span className="text-xl font-bold text-white font-arigato">GR-AI-N</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-yellow-200",
                    pathname === item.href
                      ? "text-white"
                      : "text-white/80"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {!loading && (
              <>
                {user ? (
                  <div className="relative" ref={profileDropdownRef}>
                    <Button
                      variant="ghost"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center space-x-2 text-sm font-medium transition-colors text-white hover:text-yellow-200"
                    >
                      <User className="h-4 w-4" />
                      <span>{user.email?.split('@')[0] || user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                        <div className="py-1">
                          {isAdmin && (
                            <Link href="/admin">
                              <div className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer">
                                <Settings className="h-4 w-4" />
                                <span>Dashboard</span>
                              </div>
                            </Link>
                          )}
                          <div 
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                              supabase.auth.signOut()
                              setProfileDropdownOpen(false)
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login">
                      <Button 
                        variant="ghost" 
                        className="text-sm font-medium transition-colors text-white hover:text-yellow-200"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button 
                        className="text-sm font-medium"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Navigation */}
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary py-2 px-3 rounded-md",
                        pathname === item.href
                          ? "text-foreground bg-muted/50"
                          : "text-muted-foreground hover:bg-muted/30"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Mobile Auth Buttons */}
              {!loading && (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  {user ? (
                    <div className="flex flex-col space-y-2">
                      <div className="px-3 py-2 text-sm font-medium text-foreground border-b border-border">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{user.email?.split('@')[0] || user.email}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          supabase.auth.signOut()
                          setMobileMenuOpen(false)
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          className="w-full justify-start text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
