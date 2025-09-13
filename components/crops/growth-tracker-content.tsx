'use client';

import { useState } from 'react';
import PlantStageCard from '@/components/crops/plant-stage-card';
import AISuggestions from '@/components/crops/ai-suggestions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiceStage } from '@/lib/services/crop-stage';

type Method = 'direct' | 'transplant';

interface GrowthTrackerContentProps {
  farmData: {
    farmName: string;
    region: string;
    province: string;
    variety: string;
    method: Method;
    sowingDate: string;
    farmProfileId?: string;
  };
}

export default function GrowthTrackerContent({ farmData }: GrowthTrackerContentProps) {
  const [currentStage, setCurrentStage] = useState<RiceStage>('nursery');
  const [progress, setProgress] = useState(0);
  const [nextInDays, setNextInDays] = useState(0);

  const handleStageChange = (stage: RiceStage, progressValue: number, nextInDaysValue: number) => {
    setCurrentStage(stage);
    setProgress(progressValue);
    setNextInDays(nextInDaysValue);
  };

  return (
    <div className="container mx-auto px-6 py-6 max-w-6xl">
      <div className="mb-6 rounded-xl border bg-white/60 backdrop-blur p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{farmData.farmName}</h2>
            <p className="text-sm text-muted-foreground">{farmData.region} • {farmData.province}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">{farmData.variety}</Badge>
            <Badge className="capitalize">{farmData.method}</Badge>
          </div>
        </div>
        {!farmData.farmProfileId && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Setup Required:</strong> You need to create a farm profile to use the growth tracker. 
              Please fill out the form below to get started.
            </p>
          </div>
        )}
      </div>

      {/* Main Growth Tracker Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <PlantStageCard 
            name={farmData.farmName} 
            method={farmData.method} 
            sowingDate={farmData.sowingDate} 
            farmProfileId={farmData.farmProfileId}
            onStageChange={handleStageChange}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Edit</CardTitle>
          </CardHeader>
          <CardContent>
            <form action="/api/farm-profiles" method="post" className="grid gap-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Farm Name</label>
                  <Input name="farm_name" defaultValue={farmData.farmName} placeholder="Your Farm Name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Province</label>
                  <Input name="province" defaultValue={farmData.province} placeholder="Province" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Region</label>
                  <Input name="region" defaultValue={farmData.region} placeholder="Region" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Planting Date</label>
                  <Input name="planting_date" defaultValue={farmData.sowingDate} placeholder="YYYY-MM-DD" type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rice Variety</label>
                  <Input name="preferred_rice_variety" defaultValue={farmData.variety} placeholder="Rice variety" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Farming Method</label>
                  <Input name="farming_method" defaultValue={farmData.method} placeholder="direct|transplant" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit">
                  {farmData.farmProfileId ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <AISuggestions 
          currentStage={currentStage}
          progress={progress}
          nextInDays={nextInDays}
          farmData={{
            region: farmData.region,
            province: farmData.province,
            variety: farmData.variety,
            method: farmData.method
          }}
        />
      </div>
    </div>
  );
}
