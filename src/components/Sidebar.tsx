'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, History, Key, Settings } from 'lucide-react';

const navItems = [
  { href: '/generate', label: 'Generate', icon: Zap },
  { href: '/history', label: 'History', icon: History },
  { href: '/api-access', label: 'API Access', icon: Key },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black border-r border-[#262626] flex flex-col h-screen sticky top-0">
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
          v1.0.0 • Local Mode
        </div>
      </div>
    </aside>
  );
}