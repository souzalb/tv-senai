'use client';

import { useStore } from '@/store/useStore';
import { Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

interface TVSelectorProps {
    onSelect: (tvId: string) => void;
}

export default function TVSelector({ onSelect }: TVSelectorProps) {
    const { tvs } = useStore();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <div className="text-center mb-10">
                    <Monitor size={48} className="mx-auto mb-4 text-blue-500" />
                    <h1 className="text-3xl font-bold mb-2">Configure Display</h1>
                    <p className="text-zinc-400">Identify this screen to start playing content.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tvs.map((tv) => (
                        <button
                            key={tv.id}
                            onClick={() => onSelect(tv.id)}
                            className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-left hover:border-blue-500 hover:bg-zinc-800 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{tv.name}</h3>
                                <span className="text-xs bg-zinc-950 px-2 py-1 rounded text-zinc-500">
                                    {tv.orientation}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400">{tv.location}</p>
                            <div className="text-xs text-zinc-600 mt-2">
                                {tv.resolution.width} x {tv.resolution.height}
                            </div>
                        </button>
                    ))}
                </div>

                {tvs.length === 0 && (
                    <div className="text-center text-zinc-500 bg-zinc-900/50 p-8 rounded-xl border border-dashed border-zinc-800">
                        No TVs registered in Admin Panel.
                    </div>
                )}
            </motion.div>
        </div>
    );
}
