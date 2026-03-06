import React, { useState, useEffect, useCallback, useMemo } from 'react';
import getPusher from '../../services/pusher';
import { motion, AnimatePresence } from 'framer-motion';

import TopStatsBar from './TopStatsBar';
import RequestMarker from './RequestMarker';
import DonorMarker from './DonorMarker';
import RadiusOverlay from './RadiusOverlay';
import HeatmapToggle from './HeatmapToggle';
import TimelineSlider from './TimelineSlider';
import FilterDrawer from './FilterDrawer';
import * as api from '../../services/api';

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

const EmergencyMap = () => {
    const [LeafletComps, setLeafletComps] = useState(null);
    const [requests, setRequests] = useState([]);
    const [donors, setDonors] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [radiusStats, setRadiusStats] = useState({ donorsFound: 0 });
    const [isHeatmap, setIsHeatmap] = useState(false);
    const [timelineVal, setTimelineVal] = useState(Date.now());
    const [minTimeline] = useState(Date.now() - 24 * 60 * 60 * 1000);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const reqRes = await api.get('/map/active-requests');
                if (reqRes.data?.success) setRequests(reqRes.data.data);
                const donorRes = await api.get('/map/nearby-donors?lat=20.5937&lng=78.9629&radiusKm=3000');
                if (donorRes.data?.success) setDonors(donorRes.data.data);
            } catch (error) { console.error("EIMS Fetch Error", error); }
        };
        fetchMapData();
    }, []);

    useEffect(() => {
        const pusher = getPusher();
        const channel = pusher.subscribe('eims-live');

        channel.bind('newRequest', (newReq) => setRequests(prev => [newReq, ...prev]));
        channel.bind('requestUpdated', (upd) => setRequests(prev => prev.map(r => r._id === upd._id ? upd : r)));
        channel.bind('requestResolved', (id) => setRequests(prev => prev.filter(r => r._id !== id)));

        return () => {
            channel.unbind_all();
            pusher.unsubscribe('eims-live');
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            Promise.all([
                import(/* @vite-ignore */ 'react-leaflet'),
                import(/* @vite-ignore */ 'leaflet'),
                import(/* @vite-ignore */ 'leaflet/dist/leaflet.css')
            ]).then(([RL, Lmod]) => {
                setLeafletComps({
                    MapContainer: RL.MapContainer,
                    TileLayer: RL.TileLayer,
                    Marker: RL.Marker,
                    Popup: RL.Popup,
                    Circle: RL.Circle,
                    useMap: RL.useMap,
                    L: Lmod.default
                });
            }).catch(console.error);
        }
    }, []);

    const visibleRequests = useMemo(() => {
        return requests.filter(r => new Date(r.createdAt).getTime() <= timelineVal);
    }, [requests, timelineVal]);

    const stats = useMemo(() => {
        const critical = visibleRequests.filter(r => r.urgencyLevel === 'critical').length;
        return {
            activeRequests: visibleRequests.length,
            criticalCases: critical,
            availableDonors: donors.length,
            avgResponseTime: "14"
        };
    }, [visibleRequests, donors]);

    const handleRequestClick = useCallback((req) => {
        setSelectedRequest(req);
        const fetchRadius = async () => {
            try {
                const [lng, lat] = req.location.coordinates;
                const res = await api.get(`/map/nearby-donors?lat=${lat}&lng=${lng}&radiusKm=10`);
                if (res.data?.success) setRadiusStats({ donorsFound: res.data.count });
            } catch (err) { console.error("Radius fetch error", err); }
        };
        fetchRadius();
    }, []);

    if (!LeafletComps) {
        return <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 font-bold">Booting EIMS Intelligence...</div>;
    }

    const { MapContainer, TileLayer } = LeafletComps;

    return (
        <div className="relative w-full h-[calc(100vh-64px)] bg-slate-900 overflow-hidden">
            <TopStatsBar stats={stats} />
            <FilterDrawer onFilterChange={(f) => console.log('Filters:', f)} />

            <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="w-full h-full z-0" zoomControl={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://carto.com/">Carto</a>'
                />

                <HeatmapToggle isHeatmap={isHeatmap} onToggle={() => setIsHeatmap(!isHeatmap)} />
                <TimelineSlider minTime={minTimeline} maxTime={Date.now()} currentTime={timelineVal} onChange={setTimelineVal} />

                {!isHeatmap && (
                    <>
                        {donors.map(donor => <DonorMarker key={`donor-${donor._id}`} donor={donor} components={LeafletComps} />)}
                        {visibleRequests.map(req => <RequestMarker key={`req-${req._id}`} request={req} onClick={() => handleRequestClick(req)} components={LeafletComps} />)}
                    </>
                )}

                <AnimatePresence>
                    {selectedRequest && <RadiusOverlay request={selectedRequest} stats={radiusStats} components={LeafletComps} />}
                </AnimatePresence>
            </MapContainer>
        </div>
    );
};

export default EmergencyMap;
