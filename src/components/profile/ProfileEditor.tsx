'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { Camera, Loader2, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProfileEditor() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata.full_name || '');
        setAvatarUrl(user.user_metadata.avatar_url || '');
      }
    };
    getUser();
  }, [supabase]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Auto-save the avatar URL to metadata immediately
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      router.refresh();
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
            full_name: fullName,
            avatar_url: avatarUrl // Ensure avatar is synced
        }
      });

      if (error) throw error;
      
      router.refresh();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100">
            {avatarUrl ? (
              <Image 
                src={avatarUrl} 
                alt="Profile" 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <UserIcon size={48} />
              </div>
            )}
            
            {/* Overlay for upload */}
            <div 
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="text-white w-8 h-8" />
            </div>
          </div>
          
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={handleAvatarUpload}
            ref={fileInputRef}
            className="hidden"
            disabled={uploading}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-gray-600 hover:text-black font-medium"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Change Picture'}
          </button>
        </div>

        {/* Details Form */}
        <form onSubmit={handleUpdateProfile} className="flex-1 w-full space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed"
            />
          </div>

          {message && (
            <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={updating || uploading}
              className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {updating && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
