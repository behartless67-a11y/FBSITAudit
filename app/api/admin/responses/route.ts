import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In production, this would query your database
    // For now, return empty array or fetch from database

    // TODO: Replace with actual database query
    // const responses = await db.query('SELECT * FROM audit_responses ORDER BY submitted_at DESC');

    return NextResponse.json({
      success: true,
      responses: [] // Will be populated from database in production
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
