import React from "react";
import { Presentation, X } from "lucide-react";
import { isDemoMode, disableDemoMode } from "../../services/api";

export default function DemoModeBanner() {
    const [visible, setVisible] = React.useState(isDemoMode());

    if (!visible) return null;

    const exitDemo = () => {
        disableDemoMode();
        setVisible(false);
        window.location.href = "/";
    };

    return (
        <div className="fixed left-1/2 top-3 z-[10000] flex w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 shadow-xl">
            <Presentation size={20} className="shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-black">DEMO MODE — Presentation only</p>
                <p className="text-[11px] font-medium">No real login, OTP, Aadhaar, password, or account data is being used.</p>
            </div>
            <button type="button" onClick={exitDemo} aria-label="Exit demo mode" className="rounded-lg p-1 text-amber-700 hover:bg-amber-100">
                <X size={16} />
            </button>
        </div>
    );
}
