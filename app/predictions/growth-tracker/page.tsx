import GrowthTrackerContent from '@/components/crops/growth-tracker-content';
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

      <GrowthTrackerContent 
        farmData={{
          farmName: ui.farmName,
          region: ui.region,
          province: ui.province,
          variety: ui.variety,
          method: ui.method,
          sowingDate: ui.sowingDate,
          farmProfileId: ui.farmProfileId
        }}
      />
    </div>
  );
}