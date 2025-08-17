export interface RiceFarmingAdvice {
  id: string
  category: 'planting' | 'irrigation' | 'fertilizer' | 'pest_management' | 'harvest' | 'weather' | 'variety'
  title: string
  description: string
  region12Specific?: boolean
  recommendations: string[]
  warnings?: string[]
  bestPractices: string[]
  seasonalAdvice?: {
    drySeason?: string[]
    wetSeason?: string[]
  }
}

export const RICE_FARMING_KNOWLEDGE_BASE: RiceFarmingAdvice[] = [
  {
    id: 'region12-overview',
    category: 'variety',
    title: 'Region 12 (SOCCSKSARGEN) Rice Farming Overview',
    description: 'Comprehensive guide for rice farming in South Cotabato, Cotabato, Sultan Kudarat, Sarangani, and General Santos City',
    region12Specific: true,
    recommendations: [
      'Plant drought-tolerant varieties like NSIC Rc160 and PSB Rc82',
      'Utilize irrigation systems during dry spells',
      'Monitor weather patterns from PAGASA Region 12',
      'Practice crop rotation with corn and vegetables'
    ],
    warnings: [
      'Be prepared for El Niño effects on water availability',
      'Monitor for rice blast disease during wet season',
      'Watch for brown planthopper outbreaks'
    ],
    bestPractices: [
      'Use certified seeds from PhilRice',
      'Implement integrated pest management',
      'Maintain proper field drainage',
      'Test soil pH regularly (optimal: 6.0-6.5)'
    ]
  },
  {
    id: 'planting-season-region12',
    category: 'planting',
    title: 'Optimal Planting Seasons in Region 12',
    description: 'Best planting windows for rice in SOCCSKSARGEN region',
    region12Specific: true,
    recommendations: [
      'Main season: May-June (wet season)',
      'Off-season: November-December (dry season with irrigation)',
      'Avoid planting during peak typhoon months (July-October)',
      'Use early maturing varieties for off-season planting'
    ],
    warnings: [
      'Heavy rains in July-October can damage crops',
      'Water scarcity in March-May affects dry season crops'
    ],
    bestPractices: [
      'Monitor PAGASA weather forecasts',
      'Prepare seedbeds 2-3 weeks before transplanting',
      'Use 20-25 day old seedlings for transplanting',
      'Maintain 20x20 cm spacing for optimal growth'
    ],
    seasonalAdvice: {
      drySeason: [
        'Use drought-tolerant varieties',
        'Implement alternate wetting and drying',
        'Apply mulch to conserve soil moisture',
        'Schedule irrigation during early morning or late afternoon'
      ],
      wetSeason: [
        'Ensure proper field drainage',
        'Monitor for fungal diseases',
        'Apply fungicides preventively',
        'Use wind-resistant varieties'
      ]
    }
  },
  {
    id: 'irrigation-region12',
    category: 'irrigation',
    title: 'Irrigation Management for Region 12',
    description: 'Water management strategies for rice farming in SOCCSKSARGEN',
    region12Specific: true,
    recommendations: [
      'Use alternate wetting and drying (AWD) technique',
      'Maintain 3-5 cm water level during vegetative stage',
      'Drain field 7-10 days before harvest',
      'Use furrow irrigation for water conservation'
    ],
    warnings: [
      'Water scarcity during El Niño periods',
      'Over-irrigation can lead to disease outbreaks',
      'Poor drainage causes root rot'
    ],
    bestPractices: [
      'Install water level markers in fields',
      'Use soil moisture sensors',
      'Implement drip irrigation for upland rice',
      'Practice rainwater harvesting'
    ]
  },
  {
    id: 'fertilizer-region12',
    category: 'fertilizer',
    title: 'Fertilizer Management for Region 12 Soils',
    description: 'Nutrient management for rice production in SOCCSKSARGEN',
    region12Specific: true,
    recommendations: [
      'Apply 120-60-60 kg/ha NPK for high-yielding varieties',
      'Use split application: 50% basal, 25% at tillering, 25% at panicle initiation',
      'Apply zinc sulfate for zinc-deficient soils',
      'Use organic fertilizers to improve soil health'
    ],
    warnings: [
      'Over-fertilization can cause lodging',
      'Nitrogen leaching during heavy rains',
      'Phosphorus fixation in acidic soils'
    ],
    bestPractices: [
      'Conduct soil analysis every 2-3 years',
      'Use leaf color chart for nitrogen management',
      'Apply fertilizers when soil is moist',
      'Incorporate organic matter regularly'
    ]
  },
  {
    id: 'pest-management-region12',
    category: 'pest_management',
    title: 'Pest and Disease Management in Region 12',
    description: 'Integrated pest management for rice in SOCCSKSARGEN',
    region12Specific: true,
    recommendations: [
      'Monitor fields weekly for pest presence',
      'Use resistant varieties like NSIC Rc160',
      'Practice crop rotation to break pest cycles',
      'Maintain field sanitation'
    ],
    warnings: [
      'Rice blast outbreaks during wet season',
      'Brown planthopper resistance to insecticides',
      'Golden apple snail damage to young seedlings'
    ],
    bestPractices: [
      'Use light traps for monitoring',
      'Release Trichogramma wasps for stem borer control',
      'Apply neem-based pesticides',
      'Maintain proper field drainage'
    ]
  },
  {
    id: 'harvest-region12',
    category: 'harvest',
    title: 'Harvest and Post-Harvest Management',
    description: 'Optimal harvesting and storage practices for Region 12',
    region12Specific: true,
    recommendations: [
      'Harvest at 20-25% grain moisture content',
      'Use combine harvesters for large fields',
      'Dry grains to 14% moisture for storage',
      'Store in hermetic bags or silos'
    ],
    warnings: [
      'Rain during harvest can cause grain spoilage',
      'High humidity promotes fungal growth',
      'Rodent damage in storage facilities'
    ],
    bestPractices: [
      'Monitor grain moisture regularly',
      'Clean storage facilities before use',
      'Use proper drying facilities',
      'Implement integrated pest management in storage'
    ]
  },
  {
    id: 'weather-adaptation-region12',
    category: 'weather',
    title: 'Weather Adaptation Strategies for Region 12',
    description: 'Climate-smart rice farming practices for SOCCSKSARGEN',
    region12Specific: true,
    recommendations: [
      'Use early warning systems from PAGASA',
      'Plant early maturing varieties during uncertain weather',
      'Implement crop insurance programs',
      'Diversify income sources'
    ],
    warnings: [
      'Increasing frequency of extreme weather events',
      'Unpredictable rainfall patterns',
      'Temperature stress during flowering'
    ],
    bestPractices: [
      'Monitor weather forecasts daily',
      'Use climate-resilient varieties',
      'Implement water conservation practices',
      'Maintain emergency funds for crop losses'
    ]
  },
  {
    id: 'variety-selection-region12',
    category: 'variety',
    title: 'Rice Variety Selection for Region 12',
    description: 'Best rice varieties for different conditions in SOCCSKSARGEN',
    region12Specific: true,
    recommendations: [
      'NSIC Rc160: High-yielding, drought-tolerant',
      'PSB Rc82: Early maturing, blast-resistant',
      'IR64: Popular variety, good eating quality',
      'NSIC Rc222: New variety, high yield potential'
    ],
    warnings: [
      'Some varieties may not perform well in all areas',
      'Seed quality affects yield potential',
      'Variety-specific management requirements'
    ],
    bestPractices: [
      'Use certified seeds from authorized dealers',
      'Test new varieties in small areas first',
      'Follow recommended management practices',
      'Keep records of variety performance'
    ]
  },
  {
    id: 'fertilizer-management-detailed',
    category: 'fertilizer',
    title: 'Comprehensive Fertilizer Management Guide',
    description: 'Detailed fertilizer application guide for optimal rice production',
    region12Specific: false,
    recommendations: [
      'Apply 120-60-60 kg/ha NPK for high-yielding varieties',
      'Use split application: 50% basal, 25% at tillering, 25% at panicle initiation',
      'Apply zinc sulfate (25 kg/ha) for zinc-deficient soils',
      'Use organic fertilizers (2-3 tons/ha) to improve soil health',
      'Apply foliar fertilizers during critical growth stages'
    ],
    warnings: [
      'Over-fertilization can cause lodging and reduced yield',
      'Nitrogen leaching during heavy rains reduces efficiency',
      'Phosphorus fixation in acidic soils limits availability',
      'Late fertilizer application can delay maturity'
    ],
    bestPractices: [
      'Conduct soil analysis every 2-3 years',
      'Use leaf color chart for nitrogen management',
      'Apply fertilizers when soil is moist but not flooded',
      'Incorporate organic matter regularly',
      'Monitor plant response to fertilizer application',
      'Use slow-release fertilizers for better efficiency'
    ]
  },
  {
    id: 'pest-management-comprehensive',
    category: 'pest_management',
    title: 'Integrated Pest Management (IPM) Guide',
    description: 'Comprehensive pest and disease management strategies',
    region12Specific: false,
    recommendations: [
      'Monitor fields weekly for pest presence and damage',
      'Use resistant varieties like NSIC Rc160 and PSB Rc82',
      'Practice crop rotation to break pest cycles',
      'Maintain field sanitation and remove crop residues',
      'Use biological control agents (Trichogramma, Metarhizium)',
      'Apply pesticides only when economic threshold is reached'
    ],
    warnings: [
      'Rice blast outbreaks during wet season require immediate action',
      'Brown planthopper resistance to insecticides is increasing',
      'Golden apple snail damage to young seedlings can be severe',
      'Overuse of pesticides can harm beneficial insects',
      'Some diseases can spread rapidly under favorable conditions'
    ],
    bestPractices: [
      'Use light traps for monitoring pest populations',
      'Release Trichogramma wasps for stem borer control',
      'Apply neem-based pesticides for eco-friendly control',
      'Maintain proper field drainage to reduce disease pressure',
      'Use pheromone traps for early pest detection',
      'Implement refuge areas to maintain pest resistance',
      'Train workers on proper pesticide application'
    ]
  },
  {
    id: 'disease-management-specific',
    category: 'pest_management',
    title: 'Rice Disease Management Strategies',
    description: 'Specific management strategies for common rice diseases',
    region12Specific: false,
    recommendations: [
      'Rice Blast: Apply fungicides at booting stage, use resistant varieties',
      'Bacterial Leaf Blight: Remove infected plants, avoid overhead irrigation',
      'Tungro Virus: Control green leafhoppers, use resistant varieties',
      'Sheath Blight: Maintain proper spacing, apply fungicides if needed',
      'Brown Spot: Improve soil fertility, use certified seeds'
    ],
    warnings: [
      'Rice blast can cause 50-90% yield loss if not controlled',
      'Bacterial diseases can spread rapidly through irrigation water',
      'Viral diseases are transmitted by insect vectors',
      'Fungal diseases thrive in humid conditions',
      'Some diseases can survive in crop residues'
    ],
    bestPractices: [
      'Use disease-free certified seeds',
      'Practice field sanitation and crop rotation',
      'Monitor weather conditions for disease development',
      'Apply preventive fungicides during critical stages',
      'Maintain proper plant spacing for air circulation',
      'Use resistant varieties when available',
      'Remove and destroy infected plant parts'
    ]
  },
  {
    id: 'nutrient-deficiency-guide',
    category: 'fertilizer',
    title: 'Nutrient Deficiency Identification and Management',
    description: 'Guide for identifying and correcting nutrient deficiencies',
    region12Specific: false,
    recommendations: [
      'Nitrogen deficiency: Apply urea or ammonium sulfate',
      'Phosphorus deficiency: Apply single superphosphate or DAP',
      'Potassium deficiency: Apply muriate of potash',
      'Zinc deficiency: Apply zinc sulfate or zinc chelate',
      'Iron deficiency: Apply iron chelate or foliar spray',
      'Sulfur deficiency: Apply gypsum or elemental sulfur'
    ],
    warnings: [
      'Nutrient deficiencies can be confused with pest damage',
      'Over-application can cause nutrient toxicity',
      'Soil pH affects nutrient availability',
      'Some deficiencies have similar symptoms',
      'Nutrient interactions can affect uptake'
    ],
    bestPractices: [
      'Conduct regular soil and tissue analysis',
      'Learn to identify deficiency symptoms',
      'Apply nutrients based on soil test results',
      'Use balanced fertilizers to prevent deficiencies',
      'Monitor plant response after application',
      'Consider soil pH when applying nutrients',
      'Use foliar application for quick correction'
    ]
  }
]

export function getAdviceByCategory(category: RiceFarmingAdvice['category']): RiceFarmingAdvice[] {
  return RICE_FARMING_KNOWLEDGE_BASE.filter(advice => advice.category === category)
}

export function getRegion12SpecificAdvice(): RiceFarmingAdvice[] {
  return RICE_FARMING_KNOWLEDGE_BASE.filter(advice => advice.region12Specific)
}

export function searchAdvice(query: string): RiceFarmingAdvice[] {
  const lowerQuery = query.toLowerCase()
  return RICE_FARMING_KNOWLEDGE_BASE.filter(advice => 
    advice.title.toLowerCase().includes(lowerQuery) ||
    advice.description.toLowerCase().includes(lowerQuery) ||
    advice.recommendations.some(rec => rec.toLowerCase().includes(lowerQuery)) ||
    advice.bestPractices.some(practice => practice.toLowerCase().includes(lowerQuery))
  )
}

export function getAdviceBySeason(season: 'drySeason' | 'wetSeason'): RiceFarmingAdvice[] {
  return RICE_FARMING_KNOWLEDGE_BASE.filter(advice => 
    advice.seasonalAdvice && advice.seasonalAdvice[season]
  )
}
