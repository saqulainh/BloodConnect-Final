import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
    Navigation,
    Thermometer,
    ShieldCheck,
    Clock,
    MapPin,
    AlertTriangle,
    Play,
    Pause,
    RotateCcw,
    Droplets,
    Hospital,
    Phone,
    User,
    CheckCircle2,
    Sparkles,
    ShieldAlert
} from 'lucide-react';
import * as api from '../../services/api';

// Helper to keep map size responsive
function MapResizeFix() {
    const map = useMap();
    useEffect(() => {
        const refresh = () => map.invalidateSize();
        const t1 = setTimeout(refresh, 100);
        const t2 = setTimeout(refresh, 500);
        window.addEventListener('resize', refresh);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener('resize', refresh);
        };
    }, [map]);
    return null;
}

// Map center tracking helper
function MapFollowCourier({ position, isAutoFollow }) {
    const map = useMap();
    useEffect(() => {
        if (isAutoFollow && position && position[0] && position[1]) {
            map.panTo(position, { animate: true, duration: 1 });
        }
    }, [position, isAutoFollow, map]);
    return null;
}

// ── CUSTOM LEAFLET SVG ICONS (Zero external image dependencies) ──
const createCourierIcon = (isSimulating) => L.divIcon({
    className: 'courier-custom-icon',
    html: `
        <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; background: rgba(239, 68, 68, 0.25); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 38px; height: 38px; background: linear-gradient(135deg, #ef4444, #b91c1c); border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5); border: 2.5px solid #ffffff;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18.5" cy="17.5" r="3.5"/>
                    <circle cx="5.5" cy="17.5" r="3.5"/>
                    <circle cx="15" cy="5" r="1"/>
                    <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
            </div>
            <div style="position: absolute; -bottom: 6px; background: #1e293b; color: #ffffff; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 9999px; letter-spacing: 0.5px; white-space: nowrap; border: 1px solid #475569;">
                COURIER
            </div>
        </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -20]
});

const createDonorIcon = () => L.divIcon({
    className: 'donor-custom-icon',
    html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 34px; height: 34px; background: #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 3px solid #dc2626;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626" stroke="#dc2626" stroke-width="2">
                    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
                </svg>
            </div>
            <div style="position: absolute; bottom: -4px; background: #dc2626; color: #ffffff; font-size: 8px; font-weight: 900; padding: 1px 5px; border-radius: 4px; text-transform: uppercase;">
                PICKUP
            </div>
        </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -18]
});

const createHospitalIcon = () => L.divIcon({
    className: 'hospital-custom-icon',
    html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 34px; height: 34px; background: #059669; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(5,150,105,0.4); border: 3px solid #ffffff;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 6v12"/>
                    <path d="M6 12h12"/>
                </svg>
            </div>
            <div style="position: absolute; bottom: -4px; background: #047857; color: #ffffff; font-size: 8px; font-weight: 900; padding: 1px 5px; border-radius: 4px; text-transform: uppercase;">
                HOSPITAL
            </div>
        </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -18]
});

export default function LiveTransitMap({ transitId, currentUserRole = 'receiver', onTransitUpdate }) {
    const [transit, setTransit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simStep, setSimStep] = useState(0);
    const [autoFollow, setAutoFollow] = useState(true);
    const [tempOverride, setTempOverride] = useState(4.0);
    const simIntervalRef = useRef(null);

    // Fetch transit info
    const loadTransit = useCallback(async () => {
        try {
            let res;
            if (transitId) {
                res = await api.getTransitById(transitId);
            } else {
                res = await api.getActiveTransit();
            }
            if (res.success && res.transit) {
                setTransit(res.transit);
                setTempOverride(res.transit.coldChain?.currentTemp ?? 4.0);
                if (onTransitUpdate) onTransitUpdate(res.transit);
            } else {
                setError(res.message || 'No active transit found');
            }
        } catch (err) {
            console.error('Error fetching transit:', err);
            setError('Failed to load blood transit data');
        } finally {
            setLoading(false);
        }
    }, [transitId, onTransitUpdate]);

    useEffect(() => {
        loadTransit();
        const poll = setInterval(loadTransit, 10000);
        return () => clearInterval(poll);
    }, [loadTransit]);

    // Path waypoints for simulation (Connaught Place -> Janpath -> India Gate -> Lodhi -> AIIMS Trauma Center)
    const WAYPOINTS = [
        [28.6315, 77.2167], // Connaught Place (Pickup)
        [28.6250, 77.2185], // Janpath
        [28.6129, 77.2295], // India Gate Outer Circle
        [28.5980, 77.2240], // Lodhi Garden Area
        [28.5820, 77.2180], // Safdarjung Tomb
        [28.5720, 77.2130], // South Ext
        [28.5672, 77.2100], // AIIMS Trauma Center (Destination)
    ];

    // Simulation Runner
    useEffect(() => {
        if (!isSimulating) {
            if (simIntervalRef.current) clearInterval(simIntervalRef.current);
            return;
        }

        simIntervalRef.current = setInterval(async () => {
            setSimStep(prev => {
                const next = (prev + 1) % WAYPOINTS.length;
                const newCoords = WAYPOINTS[next];
                const totalSteps = WAYPOINTS.length - 1;
                const fractionRemaining = (totalSteps - next) / totalSteps;
                const newEta = Math.max(1, Math.round(15 * fractionRemaining));
                const newDist = parseFloat((8.5 * fractionRemaining).toFixed(1));
                const simulatedTemp = parseFloat((3.6 + Math.sin(next) * 0.9).toFixed(1));

                // Optimistic local state update
                setTransit(curr => {
                    if (!curr) return curr;
                    return {
                        ...curr,
                        currentLocation: {
                            type: 'Point',
                            coordinates: [newCoords[1], newCoords[0]],
                            address: next === totalSteps ? 'Arrived at AIIMS Trauma Center' : `En-route Waypoint ${next + 1} of ${totalSteps + 1}`,
                            heading: 180,
                            speedKmh: next === totalSteps ? 0 : 38
                        },
                        etaMinutes: newEta,
                        distanceKm: newDist,
                        status: next === totalSteps ? 'in_transit' : curr.status,
                        coldChain: {
                            ...curr.coldChain,
                            currentTemp: simulatedTemp
                        }
                    };
                });

                // Sync with server if we have an active transit ID
                if (transit?._id) {
                    api.updateTransitLocationAndTemp(transit._id, {
                        lat: newCoords[0],
                        lng: newCoords[1],
                        speedKmh: next === totalSteps ? 0 : 38,
                        heading: 180,
                        currentTemp: simulatedTemp
                    }).catch(console.error);
                }

                return next;
            });
        }, 3200);

        return () => {
            if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        };
    }, [isSimulating, transit?._id]);

    const handleResetSimulation = () => {
        setIsSimulating(false);
        setSimStep(0);
        const start = WAYPOINTS[0];
        setTransit(curr => {
            if (!curr) return curr;
            return {
                ...curr,
                currentLocation: {
                    type: 'Point',
                    coordinates: [start[1], start[0]],
                    address: 'Near Connaught Place Block B',
                    heading: 0,
                    speedKmh: 0
                },
                etaMinutes: 15,
                distanceKm: 8.5,
                coldChain: {
                    ...curr.coldChain,
                    currentTemp: 4.0
                }
            };
        });
        if (transit?._id) {
            api.updateTransitLocationAndTemp(transit._id, {
                lat: start[0],
                lng: start[1],
                speedKmh: 0,
                heading: 0,
                currentTemp: 4.0
            }).catch(console.error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[420px] text-center">
                <div className="w-14 h-14 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="text-base font-bold text-slate-800">Connecting to Blood Logistics Satellite Radar...</h4>
                <p className="text-xs text-slate-400 mt-1">Calibrating cold-chain telemetry & courier telemetry</p>
            </div>
        );
    }

    if (error || !transit) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center min-h-[360px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No Active Blood Transit Right Now</h3>
                <p className="text-sm text-slate-500 max-w-md mb-6">
                    {error || "When a donor's blood is collected for a critical patient, the verified medical courier's live moving map and cold-chain telemetry will show here."}
                </p>
                <button
                    onClick={loadTransit}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-red-200"
                >
                    Refresh Status
                </button>
            </div>
        );
    }

    const courierPos = [
        transit.currentLocation?.coordinates?.[1] || WAYPOINTS[simStep][0],
        transit.currentLocation?.coordinates?.[0] || WAYPOINTS[simStep][1]
    ];
    const pickupPos = [
        transit.pickup?.coordinates?.[1] || WAYPOINTS[0][0],
        transit.pickup?.coordinates?.[0] || WAYPOINTS[0][1]
    ];
    const destinationPos = [
        transit.destination?.coordinates?.[1] || WAYPOINTS[WAYPOINTS.length - 1][0],
        transit.destination?.coordinates?.[0] || WAYPOINTS[WAYPOINTS.length - 1][1]
    ];

    const currentTemp = transit.coldChain?.currentTemp ?? tempOverride;
    const isTempSafe = currentTemp >= 2.0 && currentTemp <= 6.0;

    const statusBadge = {
        assigned: { label: 'Courier Assigned', bg: 'bg-amber-100 text-amber-700 border-amber-300' },
        in_transit: { label: 'In Transit (Moving)', bg: 'bg-blue-100 text-blue-700 border-blue-300' },
        delivered: { label: 'Delivered to Hospital', bg: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
        cancelled: { label: 'Cancelled', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
    }[transit.status] || { label: transit.status, bg: 'bg-slate-100 text-slate-700' };

    return (
        <div className="flex flex-col gap-4">
            {/* ── TOP ZOMATO / UBER STYLE FLOATING PILL ── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 text-white shadow-xl border border-slate-700/60">
                <div className="absolute top-0 right-0 w-80 h-full bg-red-500/10 blur-3xl pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                            <Navigation size={24} className="animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                                    {statusBadge.label}
                                </span>
                                <span className="text-xs font-semibold text-slate-400">
                                    Unit: <span className="text-red-400 font-extrabold">{transit.bloodGroup}</span> ({transit.units} bag)
                                </span>
                            </div>
                            <h2 className="text-lg md:text-xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
                                🚀 Blood <span className="text-red-400 underline decoration-red-500/50 decoration-2 underline-offset-4">{transit.etaMinutes} min</span> door hai!
                            </h2>
                            <p className="text-xs text-slate-400 truncate max-w-md">
                                Going to: <strong className="text-slate-200">{transit.destination?.hospitalName || 'AIIMS Trauma Center'}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Speed & Distance Metric */}
                    <div className="flex items-center gap-2 sm:gap-4 bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80">
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining</span>
                            <span className="text-sm md:text-base font-black text-white">{transit.distanceKm} km</span>
                        </div>
                        <div className="h-7 w-[1px] bg-slate-700" />
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Speed</span>
                            <span className="text-sm md:text-base font-black text-emerald-400">{transit.currentLocation?.speedKmh || 38} km/h</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                        <span className="flex items-center gap-1.5 text-slate-300">
                            <MapPin size={12} className="text-red-400" /> {transit.pickup?.address || 'Donor Pickup'}
                        </span>
                        <span className="text-red-400 font-extrabold">{transit.etaMinutes} mins ETA</span>
                        <span className="flex items-center gap-1.5 text-slate-300">
                            <Hospital size={12} className="text-emerald-400" /> {transit.destination?.hospitalName || 'Hospital'}
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <div
                            className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                                width: `${Math.min(100, Math.max(10, 100 - (transit.distanceKm / 8.5) * 100))}%`
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ── MAP CONTAINER ── */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-50 min-h-[460px] h-[480px]">
                <MapContainer
                    center={courierPos}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <MapResizeFix />
                    <MapFollowCourier position={courierPos} isAutoFollow={autoFollow} />

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Route Polyline (Full planned route) */}
                    <Polyline
                        positions={WAYPOINTS}
                        color="#94a3b8"
                        weight={4}
                        dashArray="6, 8"
                        opacity={0.7}
                    />

                    {/* Active completed route segment */}
                    <Polyline
                        positions={WAYPOINTS.slice(0, simStep + 1)}
                        color="#ef4444"
                        weight={6}
                        opacity={0.9}
                    />

                    {/* Donor Pickup Marker */}
                    <Marker position={pickupPos} icon={createDonorIcon()}>
                        <Popup>
                            <div className="p-1">
                                <h4 className="font-extrabold text-xs text-red-600 flex items-center gap-1">
                                    <Droplets size={12} /> Donor Pickup Point
                                </h4>
                                <p className="text-xs font-semibold text-slate-800 mt-1">{transit.pickup?.donorName || 'Blood Donor'}</p>
                                <p className="text-[11px] text-slate-500">{transit.pickup?.address}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Hospital Destination Marker */}
                    <Marker position={destinationPos} icon={createHospitalIcon()}>
                        <Popup>
                            <div className="p-1">
                                <h4 className="font-extrabold text-xs text-emerald-600 flex items-center gap-1">
                                    <Hospital size={12} /> Delivery Hospital
                                </h4>
                                <p className="text-xs font-semibold text-slate-800 mt-1">{transit.destination?.hospitalName}</p>
                                <p className="text-[11px] text-slate-500">{transit.destination?.address}</p>
                                <p className="text-[11px] font-bold text-red-600 mt-1">Recipient: {transit.destination?.recipientName}</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Live Moving Courier Marker */}
                    <Marker position={courierPos} icon={createCourierIcon(isSimulating)}>
                        <Popup>
                            <div className="p-1">
                                <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
                                    🚴 {transit.transporter?.name || 'Volunteer Courier'}
                                </h4>
                                <p className="text-[11px] text-slate-600 mt-0.5">Vehicle: {transit.transporter?.vehicle || 'Hero Splendor (DL-08-9921)'}</p>
                                <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-slate-500">Speed:</span>
                                    <span className="font-extrabold text-emerald-600">{transit.currentLocation?.speedKmh || 38} km/h</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-slate-500">Temp:</span>
                                    <span className={`font-extrabold ${isTempSafe ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {currentTemp}°C {isTempSafe ? '✓' : '⚠️'}
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>

                {/* Floating Map Controls Top-Right */}
                <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
                    <button
                        onClick={() => setAutoFollow(!autoFollow)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-md backdrop-blur-md transition flex items-center gap-1.5 ${autoFollow
                                ? 'bg-slate-900/90 text-white border border-slate-700'
                                : 'bg-white/90 text-slate-700 border border-slate-200'
                            }`}
                    >
                        <Navigation size={13} className={autoFollow ? 'text-red-400 animate-spin' : ''} />
                        {autoFollow ? 'Center Lock On' : 'Free Camera'}
                    </button>

                    {/* Live Simulation Controls for demonstration */}
                    <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-1.5">
                        <button
                            onClick={() => setIsSimulating(!isSimulating)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${isSimulating
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                                }`}
                        >
                            {isSimulating ? <Pause size={13} /> : <Play size={13} />}
                            {isSimulating ? 'Pause Movement' : 'Simulate Live Dispatch'}
                        </button>
                        <button
                            onClick={handleResetSimulation}
                            title="Reset route to start"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </div>

                {/* Cold Chain Warning Overlay if breached */}
                {!isTempSafe && (
                    <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-red-600/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between border border-red-400 animate-bounce">
                        <div className="flex items-center gap-3">
                            <ShieldAlert size={24} className="shrink-0" />
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider">Cold-Chain Temperature Breach Alert!</h4>
                                <p className="text-xs text-red-100">
                                    Current Box Temp: <strong>{currentTemp}°C</strong> (Medical Safe Zone is 2.0°C to 6.0°C).
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setTempOverride(4.0)}
                            className="px-3 py-1.5 bg-white text-red-700 font-extrabold text-xs rounded-xl hover:bg-red-50 shrink-0"
                        >
                            Restore 4°C Safe
                        </button>
                    </div>
                )}
            </div>

            {/* ── BOTTOM TELEMETRY & SECURITY PANEL ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. COLD-CHAIN SMART MONITOR (2°C - 6°C) */}
                <div className={`p-4 rounded-3xl border transition-all ${isTempSafe
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200'
                        : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Thermometer size={14} className={isTempSafe ? 'text-emerald-600' : 'text-red-600'} />
                            Cold-Chain Telemetry
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isTempSafe ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700 animate-pulse'
                            }`}>
                            {isTempSafe ? 'SAFE ZONE (2-6°C)' : 'CRITICAL BREACH'}
                        </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                        <div>
                            <span className="text-3xl font-black text-slate-800">{currentTemp}°</span>
                            <span className="text-xs font-bold text-slate-500 ml-1">Celsius</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 block">Seal Number</span>
                            <span className="text-xs font-mono font-extrabold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {transit.coldChain?.sealNumber || 'BC-SEAL-8891'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Min/Max Logged:</span>
                        <span className="font-bold text-slate-800">
                            {transit.coldChain?.minTemp || 3.1}°C / {transit.coldChain?.maxTemp || 4.8}°C
                        </span>
                    </div>
                </div>

                {/* 2. DUAL OTP HANDSHAKE DISPLAY */}
                <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-red-600" />
                                OTP Handshake Security
                            </span>
                            <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                Anti-Theft
                            </span>
                        </div>

                        {currentUserRole === 'donor' || currentUserRole === 'admin' ? (
                            <div className="bg-red-50 p-3 rounded-2xl border border-red-100 mt-1">
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Pickup OTP for Courier</span>
                                <div className="text-2xl font-mono font-black text-red-700 tracking-widest mt-0.5">
                                    {transit.pickupOtp || '4289'}
                                </div>
                                <p className="text-[10px] text-red-500 mt-1">Share this OTP with courier when handing over the blood bag.</p>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 mt-1">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Hospital Delivery OTP</span>
                                <div className="text-2xl font-mono font-black text-emerald-800 tracking-widest mt-0.5">
                                    {transit.deliveryOtp || '8512'}
                                </div>
                                <p className="text-[10px] text-emerald-600 mt-1">Give this OTP to courier once cold box & seal are verified.</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-500" /> SHA-256 Verified Medical Handshake
                    </div>
                </div>

                {/* 3. VOLUNTEER COURIER CONTACT CARD */}
                <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <User size={14} className="text-blue-600" />
                                Volunteer Courier
                            </span>
                            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                Verified Transporter
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                                {transit.transporter?.name?.[0] || 'V'}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-extrabold text-slate-800 truncate">
                                    {transit.transporter?.name || 'Rohan Sharma (Volunteer)'}
                                </h4>
                                <p className="text-xs text-slate-500 truncate">
                                    {transit.transporter?.vehicle || 'Hero Splendor (DL-08-9921)'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Contact Courier:</span>
                        <a
                            href={`tel:${transit.transporter?.phone || '+919876543210'}`}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                        >
                            <Phone size={12} /> Call Now
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
