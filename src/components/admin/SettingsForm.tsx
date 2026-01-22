'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface SettingsFormProps {
  initialAnnouncement: string;
  initialPopupSettings: {
    enabled: boolean;
    image: string;
    header: string;
    text: string;
    buttonText?: string;
    buttonLink?: string;
  };
}

export function SettingsForm({ initialAnnouncement, initialPopupSettings }: SettingsFormProps) {
  // Announcement State
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  
  // Popup State
  const [popupEnabled, setPopupEnabled] = useState(initialPopupSettings?.enabled || false);
  const [popupImage, setPopupImage] = useState(initialPopupSettings?.image || '');
  const [popupHeader, setPopupHeader] = useState(initialPopupSettings?.header || '');
  const [popupText, setPopupText] = useState(initialPopupSettings?.text || '');
  const [popupButtonText, setPopupButtonText] = useState(initialPopupSettings?.buttonText || '');
  const [popupButtonLink, setPopupButtonLink] = useState(initialPopupSettings?.buttonLink || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient() as any;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `popup-${Math.random()}.${fileExt}`;
      const filePath = `popups/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setPopupImage(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (error.message?.includes('Bucket not found') || error.error === 'Bucket not found') {
          setMessage({ type: 'error', text: 'Error: Storage bucket "site-assets" not found. Please run the SQL migration.' });
       } else if (error.message?.includes('row-level security policy')) {
          setMessage({ type: 'error', text: 'Permission Error: Please update your storage policies using the provided SQL.' });
       } else {
          setMessage({ type: 'error', text: 'Failed to upload image: ' + error.message });
       }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Save Announcement
      const { error: announcementError } = await supabase
        .from('settings')
        .upsert({ key: 'announcement', value: announcement });

      if (announcementError) throw announcementError;

      // Save Popup Settings
      const popupSettings = {
        enabled: popupEnabled,
        image: popupImage,
        header: popupHeader,
        text: popupText,
        buttonText: popupButtonText,
        buttonLink: popupButtonLink,
        lastUpdated: Date.now()
      };

      const { error: popupError } = await supabase
        .from('settings')
        .upsert({ key: 'site_popup', value: JSON.stringify(popupSettings) });

      if (popupError) throw popupError;

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error: any) {
      console.error('Error saving settings:', error.message || error);
      setMessage({ type: 'error', text: `Failed to save settings: ${error.message || 'Unknown error'}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Announcement Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Announcement Bar</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="announcement" className="block text-sm font-medium text-gray-700 mb-1">
              Announcement Text
            </label>
            <p className="text-sm text-gray-500 mb-2">
              This text will be displayed as a scrolling marquee at the top of the site. Leave empty to hide.
            </p>
            <textarea
              id="announcement"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[100px]"
              placeholder="Enter announcement text..."
            />
          </div>
        </div>
      </div>

      {/* Popup Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Promotional Popup</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show Popup</label>
            <button
              type="button"
              onClick={() => setPopupEnabled(!popupEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black/5 focus:ring-offset-2 ${
                popupEnabled ? 'bg-black' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  popupEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className={`space-y-6 ${!popupEnabled && 'opacity-50 pointer-events-none'}`}>
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Popup Image</label>
            <div className="flex items-start gap-4">
              <div 
                className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {popupImage ? (
                  <Image 
                    src={popupImage} 
                    alt="Popup preview" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Click to upload</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                 <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {popupImage && (
                   <button
                    type="button"
                    onClick={() => setPopupImage('')}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 mt-2"
                  >
                    <X className="w-4 h-4" /> Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Header */}
          <div>
            <label htmlFor="popupHeader" className="block text-sm font-medium text-gray-700 mb-1">
              Header Text
            </label>
            <input
              type="text"
              id="popupHeader"
              value={popupHeader}
              onChange={(e) => setPopupHeader(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
              placeholder="e.g., Join our Newsletter"
            />
          </div>

          {/* Body Text */}
          <div>
            <label htmlFor="popupText" className="block text-sm font-medium text-gray-700 mb-1">
              Body Text
            </label>
            <textarea
              id="popupText"
              value={popupText}
              onChange={(e) => setPopupText(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[100px]"
              placeholder="Enter popup content..."
            />
          </div>

          {/* Button Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="popupButtonText" className="block text-sm font-medium text-gray-700 mb-1">
                Button Text (Optional)
              </label>
              <input
                type="text"
                id="popupButtonText"
                value={popupButtonText}
                onChange={(e) => setPopupButtonText(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="e.g., Shop Now"
              />
            </div>
            <div>
              <label htmlFor="popupButtonLink" className="block text-sm font-medium text-gray-700 mb-1">
                Button Link (Optional)
              </label>
              <input
                type="text"
                id="popupButtonLink"
                value={popupButtonLink}
                onChange={(e) => setPopupButtonLink(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="e.g., /shop or https://..."
              />
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="sticky bottom-6 bg-white p-4 rounded-xl border border-gray-200 shadow-lg flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>
    </form>
  );
}
