import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (user.email !== 'parishkrit2061@gmail.com') {
    redirect('/');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 md:py-0 min-h-[4rem] flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-semibold whitespace-nowrap">Admin Dashboard</span>
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar mask-fade">
            <Link href="/admin" className="text-sm hover:text-black text-gray-600 transition-colors whitespace-nowrap">
              Posts
            </Link>
            <Link href="/admin/comments" className="text-sm hover:text-black text-gray-600 transition-colors whitespace-nowrap">
              Comments
            </Link>
            <Link href="/admin/settings" className="text-sm hover:text-black text-gray-600 transition-colors whitespace-nowrap">
              Settings
            </Link>
          </div>
          <Link href="/" className="md:ml-auto text-sm hover:text-black text-gray-600 transition-colors whitespace-nowrap" target="_blank">
            View Site
          </Link>
        </div>
      </nav>
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
