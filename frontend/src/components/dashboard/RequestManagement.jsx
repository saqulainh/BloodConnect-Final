import React, { useState, useEffect } from 'react';
import {
    MapPin,
    ChevronRight,
    X,
    AlertCircle,
    Loader2,
    MessageCircle,
    Edit,
    Trash2,
    Maximize2
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { BloodGroupLogo, BloodGroupSelector } from '../ui/BloodGroup';
import { createBloodRequest, getCurrentLocation, getAllRequests, updateBloodRequest, deleteBloodRequest } from '../../services/api';

const RequestBloodForm = ({ onClose, initialData = null }) => {
    const [form, setForm] = useState({
        patientName: initialData?.patientName || '',
        age: initialData?.age || '',
        bloodGroup: initialData?.bloodGroup || '',
        hospitalName: initialData?.hospital || '',
        units: initialData?.units || 1,
        urgency: initialData?.urgency || 'Normal',
        contactNumber: initialData?.contactNumber || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.bloodGroup) { setError("Please select a blood group"); return; }

        setLoading(true);
        setError('');
        try {
            let loc = { lat: 0, lng: 0 };
            if (!initialData) {
                loc = await getCurrentLocation().catch(() => ({ lat: 0, lng: 0 }));
            }

            const payload = {
                ...form,
                hospital: form.hospitalName,
                lat: loc.lat, // lat/lng usually only set on creation for MVP
                lng: loc.lng
            };

            if (initialData && initialData._id) {
                await updateBloodRequest(initialData._id, payload);
                alert("Request updated successfully!");
            } else {
                await createBloodRequest(payload);
                alert("Request created successfully!");
            }
            onClose();
        } catch (err) {
            setError(err.message || "Failed to process request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <AlertCircle className="text-red-600" /> {initialData ? 'Edit Blood Request' : 'New Blood Request'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Group Required</label>
                        <BloodGroupSelector selected={form.bloodGroup} onChange={(g) => setForm({ ...form, bloodGroup: g })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Patient Name</label>
                            <input type="text" required className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Age</label>
                            <input type="number" required className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Hospital Name</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input type="text" required className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 pl-10 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.hospitalName} onChange={e => setForm({ ...form, hospitalName: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Units Required</label>
                            <input type="number" min="1" required className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Urgency</label>
                            <select className="w-full bg-slate-50 border-none rounded-lg font-bold text-slate-800 p-3 focus:ring-2 focus:ring-red-100 outline-none"
                                value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                                <option>Normal</option>
                                <option>Urgent</option>
                                <option>Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : (initialData ? 'Update Request' : 'Create Request')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RequestDetailsModal = ({ request, onClose, onStartChat, currentUser }) => {
    if (!request) return null;
    const isMyRequest = currentUser && request.requester && request.requester._id === currentUser._id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <AlertCircle className="text-red-600" /> Request Details
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <BloodGroupLogo group={request.bloodGroup} size="lg" />
                        <div>
                            <h4 className="text-2xl font-black text-slate-800">{request.patientName}</h4>
                            <StatusBadge status={request.status} />
                        </div>
                    </div>

                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hospital Location</p>
                            <p className="font-bold text-slate-700 flex items-center gap-2">
                                <MapPin size={16} className="text-red-500" /> {request.hospital}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Units Required</p>
                                <p className="font-bold text-slate-700">{request.units} Units</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Urgency</p>
                                <p className={`font-bold ${request.urgency === 'Critical' ? 'text-red-600' : 'text-slate-700'}`}>{request.urgency}</p>
                            </div>
                        </div>
                    </div>

                    {!isMyRequest && request.requester && (
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requester Contact</p>
                            <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl">
                                <div>
                                    <p className="font-bold text-slate-800">{request.requester.name}</p>
                                    <p className="text-sm font-medium text-slate-500">{request.requester.phone}</p>
                                </div>
                                <button
                                    onClick={() => { onClose(); onStartChat && onStartChat(request.requester); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors"
                                >
                                    <MessageCircle size={16} /> Message
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RequestManagement = ({ onStartChat, currentUser }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    const [viewingRequest, setViewingRequest] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await getAllRequests();
            if (res && res.success) {
                setRequests(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blood request?")) return;
        try {
            await deleteBloodRequest(id);
            fetchRequests();
        } catch (error) {
            console.error("Failed to delete request", error);
            alert("Delete failed: " + error.message);
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRequest(null);
        fetchRequests(); // refresh list
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 text-lg">Active Requests</h2>
                <button onClick={() => setIsFormOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 transition-colors">
                    New Request
                </button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-8 text-slate-400 font-medium">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-medium">No active blood requests found.</div>
                ) : (
                    requests.map((req) => {
                        const isMyRequest = currentUser && req.requester && req.requester._id === currentUser._id;
                        return (
                            <div key={req._id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:shadow-md border-l-4 border-l-red-500">
                                <div className="flex items-center gap-4 w-full md:w-auto cursor-pointer flex-1" onClick={() => setViewingRequest(req)}>
                                    <BloodGroupLogo group={req.bloodGroup} size="md" />
                                    <div>
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            {req.patientName} <span className="text-xs text-slate-500 font-normal">({req.units} Units)</span>
                                            <Maximize2 size={12} className="text-slate-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                                            <MapPin size={12} /> {req.hospital}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full md:w-auto gap-6 cursor-default">
                                    <div className="text-center md:text-left cursor-pointer" onClick={() => setViewingRequest(req)}>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Urgency</p>
                                        <p className={`text-sm font-bold ${req.urgency === 'Critical' ? 'text-red-600' : 'text-slate-700'}`}>{req.urgency}</p>
                                    </div>
                                    <div className="cursor-pointer" onClick={() => setViewingRequest(req)}>
                                        <StatusBadge status={req.status} />
                                    </div>

                                    {/* Contact Action */}
                                    {!isMyRequest && req.requester ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onStartChat && onStartChat(req.requester); }}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold border border-red-100"
                                            title="Contact Patient Family"
                                        >
                                            <MessageCircle size={16} /> Contact
                                        </button>
                                    ) : isMyRequest ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingRequest(req); }}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-100"
                                                title="Edit Request"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(req._id); }}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                                                title="Delete Request"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    }))}
            </div>

            {(isFormOpen || editingRequest) && (
                <RequestBloodForm
                    initialData={editingRequest}
                    onClose={handleFormClose}
                />
            )}
            {viewingRequest && (
                <RequestDetailsModal
                    request={viewingRequest}
                    onClose={() => setViewingRequest(null)}
                    onStartChat={onStartChat}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default RequestManagement;
