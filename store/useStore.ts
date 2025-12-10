import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TV, Playlist, Slide } from '../types';

interface AppState {
    tvs: TV[];
    playlists: Playlist[];

    // Actions
    addTV: (tv: TV) => void;
    updateTV: (id: string, updates: Partial<TV>) => void;
    removeTV: (id: string) => void;

    addPlaylist: (playlist: Playlist) => void;
    updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
    removePlaylist: (id: string) => void;

    assignPlaylistToTV: (tvId: string, playlistId: string | null) => void;
}

const initialTVs: TV[] = [
    {
        id: 'tv-1',
        name: 'Reception Display',
        location: 'Main Entrance',
        resolution: { width: 1920, height: 1080 },
        orientation: 'landscape',
        assignedPlaylistId: 'pl-1'
    },
    {
        id: 'tv-vertical',
        name: 'Hallway Vertical',
        location: '2nd Floor Hallway',
        resolution: { width: 1080, height: 1920 }, // Portrait
        orientation: 'portrait',
        assignedPlaylistId: null
    }
];

const initialPlaylists: Playlist[] = [
    {
        id: 'pl-1',
        name: 'Welcome Loop',
        slides: [
            {
                id: 's-1',
                type: 'image',
                url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=1920',
                duration: 10,
                order: 0
            },
            {
                id: 's-2',
                type: 'image',
                url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1920',
                duration: 8,
                order: 1
            }
        ]
    }
];

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            tvs: initialTVs,
            playlists: initialPlaylists,

            addTV: (tv) => set((state) => ({ tvs: [...state.tvs, tv] })),
            updateTV: (id, updates) => set((state) => ({
                tvs: state.tvs.map((tv) => (tv.id === id ? { ...tv, ...updates } : tv))
            })),
            removeTV: (id) => set((state) => ({
                tvs: state.tvs.filter((tv) => tv.id !== id)
            })),

            addPlaylist: (playlist) => set((state) => ({ playlists: [...state.playlists, playlist] })),
            updatePlaylist: (id, updates) => set((state) => ({
                playlists: state.playlists.map((pl) => (pl.id === id ? { ...pl, ...updates } : pl))
            })),
            removePlaylist: (id) => set((state) => ({
                playlists: state.playlists.filter((pl) => pl.id !== id)
            })),

            assignPlaylistToTV: (tvId, playlistId) => set((state) => ({
                tvs: state.tvs.map((tv) => (tv.id === tvId ? { ...tv, assignedPlaylistId: playlistId } : tv))
            })),
        }),
        {
            name: 'digital-signage-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
