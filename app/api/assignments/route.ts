import { NextResponse } from 'next/server';
import { getPool } from '@/lib/azure-sql';

interface UserAssignment {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  area_id: string;
  area_name: string;
  is_active: boolean;
  created_at: Date;
}

// GET - Fetch all user area assignments
export async function GET() {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT * FROM user_area_assignments ORDER BY created_at DESC
    `);

    return NextResponse.json({ assignments: result.recordset });
  } catch (error) {
    console.error('Error in GET /api/assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user area assignment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, areaId, areaName } = body;

    // Validate required fields
    if (!userId || !userName || !userEmail || !areaId || !areaName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // Insert assignment
    const result = await pool.request()
      .input('user_id', userId)
      .input('user_name', userName)
      .input('user_email', userEmail)
      .input('area_id', areaId)
      .input('area_name', areaName)
      .query(`
        INSERT INTO user_area_assignments (user_id, user_name, user_email, area_id, area_name, is_active)
        OUTPUT INSERTED.*
        VALUES (@user_id, @user_name, @user_email, @area_id, @area_name, 1)
      `);

    return NextResponse.json({
      success: true,
      assignment: result.recordset[0],
      message: 'Assignment created successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/assignments:', error);
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('UQ_user_area')) {
      return NextResponse.json(
        { error: 'User is already assigned to this area' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate user area assignment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // Soft delete by setting is_active to false
    const result = await pool.request()
      .input('id', parseInt(id))
      .query(`
        UPDATE user_area_assignments
        SET is_active = 0
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment: result.recordset[0],
      message: 'Assignment deactivated successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
