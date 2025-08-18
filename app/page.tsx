import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wheat, TrendingUp, Zap, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden h-screen">
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
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Content */}
        <div className="relative text-center space-y-8 h-full flex flex-col justify-center items-center px-8">
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-xl">
              Smart Rice Farming with <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">96.01% Accuracy</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/95 drop-shadow-lg font-medium leading-relaxed">
            Revolutionize your rice farming with our ML-powered predictions. Get precise planting recommendations, weather insights, and yield forecasts tailored for the Philippines.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 text-base shadow-md hover:shadow-lg transition-all duration-200">
              <Link href="/predictions">Get Yield Predictions</Link>
            </Button>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center space-y-2 text-white/80">
              <span className="text-sm font-medium">Learn More</span>
              <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-6 py-16 space-y-12">
        {/* Steps Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Get Your Yield Predictions in 3 Easy Steps
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our ML-powered system makes rice farming predictions simple and accurate
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl font-extrabold">
                1
              </div>
              <h3 className="text-xl font-semibold">Enter Location</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Select your farm location anywhere in the Philippines for precise regional data
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl font-extrabold">
                2
              </div>
              <h3 className="text-xl font-semibold">Choose Year & Quarter</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Specify the year and planting quarter (Q1, Q2, Q3, or Q4) for your crop cycle
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl font-extrabold">
                3
              </div>
              <h3 className="text-xl font-semibold">Get Predictions</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Receive top 3 optimal 7-day planting windows with 96.01% accuracy
              </p>
            </div>
          </div>

          <div className="text-center mt-2">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-5">
              <Link href="/predictions">Start Your Prediction</Link>
            </Button>
          </div>
        </section>

        {/* Precision Feature Cards */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Precision Agriculture for Filipino Farmers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
              Our advanced MLR formula delivers unmatched accuracy to optimize your rice production
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Yield Predictions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pt-5 pb-3">
                <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-700" />
                </div>
                <CardTitle className="text-center">Yield Predictions</CardTitle>
                <CardDescription className="text-center">
                  96.01% accurate ML predictions for optimal planting times
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2 pt-0">
                <p>• Location-based recommendations</p>
                <p>• Quarterly planting schedules</p>
                <p>• Top 3 optimal 7-day windows</p>
                <p>• Rice variety considerations</p>
              </CardContent>
            </Card>

            {/* Smart Analytics */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pt-5 pb-3">
                <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-700" />
                </div>
                <CardTitle className="text-center">Smart Analytics</CardTitle>
                <CardDescription className="text-center">
                  Data-driven insights for better farming decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2 pt-0">
                <p>• Historical yield trends</p>
                <p>• Weather pattern analysis</p>
                <p>• Risk assessment tools</p>
                <p>• Performance tracking</p>
              </CardContent>
            </Card>

            {/* AI Chatbot */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pt-5 pb-3">
                <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-700" />
                </div>
                <CardTitle className="text-center">AI Chatbot</CardTitle>
                <CardDescription className="text-center">
                  Personalized farming advice and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2 pt-0">
                <p>• Ask rice-farming questions</p>
                <p>• Location-aware answers</p>
                <p>• Tips on variety and inputs</p>
                <p>• Available as floating widget</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Wheat className="h-6 w-6 text-green-400" />
                <span className="text-xl font-bold">GrainKeeper</span>
              </div>
              <p className="text-gray-400">
                Empowering Filipino farmers with AI-powered rice yield predictions and expert farming guidance.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/predictions" className="text-gray-400 hover:text-white transition-colors">Yield Predictions</Link></li>
                
                <li><span className="text-gray-400">AI Chatbot (Floating Widget)</span></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>Email: info@grainkeeper.ph</p>
                <p>Phone: +63 2 8123 4567</p>
                <p>Address: Quezon City, Philippines</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 GrainKeeper. All rights reserved. Empowering Filipino farmers with AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
