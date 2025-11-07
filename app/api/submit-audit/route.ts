import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, areaId, areaName, responses, month } = body;

    // Validate required fields
    if (!userName || !areaId || !areaName || !responses || !month) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Insert into database
    const { data, error } = await supabase
      .from('audit_responses')
      .insert([
        {
          user_id: userId || 'anonymous',
          user_name: userName,
          user_email: userEmail || '',
          area_id: areaId,
          area_name: areaName,
          responses: responses,
          month: month,
          submitted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save audit response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: 'Audit response submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting audit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
