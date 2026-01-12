/**
 * ProgressIndicator Component (Milestone 2)
 *
 * Shows current position in the feed.
 */

import React from 'react';

interface ProgressIndicatorProps {
  current: number; // 0-indexed
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  if (total === 0) return null;

  const displayCurrent = current + 1; // Convert to 1-indexed for display
  const percentage = ((displayCurrent) / total) * 100;

  return (
    <div className="w-full max-w-[360px]">
      {/* Progress bar */}
      <div className="h-1 bg-secondary rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Counter */}
      <div className="text-center text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{displayCurrent.toLocaleString()}</span>
        {' / '}
        <span>{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
