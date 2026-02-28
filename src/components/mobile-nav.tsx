'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Target, Menu, X, Trophy, BookOpen, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/contexts/settings-context';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/scoreboard', label: 'Scoreteller', icon: Target },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/training', label: 'Training', icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { preferences } = useSettings();
  const accentColor = preferences.accentColor || 'emerald';

  const getAccentColorClass = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-600',
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      rose: 'bg-rose-600',
      amber: 'bg-amber-600',
      orange: 'bg-orange-600',
      teal: 'bg-teal-600',
      slate: 'bg-slate-600',
    };
    return colors[color] || 'bg-emerald-600';
  };

  const getAccentTextColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'text-emerald-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      rose: 'text-rose-600',
      amber: 'text-amber-600',
      orange: 'text-orange-600',
      teal: 'text-teal-600',
      slate: 'text-slate-600',
    };
    return colors[color] || 'text-emerald-600';
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Content */}
      {menuOpen && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden rounded-t-2xl shadow-2xl p-4">
          <div className="space-y-2">
            <Link
              href="/leaderboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Trophy className="h-5 w-5" style={{ color: getAccentTextColor(accentColor) }} />
              <span className="font-medium">Leaderboard</span>
            </Link>
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Settings className="h-5 w-5 text-slate-600" />
              <span className="font-medium">Instellingen</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LogOut className="h-5 w-5 text-slate-600" />
              <span className="font-medium">Uitloggen</span>
            </Link>
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: getAccentColorClass(accentColor) }}
            >
              <span className="font-medium">Registreren</span>
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Visible on both mobile and desktop */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-4xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? getAccentTextColor(accentColor) : 'text-slate-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? getAccentTextColor(accentColor) : 'text-slate-400'}`} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Settings Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              menuOpen ? getAccentTextColor(accentColor) : 'text-slate-600'
            }`}
          >
            <Menu className={`h-5 w-5 ${menuOpen ? getAccentTextColor(accentColor) : 'text-slate-400'}`} />
            <span className="text-[10px] mt-1 font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-16" />
    </>
  );
}
