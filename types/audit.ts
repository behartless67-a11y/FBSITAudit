export interface Question {
  id: number;
  section?: string;
  text: string;
  type: 'single-choice';
  required: boolean;
  options: string[];
}

export interface Area {
  id: string;
  name: string;
  questions: Question[];
}

export interface AuditResponse {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  areaId: string;
  areaName: string;
  responses: Record<number, string>;
  submittedAt: Date;
  month: string; // Format: YYYY-MM
}

export interface UserInfo {
  clientPrincipal: {
    identityProvider: string;
    userId: string;
    userDetails: string;
    userRoles: string[];
    claims?: Array<{ typ: string; val: string }>;
  } | null;
}
