'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RiceStage, prettyStage } from '@/lib/services/crop-stage';
import { 
  Droplets, 
  Sun, 
  Shield, 
  Zap, 
  Leaf, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react';

interface AISuggestionsProps {
  currentStage: RiceStage;
  progress: number;
  nextInDays: number;
  farmData: {
    region: string;
    province: string;
    variety: string;
    method: string;
  };
}

interface Suggestion {
  id: string;
  type: 'critical' | 'important' | 'recommended' | 'tip';
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

const getStageSuggestions = (
  stage: RiceStage, 
  progress: number, 
  nextInDays: number,
  farmData: { region: string; province: string; variety: string; method: string }
): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  switch (stage) {
    case 'nursery':
      suggestions.push(
        {
          id: 'nursery-watering',
          type: 'critical',
          title: 'Maintain Consistent Moisture',
          description: 'Keep soil moist but not waterlogged. Water 2-3 times daily with fine mist to prevent seedling stress.',
          icon: <Droplets className="h-4 w-4" />,
          action: 'Set watering schedule'
        },
        {
          id: 'nursery-protection',
          type: 'important',
          title: 'Protect from Pests',
          description: 'Monitor for rice blast and brown spot. Apply preventive fungicide if weather is humid.',
          icon: <Shield className="h-4 w-4" />,
          action: 'Check pest status'
        },
        {
          id: 'nursery-nutrition',
          type: 'recommended',
          title: 'Light Fertilization',
          description: 'Apply 1/4 strength NPK fertilizer after first true leaves appear. Avoid over-fertilization.',
          icon: <Leaf className="h-4 w-4" />,
          action: 'Plan fertilization'
        }
      );
      break;

    case 'vegetative':
      suggestions.push(
        {
          id: 'vegetative-water',
          type: 'critical',
          title: 'Increase Water Depth',
          description: 'Maintain 2-3cm water depth. This stage requires more water for rapid growth.',
          icon: <Droplets className="h-4 w-4" />,
          action: 'Adjust water level'
        },
        {
          id: 'vegetative-fertilizer',
          type: 'important',
          title: 'Apply Nitrogen Fertilizer',
          description: 'Apply 50% of total nitrogen requirement. Split application recommended for better uptake.',
          icon: <TrendingUp className="h-4 w-4" />,
          action: 'Schedule fertilization'
        },
        {
          id: 'vegetative-weeding',
          type: 'recommended',
          title: 'Control Weeds',
          description: 'Manual weeding or safe herbicide application. Weeds compete for nutrients and light.',
          icon: <Target className="h-4 w-4" />,
          action: 'Plan weeding'
        }
      );
      break;

    case 'tillering':
      suggestions.push(
        {
          id: 'tillering-water',
          type: 'critical',
          title: 'Manage Water Carefully',
          description: 'Maintain 3-5cm water depth. Avoid water stress which reduces tiller production.',
          icon: <Droplets className="h-4 w-4" />,
          action: 'Monitor water level'
        },
        {
          id: 'tillering-fertilizer',
          type: 'important',
          title: 'Apply Phosphorus & Potassium',
          description: 'Apply remaining 50% nitrogen plus phosphorus and potassium for strong tiller development.',
          icon: <TrendingUp className="h-4 w-4" />,
          action: 'Apply nutrients'
        },
        {
          id: 'tillering-monitoring',
          type: 'recommended',
          title: 'Count Tillers',
          description: 'Aim for 15-20 productive tillers per plant. Thin if overcrowded.',
          icon: <CheckCircle className="h-4 w-4" />,
          action: 'Count tillers'
        }
      );
      break;

    case 'pi':
      suggestions.push(
        {
          id: 'pi-water',
          type: 'critical',
          title: 'Reduce Water Depth',
          description: 'Lower water to 1-2cm to encourage root development and prevent lodging.',
          icon: <Droplets className="h-4 w-4" />,
          action: 'Adjust water level'
        },
        {
          id: 'pi-nutrition',
          type: 'important',
          title: 'Apply Micronutrients',
          description: 'Apply zinc and iron if soil is deficient. Critical for panicle initiation.',
          icon: <Leaf className="h-4 w-4" />,
          action: 'Test soil nutrients'
        },
        {
          id: 'pi-pest',
          type: 'recommended',
          title: 'Monitor Stem Borers',
          description: 'Check for stem borer damage. Apply biological control if detected.',
          icon: <Shield className="h-4 w-4" />,
          action: 'Check for pests'
        }
      );
      break;

    case 'booting':
      suggestions.push(
        {
          id: 'booting-water',
          type: 'critical',
          title: 'Maintain Adequate Moisture',
          description: 'Keep soil moist but not flooded. Water stress now reduces grain number.',
          icon: <Droplets className="h-4 w-4" />,
          action: 'Monitor moisture'
        },
        {
          id: 'booting-fertilizer',
          type: 'important',
          title: 'Apply Potassium',
          description: 'Apply potassium fertilizer to strengthen stems and prevent lodging.',
          icon: <TrendingUp className="h-4 w-4" />,
          action: 'Apply potassium'
        },
        {
          id: 'booting-protection',
          type: 'recommended',
          title: 'Protect from Wind',
          description: 'Monitor weather. Strong winds can cause lodging during this critical stage.',
          icon: <AlertTriangle className="h-4 w-4" />,
          action: 'Check weather'
        }
      );
      break;

    case 'heading':
      suggestions.push(
        {
          id: 'heading-water',
          type: 'critical',
          title: 'Ensure Adequate Water',
          description: 'Maintain 2-3cm water depth. Heading is most sensitive to water stress.',
          icon: <Droplets className="h-4 w-4" />,
          action: 'Check water level'
        },
        {
          id: 'heading-temperature',
          type: 'important',
          title: 'Monitor Temperature',
          description: 'Optimal temperature is 25-30°C. High temperatures can cause sterility.',
          icon: <Sun className="h-4 w-4" />,
          action: 'Check temperature'
        },
        {
          id: 'heading-pest',
          type: 'recommended',
          title: 'Watch for Blast',
          description: 'Monitor for neck blast. Apply fungicide if conditions are favorable for disease.',
          icon: <Shield className="h-4 w-4" />,
          action: 'Monitor disease'
        }
      );
      break;

    case 'flowering':
      suggestions.push(
        {
          id: 'flowering-water',
          type: 'critical',
          title: 'Maintain Water Level',
          description: 'Keep 2-3cm water depth. Water stress during flowering reduces grain set.',
          icon: <Droplets className="h-4 w-4" />,
          action: 'Maintain water'
        },
        {
          id: 'flowering-pollination',
          type: 'important',
          title: 'Ensure Good Pollination',
          description: 'Avoid spraying during flowering hours (9-11 AM). Wind helps pollination.',
          icon: <Zap className="h-4 w-4" />,
          action: 'Check pollination'
        },
        {
          id: 'flowering-nutrition',
          type: 'recommended',
          title: 'Light Nitrogen Application',
          description: 'Small amount of nitrogen can improve grain filling if plants look pale.',
          icon: <Leaf className="h-4 w-4" />,
          action: 'Assess plant color'
        }
      );
      break;

    case 'grain_fill':
      suggestions.push(
        {
          id: 'grain-water',
          type: 'critical',
          title: 'Gradual Water Reduction',
          description: 'Slowly reduce water depth to 1cm. Complete drainage 2 weeks before harvest.',
          icon: <Droplets className="h-4 w-4" />,
          action: 'Reduce water gradually'
        },
        {
          id: 'grain-birds',
          type: 'important',
          title: 'Protect from Birds',
          description: 'Use bird nets or scare devices. Birds can cause significant yield loss.',
          icon: <Shield className="h-4 w-4" />,
          action: 'Set up bird protection'
        },
        {
          id: 'grain-maturity',
          type: 'recommended',
          title: 'Monitor Grain Maturity',
          description: 'Check grain moisture content. Harvest when 80% of grains are golden yellow.',
          icon: <CheckCircle className="h-4 w-4" />,
          action: 'Check grain color'
        }
      );
      break;

    case 'maturity':
      suggestions.push(
        {
          id: 'maturity-harvest',
          type: 'critical',
          title: 'Plan Harvest Timing',
          description: 'Harvest when 80-85% of grains are mature. Delayed harvest increases shattering.',
          icon: <Target className="h-4 w-4" />,
          action: 'Schedule harvest'
        },
        {
          id: 'maturity-drying',
          type: 'important',
          title: 'Prepare Drying Area',
          description: 'Ensure drying area is clean and ready. Proper drying prevents mold and maintains quality.',
          icon: <Sun className="h-4 w-4" />,
          action: 'Prepare drying area'
        },
        {
          id: 'maturity-storage',
          type: 'recommended',
          title: 'Plan Storage',
          description: 'Clean storage area and check for pests. Proper storage maintains grain quality.',
          icon: <CheckCircle className="h-4 w-4" />,
          action: 'Prepare storage'
        }
      );
      break;
  }

  // Add weather-based suggestions
  if (farmData.region && farmData.region !== '—') {
    suggestions.push({
      id: 'weather-monitoring',
      type: 'tip',
      title: 'Monitor Local Weather',
      description: `Check weather forecast for ${farmData.province}. Adjust practices based on upcoming conditions.`,
      icon: <Sun className="h-4 w-4" />,
      action: 'Check weather'
    });
  }

  return suggestions;
};

const getTypeColor = (type: Suggestion['type']) => {
  switch (type) {
    case 'critical':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'important':
      return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'recommended':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'tip':
      return 'bg-green-50 border-green-200 text-green-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const getTypeIcon = (type: Suggestion['type']) => {
  switch (type) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4" />;
    case 'important':
      return <Target className="h-4 w-4" />;
    case 'recommended':
      return <CheckCircle className="h-4 w-4" />;
    case 'tip':
      return <Lightbulb className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
};

export default function AISuggestions({ currentStage, progress, nextInDays, farmData }: AISuggestionsProps) {
  const suggestions = getStageSuggestions(currentStage, progress, nextInDays, farmData);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">AI-Powered Farming Suggestions</h2>
        <p className="text-muted-foreground">
          Personalized recommendations for your {prettyStage(currentStage)} stage
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className={`border-2 ${getTypeColor(suggestion.type)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(suggestion.type)}
                <Badge 
                  variant={suggestion.type === 'critical' ? 'destructive' : 
                          suggestion.type === 'important' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {suggestion.type}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold">
                {suggestion.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm mb-3">
                {suggestion.description}
              </p>
              {suggestion.action && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs"
                >
                  {suggestion.action}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground">
          💡 Suggestions are based on your current growth stage, location, and farming method
        </p>
      </div>
    </div>
  );
}
