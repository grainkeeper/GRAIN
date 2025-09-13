import { LoginForm } from '@/components/login-form'
import Image from 'next/image'
import { Suspense } from 'react'

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 md:p-10">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/Background.png"
          alt="Rice grain background"
          fill
          className="object-cover"
          priority
          quality={95}
        />
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-500 to-yellow-400"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image 
              src="/Images/chatbot.png" 
              alt="GR-AI-N Logo" 
              width={48} 
              height={48} 
              className="h-12 w-12"
            />
            <span className="text-2xl font-bold text-white font-arigato">GR-AI-N</span>
          </div>
          <p className="text-white/90 text-sm">Smart Rice Farming Platform</p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="text-white">Loading...</div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
