/**
 * CSV Importer for Crunchbase Fundraise Data (Backend)
 *
 * Ported from front-end, adapted for Node.js
 */

import { v4 as uuidv4 } from 'uuid';
import { Fundraise, FundraiseStage } from '../types';

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

  return 'Seed';
}

/**
 * Format USD amount to human readable string
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
 * Parse investors string into array
 */
function parseInvestors(investorString: string): string[] {
  if (!investorString || investorString.trim() === '') return [];
  return investorString.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Convert a Crunchbase row to canonical Fundraise
 */
function mapCrunchbaseRow(row: CrunchbaseRow): Fundraise {
  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    company_name: row['Organization Name'] || 'Unknown',
    description: row['Organization Description'] || 'No description available',
    stage: mapFundingType(row['Funding Type']),
    amount_raised: formatAmount(row['Money Raised (in USD)']),
    announced_at: row['Announced Date'] ? new Date(row['Announced Date']).toISOString() : now,
    source_url: row['Transaction Name URL'] || row['Organization Name URL'] || '',
    created_at: now,
    investors: parseInvestors(row['Lead Investors'] || row['Investor Names']),
    geography: '',
  };
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
 * Parse CSV string into array of objects
 */
function parseCSV(csvString: string): CrunchbaseRow[] {
  const lines = csvString.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
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
 * Import CSV string and return array of Fundraises
 */
export function importFromCSV(csvString: string): Fundraise[] {
  const rows = parseCSV(csvString);
  return rows.map(mapCrunchbaseRow);
}
