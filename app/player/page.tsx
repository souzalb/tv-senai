'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TVSelector from '@/components/TVSelector';
import PlayerView from '@/components/PlayerView';

export default function PlayerPage() {
    const [tvId, setTvId] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Check LocalStorage for existing session
        const storedId = localStorage.getItem('senai-tv-id');
        if (storedId) {
            setTvId(storedId);
        }
    }, []);

    const handleSelect = (id: string) => {
        localStorage.setItem('senai-tv-id', id);
        setTvId(id);
    };

    const handleReset = () => {
        if (confirm('Reset TV config?')) {
            localStorage.removeItem('senai-tv-id');
            setTvId(null);
        }
    };

    if (!isClient) return null; // Hydration fix

    return (
        <>
            {tvId ? (
                <>
                    <PlayerView tvId={tvId} />
                    {/* Hidden interaction to reset */}
                    <button
                        onClick={handleReset}
                        className="fixed top-0 left-0 w-4 h-4 opacity-0 z-50 hover:cursor-default"
                        title="Double click top-left to reset"
                    />
                </>
            ) : (
                <TVSelector onSelect={handleSelect} />
            )}
        </>
    );
}
