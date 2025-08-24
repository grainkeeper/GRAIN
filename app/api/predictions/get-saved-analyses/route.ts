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

    // Get saved analyses for the user
    const { data: analyses, error } = await supabase
      .from('planting_window_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Get Saved Analyses] Error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve analyses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || []
    });

  } catch (error: any) {
    console.error('[Get Saved Analyses] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
