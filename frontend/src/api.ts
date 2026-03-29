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
  result: BackendUser | null;
}

export interface BackendPost {
  _id: string;
  title: string;
  type: number;
  body: string;
  bodySpanish?: string;
  embeddings: number[];
  authorId: string;
  genre?: string[];
}

export interface BackendChat {
  _id: string;
  userOne: string;
  userTwo: string;
  messages: BackendChatMessage[];
}

export interface BackendChatMessage {
  user: string;
  contentEnglish: string;
  contentSpanish: string;
  _id?: string;
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
 * Signup via GET /signup/:username/:pass/:type/:lang
 * Returns the newly created user object.
 */
export async function signupUser(username: string, password: string, type: number, lang: number): Promise<BackendUser> {
  const res = await fetch(`${API_BASE}/signup/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${type}/${lang}`);
  if (!res.ok) {
    throw new Error(`Signup request failed with status ${res.status}`);
  }
  return res.json();
}

// ═══════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════

/**
 * Create a new post via GET /newPost/:name/:body/:authorId/:type
 */
export async function createPost(
  title: string,
  body: string,
  authorId: string,
  type: number
): Promise<BackendPost> {
  const res = await fetch(
    `${API_BASE}/newPost/${encodeURIComponent(title)}/${encodeURIComponent(body)}/${encodeURIComponent(authorId)}/${type}`
  );
  if (!res.ok) {
    throw new Error(`Create post failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Get posts by author ID via GET /postByAuthorId/:id
 */
export async function getPostsByAuthor(authorId: string): Promise<BackendPost[]> {
  const res = await fetch(`${API_BASE}/postByAuthorId/${encodeURIComponent(authorId)}`);
  if (!res.ok) {
    throw new Error(`Fetch posts failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Get ALL posts via GET /allPosts
 */
export async function getAllPosts(): Promise<BackendPost[]> {
  const res = await fetch(`${API_BASE}/allPosts`);
  if (!res.ok) {
    throw new Error(`Fetch all posts failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Look up a user by their MongoDB _id via GET /userById/:id
 */
export async function getUserById(userId: string): Promise<{ _id: string; username: string; type: number } | null> {
  const res = await fetch(`${API_BASE}/userById/${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error(`User lookup failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Search posts by name via GET /postByName/:search/:uType
 */
export async function searchPosts(search: string, userType: number): Promise<BackendPost[]> {
  const res = await fetch(
    `${API_BASE}/postByName/${encodeURIComponent(search)}/${userType}`
  );
  if (!res.ok) {
    throw new Error(`Search posts failed with status ${res.status}`);
  }
  return res.json();
}

// ═══════════════════════════════════════════════════
// CHATS
// ═══════════════════════════════════════════════════

/**
 * Create a new chat between two users via GET /createChat/:user1/:user2
 */
export async function createChatAPI(user1: string, user2: string): Promise<BackendChat> {
  const res = await fetch(
    `${API_BASE}/createChat/${encodeURIComponent(user1)}/${encodeURIComponent(user2)}`
  );
  if (!res.ok) {
    throw new Error(`Create chat failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Get all chats for a user via GET /getChats/:user
 * Backend returns a single chat object or empty array
 */
export async function getChats(userId: string): Promise<BackendChat[]> {
  const res = await fetch(`${API_BASE}/getChats/${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error(`Fetch chats failed with status ${res.status}`);
  }
  const data = await res.json();
  // Backend may return a single chat object or an empty array
  if (Array.isArray(data)) {
    return data;
  }
  // Single chat object — wrap in array
  return data ? [data] : [];
}

/**
 * Get a specific chat between two users via GET /getChat/:user/:user2
 */
export async function getChat(user1: string, user2: string): Promise<BackendChat | null> {
  const res = await fetch(
    `${API_BASE}/getChat/${encodeURIComponent(user1)}/${encodeURIComponent(user2)}`
  );
  if (!res.ok) {
    throw new Error(`Fetch chat failed with status ${res.status}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  return data || null;
}

/**
 * Send a message via GET /sendMessage/:id/:userID/:userTwo/:newMessage/:lang
 * lang: 0 = english, 1 = spanish
 */
export async function sendMessage(
  chatId: string,
  userId: string,
  userTwo: string,
  message: string,
  lang: number = 0
): Promise<BackendChat> {
  const res = await fetch(
    `${API_BASE}/sendMessage/${encodeURIComponent(chatId)}/${encodeURIComponent(userId)}/${encodeURIComponent(userTwo)}/${encodeURIComponent(message)}/${lang}`
  );
  if (!res.ok) {
    throw new Error(`Send message failed with status ${res.status}`);
  }
  return res.json();
}
