import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wheat, TrendingUp, Zap, MessageSquare, MapPin, Target, BarChart3, Calculator, Database, Download } from 'lucide-react'
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
              Rice Yield and Optimal Planting Window Forecasting System
            </h1>
            <p className="text-xl lg:text-2xl text-white/95 drop-shadow-lg font-medium leading-relaxed">
            Revolutionize your rice farming with our ML-powered predictions. Get precise planting recommendations, weather insights, and yield forecasts tailored for the Philippines.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 text-base shadow-md hover:shadow-lg transition-all duration-200">
              <Link href="/predictions">Get Yield Predictions</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-green-600 font-semibold px-6 py-3 text-base shadow-md hover:shadow-lg transition-all duration-200 gap-0">
              <Link href="/map" className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Explore Map</span>
              </Link>
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

        {/* Formula & Accuracy Section */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Our Revolutionary ML Formula
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
              Powered by advanced Multiple Linear Regression (MLR) with proven 96.01% accuracy
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Formula Details */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-6 w-6 text-green-600" />
                    <CardTitle className="text-xl">Advanced MLR Algorithm</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mathematical Formula */}
                  <div className="bg-white rounded-lg p-6 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-6 text-center">Quarterly MLR Formulas</h4>
                    <div className="bg-gray-50 rounded-lg p-6 font-mono text-xs overflow-x-auto space-y-4">
                      <div className="text-center space-y-2">
                        <div className="text-sm font-bold text-green-700">Quarter 1:</div>
                        <div className="text-xs leading-tight">
                          Ŷ = 8478.474259T - 16643.35313D + 36502.00765P - 5998.639807W - 787.357142H + 420307.9461
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-sm font-bold text-green-700">Quarter 2:</div>
                        <div className="text-xs leading-tight">
                          Ŷ = -3835.953799T - 6149.597523D - 4483.424128P - 2593.991107W - 8024.420014H + 1067116.384
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-sm font-bold text-green-700">Quarter 3:</div>
                        <div className="text-xs leading-tight">
                          Ŷ = 16630.77076T - 1018.254139D + 403.126612P + 74623.00801W + 25918.43338H - 2410001.76
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-sm font-bold text-green-700">Quarter 4:</div>
                        <div className="text-xs leading-tight">
                          Ŷ = 8993.693672T + 5844.061829D - 30748.53656P - 33023.39764W - 1155.458549H + 410764.6506
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-6 pt-4 border-t border-gray-300">
                        <div className="text-center mb-3 font-semibold text-gray-800">Variables:</div>
                        <div className="text-xs text-gray-700 space-y-1 text-left max-w-md mx-auto">
                          <div><strong>T</strong> = Temperature (°C)</div>
                          <div><strong>D</strong> = Dew Point (°C)</div>
                          <div><strong>P</strong> = Precipitation (mm)</div>
                          <div><strong>W</strong> = Wind Speed (km/h)</div>
                          <div><strong>H</strong> = Humidity (%)</div>
                          <div><strong>Ŷ</strong> = Predicted Yield (kg/ha)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Accuracy Showcase */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-xl">96.01% Accuracy Rate</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">96.01%</div>
                    <p className="text-sm text-gray-600">Proven accuracy across 81 provinces</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-green-600">9+</div>
                      <div className="text-xs text-gray-600">Years of Data</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-green-600">81</div>
                      <div className="text-xs text-gray-600">Provinces Covered</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-green-600">50K+</div>
                      <div className="text-xs text-gray-600">Data Points</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-green-600">24/7</div>
                      <div className="text-xs text-gray-600">Real-time Updates</div>
                    </div>
                  </div>

                  <div className="bg-blue-100 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Validation Results:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Cross-validated with 2023-2024 data</p>
                      <p>• Tested across all major rice regions</p>
                      <p>• Independent agricultural expert verification</p>
                      <p>• Continuous monitoring and improvement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md text-center">
              <CardContent className="pt-6">
                <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Precision</h3>
                <p className="text-sm text-gray-600">96.01% accuracy in yield predictions</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md text-center">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Reliability</h3>
                <p className="text-sm text-gray-600">Consistent results across seasons</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md text-center">
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Speed</h3>
                <p className="text-sm text-gray-600">Instant predictions in seconds</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Download Predictions Section */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Download Our Complete Predictions Dataset
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
              Access our comprehensive rice yield predictions from 2025-2100 for research, analysis, and planning
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Dataset Preview */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Database className="h-6 w-6 text-green-600" />
                    <CardTitle className="text-xl">Complete Predictions Dataset</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-6 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Dataset Overview</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">76 Years</div>
                        <div className="text-xs text-gray-600">Prediction Period</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">304 Quarters</div>
                        <div className="text-xs text-gray-600">Data Points</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">6 Variables</div>
                        <div className="text-xs text-gray-600">Per Quarter</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">CSV Format</div>
                        <div className="text-xs text-gray-600">Easy to Import</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-4 pt-4 border-t border-gray-300">
                      <div className="text-center mb-2 font-semibold text-gray-800">Variables Included:</div>
                      <div className="text-xs text-gray-700 space-y-1 text-left max-w-md mx-auto">
                        <div><strong>Quarter:</strong> Q1-Q4 with Year</div>
                        <div><strong>Yield:</strong> Predicted yield (kg/ha)</div>
                        <div><strong>Temp:</strong> Temperature (°C)</div>
                        <div><strong>Dew:</strong> Dew Point (°C)</div>
                        <div><strong>Precip:</strong> Precipitation (mm)</div>
                        <div><strong>Wind:</strong> Wind Speed (km/h)</div>
                        <div><strong>Humidity:</strong> Relative Humidity (%)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Download Section */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Download className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-xl">Download Predictions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">2025-2100</div>
                    <p className="text-sm text-gray-600">Complete rice yield predictions</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-green-600">76</div>
                      <div className="text-xs text-gray-600">Years of Data</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-green-600">304</div>
                      <div className="text-xs text-gray-600">Quarterly Records</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-green-600">7</div>
                      <div className="text-xs text-gray-600">Data Columns</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-green-600">Free</div>
                      <div className="text-xs text-gray-600">No Cost</div>
                    </div>
                  </div>

                  <div className="bg-blue-100 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Perfect For:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Agricultural research and analysis</p>
                      <p>• Long-term farming planning</p>
                      <p>• Academic studies and papers</p>
                      <p>• Government policy development</p>
                      <p>• Investment and business planning</p>
                    </div>
                  </div>

                                     <Button 
                     asChild 
                     size="lg" 
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                   >
                     <a href="/yield_output.csv" download="rice_yield_predictions_2025-2100.csv">
                       <Download className="h-5 w-5 mr-2" />
                       Download Complete Dataset (CSV)
                     </a>
                   </Button>
                </CardContent>
              </Card>
            </div>
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

            {/* Interactive Map */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pt-5 pb-3">
                <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-green-700" />
                </div>
                <CardTitle className="text-center">Interactive Map</CardTitle>
                <CardDescription className="text-center">
                  Visualize rice yield data across the Philippines
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2 pt-0">
                <p>• Province/district-level data</p>
                <p>• Click to view yield information</p>
                <p>• Color-coded regions</p>
                <p>• Mobile-responsive design</p>
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
                <span className="text-xl font-bold">GR-AI-N</span>
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
                <li><Link href="/map" className="text-gray-400 hover:text-white transition-colors">Yield Map</Link></li>
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
