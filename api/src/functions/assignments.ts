import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPool } from '../shared/db';

export async function assignments(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const method = request.method;

  if (method === 'GET') {
    return getAssignments(context);
  } else if (method === 'POST') {
    return createAssignment(request, context);
  } else if (method === 'DELETE') {
    return deleteAssignment(request, context);
  }

  return {
    status: 405,
    jsonBody: { error: 'Method not allowed' }
  };
}

async function getAssignments(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT * FROM user_area_assignments ORDER BY created_at DESC
    `);

    return {
      jsonBody: { assignments: result.recordset }
    };
  } catch (error) {
    context.error('Error in GET /api/assignments:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

async function createAssignment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as {
      userId?: string;
      userName?: string;
      userEmail?: string;
      areaId?: string;
      areaName?: string;
    };
    const { userId, userName, userEmail, areaId, areaName } = body;

    if (!userId || !userName || !userEmail || !areaId || !areaName) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields' }
      };
    }

    const pool = await getPool();

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

    return {
      jsonBody: {
        success: true,
        assignment: result.recordset[0],
        message: 'Assignment created successfully',
      }
    };
  } catch (error) {
    context.error('Error in POST /api/assignments:', error);
    if (error instanceof Error && error.message.includes('UQ_user_area')) {
      return {
        status: 409,
        jsonBody: { error: 'User is already assigned to this area' }
      };
    }
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

async function deleteAssignment(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.query.get('id');

    if (!id) {
      return {
        status: 400,
        jsonBody: { error: 'Assignment ID is required' }
      };
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('id', parseInt(id))
      .query(`
        UPDATE user_area_assignments
        SET is_active = 0
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return {
        status: 404,
        jsonBody: { error: 'Assignment not found' }
      };
    }

    return {
      jsonBody: {
        success: true,
        assignment: result.recordset[0],
        message: 'Assignment deactivated successfully',
      }
    };
  } catch (error) {
    context.error('Error in DELETE /api/assignments:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

app.http('assignments', {
  methods: ['GET', 'POST', 'DELETE'],
  authLevel: 'anonymous',
  route: 'assignments',
  handler: assignments
});
