/**
 * Feed Generator Service
 *
 * Loads fundraise data and generates deterministic feeds for workspaces.
 * Ensures both co-founders see identical ordering.
 */

import fs from 'fs';
import path from 'path';
import { Fundraise, Mode } from '../types';
import { importFromCSV } from './csvImporter';
import { deterministicShuffle } from '../utils/deterministicShuffle';

// In-memory datasets (separate for each mode)
let archiveFundraises: Fundraise[] = [];
let recentFundraises: Fundraise[] = [];
let isLoaded = false;

/**
 * Load fundraise data from CSV files
 */
export function loadFundraiseData(): void {
  if (isLoaded) return;

  const dataDir = path.join(__dirname, '../../data');
  const yearlyPath = path.join(dataDir, 'funding_last_year.csv');
  const recentPath = path.join(dataDir, 'funding_last_48_hrs.csv');

  // Load yearly CSV for Archive mode
  if (fs.existsSync(yearlyPath)) {
    const yearlyCSV = fs.readFileSync(yearlyPath, 'utf-8');
    const yearlyData = importFromCSV(yearlyCSV);
    archiveFundraises = deduplicateFundraises(yearlyData);
    console.log(`[FeedGenerator] Archive: Loaded ${archiveFundraises.length} fundraises from funding_last_year.csv`);
  } else {
    console.warn(`[FeedGenerator] Warning: ${yearlyPath} not found`);
    archiveFundraises = [];
  }

  // Load 48hrs CSV for Recent mode
  if (fs.existsSync(recentPath)) {
    const recentCSV = fs.readFileSync(recentPath, 'utf-8');
    const recentData = importFromCSV(recentCSV);
    recentFundraises = deduplicateFundraises(recentData);
    console.log(`[FeedGenerator] Recent: Loaded ${recentFundraises.length} fundraises from funding_last_48_hrs.csv`);
  } else {
    console.warn(`[FeedGenerator] Warning: ${recentPath} not found`);
    recentFundraises = [];
  }

  isLoaded = true;
}

/**
 * Deduplicate fundraises by company_name + announced_at
 */
function deduplicateFundraises(data: Fundraise[]): Fundraise[] {
  const seen = new Map<string, Fundraise>();

  for (const f of data) {
    const key = `${f.company_name.toLowerCase()}|${f.announced_at}`;
    if (!seen.has(key)) {
      seen.set(key, f);
    }
  }

  return Array.from(seen.values());
}

/**
 * Get Archive feed (deterministic shuffle based on workspace seed)
 */
export function getArchiveFeed(workspaceSeed: string): Fundraise[] {
  // Apply deterministic shuffle based on workspace seed
  return deterministicShuffle(archiveFundraises, workspaceSeed);
}

/**
 * Get Recent feed (chronological, newest first)
 */
export function getRecentFeed(): Fundraise[] {
  // Sort by announced_at DESC (newest first)
  return [...recentFundraises].sort(
    (a, b) => new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
  );
}

/**
 * Get feed for a specific mode
 */
export function getFeed(mode: Mode, workspaceSeed: string): Fundraise[] {
  if (!isLoaded) {
    loadFundraiseData();
  }

  if (mode === 'archive') {
    return getArchiveFeed(workspaceSeed);
  } else {
    return getRecentFeed();
  }
}

/**
 * Get all fundraises (for debugging)
 */
export function getAllFundraises(): { archive: Fundraise[]; recent: Fundraise[] } {
  if (!isLoaded) {
    loadFundraiseData();
  }
  return { archive: archiveFundraises, recent: recentFundraises };
}

/**
 * Get dataset statistics
 */
export function getDatasetStats(): {
  archiveCount: number;
  recentCount: number;
} {
  if (!isLoaded) {
    loadFundraiseData();
  }

  return {
    archiveCount: archiveFundraises.length,
    recentCount: recentFundraises.length,
  };
}
