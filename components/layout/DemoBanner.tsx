'use client';

import { useDemo } from '@/lib/hooks/useDemo';
import { Sparkles, X } from 'lucide-react';
import Link from 'next/link';

export default function DemoBanner() {
  const { isDemo, exitDemo, mounted } = useDemo();

  if (!mounted || !isDemo) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30 backdrop-blur-sm">
      <div className="pl-64 pr-4 py-2 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-2 text-amber-300 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>
            <strong>Demo Mode</strong> — Exploring with sample data from City of Sacramento.{' '}
            <Link href="/signup" className="underline hover:text-amber-200">
              Sign up
            </Link>{' '}
            to create your own workspace.
          </span>
        </div>
        <button
          onClick={exitDemo}
          className="p-1 rounded hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 transition-colors"
          title="Exit demo mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

