'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { Monitor, ArrowRight, Tv } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './ui/GlassCard';

interface TVSelectorProps {
    onSelect: (tvId: string) => void;
}

export default function TVSelector({ onSelect }: TVSelectorProps) {
    const { tvs, fetchData } = useStore();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel('tv-selector-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tvs' }, () => {
                fetchData();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-5xl w-full relative z-10"
            >
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block p-4 rounded-full bg-blue-600/20 backdrop-blur-md mb-6 shadow-[0_0_50px_-10px_rgba(37,99,235,0.5)]"
                    >
                        <Tv size={48} className="text-blue-400" />
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tight">
                        Select Your Display
                    </h1>
                    <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">
                        Identify this screen to begin streaming your digital signage content.
                    </p>
                </div>

                {tvs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                        {tvs.map((tv, idx) => (
                            <motion.button
                                key={tv.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (idx * 0.1) }}
                                onClick={() => onSelect(tv.id)}
                                onMouseEnter={() => setHoveredId(tv.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className="text-left group perspective-1000 outline-none"
                            >
                                <GlassCard
                                    hoverEffect={false}
                                    className={`
                                        h-full transition-all duration-500 transform
                                        ${hoveredId === tv.id ? 'scale-105 border-blue-500/50 bg-blue-600/10 shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)]' : 'border-white/10 hover:bg-white/10'}
                                    `}
                                >
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-white/5 rounded-xl backdrop-blur-md group-hover:bg-blue-500 transition-colors">
                                                    <Monitor size={24} className="text-white" />
                                                </div>
                                                <div className="text-xs font-mono bg-black/40 text-zinc-400 px-2 py-1 rounded border border-white/5">
                                                    {tv.resolution.width}x{tv.resolution.height}
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{tv.name}</h3>
                                            <p className="text-zinc-500 text-sm">{tv.location}</p>
                                        </div>

                                        <div className="mt-8 flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-white transition-colors">
                                            Start Playback <ArrowRight size={16} className={`transition-transform duration-300 ${hoveredId === tv.id ? 'translate-x-1' : ''}`} />
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-12 max-w-lg mx-auto"
                    >
                        <p className="text-zinc-500 text-lg">No screens registered yet.</p>
                        <p className="text-sm text-zinc-600 mt-2">Visit the Admin Panel to add a display.</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
