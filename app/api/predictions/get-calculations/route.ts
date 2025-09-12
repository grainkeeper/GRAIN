import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get saved calculations for the user
    const { data: calculations, error } = await supabase
      .from('recent_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Get Calculations] Error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve calculations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      calculations: calculations || []
    });

  } catch (error: any) {
    console.error('[Get Calculations] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { calculationId } = body;

    if (!calculationId) {
      return NextResponse.json(
        { error: 'Calculation ID is required' },
        { status: 400 }
      );
    }

    // Delete the calculation
    const { error } = await supabase
      .from('recent_calculations')
      .delete()
      .eq('id', calculationId)
      .eq('user_id', user.id); // Ensure user can only delete their own calculations

    if (error) {
      console.error('[Delete Calculation] Error:', error);
      return NextResponse.json(
        { error: 'Failed to delete calculation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Calculation deleted successfully'
    });

  } catch (error: any) {
    console.error('[Delete Calculation] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

