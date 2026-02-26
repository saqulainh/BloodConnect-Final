import React, { useState } from "react";
import { X, Heart, ShieldCheck, CreditCard, Loader2, Download, CheckCircle2, User, Mail, Phone } from "lucide-react";
import { createOrder, verifyPayment } from "../../services/api";

const BASE_URL = import.meta.env.DEV ? "" : "https://bloodconnect-vert.vercel.app";

const DonateModal = ({ closeModal }) => {
    const [loading, setLoading] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(500);
    const [customAmount, setCustomAmount] = useState("");
    const [step, setStep] = useState("form"); // "form" | "success"
    const [successData, setSuccessData] = useState(null);

    // Donor info for receipt
    const [donorName, setDonorName] = useState("");
    const [donorEmail, setDonorEmail] = useState("");
    const [donorPhone, setDonorPhone] = useState("");

    const loadScript = (src) =>
        new Promise((resolve) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const getFinalAmount = () => {
        if (customAmount && Number(customAmount) >= 10) return Number(customAmount);
        return selectedAmount;
    };

    const handleDonate = async () => {
        const amount = getFinalAmount();
        if (amount < 10) return alert("Minimum donation is ₹10");
        if (!donorName.trim()) return alert("Please enter your name for the receipt.");

        setLoading(true);
        try {
            const isLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!isLoaded) {
                alert("Razorpay SDK failed to load. Are you online?");
                setLoading(false);
                return;
            }

            const res = await createOrder(amount, donorName, donorEmail, donorPhone);
            if (!res || !res.success) throw new Error(res?.message || "Failed to create order");

            const order = res.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_placeholder",
                amount: order.amount,
                currency: order.currency,
                name: "BloodConnect",
                description: "Support our mission to save lives",
                image: "https://cdn-icons-png.flaticon.com/512/803/803741.png",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyRes && verifyRes.success) {
                            setSuccessData({
                                orderId: response.razorpay_order_id,
                                receiptNumber: verifyRes.data?.receiptNumber,
                                amount,
                            });
                            setStep("success");
                        } else {
                            alert("Verification failed: " + (verifyRes?.message || "Unknown error"));
                        }
                    } catch (err) {
                        alert("Error during verification: " + err.message);
                    }
                },
                prefill: { name: donorName, email: donorEmail, contact: donorPhone },
                notes: { address: "BloodConnect Platform" },
                theme: { color: "#DC2626" },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Donation Error:", error);
            alert("Something went wrong: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = () => {
        if (!successData?.orderId) return;
        const token = localStorage.getItem("accessToken");
        window.open(`${BASE_URL}/api/v1/payment/${successData.orderId}/receipt?token=${token}`, "_blank");
    };

    /* ─── SUCCESS SCREEN ────────────────────────────────────────── */
    if (step === "success") {
        return (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeModal} />
                <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center p-10">
                    {/* Confetti-like red glow */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-400 via-red-600 to-red-400" />

                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                        <CheckCircle2 size={44} className="text-emerald-500" strokeWidth={1.5} />
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 mb-1">Thank You! ❤️</h2>
                    <p className="text-sm text-slate-500 text-center mb-6">
                        Your donation of <span className="font-bold text-slate-700">₹{successData?.amount?.toLocaleString("en-IN")}</span> was
                        successful. You're helping save lives across India.
                    </p>

                    {successData?.receiptNumber && (
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 mb-6 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Receipt Number</p>
                            <p className="text-lg font-black text-slate-700 font-mono">{successData.receiptNumber}</p>
                        </div>
                    )}

                    <button
                        onClick={handleDownloadReceipt}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200 transition-all mb-3"
                    >
                        <Download size={18} />
                        Download Tax Receipt (80G)
                    </button>
                    <button
                        onClick={closeModal}
                        className="w-full py-3.5 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    /* ─── DONATION FORM ─────────────────────────────────────────── */
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={closeModal}
            />

            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300 flex flex-col items-center max-h-[95vh] overflow-y-auto">
                {/* Header Decoration */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-red-500 to-red-700 -z-10" />

                <div className="absolute top-4 right-4 group">
                    <button
                        onClick={closeModal}
                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all group-hover:rotate-90 duration-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-12 w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-red-600 mb-5">
                    <Heart size={40} fill="currentColor" className="animate-pulse" />
                </div>

                <div className="px-8 pb-10 text-center w-full">
                    <h2 className="text-2xl font-black text-slate-800 mb-1">Support Our Mission</h2>
                    <p className="text-sm font-medium text-slate-500 mb-6 px-2">
                        Your contribution keeps the platform free & powers emergency blood requests across India.
                    </p>

                    {/* Amount Selector */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        {[100, 500, 1000].map((amt) => (
                            <button
                                key={amt}
                                onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                                className={`py-4 rounded-2xl border-2 transition-all font-black ${selectedAmount === amt && !customAmount
                                    ? "border-red-600 bg-red-50 text-red-600"
                                    : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                                    }`}
                            >
                                ₹{amt}
                            </button>
                        ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="relative mb-6">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                        <input
                            type="number"
                            min="10"
                            placeholder="Custom amount"
                            value={customAmount}
                            onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                            className="w-full pl-9 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-700 font-bold focus:outline-none focus:border-red-400 transition-all"
                        />
                    </div>

                    {/* Donor Info for Receipt */}
                    <div className="text-left mb-5 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Details (for Tax Receipt)</p>

                        <div className="relative">
                            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Your Full Name *"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:border-red-400 transition-all"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={donorEmail}
                                onChange={(e) => setDonorEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:border-red-400 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={donorPhone}
                                onChange={(e) => setDonorPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:border-red-400 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleDonate}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <CreditCard size={20} className="group-hover:scale-110 transition-transform" />
                                DONATE ₹{getFinalAmount().toLocaleString("en-IN")}
                            </>
                        )}
                    </button>

                    <div className="mt-5 flex items-center justify-center gap-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Secure via Razorpay
                        </div>
                        <div className="w-px h-3 bg-slate-200" />
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            80G Tax Receipt
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonateModal;
