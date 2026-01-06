'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function SharedPlanPage() {
    const { shareToken } = useParams();

    useEffect(() => {
        const userAgent = navigator.userAgent || '';

        const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

        if (!isIOS) return;

        const appStoreUrl =
            'https://apps.apple.com/app/id6751006510?pt=128059857&ct=shared_plan_redirect&mt=8';

        const timeout = setTimeout(() => {
            window.location.href = appStoreUrl;
        }, 800);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div style={{ padding: 24, textAlign: 'center' }}>
            <h3>Opening PlaPlan…</h3>
            <p>If nothing happens, you’ll be redirected.</p>
        </div>
    );
}