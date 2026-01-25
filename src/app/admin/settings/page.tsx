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
    <div className="p-4 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Site Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure global settings for your blog.</p>
        </div>
      </div>
      
      <SettingsForm 
        initialAnnouncement={initialAnnouncement}
        initialPopupSettings={initialPopupSettings}
      />
    </div>
  );
}
