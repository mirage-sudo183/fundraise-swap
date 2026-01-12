/**
 * Canonical Fundraise Data Model (Milestone 1)
 *
 * This is the single source of truth for fundraise data.
 * All feeds, modes, and logic derive from this schema.
 */

export type FundraiseStage =
  | 'Pre-Seed'
  | 'Seed'
  | 'Series A'
  | 'Series B'
  | 'Series C'
  | 'Series D+'
  | 'Growth';

export interface Fundraise {
  // Required fields (v1) - non-negotiable
  id: string;                    // Stable unique identifier (UUID)
  company_name: string;          // Company name
  description: string;           // One-line description
  stage: FundraiseStage;         // Funding round stage
  amount_raised: string;         // String format (e.g. "$12M", "€5M")
  announced_at: string;          // ISO date string - KEY for time windows
  source_url: string;            // URL where fundraise was announced
  created_at: string;            // Internal timestamp (ISO)

  // Optional fields (nice to have)
  investors?: string[];          // Lead investors
  geography?: string;            // Country/city
  currency?: string;             // If parsing later
}

/**
 * Time window constants
 * Archive: last 12 months (rolling)
 * Recent: last 48 hours (hardcoded per spec)
 */
export const TIME_WINDOWS = {
  ARCHIVE_MONTHS: 12,
  RECENT_HOURS: 48,
} as const;
