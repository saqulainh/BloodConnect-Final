import React, { useEffect } from 'react';
// import { Circle, useMap, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';

const RadiusOverlay = ({ request, stats, components }) => {
    const { Circle, Popup, useMap } = components || {};
    const map = useMap ? useMap() : null;

    useEffect(() => {
        if (request?.location?.coordinates && map) {
            const [lng, lat] = request.location.coordinates;
            map.flyTo([lat, lng], 13, { duration: 1.5 });
        }
    }, [request, map]);

    if (!request?.location?.coordinates || !Circle) return null;
    const [lng, lat] = request.location.coordinates;

    const fillOptions = {
        fillColor: '#ef4444',
        fillOpacity: 0.1,
        weight: 1,
        color: '#ef4444',
        dashArray: '5, 10'
    };

    return (
        <>
            <Circle center={[lat, lng]} radius={5000} pathOptions={fillOptions} />
            <Circle center={[lat, lng]} radius={100} pathOptions={{ fillOpacity: 0.8, color: '#ef4444' }}>
                <Popup className="radius-popup" closeButton={false}>
                    <div className="p-2 bg-slate-900 text-white rounded-lg shadow-2xl border border-red-500/30">
                        <p className="text-[10px] font-black uppercase text-red-500 mb-1">Impact Analysis</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black">{stats?.donorsFound || 0}</span>
                            <span className="text-xs font-bold text-slate-400">Donors within 5km</span>
                        </div>
                    </div>
                </Popup>
            </Circle>
        </>
    );
};

export default RadiusOverlay;
