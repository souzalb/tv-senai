'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Trash2, Monitor, Settings2, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TV, Orientation } from '@/types';

export default function TVManagementPage() {
    const { tvs, playlists, addTV, removeTV, assignPlaylistToTV } = useStore();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newWidth, setNewWidth] = useState(1920);
    const [newHeight, setNewHeight] = useState(1080);
    const [newOrientation, setNewOrientation] = useState<Orientation>('landscape');

    const handleAddTV = (e: React.FormEvent) => {
        e.preventDefault();
        const newTV: TV = {
            id: `tv-${Date.now()}`,
            name: newName,
            location: newLocation,
            resolution: { width: newWidth, height: newHeight },
            orientation: newOrientation,
            assignedPlaylistId: null
        };
        addTV(newTV);
        setIsAdding(false);
        resetForm();
    };

    const resetForm = () => {
        setNewName('');
        setNewLocation('');
        setNewWidth(1920);
        setNewHeight(1080);
        setNewOrientation('landscape');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">TV Management</h2>
                    <p className="text-zinc-400">Register and configure your display units.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    <Plus size={18} />
                    Register TV
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                    {tvs.map((tv) => (
                        <motion.div
                            key={tv.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex justify-between items-start group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-zinc-800 rounded-lg">
                                    <Monitor className={tv.orientation === 'portrait' ? 'rotate-90' : ''} size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{tv.name}</h3>
                                    <div className="text-zinc-500 text-sm space-y-1">
                                        <p>{tv.location}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs">
                                                {tv.resolution.width}x{tv.resolution.height}
                                            </span>
                                            <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs capitalize">
                                                {tv.orientation}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Playlist Selector */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <PlayCircle size={14} className="text-zinc-500" />
                                        <select
                                            value={tv.assignedPlaylistId || ''}
                                            onChange={(e) => assignPlaylistToTV(tv.id, e.target.value || null)}
                                            className="bg-black border border-zinc-800 text-xs text-zinc-300 rounded px-2 py-1 outline-none focus:border-blue-500 hover:border-zinc-700 transition-colors"
                                        >
                                            <option value="">No Content Assigned</option>
                                            {playlists.map(pl => (
                                                <option key={pl.id} value={pl.id}>{pl.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => removeTV(tv.id)}
                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Remove TV"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold">Register New TV</h3>
                                <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white">✕</button>
                            </div>

                            <form onSubmit={handleAddTV} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Display Name</label>
                                    <input
                                        required
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="e.g. Lobby Display 1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Location</label>
                                    <input
                                        required
                                        value={newLocation}
                                        onChange={(e) => setNewLocation(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="e.g. Building A, Floor 1"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Width (px)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newWidth}
                                            onChange={(e) => setNewWidth(Number(e.target.value))}
                                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Height (px)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newHeight}
                                            onChange={(e) => setNewHeight(Number(e.target.value))}
                                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-1">Orientation</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['landscape', 'portrait'].map((opt) => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => setNewOrientation(opt as Orientation)}
                                                className={`px-4 py-2 rounded-lg border capitalize text-sm transition-all ${newOrientation === opt
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors font-medium"
                                    >
                                        Register TV
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
