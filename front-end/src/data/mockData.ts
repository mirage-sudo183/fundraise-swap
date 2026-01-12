import { Fundraise } from '../types';

export const MOCK_FUNDRAISES: Fundraise[] = [
  {
    id: '1',
    companyName: 'Nebula AI',
    oneLiner: 'Generative infrastructure for biological computing',
    description: 'Building the foundational layer for biological computing using generative models. We help pharma companies simulate drug interactions at scale.',
    amount: '$4.2M',
    round: 'Seed',
    date: '2023-10-24',
    tags: ['Biotech', 'Generative AI', 'Infra'],
    logoColor: 'bg-indigo-500',
    location: 'San Francisco, CA',
    investors: ['Sequoia', 'Lux Capital']
  },
  {
    id: '2',
    companyName: 'FlowState',
    oneLiner: 'Headless CMS for spatial computing',
    description: 'The first content management system designed specifically for AR/VR environments. Manage 3D assets and spatial interactions from a single dashboard.',
    amount: '$2.8M',
    round: 'Pre-Seed',
    date: '2023-10-23',
    tags: ['VR/AR', 'DevTools', 'SaaS'],
    logoColor: 'bg-rose-500',
    location: 'New York, NY',
    investors: ['a16z', 'BoxGroup']
  },
  {
    id: '3',
    companyName: 'CarbonFix',
    oneLiner: 'Direct air capture with modular basalt reactors',
    description: 'Modular, shipping-container sized basalt reactors that capture CO2 directly from the air and mineralize it permanently.',
    amount: '$12M',
    round: 'Series A',
    date: '2023-10-20',
    tags: ['Climate', 'Hardware', 'DeepTech'],
    logoColor: 'bg-emerald-500',
    location: 'Reykjavik, Iceland',
    investors: ['Lowercarbon', 'Breakthrough']
  },
  {
    id: '4',
    companyName: 'Synthetix',
    oneLiner: 'Synthetic data generation for autonomous robotics',
    description: 'Solving the data shortage in robotics by generating photorealistic synthetic training data. 100x faster than real-world collection.',
    amount: '$6.5M',
    round: 'Seed',
    date: '2023-10-18',
    tags: ['Robotics', 'AI', 'Enterprise'],
    logoColor: 'bg-orange-500',
    location: 'Boston, MA',
    investors: ['Founders Fund', 'Matrix']
  },
  {
    id: '5',
    companyName: 'Velocipath',
    oneLiner: 'High-frequency trading infrastructure for emerging markets',
    description: 'Ultra-low latency connectivity for exchanges in Brazil, India, and Nigeria. bringing Wall Street speeds to the global south.',
    amount: '$3.1M',
    round: 'Seed',
    date: '2023-10-15',
    tags: ['Fintech', 'Infra', 'Emerging Markets'],
    logoColor: 'bg-blue-600',
    location: 'London, UK',
    investors: ['Index', 'Lightspeed']
  },
  {
    id: '6',
    companyName: 'AeroGuard',
    oneLiner: 'Autonomous drone defense for critical infrastructure',
    description: 'AI-powered detection and non-kinetic mitigation of unauthorized drones near airports and power plants.',
    amount: '$8M',
    round: 'Series A',
    date: '2023-10-10',
    tags: ['Defense', 'Aerospace', 'AI'],
    logoColor: 'bg-slate-600',
    location: 'Tel Aviv, Israel',
    investors: ['Anduril', '8VC']
  }
];