import { createClient } from '@/lib/supabase/server';

export async function AnnouncementBar() {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'announcement')
    .single() as { data: { value: string } | null };

  const announcement = data?.value;

  if (!announcement) {
    return null;
  }

  return (
    <div className="bg-black text-white text-sm py-2 overflow-hidden relative z-50">
      <div className="animate-marquee whitespace-nowrap inline-block font-medium px-4">
        {announcement}
      </div>
    </div>
  );
}
