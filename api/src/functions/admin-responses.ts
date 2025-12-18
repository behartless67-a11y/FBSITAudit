import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPool } from '../shared/db';

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

export async function adminResponses(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT * FROM audit_responses ORDER BY submitted_at DESC
    `);

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

    return {
      jsonBody: {
        success: true,
        responses,
      }
    };
  } catch (error) {
    context.error('Error fetching responses:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

app.http('admin-responses', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/responses',
  handler: adminResponses
});
