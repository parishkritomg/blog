import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';

// Note: In a server component/route handler, we should use the server client or simple fetch if public.
// But for sitemap generation at build time or request time, we can use the client or just fetch directly.
// Since sitemap is server-side, we use a specialized client or fetch.
// However, 'createClient' from '@/lib/supabase/client' is for browser.
// We should use '@/lib/supabase/server' but we can't use cookies() here easily if it's static generation?
// Actually sitemap.ts is a server function.

import { createClient as createServerClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://blog.parishkrit.com.np'; 

  // Handle missing environment variables gracefully during build
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing Supabase environment variables. Sitemap will be incomplete.');
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }

  // Use a direct client or fetch for sitemap to avoid cookie issues during build if static
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey
  );

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at')
    .eq('published', true);

  const blogPosts = posts?.map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...blogPosts,
  ];
}
