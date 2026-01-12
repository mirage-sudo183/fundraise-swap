/**
 * Data Loader for Fundraise App
 *
 * Loads and merges CSV files into the canonical fundraise dataset.
 * This is the single initialization point for all fundraise data.
 */

import { importFromCSV } from './csvImporter';
import { initializeFundraises, getDatasetStats } from './fundraiseService';
import { Fundraise } from '../types/fundraise';

// Track loading state
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Load fundraise data from CSV files
 * Merges both recent and yearly data into single dataset
 */
export async function loadFundraiseData(): Promise<void> {
  // Return existing promise if already loading
  if (loadPromise) return loadPromise;

  // Skip if already loaded
  if (isLoaded) return;

  loadPromise = (async () => {
    try {
      console.log('[DataLoader] Loading fundraise data from CSV files...');

      // Fetch both CSV files in parallel
      const [recentResponse, yearlyResponse] = await Promise.all([
        fetch('/data/funding_last_48_hrs.csv'),
        fetch('/data/funding_last_year.csv'),
      ]);

      const [recentCSV, yearlyCSV] = await Promise.all([
        recentResponse.text(),
        yearlyResponse.text(),
      ]);

      // Parse CSV files
      const recentFundraises = importFromCSV(recentCSV);
      const yearlyFundraises = importFromCSV(yearlyCSV);

      console.log(`[DataLoader] Parsed ${recentFundraises.length} recent + ${yearlyFundraises.length} yearly fundraises`);

      // Merge datasets (recent first, then yearly)
      // Deduplication happens in initializeFundraises
      const allFundraises: Fundraise[] = [...recentFundraises, ...yearlyFundraises];

      // Initialize the service with merged data
      initializeFundraises(allFundraises);

      // Log stats
      const stats = getDatasetStats();
      console.log('[DataLoader] Dataset initialized:', stats);

      isLoaded = true;
    } catch (error) {
      console.error('[DataLoader] Failed to load fundraise data:', error);
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Check if data has been loaded
 */
export function isDataLoaded(): boolean {
  return isLoaded;
}

/**
 * Reset loader state (for testing)
 */
export function resetLoader(): void {
  isLoaded = false;
  loadPromise = null;
}
