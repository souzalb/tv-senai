'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Monitor, ListVideo, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Monitor, label: 'TV Management', href: '/admin/tvs' },
    { icon: ListVideo, label: 'Playlists', href: '/admin/playlists' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-72 glass-panel rounded-3xl flex flex-col p-6 z-50">
            <div className="mb-10 px-2">
                <h1 className="text-2xl font-bold text-gradient mb-1">NeonSign</h1>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Premium Digital Signage</p>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={clsx(
                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden",
                                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                {/* Active Background Glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <item.icon size={20} className={clsx("relative z-10", isActive && "text-blue-400")} />
                                <span className="relative z-10 font-medium">{item.label}</span>

                                {/* Hover effect for non-active items */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto px-4 py-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                        A
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Admin User</p>
                        <p className="text-xs text-zinc-500">Online</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
