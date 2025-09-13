import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, TrendingUp, Database, Map, BarChart3, Bot, Leaf, Users, Clock, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import BarChart from "@/components/charts/bar-chart"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">


      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-20">
        <Image
          src="/Images/Grain images/2.jpg"
          alt="Rice field background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight animate-fade-in">
              Rice Yield and Optimal Planting Window Forecasting System
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              Revolutionize your rice farming with our ML-powered predictions. Get precise planting recommendations,
              weather insights, and yield forecasts tailored for the Philippines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
              <Button asChild size="lg" className="px-8 py-3 text-lg">
                <Link href="/predictions">Get Yield Predictions</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="px-8 py-3 text-lg"
              >
                <Link href="/map" className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Explore Map</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Regional MLR Grouped Coefficients */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Per-Region MLR Coefficients</h2>
            <p className="text-muted-foreground">Grouped bars show T, D, P, W, H for each region</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">MLR Coefficient Comparison by Region</CardTitle>
              <CardDescription>Positive/negative values indicate direction of influence</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                height={520}
                title="Per-Region MLR Coefficients"
                xLabel="Region"
                yLabel="Coefficient"
                data={{
                  labels: ["R1","R2","R3","R4-A","R4-B","R5","R6","R7","R8","R9","R10","R11","R12","R13","CAR","BARMM"],
                  datasets: [
                    {
                      label: "T",
                      data: [44830.51,-383.61,245611.70,-2513.54,-7727.47,56816.45,28665.03,-27552.19,-9727.51,-16084.13,-1476.72,9666.20,-383.61,-4011.04,-16394.58,43919.76],
                      backgroundColor: "rgba(34,197,94,0.6)",
                      borderColor: "rgba(34,197,94,1)",
                      borderWidth: 1
                    },
                    {
                      label: "D",
                      data: [21917.64,45198.12,-296632.33,-2316.11,-85345.64,-23635.04,39439.85,-16438.49,12445.77,94152.10,-2507.21,6119.26,45198.12,-1976.29,-43532.95,-1643.65],
                      backgroundColor: "rgba(59,130,246,0.6)",
                      borderColor: "rgba(59,130,246,1)",
                      borderWidth: 1
                    },
                    {
                      label: "P",
                      data: [7039.91,-5770.20,-10775.58,-574.60,1319.55,-565.27,9865.76,-2461.82,756.7,4434.45,153.11,4730.31,-5770.20,4855.15,5910.99,2318.58],
                      backgroundColor: "rgba(234,179,8,0.6)",
                      borderColor: "rgba(234,179,8,1)",
                      borderWidth: 1
                    },
                    {
                      label: "W",
                      data: [-18765.53,-51440.83,24416.92,1220.70,7552.72,-11163.59,14974.76,-827,2646.83,50325.79,-3460.66,8512.54,-51440.83,-3268.16,4644.37,-10601.40],
                      backgroundColor: "rgba(16,185,129,0.6)",
                      borderColor: "rgba(16,185,129,1)",
                      borderWidth: 1
                    },
                    {
                      label: "H",
                      data: [-1770.70,-2384.66,37579.99,444.82,-1893.09,3078.61,10348.36,-247.73,269.26,-1586.53,-1443.86,-1767.15,-2384.66,-5434.78,6123.95,1742.90],
                      backgroundColor: "rgba(244,63,94,0.6)",
                      borderColor: "rgba(244,63,94,1)",
                      borderWidth: 1
                    }
                  ]
                }}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3 Easy Steps Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Get Your Yield Predictions in 3 Easy Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our ML-powered system makes rice farming predictions simple and accurate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <Badge variant="secondary" className="w-fit mx-auto mb-2">
                  Step 1
                </Badge>
                <CardTitle className="text-xl font-serif">Enter Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Select your farm location anywhere in the Philippines for precise regional data
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-secondary" />
                </div>
                <Badge variant="secondary" className="w-fit mx-auto mb-2">
                  Step 2
                </Badge>
                <CardTitle className="text-xl font-serif">Enter Planting Date</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Specify your planting date to get accurate growth stage predictions and timeline
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <Badge variant="secondary" className="w-fit mx-auto mb-2">
                  Step 3
                </Badge>
                <CardTitle className="text-xl font-serif">Get Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Receive AI-optimized yield forecasts with 96.01% accuracy for better farming decisions
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/predictions">Start Your Prediction</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ML Formula & Accuracy Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Our Revolutionary ML Formula
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by Advanced Multiple Linear Regression (MLR) with proven 96.01% accuracy
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">96.01%</div>
                  <p className="text-lg font-medium text-foreground">Prediction Accuracy</p>
                  <p className="text-sm text-muted-foreground mt-1">Validated across all regions</p>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center bg-card">
                  <div className="text-2xl font-bold text-secondary mb-1">9+</div>
                  <p className="text-sm text-muted-foreground">Years of Data</p>
                </Card>
                <Card className="p-4 text-center bg-card">
                  <div className="text-2xl font-bold text-secondary mb-1">81</div>
                  <p className="text-sm text-muted-foreground">Provinces Covered</p>
                </Card>
                <Card className="p-4 text-center bg-card">
                  <div className="text-2xl font-bold text-secondary mb-1">50K+</div>
                  <p className="text-sm text-muted-foreground">Data Points</p>
                </Card>
                <Card className="p-4 text-center bg-card">
                  <div className="text-2xl font-bold text-secondary mb-1">24/7</div>
                  <p className="text-sm text-muted-foreground">Real-time Updates</p>
                </Card>
              </div>
            </div>

            <Card className="p-6 bg-muted/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Advanced MLR Algorithm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-background p-4 rounded-lg font-mono text-sm">
                  <div className="text-muted-foreground mb-2">Quarterly MLR Formulas:</div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-primary">Q1:</span> Ŷ = 8478.47T - 16643.35D + 36502.01P - 5998.64W - 787.36H + 420307.95
                    </div>
                    <div>
                      <span className="text-primary">Q2:</span> Ŷ = -3835.95T - 6149.60D - 4483.42P - 2593.99W - 8024.42H + 1067116.38
                    </div>
                    <div>
                      <span className="text-primary">Q3:</span> Ŷ = 16630.77T - 1018.25D + 403.13P + 74623.01W + 25918.43H - 2410001.76
                    </div>
                    <div>
                      <span className="text-primary">Q4:</span> Ŷ = 8993.69T + 5844.06D - 30748.54P - 33023.40W - 1155.46H + 410764.65
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Variables: T=Temperature (°C), D=Dew Point (°C), P=Precipitation (mm), W=Wind Speed (km/h), H=Humidity (%)
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dataset Download Section */}
      <section id="dataset" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Download Our Complete Predictions Dataset
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access our comprehensive rice yield predictions from 2025-2100 for research, analysis, and planning
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-serif">Complete Predictions Dataset</CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-2">
                      2025-2100 Complete Rice Yield Predictions
                    </CardDescription>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <a href="/yield_output.csv" download="rice_yield_predictions_2025-2100.csv">
                      <Download className="h-4 w-4 mr-2" />
                      Download Predictions
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-2">76</div>
                    <p className="text-xs md:text-sm text-muted-foreground">Years</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-secondary mb-2">304</div>
                    <p className="text-xs md:text-sm text-muted-foreground">Quarters</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-accent mb-2">6</div>
                    <p className="text-xs md:text-sm text-muted-foreground">Variables</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-2">Free</div>
                    <p className="text-xs md:text-sm text-muted-foreground">Download</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm md:text-base">Variables Included:</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
                      <li>• Quarter: Q1 with Year</li>
                      <li>• Yield: Provincial Yield (kg/ha)</li>
                      <li>• Temp: Temperature (°C)</li>
                      <li>• Rain: Rainfall (mm)</li>
                      <li>• Humidity: Relative Humidity (%)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-sm md:text-base">Perfect For:</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-muted-foreground">
                      <li>• Agricultural research and analysis</li>
                      <li>• Long-term farming planning</li>
                      <li>• Academic studies and papers</li>
                      <li>• Government policy development</li>
                      <li>• Climate impact assessments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Precision Agriculture Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Precision Agriculture for Filipino Farmers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our advanced ML formula delivers unmatched accuracy to optimize your rice production
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg font-serif">Yield Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  96.01% accurate ML predictions for optimal yield planning across all regions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Map className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-lg font-serif">Interactive Map</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Visualize rice yield data across the Philippines with our interactive mapping system
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-lg font-serif">Smart Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Data-driven insights for better farming decisions with comprehensive analytics tools
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg font-serif">AI Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Personalized farming advice and real-time support through our intelligent AI assistant
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="font-arigato text-xl font-bold">GR-AI-N</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Revolutionizing rice farming with AI-powered predictions for Filipino farmers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/predictions" className="text-muted-foreground hover:text-foreground transition-colors">
                    Predictions
                  </Link>
                </li>
                <li>
                  <Link href="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                    Map
                  </Link>
                </li>
                <li>
                  <a href="#dataset" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dataset
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Users className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Clock className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Database className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 GR-AI-N. All rights reserved. Empowering Filipino farmers with AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
