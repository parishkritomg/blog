'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function VisitorTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      // Check if already visited in this session
      const hasVisited = sessionStorage.getItem('site_visited');
      
      if (!hasVisited) {
        const supabase = createClient();
        await supabase.rpc('increment_site_visitors');
        sessionStorage.setItem('site_visited', 'true');
      }
    };

    trackVisit();
  }, []);

  return null;
}
