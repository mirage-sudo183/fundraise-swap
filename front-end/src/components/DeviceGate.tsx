import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export function DeviceGate() {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-8">
        
        {/* Logo */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4">
            <Smartphone size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Fundraise Swipe</h1>
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">Mobile Experience</p>
        </div>

        {/* Main Card */}
        <div className="w-full bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold mb-3">Designed for your phone</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Fundraise Swipe is a fast, swipe-based experience built specifically for mobile interactions.
          </p>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-4 shadow-sm">
            <QRCodeSVG value={currentUrl} size={160} />
          </div>
          <p className="text-xs text-muted-foreground mb-6">Scan to open on your phone</p>

          {/* Copy Link Action */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors font-medium text-sm"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? 'Link Copied' : 'Copy Link'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground/50 pt-8 border-t border-border/50 w-full">
          Desktop support is limited by design.
        </div>
      </div>
    </div>
  );
}