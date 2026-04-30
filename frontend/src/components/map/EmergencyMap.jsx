import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import getPusher from '../../services/pusher';
import { AnimatePresence } from 'framer-motion';

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

// Leaflet components object for passing to child components
const LeafletComps = {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    useMap,
    L
};

function MapResizeFix() {
    const map = useMap();

    useEffect(() => {
        const refresh = () => map.invalidateSize();
        const timerA = setTimeout(refresh, 80);
        const timerB = setTimeout(refresh, 350);
        window.addEventListener('resize', refresh);

        return () => {
            clearTimeout(timerA);
            clearTimeout(timerB);
            window.removeEventListener('resize', refresh);
        };
    }, [map]);

    return null;
}

const EmergencyMap = () => {
    const [requests, setRequests] = useState([]);
    const [donors, setDonors] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [radiusStats, setRadiusStats] = useState({ donorsFound: 0 });
    const [isHeatmap, setIsHeatmap] = useState(false);
    const [nowTs, setNowTs] = useState(() => Date.now());
    const [timelineVal, setTimelineVal] = useState(() => Date.now());
    const minTimeline = nowTs - 24 * 60 * 60 * 1000;

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const reqRes = await api.apiFetch('/map/active-requests');
                if (reqRes?.success) setRequests(reqRes.data);
                const donorRes = await api.apiFetch('/map/nearby-donors?lat=20.5937&lng=78.9629&radiusKm=3000');
                if (donorRes?.success) setDonors(donorRes.data);
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
        const timer = setInterval(() => setNowTs(Date.now()), 60 * 1000);
        return () => clearInterval(timer);
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
                const res = await api.apiFetch(`/map/nearby-donors?lat=${lat}&lng=${lng}&radiusKm=10`);
                if (res?.success) setRadiusStats({ donorsFound: res.count || res.data?.length || 0 });
            } catch (err) { console.error("Radius fetch error", err); }
        };
        fetchRadius();
    }, []);

    return (
        <div className="relative w-full h-[calc(100vh-64px)] bg-white overflow-hidden">
            <TopStatsBar stats={stats} />
            <FilterDrawer onFilterChange={(f) => console.log('Filters:', f)} />

            <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="w-full h-full z-0" zoomControl={false}>
                <MapResizeFix />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <HeatmapToggle isHeatmap={isHeatmap} onToggle={() => setIsHeatmap(!isHeatmap)} />
                <TimelineSlider minTime={minTimeline} maxTime={nowTs} currentTime={timelineVal} onChange={setTimelineVal} />

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
