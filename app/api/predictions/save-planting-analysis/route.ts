import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PlantingWindowAnalysis } from '@/lib/types/prediction';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { analysis }: { analysis: PlantingWindowAnalysis } = body;

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis data is required' },
        { status: 400 }
      );
    }

    // Check if user already has a recent analysis for this location
    const { data: existingAnalysis } = await supabase
      .from('planting_window_analyses')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('location_name', analysis.location.name)
      .eq('latitude', analysis.location.latitude)
      .eq('longitude', analysis.location.longitude)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If analysis exists and is less than 24 hours old, update it
    let analysisId: string;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (existingAnalysis && new Date(existingAnalysis.created_at) > twentyFourHoursAgo) {
      // Update existing analysis
      const { data, error } = await supabase
        .from('planting_window_analyses')
        .update({
          forecast_period: analysis.forecastPeriod,
          plantable_days: analysis.summary.plantableDays,
          total_days: analysis.summary.totalDays,
          excellent_days: analysis.summary.bestPlantingDays.length,
          overall_recommendation: analysis.summary.overallRecommendation,
          next_update_date: analysis.summary.nextUpdateDate,
          weather_trends: analysis.summary.weatherTrends,
          best_planting_days: analysis.summary.bestPlantingDays.map(day => ({
            date: day.date,
            suitability_score: day.suitabilityScore,
            weather_summary: day.weatherSummary
          })),
          updated_at: now.toISOString()
        })
        .eq('id', existingAnalysis.id)
        .select('id')
        .single();

      if (error) {
        console.error('[Save Planting Analysis] Update error:', error);
        return NextResponse.json(
          { error: 'Failed to update analysis' },
          { status: 500 }
        );
      }

      analysisId = data.id;
    } else {
      // Create new analysis
      const { data, error } = await supabase
        .from('planting_window_analyses')
        .insert({
          user_id: user.id,
          location_name: analysis.location.name,
          latitude: analysis.location.latitude,
          longitude: analysis.location.longitude,
          forecast_period: analysis.forecastPeriod,
          plantable_days: analysis.summary.plantableDays,
          total_days: analysis.summary.totalDays,
          excellent_days: analysis.summary.bestPlantingDays.length,
          overall_recommendation: analysis.summary.overallRecommendation,
          next_update_date: analysis.summary.nextUpdateDate,
          weather_trends: analysis.summary.weatherTrends,
          best_planting_days: analysis.summary.bestPlantingDays.map(day => ({
            date: day.date,
            suitability_score: day.suitabilityScore,
            weather_summary: day.weatherSummary
          })),
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('[Save Planting Analysis] Insert error:', error);
        return NextResponse.json(
          { error: 'Failed to save analysis' },
          { status: 500 }
        );
      }

      analysisId = data.id;
    }

    return NextResponse.json({
      success: true,
      analysisId,
      message: existingAnalysis ? 'Analysis updated successfully' : 'Analysis saved successfully'
    });

  } catch (error: any) {
    console.error('[Save Planting Analysis] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
