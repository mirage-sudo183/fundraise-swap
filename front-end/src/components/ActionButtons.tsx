import React from 'react';
import { X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onSwipe: (dir: 'left' | 'right') => void;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onSwipe, disabled }) => {
  return (
    <div className="flex items-center justify-center gap-6">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => !disabled && onSwipe('left')}
        disabled={disabled}
        className="w-14 h-14 rounded-full bg-background border border-border text-muted-foreground flex items-center justify-center shadow-sm hover:bg-secondary hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Pass"
      >
        <X size={26} />
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => !disabled && onSwipe('right')}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] hover:bg-primary/90 hover:shadow-[0_8px_25px_-4px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
        aria-label="Like"
      >
        <Check size={32} strokeWidth={3} />
      </motion.button>
    </div>
  );
};