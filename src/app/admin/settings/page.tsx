import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();

  // Fetch announcement
  const { data: announcementData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'announcement')
    .single() as { data: { value: string } | null };

  // Fetch popup settings
  const { data: popupData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_popup')
    .single() as { data: { value: string } | null };

  const initialAnnouncement = announcementData?.value || '';
  let initialPopupSettings = {
    enabled: false,
    image: '',
    header: '',
    text: ''
  };

  if (popupData?.value) {
    try {
      initialPopupSettings = JSON.parse(popupData.value);
    } catch (e) {
      console.error('Error parsing popup settings:', e);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">Site Settings</h1>
      </div>
      
      <SettingsForm 
        initialAnnouncement={initialAnnouncement}
        initialPopupSettings={initialPopupSettings}
      />
    </div>
  );
}
