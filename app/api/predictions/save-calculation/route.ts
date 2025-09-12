import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const { 
      calculationData, 
      formData, 
      selectedLocation, 
      dailyForecast 
    } = body;

    if (!calculationData || !formData || !selectedLocation) {
      return NextResponse.json(
        { error: 'Calculation data, form data, and location are required' },
        { status: 400 }
      );
    }

    // Extract key metrics from calculation data
    const effectiveAnalysis = calculationData?.data?.analysis ?? calculationData?.analysis ?? calculationData ?? null;
    const optimalQuarter = effectiveAnalysis?.optimalQuarter ?? null;
    const predictedYield = effectiveAnalysis?.quarterSelection?.optimalQuarter?.predictedYield ?? null;
    const confidenceLevel = effectiveAnalysis?.overallConfidence ?? null;

    // Prepare the calculation record
    const calculationRecord = {
      user_id: user.id,
      calculation_name: `${selectedLocation.region?.name || 'Unknown'} - ${formData.year}`,
      form_data: formData,
      selected_location: selectedLocation,
      calculation_results: calculationData,
      daily_forecast: dailyForecast || null,
      optimal_quarter: optimalQuarter,
      predicted_yield: predictedYield,
      confidence_level: confidenceLevel,
      location_name: selectedLocation.region?.name || 'Unknown',
      year: formData.year,
      rice_variety: formData.riceVariety,
      farm_size: formData.hectares ? parseFloat(formData.hectares) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the calculation
    const { data, error } = await supabase
      .from('recent_calculations')
      .insert(calculationRecord)
      .select('id')
      .single();

    if (error) {
      console.error('[Save Calculation] Error:', error);
      return NextResponse.json(
        { error: 'Failed to save calculation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      calculationId: data.id,
      message: 'Calculation saved successfully'
    });

  } catch (error: any) {
    console.error('[Save Calculation] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
