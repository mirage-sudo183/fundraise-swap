// Workspace types
export interface Workspace {
  id: string;
  name: string;
  seed: string;
  invite_code: string;
  created_at: string;
}

// User types
export interface User {
  id: string;
  name: string;
  display_name: string;
  workspace_id: string | null;
  created_at: string;
}

// Session types
export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
}

// Progress types
export type Mode = 'archive' | 'recent';

export interface UserProgress {
  user_id: string;
  mode: Mode;
  cursor_index: number;
  updated_at: string;
}

// Swipe types
export type SwipeDecision = 'like' | 'pass';

export interface SwipeRecord {
  id: string;
  user_id: string;
  fundraise_id: string;
  mode: Mode;
  decision: SwipeDecision;
  created_at: string;
}

// Fundraise types (canonical)
export type FundraiseStage =
  | 'Pre-Seed'
  | 'Seed'
  | 'Series A'
  | 'Series B'
  | 'Series C'
  | 'Series D+'
  | 'Growth';

export interface Fundraise {
  id: string;
  company_name: string;
  description: string;
  stage: FundraiseStage;
  amount_raised: string;
  announced_at: string;
  source_url: string;
  created_at: string;
  investors?: string[];
  geography?: string;
}

// Match types
export interface MatchRecord {
  id: string;
  workspace_id: string;
  fundraise_id: string;
  mode: Mode;
  created_at: string;
}

// API Request/Response types
export interface AuthRequest {
  name: string; // Simple name-based login
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateWorkspaceRequest {
  name: string;
}

export interface JoinWorkspaceRequest {
  inviteCode: string;
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

export interface UpdateProgressRequest {
  cursor: number;
}

export interface SaveSwipeRequest {
  fundraiseId: string;
  decision: SwipeDecision;
}

export interface SwipeResponse {
  id: string;
  decision: SwipeDecision;
  createdAt: string;
}

// Reflection types
export interface ReflectionRecord {
  id: string;
  swipe_id: string;
  user_id: string;
  chips: string; // JSON array stored as string
  note: string | null;
  created_at: string;
}

export interface SaveReflectionRequest {
  swipeId: string;
  chips: string[];
  note?: string;
}

export interface ReflectionResponse {
  id: string;
  swipeId: string;
  chips: string[];
  note: string | null;
  createdAt: string;
}

// Match response types
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

// Express extended types
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: User;
  session?: Session;
}
