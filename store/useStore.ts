import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { TV, Playlist, Slide } from '../types';

interface AppState {
    tvs: TV[];
    playlists: Playlist[];
    isLoading: boolean;

    // Actions
    fetchData: () => Promise<void>;

    addTV: (tv: Omit<TV, 'id'>) => Promise<void>;
    updateTV: (id: string, updates: Partial<TV>) => Promise<void>;
    removeTV: (id: string) => Promise<void>;

    addPlaylist: (name: string) => Promise<string | null>;
    removePlaylist: (id: string) => Promise<void>;

    addSlide: (playlistId: string, url: string, duration: number) => Promise<void>;
    removeSlide: (slideId: string) => Promise<void>;

    assignPlaylistToTV: (tvId: string, playlistId: string | null) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    tvs: [],
    playlists: [],
    isLoading: false,

    fetchData: async () => {
        set({ isLoading: true });

        // Fetch TVs
        const { data: tvsData } = await supabase
            .from('tvs')
            .select('*')
            .order('created_at', { ascending: true });

        // Fetch Playlists with Slides
        const { data: playlistsData } = await supabase
            .from('playlists')
            .select('*, slides(*)')
            .order('created_at', { ascending: true });

        // Transform DB data to match types
        const formattedPlaylists: Playlist[] = (playlistsData || []).map((pl: any) => ({
            ...pl,
            slides: (pl.slides || []).sort((a: any, b: any) => a.order - b.order)
        }));

        // Transform TV data (map DB columns to TS interface if needed, here they match closely)
        const formattedTVs: TV[] = (tvsData || []).map((tv: any) => ({
            id: tv.id,
            name: tv.name,
            location: tv.location,
            resolution: { width: tv.width, height: tv.height },
            orientation: tv.orientation,
            assignedPlaylistId: tv.assigned_playlist_id
        }));

        set({
            tvs: formattedTVs,
            playlists: formattedPlaylists,
            isLoading: false
        });
    },

    addTV: async (tv) => {
        const { data, error } = await supabase.from('tvs').insert({
            name: tv.name,
            location: tv.location,
            width: tv.resolution.width,
            height: tv.resolution.height,
            orientation: tv.orientation
        }).select();

        if (data && !error) {
            // Re-fetch to ensure sync
            await get().fetchData();
        }
    },

    updateTV: async (id, updates) => {
        // Construct DB update object
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        // ... map other fields if needed

        // For simplicity, we might not implementation all partial updates right now unless required
        // But assignedPlaylistId is critical
        if (updates.assignedPlaylistId !== undefined) {
            dbUpdates.assigned_playlist_id = updates.assignedPlaylistId;
        }

        await supabase.from('tvs').update(dbUpdates).eq('id', id);
        await get().fetchData();
    },

    removeTV: async (id) => {
        await supabase.from('tvs').delete().eq('id', id);
        await get().fetchData();
    },

    addPlaylist: async (name) => {
        const { data } = await supabase.from('playlists').insert({ name }).select().single();
        await get().fetchData();
        return data ? data.id : null;
    },

    removePlaylist: async (id) => {
        // Cascading delete handles slides
        await supabase.from('playlists').delete().eq('id', id);
        await get().fetchData();
    },

    addSlide: async (playlistId, url, duration) => {
        // Get current max order
        const playlist = get().playlists.find(p => p.id === playlistId);
        const order = playlist ? playlist.slides.length : 0;

        await supabase.from('slides').insert({
            playlist_id: playlistId,
            url,
            duration,
            order
        });
        await get().fetchData();
    },

    removeSlide: async (slideId) => {
        await supabase.from('slides').delete().eq('id', slideId);
        await get().fetchData();
    },

    assignPlaylistToTV: async (tvId, playlistId) => {
        await supabase.from('tvs').update({ assigned_playlist_id: playlistId }).eq('id', tvId);
        await get().fetchData();
    }
}));
