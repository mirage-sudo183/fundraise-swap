# CoFounder Swipe App

A mobile-first intuition-alignment tool for co-founders to review startup fundraises.

## Features

- **Binary Swipe Interface**: Intuitive left/right swipe mechanics using Framer Motion.
- **Dual Modes**: 
  - **Archive**: Random exploration of past year's deals.
  - **Recent**: Chronological review of latest drops.
- **Match Detection**: Visual celebration when co-founders align (simulated).
- **Responsive Design**: Mobile-optimized layout with touch gestures.

## Components

- `SwipeCard`: Draggable card component with rotational physics and overlay feedback.
- `ModeSelector`: Animated toggle for switching contexts.
- `MatchOverlay`: Immersive full-screen notification for shared interests.

## Usage

```tsx
import { CoFounderSwipeApp } from '@/sd-components/16cec139-514f-4230-b381-e2de08290278';

function MyPage() {
  return <CoFounderSwipeApp />;
}
```