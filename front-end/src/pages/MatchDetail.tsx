import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, DollarSign, ExternalLink, Clock, Archive, User } from 'lucide-react';
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

function getLogoColor(name: string): string {
  const index = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % LOGO_COLORS.length;
  return LOGO_COLORS[index];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [matchData, setMatchData] = useState<api.MatchDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatch = async () => {
      if (!id) return;

      try {
        const data = await api.getMatchDetail(id);
        setMatchData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load match');
      } finally {
        setIsLoading(false);
      }
    };

    loadMatch();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading match...</p>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground p-6">
        <p className="text-destructive mb-2">Failed to load match</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => navigate('/inbox')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to Inbox
        </button>
      </div>
    );
  }

  const { match, fundraise } = matchData;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="shrink-0 pt-12 pb-4 px-4 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate('/inbox')}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold truncate">{match.companyName}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {match.mode === 'archive' ? (
              <Archive size={12} />
            ) : (
              <Clock size={12} />
            )}
            <span>Matched {formatDate(match.matchedAt)}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Company Card */}
        <div className="p-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            {/* Company Header */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl',
                  getLogoColor(match.companyName)
                )}
              >
                {match.companyName.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{match.companyName}</h2>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs inline-block mt-1">
                  {match.stage}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-4">{fundraise.description}</p>

            {/* Source Link */}
            {fundraise.source_url && (
              <a
                href={fundraise.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
              >
                <ExternalLink size={16} />
                <span className="truncate">{new URL(fundraise.source_url).hostname}</span>
              </a>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Amount</span>
                <p className="text-lg font-bold flex items-center gap-1 mt-1">
                  <DollarSign size={16} className="text-primary" />
                  {match.amountRaised}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Investors</span>
                <p className="text-sm font-medium mt-1 truncate">
                  {fundraise.investors?.join(', ') || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reflections */}
        <div className="px-4 pb-8">
          <h3 className="text-lg font-semibold mb-4">What you both liked</h3>
          <div className="space-y-4">
            {match.reflections.map((reflection) => (
              <div
                key={reflection.userId}
                className="bg-card border border-border rounded-xl p-4"
              >
                {/* User Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      'bg-primary/10'
                    )}
                  >
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{reflection.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      Liked {formatDate(reflection.likedAt)}
                    </p>
                  </div>
                </div>

                {/* Chips */}
                {reflection.chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {reflection.chips.map((chip) => (
                      <span
                        key={chip}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}

                {/* Note */}
                {reflection.note ? (
                  <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                    "{reflection.note}"
                  </p>
                ) : reflection.chips.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No note added</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
