/**
 * FundraiseCard Component (Milestone 2)
 *
 * Static card display without swipe gestures.
 * Shows company info, description, and metadata.
 */

import React from 'react';
import { DollarSign, ExternalLink } from 'lucide-react';
import { Fundraise } from '../api/client';

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

function getLogoColor(companyName: string): string {
  const index = companyName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % LOGO_COLORS.length;
  return LOGO_COLORS[index];
}

interface FundraiseCardProps {
  data: Fundraise;
}

export function FundraiseCard({ data }: FundraiseCardProps) {
  const logoColor = getLogoColor(data.company_name);

  return (
    <div className="w-full h-full bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      {/* Card Content - scrollable */}
      <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${logoColor}`}
            >
              {data.company_name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {data.company_name}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
            {data.stage}
          </span>
        </div>

        {/* Description */}
        <div className="flex-1">
          <p className="text-base text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Source Link */}
        {data.source_url && (
          <a
            href={data.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink size={16} />
            <span className="truncate">
              {(() => {
                try {
                  return new URL(data.source_url).hostname;
                } catch {
                  return 'View source';
                }
              })()}
            </span>
          </a>
        )}

        {/* Meta Data */}
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2.5">
            <span className="px-3.5 py-1.5 rounded-lg bg-secondary/80 text-secondary-foreground text-sm font-medium border border-border/50 shadow-sm">
              {data.stage}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-5 border-t border-border">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Amount
              </span>
              <span className="text-xl font-bold text-foreground flex items-center gap-1">
                <DollarSign size={18} className="text-primary" />
                {data.amount_raised}
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Investors
              </span>
              <span className="text-base font-bold text-foreground truncate block">
                {data.investors?.join(', ') || 'Undisclosed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
