'use client';

import { useState, useEffect } from 'react';
import { isDemoMode, disableDemoMode } from '@/lib/demo-data';

export function useDemo() {
  const [isDemo, setIsDemo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDemo(isDemoMode());
  }, []);

  const exitDemo = () => {
    disableDemoMode();
    setIsDemo(false);
    window.location.href = '/';
  };

  return {
    isDemo: mounted ? isDemo : false,
    exitDemo,
    mounted,
  };
}

