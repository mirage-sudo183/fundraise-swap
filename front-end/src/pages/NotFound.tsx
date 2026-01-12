import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-serif font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">This page doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        Go Home
      </button>
    </div>
  );
}