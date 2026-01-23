import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { UserMenu } from './UserMenu';
import { Search } from './Search';
import { Suspense } from 'react';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-lg font-medium tracking-tight hover:text-gray-600 transition-colors duration-200"
        >
          <Image
            src="/favicon_me.png"
            alt="Logo"
            width={24}
            height={24}
            className="rounded-full"
          />
          Parishkrit Writes
        </Link>
        <nav className="flex items-center gap-4">
          <Suspense>
            <Search />
          </Suspense>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link 
              href="/login" 
              className="text-sm font-medium bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
