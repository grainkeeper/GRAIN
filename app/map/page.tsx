"use client"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, MapPin, TrendingUp, BarChart3 } from 'lucide-react'

const ProvdistMap = dynamic(() => import('@/components/map/provdist-map'), { ssr: false })

export default function Page() {
	return (
		<div>
			{/* Hero Banner */}
			<section className="w-full bg-gradient-to-r from-green-600 to-emerald-600 py-16 text-white text-center">
				<div className="container mx-auto px-6">
					<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Rice Yield Map</h1>
					<p className="mt-3 text-white/90 max-w-3xl mx-auto text-base md:text-lg">
						Explore rice yield data across provinces and districts in the Philippines. 
						Visualize production patterns and identify high-performing regions.
					</p>
				</div>
			</section>

			{/* Map Section */}
			<div className="container mx-auto px-6 -mt-6 md:-mt-8 pb-20">
				<div className="max-w-4xl mx-auto">
					<Card className="shadow-lg">
						<CardContent className="p-0">
							<ProvdistMap />
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Information Section */}
			<div className="container mx-auto px-6 pb-20">
				<div className="max-w-6xl mx-auto">
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Map Features */}
						<Card className="shadow-md">
							<CardHeader className="pb-3">
								<div className="flex items-center space-x-2">
									<MapPin className="h-5 w-5 text-green-600" />
									<CardTitle className="text-lg">Interactive Features</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="text-sm text-gray-600">
									<p className="mb-2">• Click on provinces to view detailed yield data</p>
									<p className="mb-2">• Zoom in/out to explore specific regions</p>
									<p className="mb-2">• Hover over areas to see quick information</p>
									<p>• Color-coded regions indicate yield performance</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Badge variant="outline" className="text-xs">Interactive</Badge>
									<Badge variant="outline" className="text-xs">Real-time</Badge>
									<Badge variant="outline" className="text-xs">Responsive</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Data Sources */}
						<Card className="shadow-md">
							<CardHeader className="pb-3">
								<div className="flex items-center space-x-2">
									<BarChart3 className="h-5 w-5 text-green-600" />
									<CardTitle className="text-lg">Data Sources</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="text-sm text-gray-600">
									<p className="mb-2">• Philippine Statistics Authority (PSA)</p>
									<p className="mb-2">• Department of Agriculture (DA)</p>
									<p className="mb-2">• Regional agricultural reports</p>
									<p>• Historical yield data analysis</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Badge variant="outline" className="text-xs">Official</Badge>
									<Badge variant="outline" className="text-xs">Verified</Badge>
									<Badge variant="outline" className="text-xs">Updated</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Yield Insights */}
						<Card className="shadow-md">
							<CardHeader className="pb-3">
								<div className="flex items-center space-x-2">
									<TrendingUp className="h-5 w-5 text-green-600" />
									<CardTitle className="text-lg">Yield Insights</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="text-sm text-gray-600">
									<p className="mb-2">• Production trends by region</p>
									<p className="mb-2">• Seasonal yield patterns</p>
									<p className="mb-2">• Climate impact analysis</p>
									<p>• Farming practice correlations</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Badge variant="outline" className="text-xs">Analytics</Badge>
									<Badge variant="outline" className="text-xs">Trends</Badge>
									<Badge variant="outline" className="text-xs">Insights</Badge>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Additional Information */}
					<Card className="mt-8 shadow-md">
						<CardHeader>
							<div className="flex items-center space-x-2">
								<Info className="h-5 w-5 text-green-600" />
								<CardTitle>About Rice Yield Data</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<h4 className="font-semibold text-gray-900 mb-2">Data Coverage</h4>
									<p className="text-sm text-gray-600">
										This map displays rice yield data for all 81 provinces and 17 regions of the Philippines. 
										The data is collected annually and represents the average yield per hectare across different 
										rice varieties and growing seasons.
									</p>
								</div>
								<div>
									<h4 className="font-semibold text-gray-900 mb-2">Measurement Units</h4>
									<p className="text-sm text-gray-600">
										Yield data is measured in metric tons per hectare (t/ha). This standardized unit allows 
										for accurate comparison across different regions and farming practices. The data reflects 
										both irrigated and rainfed rice production systems.
									</p>
								</div>
							</div>
							<div className="bg-green-50 border border-green-200 rounded-lg p-4">
								<h4 className="font-semibold text-green-800 mb-2">How to Use This Map</h4>
								<p className="text-sm text-green-700">
									Use this interactive map to identify high-performing rice regions, understand regional 
									production patterns, and make informed decisions about rice farming investments. 
									The color-coded regions help visualize yield performance at a glance.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}


