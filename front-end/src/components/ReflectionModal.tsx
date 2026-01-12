import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { cn } from '../lib/utils';

type Mode = 'archive' | 'recent';

interface ReflectionModalProps {
  isOpen: boolean;
  mode: Mode;
  companyName: string;
  onSubmit: (chips: string[], note?: string) => void;
  onSkip: () => void;
  isSaving?: boolean;
}

// Mode-specific chip options
const ARCHIVE_CHIPS = [
  'Strong team',
  'Big market',
  'Unique approach',
  'Good traction',
  'Strategic fit',
  'Competitor insight',
];

const RECENT_CHIPS = [
  'Time-sensitive',
  'Market timing',
  'First mover',
  'Trend signal',
  'Quick follow-up',
  'Watch closely',
];

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  mode,
  companyName,
  onSubmit,
  onSkip,
  isSaving = false,
}) => {
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const chips = mode === 'archive' ? ARCHIVE_CHIPS : RECENT_CHIPS;
  const prompt = mode === 'archive'
    ? 'Why is this interesting?'
    : 'Why now?';

  const toggleChip = useCallback((chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip)
        ? prev.filter(c => c !== chip)
        : [...prev, chip]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(selectedChips, note.trim() || undefined);
    // Reset state after submit
    setSelectedChips([]);
    setNote('');
  }, [selectedChips, note, onSubmit]);

  const handleSkip = useCallback(() => {
    onSkip();
    // Reset state after skip
    setSelectedChips([]);
    setNote('');
  }, [onSkip]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleSkip}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Skip button */}
            <button
              onClick={handleSkip}
              disabled={isSaving}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
              aria-label="Skip"
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="px-6 pb-8 pt-2 overflow-y-auto max-h-[calc(80vh-60px)]">
              {/* Header */}
              <div className="mb-5">
                <p className="text-sm text-muted-foreground mb-1">
                  You liked <span className="font-medium text-foreground">{companyName}</span>
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  {prompt}
                </h2>
              </div>

              {/* Quick Chips */}
              <div className="mb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Quick tags (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {chips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => toggleChip(chip)}
                      disabled={isSaving}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                        selectedChips.includes(chip)
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Input */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Add a note (optional)
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Quick thought..."
                  disabled={isSaving}
                  rows={2}
                  maxLength={280}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {note.length}/280
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving || (selectedChips.length === 0 && !note.trim())}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <>
                      <Send size={18} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
