'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Monitor, ListVideo, Zap, Radio } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const { tvs, playlists, fetchData } = useStore();

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const activeTVs = tvs.filter(tv => tv.assignedPlaylistId !== null).length;
    const totalSlides = playlists.reduce((acc, pl) => acc + pl.slides.length, 0);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Dashboard</h2>
                <p className="text-zinc-400">Overview of your digital signage network.</p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatCard
                    title="Total Displays"
                    value={tvs.length}
                    subtitle="Registered Screens"
                    icon={Monitor}
                    color="blue"
                />
                <StatCard
                    title="Active Content"
                    value={activeTVs}
                    subtitle="Currently Playing"
                    icon={Zap}
                    color="yellow"
                />
                <StatCard
                    title="Playlists"
                    value={playlists.length}
                    subtitle={`${totalSlides} Total Slides`}
                    icon={ListVideo}
                    color="purple"
                />
                <StatCard
                    title="System Status"
                    value="Online"
                    subtitle="Supabase Connected"
                    icon={Radio}
                    color="green"
                />
            </motion.div>

            {/* Quick Lookup for Unassigned TVs */}
            {tvs.filter(tv => !tv.assignedPlaylistId).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8"
                >
                    <GlassCard className="border-l-4 border-l-orange-500">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            Attention Needed
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tvs.filter(tv => !tv.assignedPlaylistId).map(tv => (
                                <div key={tv.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
                                    <div>
                                        <div className="font-medium text-white">{tv.name}</div>
                                        <div className="text-sm text-zinc-500">{tv.location}</div>
                                    </div>
                                    <div className="text-xs bg-orange-500/20 text-orange-200 px-3 py-1 rounded-full border border-orange-500/20">
                                        No Content
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    color: 'blue' | 'purple' | 'green' | 'yellow';
}) {
    const colors = {
        blue: "from-blue-500 to-cyan-500",
        purple: "from-purple-500 to-pink-500",
        green: "from-emerald-500 to-teal-500",
        yellow: "from-orange-500 to-yellow-500"
    };

    const bgGlow = {
        blue: "bg-blue-500/10 text-blue-400",
        purple: "bg-purple-500/10 text-purple-400",
        green: "bg-emerald-500/10 text-emerald-400",
        yellow: "bg-orange-500/10 text-orange-400"
    };

    return (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <GlassCard className="relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
                        <h3 className="text-4xl font-bold text-white tracking-tight">
                            {value}
                        </h3>
                    </div>
                    <div className={`p-3 rounded-xl ${bgGlow[color]} backdrop-blur-md`}>
                        <Icon size={24} />
                    </div>
                </div>
                <p className="text-sm text-zinc-500 relative z-10">{subtitle}</p>

                {/* Background Gradient Blob */}
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${colors[color]} rounded-full blur-[40px] opacity-20`} />
            </GlassCard>
        </motion.div>
    );
}
