import { NextResponse } from 'next/server';
import { getPool } from '@/lib/azure-sql';

interface AuditResponse {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  area_id: string;
  area_name: string;
  responses: string;
  month: string;
  submitted_at: Date;
}

export async function GET() {
  try {
    const pool = await getPool();

    // Fetch all responses ordered by submission date (newest first)
    const result = await pool.request().query(`
      SELECT * FROM audit_responses ORDER BY submitted_at DESC
    `);

    // Transform snake_case to camelCase for frontend
    const responses = result.recordset.map((row: AuditResponse) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      areaId: row.area_id,
      areaName: row.area_name,
      responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses,
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
