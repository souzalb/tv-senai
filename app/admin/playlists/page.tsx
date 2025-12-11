'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, ListVideo, Film, Clock, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Playlist, Slide } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import GlowButton from '@/components/ui/GlowButton';

export default function PlaylistManagementPage() {
    const { playlists, addPlaylist, removePlaylist, addSlide, removeSlide, fetchData } = useStore();
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    // Slide Form
    const [isAddingSlide, setIsAddingSlide] = useState(false);
    const [slideDuration, setSlideDuration] = useState(10);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        await addPlaylist(newPlaylistName);
        setNewPlaylistName('');
        setIsCreating(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedPlaylistId) return;

        setIsUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('slides')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('slides')
                .getPublicUrl(filePath);

            await addSlide(selectedPlaylistId, publicUrl, slideDuration);

            setIsAddingSlide(false);
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">

            {/* Left Column: Playlist List */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-white">Library</h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-2 bg-white/5 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-zinc-400"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {isCreating && (
                    <GlassCard className="mb-2">
                        <form onSubmit={handleCreatePlaylist} className="flex gap-2">
                            <input
                                autoFocus
                                value={newPlaylistName}
                                onChange={e => setNewPlaylistName(e.target.value)}
                                placeholder="Playlist Name"
                                className="flex-1 bg-transparent border-b border-white/20 px-2 py-1 outline-none text-white placeholder-zinc-600 focus:border-blue-500 transition-colors"
                            />
                            <button type="submit" className="text-blue-400 hover:text-blue-300 font-medium text-sm">Create</button>
                        </form>
                    </GlassCard>
                )}

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist.id}
                            onClick={() => setSelectedPlaylistId(playlist.id)}
                            className={`
                        p-4 rounded-xl cursor-pointer border transition-all duration-300 group relative
                        ${selectedPlaylistId === playlist.id
                                    ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_-5px_rgba(37,99,235,0.3)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                    `}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedPlaylistId === playlist.id ? 'bg-blue-500' : 'bg-zinc-800'}`}>
                                        <ListVideo size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${selectedPlaylistId === playlist.id ? 'text-white' : 'text-zinc-300'}`}>
                                            {playlist.name}
                                        </h3>
                                        <p className="text-xs text-zinc-500">{playlist.slides.length} slides</p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); removePlaylist(playlist.id); }}
                                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Editor */}
            <div className="flex-1 flex flex-col h-full">
                <GlassCard className="h-full flex flex-col p-0 overflow-hidden bg-black/40">
                    {selectedPlaylist ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedPlaylist.name}</h2>
                                    <p className="text-zinc-500 text-sm">Managing Content</p>
                                </div>
                                <GlowButton onClick={() => setIsAddingSlide(true)} icon={Plus}>
                                    Add Slide
                                </GlowButton>
                            </div>

                            {/* Content Grid */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {selectedPlaylist.slides.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-white/5 rounded-2xl bg-white/5/50">
                                        <Film size={48} className="mb-4 opacity-50" />
                                        <p>No slides in this playlist.</p>
                                        <button onClick={() => setIsAddingSlide(true)} className="mt-4 text-blue-500 hover:underline">Add your first slide</button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {selectedPlaylist.slides.map((slide, index) => (
                                            <motion.div
                                                key={slide.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="group relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-white/10 shadow-lg"
                                            >
                                                <img src={slide.url} alt="Slide" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                    <div className="flex justify-between items-center text-white">
                                                        <div className="flex items-center gap-1.5 text-xs bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                                                            <Clock size={12} /> {slide.duration}s
                                                        </div>
                                                        <button
                                                            onClick={() => removeSlide(slide.id)}
                                                            className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-md transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                                                    {index + 1}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                            <ListVideo size={64} className="mb-6 opacity-20" />
                            <p className="text-lg">Select a playlist to edit content</p>
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Modern Upload Modal */}
            <AnimatePresence>
                {isAddingSlide && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="w-full max-w-lg"
                        >
                            <GlassCard>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Add New Slide</h3>
                                    <button onClick={() => setIsAddingSlide(false)} className="text-zinc-500 hover:text-white">✕</button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Duration (Seconds)</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="5"
                                                max="60"
                                                step="5"
                                                value={slideDuration}
                                                onChange={(e) => setSlideDuration(Number(e.target.value))}
                                                className="flex-1 accent-blue-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="text-xl font-bold text-blue-400 w-12 text-center">{slideDuration}s</span>
                                        </div>
                                    </div>

                                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center transition-colors hover:border-blue-500/50 hover:bg-blue-500/5 group relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        {isUploading ? (
                                            <div className="flex flex-col items-center animate-pulse">
                                                <UploadCloud size={40} className="text-blue-500 mb-3" />
                                                <p className="text-blue-400 font-medium">Uploading...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                                    <ImageIcon size={28} className="text-zinc-400 group-hover:text-white" />
                                                </div>
                                                <h4 className="text-white font-medium mb-1">Click to Upload Image</h4>
                                                <p className="text-zinc-500 text-sm">Supports JPG, PNG, WEBP</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
