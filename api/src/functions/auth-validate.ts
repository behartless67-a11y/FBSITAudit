import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function authValidate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as { password?: string };
    const { password } = body;

    const correctPassword = process.env.APP_PASSWORD || 'GarrettHall235!';

    if (password === correctPassword) {
      return {
        jsonBody: { success: true }
      };
    } else {
      return {
        status: 401,
        jsonBody: { success: false, error: 'Incorrect password' }
      };
    }
  } catch (error) {
    context.error('Auth error:', error);
    return {
      status: 500,
      jsonBody: { success: false, error: 'Authentication failed' }
    };
  }
}

app.http('auth-validate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/validate',
  handler: authValidate
});
