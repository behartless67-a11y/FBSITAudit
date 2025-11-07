import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = getServiceSupabase();

    // Fetch all responses ordered by submission date (newest first)
    const { data, error } = await supabase
      .from('audit_responses')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit responses' },
        { status: 500 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const responses = data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      areaId: row.area_id,
      areaName: row.area_name,
      responses: row.responses,
      month: row.month,
      submittedAt: row.submitted_at,
    }));

    return NextResponse.json({
      success: true,
      responses,
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
