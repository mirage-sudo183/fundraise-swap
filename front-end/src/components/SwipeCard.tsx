import React, { useImperativeHandle, forwardRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { Fundraise, SwipeDirection } from '../types';
import { ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface SwipeCardProps {
  data: Fundraise;
  active: boolean;
  onSwipe: (direction: SwipeDirection) => void;
  stackIndex?: number;
}

export interface SwipeCardRef {
  triggerSwipe: (direction: SwipeDirection) => void;
}

export const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(({ data, active, onSwipe, stackIndex = 0 }, ref) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Overlay opacities for visual feedback
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [0, -100], [0, 1]);

  // Animate swipe and call onSwipe
  const animateSwipe = async (direction: SwipeDirection) => {
    const targetX = direction === 'right' ? 500 : -500;
    await controls.start({ x: targetX, opacity: 0, transition: { duration: 0.2 } });
    onSwipe(direction);
  };

  // Expose triggerSwipe for button fallbacks
  useImperativeHandle(ref, () => ({
    triggerSwipe: (direction: SwipeDirection) => {
      if (active) {
        animateSwipe(direction);
      }
    },
  }));

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      await animateSwipe('right');
    } else if (info.offset.x < -threshold) {
      await animateSwipe('left');
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  // Stack visual effect - cards behind are slightly smaller and offset
  const scale = 1 - stackIndex * 0.03;
  const yOffset = stackIndex * 8;

  return (
    <motion.div
      style={{
        gridArea: '1 / 1 / 1 / 1',
        x,
        rotate: active ? rotate : 0,
        opacity: active ? opacity : 1,
        zIndex: 10 - stackIndex,
        pointerEvents: active ? 'auto' : 'none',
        scale,
        y: yOffset,
      }}
      drag={active ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ scale, y: yOffset }}
      className="w-full h-full absolute inset-0 touch-none select-none"
    >
      <div className="relative w-full h-full bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Swipe Overlays */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute inset-0 bg-green-500/20 z-20 pointer-events-none flex items-center justify-center">
          <div className="border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 rounded-xl -rotate-12 transform">
            INTERESTED
          </div>
        </motion.div>
        <motion.div style={{ opacity: passOpacity }} className="absolute inset-0 bg-red-500/20 z-20 pointer-events-none flex items-center justify-center">
          <div className="border-4 border-red-500 text-red-500 font-bold text-4xl px-4 py-2 rounded-xl rotate-12 transform">
            PASS
          </div>
        </motion.div>

        {/* Card Content - scrollable */}
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto touch-pan-y">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg", data.logoColor)}>
                {data.companyName.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-foreground leading-tight">{data.companyName}</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
              {data.round}
            </span>
          </div>

          {/* Description */}
          <div className="flex-1">
            <p className="text-base text-muted-foreground leading-relaxed">
              {data.description}
            </p>
          </div>

          {/* Source Link */}
          {data.sourceUrl && (
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={16} />
              <span className="truncate">{new URL(data.sourceUrl).hostname}</span>
            </a>
          )}

          {/* Meta Data */}
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2.5">
              {data.tags.map(tag => (
                <span key={tag} className="px-3.5 py-1.5 rounded-lg bg-secondary/80 text-secondary-foreground text-sm font-medium border border-border/50 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-border">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Amount</span>
                <span className="text-xl font-bold text-foreground">
                  {data.amount}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Investors</span>
                <span className="text-base font-bold text-foreground truncate block">
                  {data.investors.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

SwipeCard.displayName = 'SwipeCard';