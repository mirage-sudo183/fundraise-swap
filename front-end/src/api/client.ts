/**
 * API Client for Fundraise Swap Backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types
export interface User {
  id: string;
  name: string;
  display_name: string;
  workspace_id: string | null;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  seed: string;
  invite_code: string;
  created_at: string;
}

export interface Fundraise {
  id: string;
  company_name: string;
  description: string;
  stage: string;
  amount_raised: string;
  announced_at: string;
  source_url: string;
  investors?: string[];
  geography?: string;
}

export interface FeedResponse {
  feed: Fundraise[];
  totalCount: number;
  userCursor: number;
}

export interface ProgressResponse {
  cursor: number;
  updatedAt: string;
}

export type Mode = 'archive' | 'recent';
export type SwipeDecision = 'like' | 'pass';

export interface SwipeResponse {
  id: string;
  decision: SwipeDecision;
  createdAt: string;
  matchCreated?: boolean;
}

export interface ReflectionResponse {
  id: string;
  swipeId: string;
  chips: string[];
  note: string | null;
  createdAt: string;
}

// Match types
export interface UserReflection {
  userId: string;
  userName: string;
  displayName: string;
  chips: string[];
  note: string | null;
  likedAt: string;
}

export interface MatchListItem {
  id: string;
  fundraiseId: string;
  companyName: string;
  description: string;
  stage: string;
  amountRaised: string;
  mode: Mode;
  matchedAt: string;
  reflections: UserReflection[];
}

export interface MatchDetailResponse {
  match: MatchListItem;
  fundraise: Fundraise;
}

// Token storage
const TOKEN_KEY = 'fundraise_swap_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// API methods
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export async function getAvailableUsers(): Promise<{ users: User[] }> {
  return request('/api/auth/users');
}

export async function login(name: string): Promise<{ user: User; token: string }> {
  const result = await request<{ user: User; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  setToken(result.token);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function getMe(): Promise<{ user: User; workspace: Workspace | null }> {
  return request('/api/auth/me');
}

// Workspace API
export async function createWorkspace(name: string): Promise<{ workspace: Workspace }> {
  return request('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function joinWorkspace(inviteCode: string): Promise<{ workspace: Workspace }> {
  return request('/api/workspaces/join', {
    method: 'POST',
    body: JSON.stringify({ inviteCode }),
  });
}

export async function getCurrentWorkspace(): Promise<{
  workspace: Workspace | null;
  members: { id: string; name: string; display_name: string }[];
}> {
  return request('/api/workspaces/current');
}

// Feed API
export async function getFeed(mode: Mode): Promise<FeedResponse> {
  return request(`/api/feed/${mode}`);
}

// Progress API
export async function getProgress(mode: Mode): Promise<ProgressResponse> {
  return request(`/api/progress/${mode}`);
}

export async function updateProgress(mode: Mode, cursor: number): Promise<ProgressResponse> {
  return request(`/api/progress/${mode}`, {
    method: 'PUT',
    body: JSON.stringify({ cursor }),
  });
}

// Swipe API
export async function saveSwipe(
  mode: Mode,
  fundraiseId: string,
  decision: SwipeDecision
): Promise<SwipeResponse> {
  return request(`/api/swipes/${mode}`, {
    method: 'POST',
    body: JSON.stringify({ fundraiseId, decision }),
  });
}

// Reflection API
export async function saveReflection(
  swipeId: string,
  chips: string[],
  note?: string
): Promise<ReflectionResponse> {
  return request('/api/reflections', {
    method: 'POST',
    body: JSON.stringify({ swipeId, chips, note }),
  });
}

// Matches API
export async function getMatches(): Promise<{ matches: MatchListItem[] }> {
  return request('/api/matches');
}

export async function getMatchDetail(matchId: string): Promise<MatchDetailResponse> {
  return request(`/api/matches/${matchId}`);
}

// Check if logged in
export function isLoggedIn(): boolean {
  return !!getToken();
}
