import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Tent, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { getCamps, registerForCamp } from '../../services/api';

export default function BloodCamps({ currentUser }) {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(null); // stores camp id

    const fetchCamps = async () => {
        try {
            const res = await getCamps();
            if (res && res.success) {
                setCamps(res.data);
            }
        } catch (error) {
            console.error("Failed to load camps", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCamps();
    }, []);

    const handleRegister = async (camp) => {
        setRegistering(camp._id);
        try {
            await registerForCamp(camp._id);
            alert("Successfully registered for the blood camp!");
            fetchCamps(); // Refresh to update count and status
        } catch (error) {
            alert(error.message || "Failed to register for camp.");
        } finally {
            setRegistering(null);
        }
    };
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-green-200/40 relative overflow-hidden flex items-center justify-between">
                <div className="relative z-10">
                    <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-2">Upcoming Blood Camps</h2>
                    <p className="text-green-100 text-sm font-medium max-w-md">
                        Participate in community blood drives. Register for an upcoming camp near you to help save lives together.
                    </p>
                </div>
                <div className="hidden md:flex w-20 h-20 bg-white/20 rounded-full items-center justify-center backdrop-blur-sm z-10 shrink-0">
                    <Tent size={40} className="text-white" />
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            </div>

            {/* Camps List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800">Scheduled Camps</h3>
                    <button className="text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-4 py-2 rounded-lg transition-colors">
                        Suggest a Camp
                    </button>
                </div>

                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 font-medium">Loading upcoming camps...</div>
                    ) : camps.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-medium">No blood camps are currently scheduled. Check back soon!</div>
                    ) : (
                        camps.map((camp) => {
                            const isRegistered = currentUser && camp.registeredDonors?.includes(currentUser._id);

                            return (
                                <div key={camp._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">

                                    {/* Left: Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-black text-slate-800">{camp.name}</h4>
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${camp.status === 'Upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {camp.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500">Organized by {camp.organizer}</p>

                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg w-fit">
                                                <Calendar size={14} className="text-slate-400" /> {new Date(camp.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg w-fit">
                                                <Clock size={14} className="text-slate-400" /> {camp.time}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg w-fit">
                                                <MapPin size={14} className="text-slate-400" /> {camp.location}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end w-full md:w-auto justify-between gap-4">
                                        <div className="text-left md:text-right">
                                            <p className="text-2xl font-black text-green-600 leading-none">{camp.registeredDonors?.length || 0}</p>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered</p>
                                        </div>

                                        {isRegistered ? (
                                            <button disabled className="flex items-center gap-2 bg-slate-100 text-slate-500 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm cursor-not-allowed">
                                                <CheckCircle2 size={16} className="text-green-500" /> Registered
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRegister(camp)}
                                                disabled={registering === camp._id}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all shadow-green-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {registering === camp._id ? <Loader2 size={16} className="animate-spin" /> : 'Register'} <ChevronRight size={16} />
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );
                        }))}
                </div>
            </div>
        </div>
    );
}
