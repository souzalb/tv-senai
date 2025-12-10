export type Orientation = 'landscape' | 'portrait';

export interface TV {
    id: string;
    name: string;
    location: string;
    resolution: {
        width: number;
        height: number;
    };
    orientation: Orientation;
    assignedPlaylistId: string | null;
}

export type SlideType = 'image';

export interface Slide {
    id: string;
    type: SlideType;
    url: string; // For images
    duration: number; // in seconds
    order: number;
}

export interface Playlist {
    id: string;
    name: string;
    slides: Slide[];
}
