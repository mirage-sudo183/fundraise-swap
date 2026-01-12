import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Inbox } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Home size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">Swipe</span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/inbox"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Inbox size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">Inbox</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
