export interface AuthSessionUser {
  id: number;
  email: string;
  name: string;
  surname: string | null;
  customerType: string;
  role: string;
  status: string;
}

export interface AuthSessionResponse {
  sessionId: string;
  expiresAt: string;
  user: AuthSessionUser;
}
