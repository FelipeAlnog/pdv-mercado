'use client';

import { useLayoutEffect } from 'react';
import { usePageHeaderStore } from '@/store/usePageHeaderStore';

interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function usePageHeader(config: PageHeaderConfig) {
  const setHeader = usePageHeaderStore((s) => s.setHeader);

  // No deps — runs every render so dynamic subtitle/actions stay in sync with local state.
  // useLayoutEffect ensures the header updates before the browser paints (no flash).
  useLayoutEffect(() => {
    setHeader(config);
  });
}
