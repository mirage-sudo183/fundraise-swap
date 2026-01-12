/**
 * Seed Fundraise Data (Milestone 1)
 *
 * Realistic fundraise data for development/testing.
 * Dates are generated dynamically relative to NOW to ensure
 * time window queries work correctly.
 *
 * Distribution:
 * - 5 fundraises in last 48 hours (Recent)
 * - 15 fundraises in last 12 months (Archive)
 * - 2 fundraises older than 12 months (should be excluded)
 */

import { Fundraise, FundraiseStage } from '../types/fundraise';

// Helper to generate ISO date string relative to now
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setTime(date.getTime() - hours * 60 * 60 * 1000);
  return date.toISOString();
}

function generateId(): string {
  return crypto.randomUUID();
}

const now = new Date().toISOString();

export const SEED_FUNDRAISES: Fundraise[] = [
  // === RECENT (last 48 hours) ===
  {
    id: generateId(),
    company_name: 'Nexus AI',
    description: 'Enterprise knowledge graphs powered by LLMs',
    stage: 'Seed',
    amount_raised: '$4.5M',
    announced_at: hoursAgo(2),
    source_url: 'https://techcrunch.com/nexus-ai-seed',
    created_at: now,
    investors: ['Sequoia', 'Y Combinator'],
    geography: 'San Francisco, CA',
  },
  {
    id: generateId(),
    company_name: 'Orbital Defense',
    description: 'Autonomous satellite collision avoidance systems',
    stage: 'Series A',
    amount_raised: '$18M',
    announced_at: hoursAgo(8),
    source_url: 'https://spacenews.com/orbital-defense',
    created_at: now,
    investors: ['Lux Capital', 'a16z'],
    geography: 'Los Angeles, CA',
  },
  {
    id: generateId(),
    company_name: 'BioForge',
    description: 'Precision fermentation for alternative proteins',
    stage: 'Seed',
    amount_raised: '$6.2M',
    announced_at: hoursAgo(18),
    source_url: 'https://foodtech.com/bioforge-raise',
    created_at: now,
    investors: ['SOSV', 'Lever VC'],
    geography: 'Boston, MA',
  },
  {
    id: generateId(),
    company_name: 'Codeium',
    description: 'AI pair programmer for enterprise dev teams',
    stage: 'Series A',
    amount_raised: '$25M',
    announced_at: hoursAgo(30),
    source_url: 'https://venturebeat.com/codeium-series-a',
    created_at: now,
    investors: ['Index Ventures', 'Greenoaks'],
    geography: 'Mountain View, CA',
  },
  {
    id: generateId(),
    company_name: 'FluxEnergy',
    description: 'Solid-state battery manufacturing at scale',
    stage: 'Series B',
    amount_raised: '$45M',
    announced_at: hoursAgo(42),
    source_url: 'https://reuters.com/flux-energy-funding',
    created_at: now,
    investors: ['Breakthrough Energy', 'Tiger Global'],
    geography: 'Austin, TX',
  },

  // === ARCHIVE (within last 12 months, but > 48 hours) ===
  {
    id: generateId(),
    company_name: 'QuantumLeap',
    description: 'Quantum error correction middleware',
    stage: 'Seed',
    amount_raised: '$8M',
    announced_at: daysAgo(5),
    source_url: 'https://wired.com/quantumleap',
    created_at: now,
    investors: ['IQT', 'Bessemer'],
    geography: 'Cambridge, MA',
  },
  {
    id: generateId(),
    company_name: 'HealthPilot',
    description: 'AI-powered prior authorization automation',
    stage: 'Series A',
    amount_raised: '$15M',
    announced_at: daysAgo(12),
    source_url: 'https://fiercehealthcare.com/healthpilot',
    created_at: now,
    investors: ['General Catalyst', 'a16z Bio'],
    geography: 'New York, NY',
  },
  {
    id: generateId(),
    company_name: 'NeuralMesh',
    description: 'Brain-computer interfaces for motor rehabilitation',
    stage: 'Series A',
    amount_raised: '$22M',
    announced_at: daysAgo(30),
    source_url: 'https://statnews.com/neuralmesh',
    created_at: now,
    investors: ['Khosla Ventures', 'GV'],
    geography: 'San Diego, CA',
  },
  {
    id: generateId(),
    company_name: 'CarbonCapture Co',
    description: 'Direct air capture using ocean alkalinity',
    stage: 'Series B',
    amount_raised: '$55M',
    announced_at: daysAgo(45),
    source_url: 'https://climatetech.com/carboncapture',
    created_at: now,
    investors: ['Lowercarbon', 'Congruent Ventures'],
    geography: 'Oslo, Norway',
  },
  {
    id: generateId(),
    company_name: 'RoboticsFirst',
    description: 'Humanoid robots for warehouse logistics',
    stage: 'Series A',
    amount_raised: '$30M',
    announced_at: daysAgo(60),
    source_url: 'https://roboticsweekly.com/roboticsfirst',
    created_at: now,
    investors: ['Founders Fund', 'Coatue'],
    geography: 'Shenzhen, China',
  },
  {
    id: generateId(),
    company_name: 'SecureVault',
    description: 'Zero-knowledge proof authentication platform',
    stage: 'Seed',
    amount_raised: '$5.5M',
    announced_at: daysAgo(90),
    source_url: 'https://coindesk.com/securevault',
    created_at: now,
    investors: ['Paradigm', 'Polychain'],
    geography: 'Zurich, Switzerland',
  },
  {
    id: generateId(),
    company_name: 'AgriSense',
    description: 'Hyperspectral imaging for crop disease detection',
    stage: 'Seed',
    amount_raised: '$3.8M',
    announced_at: daysAgo(120),
    source_url: 'https://agfunder.com/agrisense',
    created_at: now,
    investors: ['Acre VP', 'AgFunder'],
    geography: 'Tel Aviv, Israel',
  },
  {
    id: generateId(),
    company_name: 'FinanceFlow',
    description: 'Real-time treasury management for SMBs',
    stage: 'Series A',
    amount_raised: '$12M',
    announced_at: daysAgo(150),
    source_url: 'https://finextra.com/financeflow',
    created_at: now,
    investors: ['Ribbit Capital', 'QED'],
    geography: 'London, UK',
  },
  {
    id: generateId(),
    company_name: 'SpaceMetal',
    description: 'Asteroid mining mission planning software',
    stage: 'Pre-Seed',
    amount_raised: '$2.2M',
    announced_at: daysAgo(180),
    source_url: 'https://spacenews.com/spacemetal',
    created_at: now,
    investors: ['Draper Associates'],
    geography: 'Seattle, WA',
  },
  {
    id: generateId(),
    company_name: 'EdTechPro',
    description: 'Adaptive learning platform for K-12',
    stage: 'Series B',
    amount_raised: '$40M',
    announced_at: daysAgo(210),
    source_url: 'https://edsurge.com/edtechpro',
    created_at: now,
    investors: ['Reach Capital', 'GSV'],
    geography: 'Chicago, IL',
  },
  {
    id: generateId(),
    company_name: 'CloudNative',
    description: 'Kubernetes security and compliance automation',
    stage: 'Series A',
    amount_raised: '$18M',
    announced_at: daysAgo(240),
    source_url: 'https://thenewstack.io/cloudnative',
    created_at: now,
    investors: ['Greylock', 'Unusual Ventures'],
    geography: 'Portland, OR',
  },
  {
    id: generateId(),
    company_name: 'DeepMaterials',
    description: 'AI-discovered novel semiconductor materials',
    stage: 'Seed',
    amount_raised: '$7M',
    announced_at: daysAgo(280),
    source_url: 'https://nature.com/deepmaterials',
    created_at: now,
    investors: ['DCVC', 'The Engine'],
    geography: 'Pittsburgh, PA',
  },
  {
    id: generateId(),
    company_name: 'LegalAI',
    description: 'Contract analysis and negotiation copilot',
    stage: 'Series A',
    amount_raised: '$14M',
    announced_at: daysAgo(300),
    source_url: 'https://lawtech.com/legalai',
    created_at: now,
    investors: ['NEA', 'Menlo Ventures'],
    geography: 'Palo Alto, CA',
  },
  {
    id: generateId(),
    company_name: 'DroneDeliver',
    description: 'Last-mile medical supply delivery via drones',
    stage: 'Series B',
    amount_raised: '$35M',
    announced_at: daysAgo(330),
    source_url: 'https://dronelife.com/dronedeliver',
    created_at: now,
    investors: ['Andreessen Horowitz', 'GV'],
    geography: 'Kigali, Rwanda',
  },
  {
    id: generateId(),
    company_name: 'VoiceAI',
    description: 'Real-time voice cloning for accessibility',
    stage: 'Seed',
    amount_raised: '$4M',
    announced_at: daysAgo(350),
    source_url: 'https://voicebot.ai/voiceai',
    created_at: now,
    investors: ['First Round', 'SV Angel'],
    geography: 'Toronto, Canada',
  },

  // === OLD (> 12 months - should be EXCLUDED from Archive) ===
  {
    id: generateId(),
    company_name: 'OldTech Inc',
    description: 'Legacy system modernization consulting',
    stage: 'Series A',
    amount_raised: '$10M',
    announced_at: daysAgo(400), // ~13 months ago
    source_url: 'https://archive.org/oldtech',
    created_at: now,
    investors: ['Legacy Partners'],
    geography: 'Detroit, MI',
  },
  {
    id: generateId(),
    company_name: 'AncientStartup',
    description: 'Archaeological site mapping with LiDAR',
    stage: 'Seed',
    amount_raised: '$2M',
    announced_at: daysAgo(450), // ~15 months ago
    source_url: 'https://archaeology.org/ancientstartup',
    created_at: now,
    investors: ['National Geographic'],
    geography: 'Athens, Greece',
  },
];
