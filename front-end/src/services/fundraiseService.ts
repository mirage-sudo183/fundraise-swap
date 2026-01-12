/**
 * Fundraise Data Service (Milestone 1)
 *
 * Single source of truth for fundraise data.
 * Provides time-window queries for Archive and Recent modes.
 *
 * Key principles:
 * - One canonical dataset
 * - Archive and Recent are QUERIES, not separate storage
 * - No ordering assumptions (arbitrary order returned)
 * - Both users see identical data
 */

import { Fundraise, TIME_WINDOWS } from '../types/fundraise';
import { Fundraise as UIFundraise } from '../types';

// Color palette for generated logos
const LOGO_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-red-500',
];

/**
 * Convert canonical Fundraise to UI Fundraise format
 */
export function toUIFundraise(f: Fundraise): UIFundraise {
  // Generate a consistent color based on company name
  const colorIndex = f.company_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % LOGO_COLORS.length;

  // Create oneLiner from description (first sentence or first 80 chars)
  const oneLiner = f.description.split('.')[0] || f.description.slice(0, 80);

  return {
    id: f.id,
    companyName: f.company_name,
    description: f.description,
    oneLiner: oneLiner,
    amount: f.amount_raised,
    round: f.stage,
    date: f.announced_at,
    tags: [f.stage],
    logoColor: LOGO_COLORS[colorIndex],
    location: f.geography || 'Unknown',
    investors: f.investors || [],
    sourceUrl: f.source_url,
  };
}

// In-memory canonical dataset (single source of truth)
let fundraises: Fundraise[] = [];

/**
 * Initialize the dataset with seed data
 */
export function initializeFundraises(data: Fundraise[]): void {
  fundraises = deduplicateFundraises(data);
  console.log(`[FundraiseService] Initialized with ${fundraises.length} fundraises`);
}

/**
 * Add a single fundraise to the dataset
 * Returns true if added, false if duplicate
 */
export function addFundraise(fundraise: Fundraise): boolean {
  const isDuplicate = fundraises.some(
    (f) =>
      f.company_name.toLowerCase() === fundraise.company_name.toLowerCase() &&
      f.announced_at === fundraise.announced_at
  );

  if (isDuplicate) {
    console.log(`[FundraiseService] Duplicate ignored: ${fundraise.company_name} (${fundraise.announced_at})`);
    return false;
  }

  fundraises.push(fundraise);
  return true;
}

/**
 * Deduplication logic (Milestone 1 spec)
 *
 * Two fundraises are the same if:
 * - company_name AND announced_at match
 *
 * If duplicates exist: keep the first, ignore the rest
 */
function deduplicateFundraises(data: Fundraise[]): Fundraise[] {
  const seen = new Map<string, Fundraise>();

  for (const fundraise of data) {
    const key = `${fundraise.company_name.toLowerCase()}|${fundraise.announced_at}`;
    if (!seen.has(key)) {
      seen.set(key, fundraise);
    } else {
      console.log(`[FundraiseService] Dedup: skipped duplicate ${fundraise.company_name}`);
    }
  }

  return Array.from(seen.values());
}

/**
 * Query 1 — Archive Dataset
 * "Give me all fundraises from the last 12 months."
 *
 * Rolling window, inclusive
 */
export function getArchiveFundraises(): Fundraise[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - TIME_WINDOWS.ARCHIVE_MONTHS);

  return fundraises.filter((f) => {
    const announcedAt = new Date(f.announced_at);
    return announcedAt >= cutoff && announcedAt <= now;
  });
}

/**
 * Query 2 — Recent Dataset
 * "Give me all fundraises from the last 48 hours."
 *
 * Hardcoded per spec (not configurable yet)
 */
export function getRecentFundraises(): Fundraise[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - TIME_WINDOWS.RECENT_HOURS * 60 * 60 * 1000);

  return fundraises.filter((f) => {
    const announcedAt = new Date(f.announced_at);
    return announcedAt >= cutoff && announcedAt <= now;
  });
}

/**
 * Get all fundraises (for debugging/validation)
 */
export function getAllFundraises(): Fundraise[] {
  return [...fundraises];
}

/**
 * Get dataset statistics (for validation)
 */
export function getDatasetStats(): {
  total: number;
  archiveCount: number;
  recentCount: number;
  oldestDate: string | null;
  newestDate: string | null;
} {
  const archive = getArchiveFundraises();
  const recent = getRecentFundraises();

  const dates = fundraises.map((f) => new Date(f.announced_at).getTime());
  const oldest = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null;
  const newest = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

  return {
    total: fundraises.length,
    archiveCount: archive.length,
    recentCount: recent.length,
    oldestDate: oldest,
    newestDate: newest,
  };
}

/**
 * Clear all data (for testing)
 */
export function clearFundraises(): void {
  fundraises = [];
}
