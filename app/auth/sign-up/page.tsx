import { SignUpForm } from '@/components/sign-up-form'
import { Wheat } from 'lucide-react'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 md:p-10">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/Rice Grain Background.jpg"
          alt="Rice grain background"
          fill
          className="object-cover"
          priority
          quality={95}
        />
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Wheat className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">GrainKeeper</span>
          </div>
          <p className="text-white/90 text-sm">Smart Rice Farming Platform</p>
        </div>
        
        <SignUpForm />
      </div>
    </div>
  )
}
