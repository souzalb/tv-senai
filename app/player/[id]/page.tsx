'use client';

import { useParams } from 'next/navigation';
import PlayerView from '@/components/PlayerView';

export default function TVPage() {
    const params = useParams();
    // Ensure we handle the possibility of id being an array (though unlikely in this config)
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    if (!id) return null;

    return (
        <PlayerView
            tvId={id}
            // User can use browser back button, but we can also provide a reset action if strictly needed.
            // For now, no explicit reset callback needed or it can redirect to /player
            onReset={() => window.location.href = '/player'}
        />
    );
}
