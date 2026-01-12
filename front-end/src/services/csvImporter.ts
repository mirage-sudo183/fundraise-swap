/**
 * CSV Importer for Crunchbase Fundraise Data
 *
 * Maps Crunchbase export columns to canonical Fundraise model.
 * Handles both funding_last_48_hrs.csv and funding_last_year.csv
 */

import { Fundraise, FundraiseStage } from '../types/fundraise';

interface CrunchbaseRow {
  'Transaction Name': string;
  'Transaction Name URL': string;
  'Organization Name': string;
  'Organization Name URL': string;
  'Funding Type': string;
  'Money Raised': string;
  'Money Raised Currency': string;
  'Money Raised (in USD)': string;
  'Announced Date': string;
  'Organization Description': string;
  'Organization Industries': string;
  'Organization Website': string;
  'Lead Investors': string;
  'Investor Names': string;
}

/**
 * Map Crunchbase funding type to our FundraiseStage enum
 */
function mapFundingType(crunchbaseType: string): FundraiseStage {
  const type = crunchbaseType.toLowerCase();

  if (type.includes('pre-seed') || type.includes('pre seed')) return 'Pre-Seed';
  if (type.includes('seed')) return 'Seed';
  if (type.includes('series a')) return 'Series A';
  if (type.includes('series b')) return 'Series B';
  if (type.includes('series c')) return 'Series C';
  if (type.includes('series d') || type.includes('series e') || type.includes('series f')) return 'Series D+';
  if (type.includes('growth') || type.includes('private equity') || type.includes('post-ipo')) return 'Growth';

  // Default to Seed for unknown types
  return 'Seed';
}

/**
 * Format USD amount to human readable string
 * e.g., 250000000 -> "$250M", 4500000 -> "$4.5M", 500000 -> "$500K"
 */
function formatAmount(usdAmount: string | number): string {
  const amount = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;

  if (isNaN(amount) || amount === 0) return 'Undisclosed';

  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

/**
 * Generate a UUID (browser-compatible)
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Parse investors string into array
 */
function parseInvestors(investorString: string): string[] {
  if (!investorString || investorString.trim() === '') return [];
  return investorString.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Convert a Crunchbase row to canonical Fundraise
 */
export function mapCrunchbaseRow(row: CrunchbaseRow): Fundraise {
  const now = new Date().toISOString();

  return {
    id: generateId(),
    company_name: row['Organization Name'] || 'Unknown',
    description: row['Organization Description'] || 'No description available',
    stage: mapFundingType(row['Funding Type']),
    amount_raised: formatAmount(row['Money Raised (in USD)']),
    announced_at: row['Announced Date'] ? new Date(row['Announced Date']).toISOString() : now,
    source_url: row['Transaction Name URL'] || row['Organization Name URL'] || '',
    created_at: now,
    investors: parseInvestors(row['Lead Investors'] || row['Investor Names']),
    geography: '', // Not directly available in Crunchbase export
  };
}

/**
 * Parse CSV string into array of objects
 */
export function parseCSV(csvString: string): CrunchbaseRow[] {
  const lines = csvString.split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse rows
  const rows: CrunchbaseRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row as unknown as CrunchbaseRow);
  }

  return rows;
}

/**
 * Parse a single CSV line (handles quoted values with commas)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Import CSV string and return array of Fundraises
 */
export function importFromCSV(csvString: string): Fundraise[] {
  const rows = parseCSV(csvString);
  return rows.map(mapCrunchbaseRow);
}

/**
 * Fetch and import CSV from file path (for use in browser with fetch)
 */
export async function importFromCSVFile(filePath: string): Promise<Fundraise[]> {
  const response = await fetch(filePath);
  const csvString = await response.text();
  return importFromCSV(csvString);
}
