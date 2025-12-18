import { NextResponse } from 'next/server';
import { getPool } from '@/lib/azure-sql';
import { v4 as uuidv4 } from 'uuid';

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

    const pool = await getPool();
    const id = uuidv4();

    // Insert into database using parameterized query
    const result = await pool.request()
      .input('id', id)
      .input('user_id', userId || 'anonymous')
      .input('user_name', userName)
      .input('user_email', userEmail || '')
      .input('area_id', areaId)
      .input('area_name', areaName)
      .input('responses', JSON.stringify(responses))
      .input('month', month)
      .query(`
        INSERT INTO audit_responses (id, user_id, user_name, user_email, area_id, area_name, responses, month)
        VALUES (@id, @user_id, @user_name, @user_email, @area_id, @area_name, @responses, @month)
      `);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { error: 'Failed to save audit response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: id,
      message: 'Audit response submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting audit:', error);
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('UQ_user_area_month')) {
      return NextResponse.json(
        { error: 'You have already submitted an audit for this area this month' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
