'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SitePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<{
    enabled: boolean;
    image: string;
    header: string;
    text: string;
    buttonText?: string;
    buttonLink?: string;
    lastUpdated?: number;
  } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on admin pages
    if (pathname.startsWith('/admin')) return;

    const fetchSettings = async () => {
      const supabase = createClient() as any;
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'site_popup')
        .single();

      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          if (parsed.enabled) {
            // Check local storage for dismissal version
            const dismissedVersion = localStorage.getItem('popup_dismissed_version');
            const currentVersion = parsed.lastUpdated || 0;
            
            // Show if never dismissed or if content has been updated since last dismissal
            if (!dismissedVersion || currentVersion > parseInt(dismissedVersion)) {
              setSettings(parsed);
              // Small delay for better UX
              setTimeout(() => setIsOpen(true), 2000);
            }
          }
        } catch (e) {
          console.error('Error parsing popup settings:', e);
        }
      }
    };

    fetchSettings();
  }, [pathname]);

  const handleClose = () => {
    setIsOpen(false);
    if (settings?.lastUpdated) {
      localStorage.setItem('popup_dismissed_version', settings.lastUpdated.toString());
    } else {
      localStorage.setItem('popup_dismissed_version', Date.now().toString());
    }
  };

  if (!isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-black transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {settings.image && (
          <div className="relative h-48 w-full bg-gray-100">
            <Image
              src={settings.image}
              alt={settings.header || 'Popup Image'}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-8 text-center">
          {settings.header && (
            <h3 className="text-2xl font-bold mb-3 text-gray-900 font-serif">
              {settings.header}
            </h3>
          )}
          
          {settings.text && (
            <p className="text-gray-600 leading-relaxed mb-6">
              {settings.text}
            </p>
          )}

          {settings.buttonText && settings.buttonLink ? (
            <Link
              href={settings.buttonLink}
              onClick={handleClose}
              className="block w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              {settings.buttonText}
            </Link>
          ) : (
            <button
              onClick={handleClose}
              className="w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
