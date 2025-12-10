'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Monitor, ListVideo, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'TVs', href: '/admin/tvs', icon: Monitor },
    { name: 'Playlists', href: '/admin/playlists', icon: ListVideo },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen text-zinc-100">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Signage Admin
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            )}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <div className="text-xs text-zinc-500">v1.0.0</div>
            </div>
        </aside>
    );
}
