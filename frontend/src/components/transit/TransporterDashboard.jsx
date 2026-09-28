import React, { useState, useEffect, useCallback } from "react";
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  KeyRound,
  Phone,
  Navigation,
  RefreshCw,
  Box,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import * as api from "../../services/api";
import LiveTransitMap from "./LiveTransitMap";

export default function TransporterDashboard({ user }) {
  const [activeTransit, setActiveTransit] = useState(null);
  const [availableTransits, setAvailableTransits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states
  const [pickupOtp, setPickupOtp] = useState("");
  const [sealNumber, setSealNumber] = useState("");
  const [deliveryOtp, setDeliveryOtp] = useState("");
  const [simTemp, setSimTemp] = useState(4.0);

  const fetchTransits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active mission
      const activeRes = await api.getActiveTransit();
      if (activeRes && activeRes.transit) {
        setActiveTransit(activeRes.transit);
        setSimTemp(activeRes.transit.currentTemperature || 4.0);
      } else {
        setActiveTransit(null);
      }

      // Fetch available missions
      const availableRes = await api.getAvailableTransits();
      if (availableRes && availableRes.transits) {
        setAvailableTransits(availableRes.transits);
      }
    } catch (err) {
      console.error("Transporter fetch error:", err);
      // Auto-fallback: fetch demo if available
      setError("Unable to sync active missions. Retrying connection...");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransits();
    const interval = setInterval(fetchTransits, 15000);
    return () => clearInterval(interval);
  }, [fetchTransits]);

  // Accept a mission
  const handleAcceptMission = async (transitId) => {
    try {
      setActionLoading(true);
      setError(null);
      await api.acceptTransit(transitId);
      setSuccessMsg("Mission Accepted! Head over to the donor location.");
      await fetchTransits();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to accept transit mission");
    } finally {
      setActionLoading(false);
    }
  };

  // Verify donor pickup OTP
  const handleVerifyPickup = async (e) => {
    e.preventDefault();
    if (!pickupOtp || pickupOtp.length !== 4) {
      setError("Please enter the 4-digit Donor Pickup OTP");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const res = await api.verifyPickup(activeTransit._id, {
        otp: pickupOtp,
        sealNumber: sealNumber || `SEAL-${Math.floor(1000 + Math.random() * 9000)}`,
      });
      setSuccessMsg("Pickup Verified! Cold box locked. Drive safely to the destination hospital.");
      setActiveTransit(res.transit);
      setPickupOtp("");
      setSealNumber("");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid Pickup OTP");
    } finally {
      setActionLoading(false);
    }
  };

  // Update temperature telemetry
  const handleTempAdjust = async (newTemp) => {
    if (!activeTransit) return;
    try {
      const fixed = parseFloat(newTemp.toFixed(1));
      setSimTemp(fixed);
      await api.updateTransitLocationAndTemp(activeTransit._id, {
        temperature: fixed,
      });
    } catch (err) {
      console.warn("Temp update warn:", err);
    }
  };

  // Verify delivery OTP at hospital
  const handleVerifyDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryOtp || deliveryOtp.length !== 4) {
      setError("Please enter the 4-digit Hospital Delivery OTP");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const res = await api.verifyDelivery(activeTransit._id, {
        otp: deliveryOtp,
      });
      setSuccessMsg("Delivery Successful! Blood securely handed over to the hospital blood bank.");
      setActiveTransit(res.transit);
      setDeliveryOtp("");
      await fetchTransits();
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid Delivery OTP");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Volunteer Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Mission Status</p>
            <p className="text-lg font-bold text-white">
              {activeTransit ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Active
                </span>
              ) : (
                <span className="text-slate-400">Idle / Ready</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Cold-Chain Spec</p>
            <p className="text-lg font-bold text-sky-400">2°C – 6°C</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Compliance</p>
            <p className="text-lg font-bold text-emerald-400">100% WHO</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Courier Trust</p>
            <p className="text-lg font-bold text-amber-400">4.9 / 5.0 ⭐</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Mission Operations Card */}
      {activeTransit ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  Mission #{activeTransit._id.slice(-6).toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {activeTransit.status?.toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">
                Urgent {activeTransit.bloodGroup} Blood Unit Transit
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Dispatched at {new Date(activeTransit.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={fetchTransits}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Sync Mission
            </button>
          </div>

          {/* Workflow Interactive Step Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1: Donor Pickup Verification */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                activeTransit.status === "assigned"
                  ? "bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/30"
                  : activeTransit.status === "in_transit" || activeTransit.status === "delivered"
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : "bg-slate-900/40 border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1</span>
                {activeTransit.status === "assigned" ? (
                  <span className="text-xs font-semibold text-rose-400 animate-pulse">Action Required</span>
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                Donor Handover OTP
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Collect blood bag from donor, seal the cooler box, and input the 4-digit Donor OTP.
              </p>

              {activeTransit.status === "assigned" ? (
                <form onSubmit={handleVerifyPickup} className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Donor Pickup OTP</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 4289"
                      value={pickupOtp}
                      onChange={(e) => setPickupOtp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Cold Box Seal Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SEAL-7489"
                      value={sealNumber}
                      onChange={(e) => setSealNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-900/30 transition disabled:opacity-50"
                  >
                    {actionLoading ? "Verifying..." : "Verify Pickup & Lock Box"}
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Demo Donor OTP: <span className="font-mono text-slate-400 font-bold">4289</span>
                  </p>
                </form>
              ) : (
                <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-mono">
                  ✅ Picked up & sealed ({activeTransit.sealNumber || "SEAL-CONFIRMED"})
                </div>
              )}
            </div>

            {/* Step 2: Cold-Chain Telemetry Monitor */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                activeTransit.status === "in_transit"
                  ? "bg-sky-950/20 border-sky-500/40 ring-1 ring-sky-500/30"
                  : "bg-slate-900/40 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 2</span>
                <span className="text-xs font-semibold text-sky-400">WHO Standard</span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-sky-400" />
                Live Cold-Chain Control
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Maintain 2.0°C to 6.0°C. Medical-grade ice packs regulate the internal cooler.
              </p>

              <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <div className="text-3xl font-extrabold font-mono text-sky-400">
                  {simTemp.toFixed(1)}°C
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {simTemp >= 2.0 && simTemp <= 6.0 ? (
                    <span className="text-emerald-400 font-medium">Safe Temperature Range</span>
                  ) : (
                    <span className="text-rose-400 font-bold animate-pulse">Cold-Chain Temperature Alert!</span>
                  )}
                </div>

                {activeTransit.status === "in_transit" && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleTempAdjust(Math.max(1.5, simTemp - 0.5))}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold"
                    >
                      -0.5°C
                    </button>
                    <button
                      onClick={() => handleTempAdjust(4.0)}
                      className="px-3 py-1.5 bg-sky-900/40 hover:bg-sky-800/40 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-mono font-bold"
                    >
                      Reset 4.0°C
                    </button>
                    <button
                      onClick={() => handleTempAdjust(Math.min(7.5, simTemp + 0.5))}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold"
                    >
                      +0.5°C
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Hospital Delivery Handover */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                activeTransit.status === "in_transit"
                  ? "bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30"
                  : activeTransit.status === "delivered"
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : "bg-slate-900/40 border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 3</span>
                {activeTransit.status === "delivered" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span className="text-xs font-semibold text-amber-400">Destination</span>
                )}
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Hospital Handover OTP
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Reach {activeTransit.dropoffLocation?.hospitalName || "Hospital"}, receive delivery OTP from blood bank officer.
              </p>

              {activeTransit.status === "in_transit" ? (
                <form onSubmit={handleVerifyDelivery} className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">Hospital Delivery OTP</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 8512"
                      value={deliveryOtp}
                      onChange={(e) => setDeliveryOtp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
                  >
                    {actionLoading ? "Confirming Handover..." : "Confirm Handover & Complete"}
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Demo Hospital OTP: <span className="font-mono text-slate-400 font-bold">8512</span>
                  </p>
                </form>
              ) : activeTransit.status === "delivered" ? (
                <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-mono">
                  🎉 Completed & Handed Over successfully!
                </div>
              ) : (
                <div className="mt-4 p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-500 text-center">
                  Unlockable after Donor Pickup OTP verified
                </div>
              )}
            </div>
          </div>

          {/* Interactive Live Moving Map inside Mission */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-rose-500" />
                Live GPS Radar & Navigation Route
              </h3>
              <span className="text-xs text-slate-400">
                Transporter Console Mode
              </span>
            </div>
            <LiveTransitMap transitId={activeTransit._id} currentUserRole="transporter" />
          </div>
        </div>
      ) : (
        /* No Active Mission -> Available Missions Feed */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 border border-rose-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Ready for Dispatch
              </div>
              <h2 className="text-2xl font-bold text-white">
                Urgent Blood Courier Missions Available
              </h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Critical patients in nearby hospitals are waiting for whole blood and platelet units. Accept a transit mission to pick up from donors and deliver under cold-chain temperature control.
              </p>
            </div>
            <button
              onClick={fetchTransits}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-semibold flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Missions
            </button>
          </div>

          {/* Available Missions List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-rose-500" />
              Available Dispatch Requests ({availableTransits.length})
            </h3>

            {availableTransits.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
                <Bike className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-semibold text-slate-300">No Open Transit Missions Right Now</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  All active blood units are currently assigned or delivered. Check back shortly or tap Refresh to sync new requests.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTransits.map((item) => (
                  <div
                    key={item._id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 shadow-lg transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {item.bloodGroup} Blood Unit
                        </span>
                        <h4 className="text-base font-bold text-white mt-2">
                          {item.pickupLocation?.address || "Donor Clinic"} → {item.dropoffLocation?.hospitalName || "Hospital"}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Urgent ETA {item.estimatedMinutes || 15}m
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>Pickup: {item.pickupLocation?.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Dropoff: {item.dropoffLocation?.hospitalName} ({item.dropoffLocation?.address})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptMission(item._id)}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 transition disabled:opacity-50"
                    >
                      <span>Accept Mission</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Standard Live Transit Map for Transporter when not in a mission */}
          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white mb-3">Live Blood Transit Network Overview</h3>
            <LiveTransitMap currentUserRole="transporter" />
          </div>
        </div>
      )}
    </div>
  );
}
