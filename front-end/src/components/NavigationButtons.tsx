/**
 * NavigationButtons Component (Milestone 2)
 *
 * Previous/Next buttons for navigating through the feed.
 * Replaces swipe gesture action buttons.
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function NavigationButtons({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center gap-8">
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center transition-all',
          'bg-secondary border border-border shadow-lg',
          hasPrevious
            ? 'hover:bg-secondary/80 active:scale-95 text-foreground'
            : 'opacity-40 cursor-not-allowed text-muted-foreground'
        )}
        aria-label="Previous"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all',
          'bg-primary border border-primary shadow-lg',
          hasNext
            ? 'hover:bg-primary/90 active:scale-95 text-primary-foreground'
            : 'opacity-40 cursor-not-allowed'
        )}
        aria-label="Next"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
}
