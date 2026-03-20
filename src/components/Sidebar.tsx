'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, History, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/generate', label: 'Generate', icon: Zap },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-b border-[#262626]">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#22c55e]">⚡</span>
            ScriptEngine
          </h1>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#a3a3a3] hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay Menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur"
          onClick={() => setMobileOpen(false)}
        >
          <nav className="flex flex-col items-center justify-center h-full gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex flex-col items-center gap-2 px-8 py-4 rounded-xl transition-all min-w-[200px] ${
                    isActive
                      ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20'
                      : 'text-[#a3a3a3] hover:bg-[#171717] hover:text-white'
                  }`}
                >
                  <Icon size={28} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-black border-r border-[#262626] flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-[#262626]">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-[#22c55e]">⚡</span>
            ScriptEngine
          </h1>
          <p className="text-xs text-[#737373] mt-1">Viral Content Generator</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20'
                        : 'text-[#a3a3a3] hover:bg-[#171717] hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#262626]">
          <div className="text-xs text-[#525252] text-center">
            v1.0.0 • Cloud Mode
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-t border-[#262626] pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-[#22c55e]'
                    : 'text-[#737373]'
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
