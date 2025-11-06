import { NextRequest, NextResponse } from 'next/server';
import { AuditResponse } from '@/types/audit';

export async function POST(request: NextRequest) {
  try {
    const body: Omit<AuditResponse, 'id' | 'submittedAt'> & { month: string } = await request.json();

    // Validate required fields
    if (!body.userId || !body.userName || !body.areaId || !body.responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, this would save to your database
    // For now, we'll log it and return success
    const auditResponse: AuditResponse = {
      id: `audit-${Date.now()}`,
      ...body,
      submittedAt: new Date(),
    };

    console.log('Audit response received:', JSON.stringify(auditResponse, null, 2));

    // TODO: Save to database
    // await saveToDatabase(auditResponse);

    return NextResponse.json({
      success: true,
      message: 'Audit form submitted successfully',
      id: auditResponse.id
    });

  } catch (error) {
    console.error('Error processing audit submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
