import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';
import { getAllRequests, getDonors } from '../../services/api';
import { MapPin, UserSquare2, Phone, Droplet, Filter, MessageSquare, X, Heart } from 'lucide-react';

// Custom icons using Leaflet DivIcon
const getRequestIcon = (urgency) => {
    const isUrgent = urgency === 'high' || urgency === 'critical';
    const pulseClass = urgency === 'critical' ? 'critical-pulse' : 'high-pulse';

    return new L.DivIcon({
        html: `<div class="pulse-marker ${isUrgent ? pulseClass : ''}" style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

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
    const [filter, setFilter] = useState("All");
    const [showFilters, setShowFilters] = useState(false);

    const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

    const defaultCenter = [20.5937, 78.9629]; // India central approx
    const defaultZoom = 5;

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

    useEffect(() => {
        fetchMapData();
    }, []);

    const filteredRequests = filter === "All" ? requests : requests.filter(r => r.bloodGroup === filter);
    const filteredDonors = filter === "All" ? donors : donors.filter(d => d.bloodGroup === filter);

    if (loading) {
        return <div className="w-full h-96 bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 font-medium">Loading Map Data...</div>;
    }

    return (
        <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative z-0">
            {/* Legend/Status Overlay */}
            <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{requests.length} Requests Live</span>
                </div>
            </div>

            {/* Floating Filter Button */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute top-4 right-4 z-[400] bg-white text-slate-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-slate-100 hover:bg-slate-50 transition-all"
            >
                {showFilters ? <X size={18} /> : <Filter size={18} />}
            </button>

            {/* Filter Panel */}
            {showFilters && (
                <div className="absolute top-16 right-4 z-[400] bg-white/95 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-slate-100 w-48 map-filter-panel">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Blood Group</p>
                    <div className="grid grid-cols-3 gap-2">
                        {BLOOD_GROUPS.map(bg => (
                            <button
                                key={bg}
                                onClick={() => setFilter(bg)}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filter === bg ? 'bg-red-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                                {bg}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {/* Render Requests */}
                {filteredRequests.map((req) => {
                    if (req.location && req.location.coordinates) {
                        const [lng, lat] = req.location.coordinates;
                        if (lat && lng) {
                            return (
                                <Marker key={`req-${req._id}`} position={[lat, lng]} icon={getRequestIcon(req.urgency)}>
                                    <Popup className="rounded-2xl">
                                        <div className="p-1 min-w-[180px]">
                                            <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-xs font-black shadow-sm">{req.bloodGroup}</span>
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${req.urgency === 'critical' ? 'text-red-600' : 'text-slate-400'}`}>
                                                        {req.urgency}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-sm mb-1">{req.patientName}</h3>
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                                                <MapPin size={12} className="text-red-500" /> {req.hospital}
                                            </p>
                                            <button
                                                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-200"
                                            >
                                                <Heart size={12} /> Contact Now
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        }
                    }
                    return null;
                })}

                {/* Render Donors */}
                {filteredDonors.map((donor) => {
                    if (donor.location && donor.location.coordinates) {
                        const [lng, lat] = donor.location.coordinates;
                        if (lat && lng) {
                            return (
                                <Marker key={`donor-${donor._id}`} position={[lat, lng]} icon={donorIcon}>
                                    <Popup className="rounded-2xl">
                                        <div className="p-1 min-w-[160px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <Droplet size={14} className="fill-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">{donor.name}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600">{donor.bloodGroup} Donor</p>
                                                </div>
                                            </div>
                                            <button
                                                className="w-full bg-slate-900 hover:bg-black text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <MessageSquare size={12} /> Secure Message
                                            </button>
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
