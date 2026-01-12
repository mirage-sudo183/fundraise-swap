import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Inbox as InboxIcon, ChevronRight, Clock, Archive } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import * as api from '../api/client';
import { cn } from '../lib/utils';

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

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Inbox() {
  const [matches, setMatches] = useState<api.MatchListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const { matches: matchList } = await api.getMatches();
        setMatches(matchList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load matches');
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground pb-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading inbox...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground p-6 pb-16">
        <p className="text-destructive mb-2">Failed to load inbox</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="shrink-0 pt-12 pb-4 px-6 border-b border-border">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <InboxIcon size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No matches yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              When both you and your co-founder like the same fundraise, it will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {matches.map((match) => (
              <Link
                key={match.id}
                to={`/inbox/${match.id}`}
                className="flex items-start gap-4 p-4 hover:bg-secondary/30 transition-colors"
              >
                {/* Company Logo */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0',
                    getLogoColor(match.companyName)
                  )}
                >
                  {match.companyName.charAt(0)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {match.companyName}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatRelativeTime(match.matchedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                      {match.stage}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {match.amountRaised}
                    </span>
                    {match.mode === 'archive' ? (
                      <Archive size={12} className="text-muted-foreground" />
                    ) : (
                      <Clock size={12} className="text-muted-foreground" />
                    )}
                  </div>

                  {/* Reflections preview */}
                  <div className="mt-2 space-y-1">
                    {match.reflections.map((ref) => (
                      <div key={ref.userId} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{ref.displayName}:</span>{' '}
                        {ref.chips.length > 0 ? (
                          ref.chips.slice(0, 2).join(', ') +
                          (ref.chips.length > 2 ? '...' : '')
                        ) : ref.note ? (
                          ref.note.slice(0, 40) + (ref.note.length > 40 ? '...' : '')
                        ) : (
                          <span className="italic">No note</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <ChevronRight size={20} className="text-muted-foreground shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
