import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { ModeSelector } from '../components/ModeSelector';
import { SwipeCard, SwipeCardRef } from '../components/SwipeCard';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { ActionButtons } from '../components/ActionButtons';
import { ReflectionModal } from '../components/ReflectionModal';
import { BottomNav } from '../components/BottomNav';
import { Fundraise, SwipeDirection } from '../types';
import * as api from '../api/client';

type Mode = 'archive' | 'recent';

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

// Map API data to SwipeCard format
function mapToUIFundraise(data: api.Fundraise): Fundraise {
  return {
    id: data.id,
    companyName: data.company_name,
    description: data.description,
    oneLiner: data.description, // Same as description
    amount: data.amount_raised,
    round: data.stage,
    date: data.announced_at,
    tags: [data.stage],
    logoColor: getLogoColor(data.company_name),
    location: data.geography || '',
    investors: data.investors || [],
    sourceUrl: data.source_url,
  };
}

// Reflection modal state
interface ReflectionState {
  isOpen: boolean;
  swipeId: string | null;
  companyName: string;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('archive');
  const [feed, setFeed] = useState<Fundraise[]>([]);
  const [cursor, setCursor] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reflection modal state
  const [reflection, setReflection] = useState<ReflectionState>({
    isOpen: false,
    swipeId: null,
    companyName: '',
  });

  // Ref to trigger programmatic swipes from action buttons
  const swipeCardRef = useRef<SwipeCardRef | null>(null);

  // Load feed when mode changes
  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.getFeed(mode);
        if (cancelled) return;

        // Map API data to UI format
        const uiFeed = response.feed.map(mapToUIFundraise);
        setFeed(uiFeed);
        setCursor(response.userCursor);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  // Handle swipe action - saves decision first, then advances cursor
  const handleSwipe = useCallback(
    async (direction: SwipeDirection) => {
      if (isSwiping || cursor >= feed.length) return;

      const currentCard = feed[cursor];
      const decision: api.SwipeDecision = direction === 'right' ? 'like' : 'pass';

      setIsSwiping(true);

      try {
        // Save swipe decision first
        const swipeResult = await api.saveSwipe(mode, currentCard.id, decision);

        // Then advance cursor
        const newCursor = cursor + 1;
        setCursor(newCursor);

        // Update cursor position in backend
        await api.updateProgress(mode, newCursor);

        // If it was a Like, show the reflection modal
        if (decision === 'like') {
          setReflection({
            isOpen: true,
            swipeId: swipeResult.id,
            companyName: currentCard.companyName,
          });
        }
      } catch (err) {
        console.error('[Home] Failed to save swipe:', err);
        // Don't advance cursor on error - user can retry
      } finally {
        setIsSwiping(false);
      }
    },
    [cursor, feed, mode, isSwiping]
  );

  // Handle reflection submit
  const handleReflectionSubmit = useCallback(
    async (chips: string[], note?: string) => {
      if (!reflection.swipeId) return;

      setIsSavingReflection(true);

      try {
        await api.saveReflection(reflection.swipeId, chips, note);
      } catch (err) {
        console.error('[Home] Failed to save reflection:', err);
        // Don't block - reflection is optional
      } finally {
        setIsSavingReflection(false);
        setReflection({ isOpen: false, swipeId: null, companyName: '' });
      }
    },
    [reflection.swipeId]
  );

  // Handle reflection skip
  const handleReflectionSkip = useCallback(() => {
    setReflection({ isOpen: false, swipeId: null, companyName: '' });
  }, []);

  // Handle button press - triggers programmatic swipe animation
  const handleButtonSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (swipeCardRef.current) {
        swipeCardRef.current.triggerSwipe(direction);
      }
    },
    []
  );

  // Get visible cards (current + next for stacking effect)
  const visibleCards = feed.slice(cursor, cursor + 2);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading {mode} feed...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-foreground p-6">
        <p className="text-destructive mb-2">Failed to load feed</p>
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

  // Empty feed state
  if (feed.length === 0) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-background text-foreground flex flex-col font-sans">
        <header className="shrink-0 pt-12 pb-2 px-6 z-20 flex items-center justify-between">
          <ModeSelector currentMode={mode} onModeChange={setMode} />
          <Link
            to="/settings"
            className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors backdrop-blur-sm"
          >
            <Settings size={20} />
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-5xl">📭</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Fundraises</h3>
          <p className="text-sm text-muted-foreground">
            {mode === 'recent'
              ? 'No fundraises in the last 48 hours.'
              : 'No fundraises in the last 12 months.'}
          </p>
        </main>
      </div>
    );
  }

  // End of feed state
  if (cursor >= feed.length) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-background text-foreground flex flex-col font-sans">
        <header className="shrink-0 pt-12 pb-2 px-6 z-20 flex items-center justify-between">
          <ModeSelector currentMode={mode} onModeChange={setMode} />
          <Link
            to="/settings"
            className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors backdrop-blur-sm"
          >
            <Settings size={20} />
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">All caught up!</h3>
          <p className="text-sm text-muted-foreground mb-6">
            You've seen all {feed.length} fundraises in {mode} mode.
          </p>
          <button
            onClick={async () => {
              setCursor(0);
              try {
                await api.updateProgress(mode, 0);
              } catch (err) {
                console.error('[Home] Failed to reset cursor:', err);
              }
            }}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Start Over
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="shrink-0 pt-12 pb-2 px-6 z-20 flex items-center justify-between">
        <ModeSelector currentMode={mode} onModeChange={setMode} />
        <Link
          to="/settings"
          className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors backdrop-blur-sm"
        >
          <Settings size={20} />
        </Link>
      </header>

      {/* Progress Indicator */}
      <div className="shrink-0 px-6 py-2 flex justify-center">
        <ProgressIndicator current={cursor} total={feed.length} />
      </div>

      {/* Main Swipe Area */}
      <main className="flex-1 w-full flex items-center justify-center min-h-0 relative px-4 py-4">
        <div className="relative w-full max-w-[360px] h-full max-h-[600px] grid place-items-center">
          <AnimatePresence>
            {visibleCards.map((card, index) => (
              <SwipeCard
                key={card.id}
                ref={index === 0 ? swipeCardRef : null}
                data={card}
                active={index === 0 && !isSwiping}
                onSwipe={handleSwipe}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Action Buttons */}
      <div className="shrink-0 py-4 z-20 flex justify-center">
        <ActionButtons onSwipe={handleButtonSwipe} disabled={isSwiping} />
      </div>

      {/* Swipe hint */}
      <footer className="shrink-0 pb-20 pt-1 z-20 flex justify-center">
        <p className="text-xs text-muted-foreground">
          Swipe left to pass • Swipe right if interested
        </p>
      </footer>

      {/* Reflection Modal */}
      <ReflectionModal
        isOpen={reflection.isOpen}
        mode={mode}
        companyName={reflection.companyName}
        onSubmit={handleReflectionSubmit}
        onSkip={handleReflectionSkip}
        isSaving={isSavingReflection}
      />

      <BottomNav />
    </div>
  );
}
