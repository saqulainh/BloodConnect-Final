import React from 'react';
// import { Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
import { Droplet, User } from 'lucide-react';

const DonorMarker = ({ donor, components }) => {
    const { Marker, Popup, L } = components || {};
    const [icon, setIcon] = React.useState(null);

    React.useEffect(() => {
        if (typeof window !== 'undefined' && L) {
            let color = donor.eligibilityStatus === 'eligible' ? '#22c55e' : '#f59e0b';

            const htmlString = `
                <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white/20 transform transition-all hover:scale-125" 
                     style="background-color: ${color};">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    ${donor.isOnline ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-ping"></div>' : ''}
                </div>
            `;

            setIcon(L.divIcon({
                html: htmlString,
                className: 'custom-donor-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16]
            }));
        }
    }, [donor.eligibilityStatus, donor.isOnline, L]);

    if (!donor.location || !donor.location.coordinates || !icon || !Marker) return null;
    const [lng, lat] = donor.location.coordinates;

    return (
        <Marker position={[lat, lng]} icon={icon}>
            <Popup className="eims-popup rounded-2xl overflow-hidden border-0">
                <div className="p-4 bg-white text-slate-800 min-w-[160px] flex flex-col gap-2 shadow-xl border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                            <Droplet size={14} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white">{donor.bloodGroup}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-tight ${donor.eligibilityStatus === 'eligible' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {donor.eligibilityStatus}
                            </p>
                        </div>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500">Donor: {donor.name}</p>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors mt-1">Message</button>
                </div>
            </Popup>
        </Marker>
    );
};

export default React.memo(DonorMarker);
