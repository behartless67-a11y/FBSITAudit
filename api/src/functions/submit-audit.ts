import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPool } from '../shared/db';
import { v4 as uuidv4 } from 'uuid';

export async function submitAudit(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as {
      userId?: string;
      userName?: string;
      userEmail?: string;
      areaId?: string;
      areaName?: string;
      responses?: Record<string, unknown>;
      month?: string;
    };

    const { userId, userName, userEmail, areaId, areaName, responses, month } = body;

    if (!userName || !areaId || !areaName || !responses || !month) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields' }
      };
    }

    const pool = await getPool();
    const id = uuidv4();

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
      return {
        status: 500,
        jsonBody: { error: 'Failed to save audit response' }
      };
    }

    return {
      jsonBody: {
        success: true,
        id: id,
        message: 'Audit response submitted successfully',
      }
    };
  } catch (error) {
    context.error('Error submitting audit:', error);
    if (error instanceof Error && error.message.includes('UQ_user_area_month')) {
      return {
        status: 409,
        jsonBody: { error: 'You have already submitted an audit for this area this month' }
      };
    }
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

app.http('submit-audit', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'submit-audit',
  handler: submitAudit
});
