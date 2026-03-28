// API service layer for communicating with the Express backend

const API_BASE = '/api';

export interface BackendUser {
  _id: string;
  username: string;
  password: string;
  type: number; // 0 = kids(?), 1 = adults, 2 = founder — mapping based on backend schema
  primaryLang?: number; // 0 = eng, 1 = spanish
}

export interface LoginResponse {
  success: boolean;
  result: BackendUser[] | null;
}

/**
 * Login via GET /login/:username/:pass
 */
export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/login/${encodeURIComponent(username)}/${encodeURIComponent(password)}`);
  if (!res.ok) {
    throw new Error(`Login request failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Signup via GET /signup/:username/:pass/:type
 * Returns the newly created user object.
 */
export async function signupUser(username: string, password: string, type: number): Promise<BackendUser> {
  const res = await fetch(`${API_BASE}/signup/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${type}`);
  if (!res.ok) {
    throw new Error(`Signup request failed with status ${res.status}`);
  }
  return res.json();
}
