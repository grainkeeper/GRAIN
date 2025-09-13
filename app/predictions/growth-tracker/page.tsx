import PlantStageCard from '@/components/crops/plant-stage-card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type Method = 'direct' | 'transplant';

export default async function GrowTrackerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if user is not authenticated
  if (!user) {
    redirect('/auth/login?redirect=/predictions/growth-tracker');
  }

  let ui: { farmName: string; region: string; province: string; variety: string; method: Method; sowingDate: string; farmProfileId?: string } = {
    farmName: 'Your Farm',
    region: '—',
    province: '—',
    variety: '—',
    method: 'direct',
    sowingDate: new Date(Date.now() - 35 * 86400000).toISOString().slice(0, 10)
  };

  if (user?.id) {
    const { data: profile } = await supabase
      .from('user_farm_profiles')
      .select('id,farm_name,region,province,preferred_rice_variety,farming_method,updated_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (profile) {
      const { data: perf } = await supabase
        .from('farm_historical_performance')
        .select('planting_date')
        .eq('farm_profile_id', profile.id)
        .order('planting_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const sowingDate = (perf?.planting_date || profile.updated_at || ui.sowingDate).slice(0, 10);
      const method: Method = profile.farming_method?.toLowerCase().includes('transplant') ? 'transplant' : 'direct';

      ui = {
        farmName: profile.farm_name,
        region: profile.region,
        province: profile.province,
        variety: profile.preferred_rice_variety || '—',
        method,
        sowingDate,
        farmProfileId: profile.id
      };
    }
  }

  return (
    <div>
      <section className="w-full bg-gradient-to-r from-green-800 via-green-500 to-yellow-400 py-16 text-white text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Growth Tracker</h1>
          <p className="mt-3 text-white/90 max-w-3xl mx-auto text-base md:text-lg">
            Monitor your rice crop's growth stages and track progress from planting to harvest. 
            Get real-time insights into your farm's development cycle.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-6 max-w-6xl">
        <div className="mb-6 rounded-xl border bg-white/60 backdrop-blur p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{ui.farmName}</h2>
              <p className="text-sm text-muted-foreground">{ui.region} • {ui.province}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">{ui.variety}</Badge>
              <Badge className="capitalize">{ui.method}</Badge>
            </div>
          </div>
          {!ui.farmProfileId && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Setup Required:</strong> You need to create a farm profile to use the growth tracker. 
                Please fill out the form below to get started.
              </p>
            </div>
          )}
        </div>

        {/* Bento/grid layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PlantStageCard 
              name={ui.farmName} 
              method={ui.method} 
              sowingDate={ui.sowingDate} 
              farmProfileId={ui.farmProfileId}
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
                    <Input name="farm_name" defaultValue={ui.farmName} placeholder="Your Farm Name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Province</label>
                    <Input name="province" defaultValue={ui.province} placeholder="Province" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Region</label>
                    <Input name="region" defaultValue={ui.region} placeholder="Region" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Planting Date</label>
                    <Input name="planting_date" defaultValue={ui.sowingDate} placeholder="YYYY-MM-DD" type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rice Variety</label>
                    <Input name="preferred_rice_variety" defaultValue={ui.variety} placeholder="Rice variety" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Farming Method</label>
                    <Input name="farming_method" defaultValue={ui.method} placeholder="direct|transplant" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit">
                    {ui.farmProfileId ? 'Update Profile' : 'Create Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}