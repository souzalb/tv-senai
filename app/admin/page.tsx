'use client';

import { useStore } from '@/store/useStore';
import { Monitor, ListVideo, Play } from 'lucide-react';

export default function AdminDashboard() {
    const { tvs, playlists } = useStore();

    const activeTVs = tvs.filter(tv => tv.assignedPlaylistId !== null).length;
    const totalSlides = playlists.reduce((acc, pl) => acc + pl.slides.length, 0);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-zinc-400">Overview of your digital signage network.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total TVs"
                    value={tvs.length}
                    subtitle={`${activeTVs} Currently Active`}
                    icon={Monitor}
                />
                <StatCard
                    title="Playlists"
                    value={playlists.length}
                    subtitle={`${totalSlides} Total Slides`}
                    icon={ListVideo}
                />
                <StatCard
                    title="System Status"
                    value="Online"
                    subtitle="Local Mode"
                    icon={Play}
                    highlight
                />
            </div>

            {/* Quick Lookup for Unassigned TVs */}
            {tvs.filter(tv => !tv.assignedPlaylistId).length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">TVs Needing Attention</h3>
                    <div className="space-y-3">
                        {tvs.filter(tv => !tv.assignedPlaylistId).map(tv => (
                            <div key={tv.id} className="flex justify-between items-center bg-black/40 p-4 rounded-lg border border-zinc-800/50">
                                <div>
                                    <div className="font-medium text-white">{tv.name}</div>
                                    <div className="text-sm text-zinc-500">{tv.location} • {tv.orientation}</div>
                                </div>
                                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                                    No Playlist
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    highlight = false
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    highlight?: boolean;
}) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-zinc-400 text-sm font-medium">{title}</p>
                    <h3 className={`text-3xl font-bold mt-1 ${highlight ? 'text-green-500' : 'text-white'}`}>
                        {value}
                    </h3>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg group-hover:bg-zinc-800 transition-colors">
                    <Icon size={24} className="text-zinc-400" />
                </div>
            </div>
            <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
    );
}
