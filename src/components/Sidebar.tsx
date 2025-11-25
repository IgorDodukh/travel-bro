'use client';
import Link from 'next/link';
import { Home, Map, Calendar, Settings, LogOut, Compass, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Map, label: 'Map', href: '/map' }, // Placeholder
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' }, // Placeholder
    { icon: Calendar, label: 'Schedule', href: '/schedule' }, // Placeholder
    { icon: Compass, label: 'Explore', href: '/explore' }, // Placeholder
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-24 bg-[#f4f4f5] flex flex-col items-center py-8 z-50 border-r border-gray-200">
      <div className="mb-12">
        <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-white font-bold text-xl">
          ig
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "p-3 rounded-full transition-all duration-300 hover:scale-110",
                isActive 
                  ? "bg-white shadow-lg text-brand-primary" 
                  : "text-gray-400 hover:text-brand-dark"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>

      <button className="mt-auto p-3 text-gray-400 hover:text-red-500 transition-colors">
        <LogOut size={20} />
      </button>
    </aside>
  );
}