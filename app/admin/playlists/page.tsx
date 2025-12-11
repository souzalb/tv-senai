'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, ListVideo, Image as ImageIcon, Upload, Loader2, ArrowRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Playlist } from '@/types';
import { clsx } from 'clsx';

export default function PlaylistManagementPage() {
    const { playlists, addPlaylist, removePlaylist, addSlide, removeSlide, fetchData } = useStore();

    useEffect(() => {
        fetchData();
    }, []); // Initial load

    // Selection State
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

    // New Playlist State
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    // New Slide State
    const [uploading, setUploading] = useState(false);
    const [newSlideDuration, setNewSlideDuration] = useState(10);

    const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        const newId = await addPlaylist(newPlaylistName);
        setNewPlaylistName('');
        setIsCreating(false);
        if (newId) setSelectedPlaylistId(newId);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedPlaylist || !e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('slides')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('slides')
                .getPublicUrl(filePath);

            await addSlide(selectedPlaylist.id, publicUrl, newSlideDuration);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Playlists</h2>
                    <p className="text-zinc-400">Manage content loops and slides.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    <Plus size={18} />
                    New Playlist
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* Playlist List (Sidebar) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-800/20">
                        <h3 className="font-medium text-zinc-300">Your Playlists</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        <AnimatePresence>
                            {isCreating && (
                                <motion.form
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    onSubmit={handleCreatePlaylist}
                                    className="p-3 bg-zinc-800 rounded-lg border border-blue-500/50 mb-2 overflow-hidden"
                                >
                                    <input
                                        autoFocus
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        placeholder="Enter playlist name..."
                                        className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm mb-2 focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                    <div className="flex justify-end gap-2 text-xs">
                                        <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-white px-2 py-1">Cancel</button>
                                        <button type="submit" disabled={!newPlaylistName} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 disabled:opacity-50">Create</button>
                                    </div>
                                </motion.form>
                            )}

                            {playlists.map(pl => (
                                <motion.div
                                    key={pl.id}
                                    layout
                                    onClick={() => setSelectedPlaylistId(pl.id)}
                                    className={clsx(
                                        'p-4 rounded-lg cursor-pointer transition-all border flex justify-between items-center group',
                                        selectedPlaylistId === pl.id
                                            ? 'bg-zinc-800 border-blue-500/50 shadow-lg'
                                            : 'border-transparent hover:bg-zinc-800/50'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <ListVideo size={20} className={selectedPlaylistId === pl.id ? 'text-blue-400' : 'text-zinc-600'} />
                                        <div>
                                            <div className="font-medium text-white">{pl.name}</div>
                                            <div className="text-xs text-zinc-500">{pl.slides.length} slides</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedPlaylistId === pl.id && <ArrowRight size={16} className="text-blue-500" />}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                    {selectedPlaylist ? (
                        <>
                            <div className="p-4 border-b border-zinc-800 bg-zinc-800/20 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg">{selectedPlaylist.name}</h3>
                                    <span className="bg-zinc-800 text-xs px-2 py-1 rounded-full text-zinc-400">
                                        ID: {selectedPlaylist.id.slice(0, 8)}...
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete playlist?')) {
                                            removePlaylist(selectedPlaylist.id);
                                            setSelectedPlaylistId(null);
                                        }
                                    }}
                                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 px-3 py-1 rounded hover:bg-red-400/10 transition-colors"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>

                            {/* Add Slide Logic */}
                            <div className="p-4 border-b border-zinc-800 bg-black/20 flex items-end gap-4">
                                <div className="w-24">
                                    <label className="block text-xs font-medium text-zinc-500 mb-1">Duration (s)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newSlideDuration}
                                        onChange={(e) => setNewSlideDuration(Number(e.target.value))}
                                        className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label
                                        className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-zinc-800 rounded-lg h-10 cursor-pointer transition-colors ${uploading ? 'bg-zinc-900 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-zinc-900'}`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploading}
                                            onChange={handleFileUpload}
                                        />
                                        {uploading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin text-blue-500" />
                                                <span className="text-sm text-zinc-500">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16} className="text-zinc-500" />
                                                <span className="text-sm text-zinc-400">Upload Image</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Slides Grid */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {selectedPlaylist.slides.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                        <ImageIcon size={48} className="mb-4 opacity-50" />
                                        <p>No slides. Upload an image to start.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedPlaylist.slides.map((slide, index) => (
                                            <div key={slide.id} className="relative group bg-black rounded-lg overflow-hidden border border-zinc-800 aspect-video">
                                                <img src={slide.url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

                                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-white flex items-center gap-1">
                                                    <Clock size={10} /> {slide.duration}s
                                                </div>
                                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
                                                    #{index + 1}
                                                </div>

                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => removeSlide(slide.id)}
                                                        className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-transform hover:scale-110"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                            <ListVideo size={48} className="mb-4 opacity-50" />
                            <p>Select a playlist.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
