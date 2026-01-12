import React from 'react';
import { Mode } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { History, Zap } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex justify-center w-full px-4">
      <div className="flex bg-secondary/80 backdrop-blur-md border border-border/50 p-1.5 rounded-full relative w-full max-w-[280px] shadow-lg">
        {/* Sliding background */}
        <motion.div
          layout
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-background rounded-full shadow-sm z-0"
          animate={{ 
            x: currentMode === 'recent' ? '100%' : '0%',
            left: currentMode === 'recent' ? 6 : 6
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <button
          onClick={() => onModeChange('archive')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-medium z-10 transition-colors relative",
            currentMode === 'archive' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <History size={14} />
          Archive
        </button>
        <button
          onClick={() => onModeChange('recent')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-medium z-10 transition-colors relative",
            currentMode === 'recent' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap size={14} />
          Recent
        </button>
      </div>
    </div>
  );
};