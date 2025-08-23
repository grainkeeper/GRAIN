import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, TrendingUp, Database, Map, BarChart3, Bot, Leaf, Users, Clock, Download } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="font-serif text-2xl font-bold text-foreground">GR-AI-N</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#predictions" className="text-muted-foreground hover:text-foreground transition-colors">
                Yield Predictions
              </a>
              <a href="#map" className="text-muted-foreground hover:text-foreground transition-colors">
                Map
              </a>
              <a href="#dataset" className="text-muted-foreground hover:text-foreground transition-colors">
                Dataset
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Predictions</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/placeholder-qw3av.png')`,
          }}
        />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight animate-fade-in">
              Rice Yield and Optimal Planting Window Forecasting System
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              Revolutionize your rice farming with our ML-powered predictions. Get precise planting recommendations,
              weather insights, and yield forecasts tailored for the Philippines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                Get Yield Predictions
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 px-8 py-3 text-lg bg-transparent"
              >
                Explore Map
              </Button>
            </div>
          </div>
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
                <CardTitle className="text-xl font-serif">Choose Year & Quarter</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Specify the year and planting quarter (Q1, Q2, Q3, or Q4) for your crop cycle
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
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Your Prediction
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
                      <span className="text-primary">Q1:</span> 6878.47+2007 + 1404.95*TEMP + 3009.25*RF
                    </div>
                    <div>
                      <span className="text-primary">Q2:</span> -3851.03*TEMP + 1404.95*TEMP + 2003.38*RF
                    </div>
                    <div>
                      <span className="text-primary">Q3:</span> 10508.77*TEMP + 2344.95*TEMP + 1403.25*RF
                    </div>
                    <div>
                      <span className="text-primary">Q4:</span> 8903.46*TEMP + 2344.95*TEMP + 3002.78*RF
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Variables: Temperature (°C), Rainfall (mm), Humidity (%), Provincial Yield (kg/ha)
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-serif">Complete Predictions Dataset</CardTitle>
                    <CardDescription className="text-base mt-2">
                      2025-2100 Complete Rice Yield Predictions
                    </CardDescription>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Download className="h-4 w-4 mr-2" />
                    Download Predictions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">76</div>
                    <p className="text-sm text-muted-foreground">Years</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary mb-2">304</div>
                    <p className="text-sm text-muted-foreground">Quarters</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">6</div>
                    <p className="text-sm text-muted-foreground">Variables</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">Free</div>
                    <p className="text-sm text-muted-foreground">Download</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Variables Included:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Quarter: Q1 with Year</li>
                      <li>• Yield: Provincial Yield (kg/ha)</li>
                      <li>• Temp: Temperature (°C)</li>
                      <li>• Rain: Rainfall (mm)</li>
                      <li>• Humidity: Relative Humidity (%)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Perfect For:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
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
                <span className="font-serif text-xl font-bold">GR-AI-N</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Revolutionizing rice farming with AI-powered predictions for Filipino farmers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#predictions" className="text-muted-foreground hover:text-foreground transition-colors">
                    Predictions
                  </a>
                </li>
                <li>
                  <a href="#map" className="text-muted-foreground hover:text-foreground transition-colors">
                    Map
                  </a>
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
