'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { enableDemoMode } from '@/lib/demo-data';
import { Loader2, Map } from 'lucide-react';

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Enable demo mode and redirect to dashboard
    enableDemoMode();
    
    // Small delay for the animation
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 mb-6 shadow-lg shadow-emerald-500/25 animate-pulse">
          <Map className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Loading Demo Environment
        </h1>
        <p className="text-slate-400 mb-6">
          Setting up sample data for City of Sacramento...
        </p>
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
      </div>
    </div>
  );
}

