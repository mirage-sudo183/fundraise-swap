import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fundraise } from '../types';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

interface MatchOverlayProps {
  match: Fundraise | null;
  onDismiss: () => void;
}

export const MatchOverlay: React.FC<MatchOverlayProps> = ({ match, onDismiss }) => {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center -space-x-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-secondary border-4 border-background flex items-center justify-center text-2xl font-bold">
                U1
              </div>
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground border-4 border-background flex items-center justify-center text-2xl font-bold">
                U2
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-accent mb-2">
              <Sparkles size={20} />
              <span className="text-sm font-bold tracking-widest uppercase">It's a Match</span>
              <Sparkles size={20} />
            </div>
            
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
              Shared Intuition!
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              You and your co-founder both liked <strong className="text-foreground">{match.companyName}</strong>.
            </p>
          </motion.div>

          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={() => alert("Simulated: Opening discussion thread")}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageSquare size={18} />
              Discuss Now
            </button>
            <button
              onClick={onDismiss}
              className="w-full py-4 rounded-xl bg-secondary text-secondary-foreground font-medium flex items-center justify-center gap-2"
            >
              Keep Swiping
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};