'use client';

import { useRouter } from 'next/navigation';
import TVSelector from '@/components/TVSelector';

export default function PlayerSelectionPage() {
    const router = useRouter();

    const handleSelect = (id: string) => {
        // Optionally save to local storage for "remember me" functionality
        // but primarily navigate to the new dynamic route
        localStorage.setItem('senai-tv-id', id);
        router.push(`/player/${id}`);
    };

    return <TVSelector onSelect={handleSelect} />;
}
