'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // Check if user is admin - using email check as per project convention
  const isAdmin = user.email === 'parishkrit2061@gmail.com'; 
  
  const name = isAdmin ? 'Parishkrit Bastakoti' : (user.user_metadata.full_name || user.email?.split('@')[0] || 'User');
  const avatarUrl = user.user_metadata.avatar_url;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors"
      >
        <span className="bg-gray-100 p-0.5 rounded-full overflow-hidden w-8 h-8 flex items-center justify-center border border-gray-200">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt={name} 
              width={32} 
              height={32} 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <UserIcon size={16} />
          )}
        </span>
        <span className="hidden sm:inline flex items-center gap-1">
          {name}
          {isAdmin && (
            <Image 
              src="/verification_badge.png" 
              alt="Verified Admin" 
              width={16} 
              height={16}
              className="inline-block ml-1"
            />
          )}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                {isAdmin && (
                  <Image 
                    src="/verification_badge.png" 
                    alt="Verified Admin" 
                    width={14} 
                    height={14}
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            
            {isAdmin && (
              <Link 
                href="/admin"
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield size={14} />
                Admin Dashboard
              </Link>
            )}

            <Link 
              href="/profile"
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon size={14} />
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
