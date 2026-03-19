'use client';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === '/login' || !session) return null;

  const isGM = (session.user as any).role === 'GM';

  const navLinks = isGM
    ? [{ href: '/dashboard', label: 'Dashboard' }]
    : [
        { href: '/upload',         label: 'Upload Assets' },
        { href: '/my-submissions', label: 'My Submissions' },
      ];

  return (
    <nav className="no-print bg-white border-b border-gray-100">
      {/* Main bar */}
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-bold text-keeper-navy text-lg">KEEPER</span>
          <span className="text-gray-400 text-sm hidden md:block">{(session.user as any).propertyName}</span>
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="text-sm text-keeper-blue hover:underline">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">{session.user?.name}</span>
          <span className={`badge ${isGM ? 'bg-keeper-blueLight text-keeper-navy' : 'bg-gray-100 text-gray-600'}`}>
            {isGM ? 'GM' : 'Staff'}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hidden md:block text-sm text-gray-400 hover:text-red-500 py-2 px-2"
          >
            Sign out
          </button>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-gray-600 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <p className="text-xs text-gray-400 mb-2">{session.user?.name} · {(session.user as any).propertyName}</p>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-medium text-keeper-blue border-b border-gray-50">
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left py-3 text-sm text-red-500 font-medium"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
