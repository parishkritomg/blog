'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload, X, Bell, MessageSquare, Save, Image as ImageIcon, Type, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
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
      
      // Auto-hide success message
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error.message || error);
      setMessage({ type: 'error', text: `Failed to save settings: ${error.message || 'Unknown error'}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pb-24 md:pb-0">
      <div className="space-y-6">
        {/* Announcement Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Announcement Bar</h2>
              <p className="text-xs text-gray-500">Top of site notification</p>
            </div>
          </div>
          
          <div className="p-4 md:p-6">
            <div className="relative">
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full p-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none placeholder:text-gray-400"
                placeholder="Enter text to display at the top of your site..."
                rows={3}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none">
                {announcement.length} chars
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Leave empty to hide the announcement bar
            </p>
          </div>
        </div>

        {/* Popup Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Promotional Popup</h2>
                <p className="text-xs text-gray-500">Overlay for visitors</p>
              </div>
            </div>
            
            {/* iOS Style Switch */}
            <button
              type="button"
              onClick={() => setPopupEnabled(!popupEnabled)}
              className={`
                relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                ${popupEnabled ? 'bg-purple-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${popupEnabled ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>

          <div className={`p-4 md:p-6 space-y-6 transition-all duration-300 ${!popupEnabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            
            {/* Image Upload - Card Style */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-gray-400" />
                Popup Image
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-full aspect-video md:aspect-[21/9] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center"
              >
                {popupImage ? (
                  <>
                    <Image 
                      src={popupImage} 
                      alt="Popup preview" 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium flex items-center gap-2">
                        <Upload size={16} /> Change Image
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopupImage('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-white hover:text-red-600 shadow-sm z-10"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-purple-500 group-hover:scale-110 transition-transform">
                      <Upload size={20} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">Recommended: 800x600px</p>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Uploading...</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Text Inputs */}
            <div className="grid gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Type size={16} className="text-gray-400" />
                  Header Text
                </label>
                <input
                  type="text"
                  value={popupHeader}
                  onChange={(e) => setPopupHeader(e.target.value)}
                  className="w-full px-4 py-3 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all placeholder:text-gray-400"
                  placeholder="e.g., Join our Newsletter"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Body Text</label>
                <textarea
                  value={popupText}
                  onChange={(e) => setPopupText(e.target.value)}
                  className="w-full px-4 py-3 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all resize-none placeholder:text-gray-400"
                  placeholder="Enter popup content..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Button Text</label>
                  <input
                    type="text"
                    value={popupButtonText}
                    onChange={(e) => setPopupButtonText(e.target.value)}
                    className="w-full px-4 py-3 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all placeholder:text-gray-400"
                    placeholder="e.g., Shop Now"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <LinkIcon size={16} className="text-gray-400" />
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={popupButtonLink}
                    onChange={(e) => setPopupButtonLink(e.target.value)}
                    className="w-full px-4 py-3 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all placeholder:text-gray-400"
                    placeholder="e.g., /shop"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
             {message && (
              <div className={`text-sm flex items-center gap-2 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              } animate-in fade-in slide-in-from-bottom-2`}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
                {message.text}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
