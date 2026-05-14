'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'แดชบอร์ด', icon: '📊' },
  { href: '/dashboard/sites', label: 'รายการไซต์', icon: '🏥' },
  { href: '/dashboard/teams', label: 'แผน & ทีม', icon: '👥' },
  { href: '/dashboard/hospitals', label: 'โรงพยาบาล', icon: '🏨' },
  { href: '/dashboard/gateway', label: 'ติดตั้ง Gateway', icon: '🔌' },
];

const adminItems = [
  { href: '/dashboard/users', label: 'ผู้ใช้งาน', icon: '👤' },
  { href: '/dashboard/settings', label: 'ตั้งค่าระบบ', icon: '⚙️' },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            IP
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-none">IPD Paperless</p>
            <p className="text-xs text-gray-400 mt-0.5">ระบบติดตามโครงการ</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              (item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href))
                ? 'bg-amber-50 text-amber-800'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {user.role === 'admin' && (
          <>
            <div className="pt-3 pb-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3">Admin</p>
            </div>
            {adminItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-amber-50 text-amber-800'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
            {user.display_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.display_name}</p>
            <p className="text-xs text-gray-400">{user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span> ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
