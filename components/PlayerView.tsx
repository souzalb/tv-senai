'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

interface PlayerViewProps {
    tvId: string;
}

export default function PlayerView({ tvId }: PlayerViewProps) {
    const { tvs, playlists } = useStore();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    // Sync with Admin changes across tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'digital-signage-storage') {
                useStore.persist.rehydrate();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Find configuration
    const tv = tvs.find(t => t.id === tvId);
    const playlist = playlists.find(p => p.id === tv?.assignedPlaylistId);

    // Auto-play logic
    useEffect(() => {
        if (!playlist || playlist.slides.length === 0) return;

        const currentSlide = playlist.slides[currentSlideIndex];
        if (!currentSlide) {
            // Reset if index out of bounds
            setCurrentSlideIndex(0);
            return;
        }

        const timer = setTimeout(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % playlist.slides.length);
        }, currentSlide.duration * 1000);

        return () => clearTimeout(timer);
    }, [currentSlideIndex, playlist]);

    // Handle Missing Config
    if (!tv) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
                <AlertCircle size={48} className="mb-4" />
                <p>TV Configuration Not Found</p>
            </div>
        );
    }

    // Handle Aspect Ratio Container
    // We simulate the TV's aspect ratio on the browser screen
    const aspectRatio = tv.resolution.width / tv.resolution.height;

    if (!playlist || playlist.slides.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 text-center p-8">
                <Loader2 size={48} className="animate-spin mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-zinc-300 mb-2">{tv.name}</h2>
                <p>Waiting for content...</p>
                <p className="text-sm mt-4 text-zinc-600">
                    ID: {tv.id} • {tv.resolution.width}x{tv.resolution.height}
                </p>
            </div>
        );
    }

    const currentSlide = playlist.slides[currentSlideIndex];

    return (
        <div className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
            {/* 
        Container that forces the specific aspect ratio.
        If the browser window doesn't match, black bars (letterboxing) will appear.
      */}
            <div
                style={{
                    aspectRatio: `${tv.resolution.width}/${tv.resolution.height}`,
                    width: '100vw',
                    maxHeight: '100vh',
                    // If the screen is wider than the aspect ratio, width will be max 100vw but height will be less.
                    // We usually want "contain" behavior.
                }}
                className="relative shadow-2xl bg-black"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {currentSlide.type === 'image' && (
                            <img
                                src={currentSlide.url}
                                alt="Slide"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Optional Debug Overlay - remove for production */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md opacity-20 hover:opacity-100 transition-opacity">
                    {tv.name} • Slide {currentSlideIndex + 1}/{playlist.slides.length}
                </div>
            </div>
        </div>
    );
}
