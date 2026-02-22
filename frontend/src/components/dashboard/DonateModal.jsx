import React, { useState } from "react";
import { X, Heart, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { createOrder, verifyPayment } from "../../services/api";

const DonateModal = ({ closeModal }) => {
    const [loading, setLoading] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(500);

    const loadScript = (src) =>
        new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handleDonate = async (amount) => {
        setLoading(true);
        try {
            const isLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!isLoaded) {
                alert("Razorpay SDK failed to load. Are you online?");
                setLoading(false);
                return;
            }

            const res = await createOrder(amount);
            if (!res || !res.success) {
                throw new Error(res?.message || "Failed to create order");
            }

            const order = res.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_placeholder", // User needs to set this in .env
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
                            alert("❤️ Thank you! Your donation was successful and will save lives.");
                            closeModal();
                        } else {
                            alert("Verification failed: " + (verifyRes?.message || "Unknown error"));
                        }
                    } catch (err) {
                        alert("Error during verification: " + err.message);
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: "",
                },
                notes: {
                    address: "BloodConnect Corporate Office",
                },
                theme: {
                    color: "#DC2626",
                },
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

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={closeModal}
            />

            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300 flex flex-col items-center">
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

                <div className="mt-12 w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-red-600 mb-6">
                    <Heart size={40} fill="currentColor" className="animate-pulse" />
                </div>

                <div className="px-8 pb-10 text-center w-full">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Support Our Mission</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 px-4">
                        Your contribution helps us keep the platform free and arrange emergency blood requests across India.
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[100, 500, 1000].map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setSelectedAmount(amt)}
                                className={`py-4 rounded-2xl border-2 transition-all font-black ${selectedAmount === amt
                                        ? "border-red-600 bg-red-50 text-red-600"
                                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                                    }`}
                            >
                                ₹{amt}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handleDonate(selectedAmount)}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <CreditCard size={20} className="group-hover:scale-110 transition-transform" />
                                DONATE NOW
                            </>
                        )}
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Secure via Razorpay
                        </div>
                        <div className="w-px h-3 bg-slate-200" />
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Tax Benefits Included
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonateModal;
