import React, { Suspense, lazy } from 'react';

// Lazy loading the map to prevent Leaflet from touching `window` during Vite build
const EmergencyMap = lazy(() => import('../map/EmergencyMap'));

export default function LiveMap({ setActiveTab }) {
    return (
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative z-0">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-white text-slate-400 font-bold">Initializing EIMS Command Center...</div>}>
                <EmergencyMap />
            </Suspense>
        </div>
    );
}
