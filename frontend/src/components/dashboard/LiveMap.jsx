import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllRequests, getDonors } from '../../services/api';
import { MapPin, UserSquare2, Phone, Droplet } from 'lucide-react';

// Custom icons using Leaflet DivIcon
const requestIcon = new L.DivIcon({
    html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const donorIcon = new L.DivIcon({
    html: `<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

export default function LiveMap() {
    const [requests, setRequests] = useState([]);
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);

    const defaultCenter = [20.5937, 78.9629]; // India central approx
    const defaultZoom = 5;

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const reqRes = await getAllRequests();
                const donRes = await getDonors({});

                if (reqRes && reqRes.success) setRequests(reqRes.data);
                if (donRes && donRes.success) setDonors(donRes.data);
            } catch (err) {
                console.error("Failed to fetch map data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMapData();
    }, []);

    if (loading) {
        return <div className="w-full h-96 bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 font-medium">Loading Map Data...</div>;
    }

    return (
        <div className="w-full h-96 rounded-3xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
            <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {/* Render Requests */}
                {requests.map((req) => {
                    if (req.location && req.location.coordinates) {
                        const [lng, lat] = req.location.coordinates;
                        if (lat && lng) {
                            return (
                                <Marker key={`req-${req._id}`} position={[lat, lng]} icon={requestIcon}>
                                    <Popup className="rounded-xl">
                                        <div className="p-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-xs font-black">{req.bloodGroup}</span>
                                                <span className="text-xs font-bold text-slate-500 uppercase">{req.urgency}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-sm mb-1">{req.patientName}</h3>
                                            <p className="text-xs text-slate-600 flex items-center gap-1"><MapPin size={12} /> {req.hospital}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        }
                    }
                    return null;
                })}

                {/* Render Donors */}
                {donors.map((donor) => {
                    // Let's assume donors might not have precise coordinates yet, or maybe they do?
                    // Currently user model doesn't explicitly store coordinates, only string address.
                    // For the sake of the map, if we had coordinates we would render them here.
                    // If we don't, we can add a fake jitter to a central point just to show mock donor distribution,
                    // or skip if no coords. Let's assume standard coords don't exist yet unless specifically mocked.
                    if (donor.location && donor.location.coordinates) {
                        const [lng, lat] = donor.location.coordinates;
                        if (lat && lng) {
                            return (
                                <Marker key={`donor-${donor._id}`} position={[lat, lng]} icon={donorIcon}>
                                    <Popup className="rounded-xl">
                                        <div className="p-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Droplet size={14} className="text-red-500" />
                                                <span className="font-black text-slate-800">{donor.bloodGroup}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-700">{donor.name}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        }
                    }
                    return null;
                })}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-100 space-y-2 z-[400] text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm"></div>
                    Urgent Requests
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm"></div>
                    Available Donors
                </div>
            </div>
        </div>
    );
}
