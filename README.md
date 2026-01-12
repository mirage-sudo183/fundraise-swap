# Co-Founder Swipe App

A mobile-first web application for co-founders to review and align on startup fundraise deals using an intuitive swipe interface.

## Features

- **Swipe Interface**: Tinder-style left/right swiping to review deals
- **Two Browsing Modes**:
  - Archive Mode: Random exploration of past year's deals
  - Recent Mode: Chronological review of latest drops
- **Match Detection**: Visual celebrations when co-founders align on the same deal
- **Mobile-First Design**: Optimized for mobile devices (768px breakpoint)

## Tech Stack

- **React** 18.2.0 with TypeScript
- **Vite** 5.4.10
- **Tailwind CSS** 3.4.15
- **Framer Motion** 10.16.4
- **React Router DOM** 6.28.0

## Project Structure

```
src/
├── components/    # Reusable UI components (SwipeCard, ModeSelector, etc.)
├── pages/         # Route pages (Home, Login, WorkspaceSetup, Settings)
├── types/         # TypeScript type definitions
├── data/          # Mock data for development
└── lib/           # Utility functions and helpers
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Open the app on a mobile device or use browser dev tools to simulate mobile
2. Log in and set up your workspace
3. Choose between Archive or Recent mode
4. Swipe right to approve deals, left to pass
5. Get notified when you and your co-founder match on a deal

## License

MIT
