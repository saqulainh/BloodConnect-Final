import React from 'react';
// import { Marker, Popup } from 'react-leaflet'; // Removed to fix build crashes
// import L from 'leaflet';
import { Droplet, AlertTriangle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RequestMarker = ({ request, onClick, components }) => {
    const { Marker, Popup, L } = components || {};
    const [icon, setIcon] = React.useState(null);

    React.useEffect(() => {
        if (typeof window !== 'undefined' && L) {
            let colorClass = 'bg-yellow-400 text-yellow-900 border-yellow-500';
            let pulseHtml = '';

            switch (request.urgencyLevel) {
                case 'medium': colorClass = 'bg-orange-500 text-white border-orange-600'; break;
                case 'high': colorClass = 'bg-red-500 text-white border-red-600'; break;
                case 'critical':
                    colorClass = 'bg-rose-700 text-white border-rose-900';
                    pulseHtml = `<div class="absolute inset-0 rounded-full border-4 border-rose-600 opacity-75 animate-ping"></div>`;
                    break;
                default: break;
            }

            const scale = Math.min(1 + ((request.units || 1) * 0.1), 1.5);
            const dimension = Math.round(36 * scale);

            const htmlString = `
                <div class="relative flex items-center justify-center shadow-xl rounded-full ${colorClass} border-[3px]" 
                     style="width: ${dimension}px; height: ${dimension}px;">
                    ${pulseHtml}
                    <svg xmlns="http://www.w3.org/2000/svg" width="${16 * scale}" height="${16 * scale}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
                </div>
            `;

            setIcon(L.divIcon({
                html: htmlString,
                className: 'custom-leaflet-icon',
                iconSize: [dimension, dimension],
                iconAnchor: [dimension / 2, dimension / 2],
                popupAnchor: [0, -dimension / 2]
            }));
        }
    }, [request.urgencyLevel, request.units, L]);

    if (!request.location || !request.location.coordinates || !icon || !Marker) return null;

    const [lng, lat] = request.location.coordinates;
    const timeAgo = request.createdAt ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true }) : 'Recently';

    return (
        <Marker
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{ click: (e) => onClick && onClick(request, e) }}
        >
            <Popup className="eims-popup min-w-[240px] rounded-2xl border-0 shadow-2xl overflow-hidden">
                <div className="bg-slate-900 text-white rounded-xl overflow-hidden flex flex-col w-full m-0 p-0 shadow-2xl">
                    <div className={`px-4 py-3 flex justify-between items-center ${request.urgencyLevel === 'critical' ? 'bg-rose-700' :
                        request.urgencyLevel === 'high' ? 'bg-red-500' : 'bg-orange-500'
                        }`}>
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                            <AlertTriangle size={14} />
                            <span>{request.urgencyLevel}</span>
                        </div>
                        <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-[10px]">EIMS: {request.urgencyScore}</span>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-red-500">{request.bloodGroup}</h3>
                            <span className="text-xs font-bold text-slate-400">{request.units} Units</span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-300">
                            <div className="flex items-center gap-2"><User size={12} className="text-slate-500" /> {request.patientName}</div>
                            <p className="text-xs text-slate-500 truncate">{request.hospital}</p>
                        </div>
                        <div className="mt-2 pt-3 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{timeAgo}</span>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-colors">Rescue</button>
                        </div>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

export default React.memo(RequestMarker);
