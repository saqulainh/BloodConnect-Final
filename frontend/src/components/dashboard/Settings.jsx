import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, Droplet, UserCheck, ShieldCheck, Mail, ShieldAlert, Settings as SettingsIcon, Award, History, Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateMe, getMyDonations } from "../../services/api";

export default function Settings() {
    const { user, login } = useAuth(); // getting logic to update global context if necessary
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const [donationsData, setDonationsData] = useState({ records: [], totalDonations: 0, totalUnits: 0 });

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        bloodGroup: "",
        address: "",
        availability: true,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                bloodGroup: user.bloodGroup || "",
                address: user.address || "",
                availability: user.availability ?? true,
            });

            // Fetch donation history
            const fetchDonations = async () => {
                try {
                    const res = await getMyDonations();
                    if (res && res.success) {
                        setDonationsData(res.data);
                    }
                } catch (err) {
                    console.error("Failed to load donations", err);
                }
            };
            fetchDonations();
        }
    }, [user]);

    const getBadgeStyle = (count) => {
        if (count >= 50) return { title: "Platinum Lifesaver", color: "bg-slate-800 text-slate-100", ring: "ring-slate-500", icon: "💍" };
        if (count >= 25) return { title: "Gold Lifesaver", color: "bg-yellow-100 text-yellow-800", ring: "ring-yellow-400", icon: "🏆" };
        if (count >= 10) return { title: "Silver Lifesaver", color: "bg-slate-200 text-slate-700", ring: "ring-slate-400", icon: "🥈" };
        if (count >= 5) return { title: "Bronze Lifesaver", color: "bg-orange-100 text-orange-800", ring: "ring-orange-400", icon: "🥉" };
        if (count >= 1) return { title: "Hero Donor", color: "bg-red-100 text-red-800", ring: "ring-red-300", icon: "🦸" };
        return { title: "Pending First Donation", color: "bg-slate-50 text-slate-500", ring: "ring-slate-200", icon: "🌱" };
    };

    const currentBadge = getBadgeStyle(donationsData.totalDonations);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);

        try {
            const response = await updateMe(formData);
            if (response.success && response.data) {
                setSuccessMsg("Profile updated successfully!");
                // Force AuthContext to refresh user data using local storage update (or reload)
                localStorage.setItem("user", JSON.stringify(response.data));
                window.location.reload(); // Simple way to sync avatar/name globally
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="relative group shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-slate-300">{user?.name?.charAt(0) || 'U'}</span>
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800">{user?.name || "User"}</h2>
                    <p className="text-slate-500 font-medium">{user?.email}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold ring-1 ring-inset ring-red-100">
                            <Droplet size={14} /> {user?.bloodGroup || 'Not set'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-bold ring-1 ring-inset ring-slate-200 capitalize">
                            <ShieldCheck size={14} /> {user?.role || 'Donor'}
                        </span>
                        {user?.aadhaarVerified && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold ring-1 ring-inset ring-emerald-100">
                                <UserCheck size={14} /> Verified Profile
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-red-500" />
                    Personal Information
                </h3>

                {successMsg && (
                    <div className="mb-6 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl text-sm font-medium border border-emerald-100">
                        {successMsg}
                    </div>
                )}

                {errorMsg && (
                    <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
                        {errorMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Phone size={18} />
                            </div>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Blood Group</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Droplet size={18} />
                            </div>
                            <select
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors appearance-none"
                            >
                                <option value="">Select Group</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                    <option key={bg} value={bg}>{bg}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Address / Location</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <MapPin size={18} />
                            </div>
                            <input
                                type="text"
                                name="address"
                                placeholder="Your city or area"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <label className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-200 transition-colors">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                name="availability"
                                checked={formData.availability}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Available to Donate</p>
                            <p className="text-xs text-slate-500 font-medium">Turn this on to appear in search results for urgent blood requests.</p>
                        </div>
                    </label>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-500/20 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>

            {/* ── Donation History & Badges ── */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 mt-6 overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <History className="w-6 h-6 text-red-500" />
                        My Donation Journey
                    </h3>
                    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl ring-1 ${currentBadge.ring} ${currentBadge.color} shadow-sm transition-transform hover:scale-105 duration-300 cursor-default`}>
                        <span className="text-2xl">{currentBadge.icon}</span>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-extrabold opacity-75">Current Tier</p>
                            <p className="font-black leading-tight text-sm">{currentBadge.title}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-red-50/50 p-4 rounded-2xl border border-red-50 text-center">
                        <p className="text-3xl font-black text-red-600 leading-none">{donationsData.totalDonations}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Total Donations</p>
                    </div>
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-50 text-center">
                        <p className="text-3xl font-black text-blue-600 leading-none">{donationsData.totalUnits}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Units Donated</p>
                    </div>
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50 text-center col-span-2 flex items-center justify-center gap-3">
                        <Heart className="w-8 h-8 text-emerald-500 animate-pulse" fill="currentColor" />
                        <div className="text-left">
                            <p className="text-xl font-black text-emerald-700 leading-none">{donationsData.totalDonations * 3}</p>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mt-1">Potential Lives Saved</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Donation Timeline</h4>
                    {donationsData.records.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                            <p className="text-slate-500 font-medium text-sm">You haven't logged any donations yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Your journey as a lifesaver starts now!</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-red-100 ml-4 space-y-6 pb-4">
                            {donationsData.records.map((record, index) => (
                                <div key={record._id || index} className="relative pl-6">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-red-500 shadow-sm" />
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-red-200 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                            <h5 className="font-bold text-slate-800">{record.hospital}</h5>
                                            <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 whitespace-nowrap">
                                                {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium">Donated <span className="font-bold text-slate-800">{record.units} unit(s)</span> for patient <strong>{record.patientName}</strong></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
