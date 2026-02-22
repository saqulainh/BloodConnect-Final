import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, Droplet, UserCheck, ShieldCheck, Mail, ShieldAlert, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateMe } from "../../services/api";

export default function Settings() {
    const { user, login } = useAuth(); // getting logic to update global context if necessary
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

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
        }
    }, [user]);

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
        </div>
    );
}
