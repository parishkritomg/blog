import Link from 'next/link';
import { Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white pt-16 pb-8 mt-auto">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="block">
              <h3 className="text-xl font-bold tracking-tight text-gray-900">Parishkrit Writes</h3>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Thoughts on software, design, and life. Documenting the journey of building things for the web.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a 
                href="https://x.com/notparishkrit" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-black transition-colors p-2 hover:bg-gray-50 rounded-full -ml-2"
                aria-label="Follow on X (Twitter)"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Explore</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-black transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-black transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a 
                  href="https://x.com/notparishkrit" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors"
                >
                  X (Twitter)
                </a>
              </li>
              <li>
                <a 
                  href="mailto:parishkrit2061@gmail.com" 
                  className="hover:text-black transition-colors"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Parishkrit Bastakoti. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-sm text-gray-400">
              Designed & Built by Parishkrit
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
