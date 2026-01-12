export type Mode = 'archive' | 'recent';

// Legacy Fundraise type (used by existing UI components)
// TODO: Migrate UI to use canonical Fundraise from ./fundraise.ts
export interface Fundraise {
  id: string;
  companyName: string;
  description: string;
  oneLiner: string;
  amount: string;
  round: string;
  date: string;
  tags: string[];
  logoColor: string; // generating a color instead of image for now
  location: string;
  investors: string[];
  sourceUrl: string;
}

export type SwipeDirection = 'left' | 'right';

export interface Match {
  fundraiseId: string;
  timestamp: number;
}

// Re-export canonical Fundraise types (Milestone 1)
export type {
  Fundraise as CanonicalFundraise,
  FundraiseStage,
} from './fundraise';
export { TIME_WINDOWS } from './fundraise';