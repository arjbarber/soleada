// API service layer for communicating with the Express backend

// const API_BASE = '/api';
const API_BASE = "http://localhost:5000";

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

export interface SignupResponse {
  firebaseToken: string;
  backendUser: BackendUser;
}

/**
 * Login via GET /login/:username/:pass
 */
// export async function loginUser(username: string, password: string): Promise<LoginResponse> {
//   const res = await fetch(`${API_BASE}/login/${encodeURIComponent(username)}/${encodeURIComponent(password)}`);
//   if (!res.ok) {
//     throw new Error(`Login request failed with status ${res.status}`);
//   }
//   return res.json();
// }

/**
 * Signup via GET /signup/:username/:pass/:type
 * Returns the newly created user object.
 */
export async function signupUser(
  email: string, 
  displayName: string, 
  password: string, 
  type: number
): Promise<SignupResponse> {
  const res = await fetch(`${API_BASE}/account/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, displayName, password, type }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `Signup request failed with status ${res.status}`);
  }

  return res.json();
}

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error(`Login failed with status ${res.status}`);
  }

  return res.json();
}
