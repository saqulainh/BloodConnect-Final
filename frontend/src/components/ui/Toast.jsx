import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─── Toast Context ─────────────────────────────────────────────────────
const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
};

// ─── Toast Item Component ──────────────────────────────────────────────
const VARIANT_STYLES = {
    success: {
        container: 'bg-white border-l-4 border-emerald-500',
        icon: <CheckCircle size={18} className="text-emerald-500 shrink-0" />,
        title: 'text-emerald-700',
    },
    error: {
        container: 'bg-white border-l-4 border-red-500',
        icon: <XCircle size={18} className="text-red-500 shrink-0" />,
        title: 'text-red-700',
    },
    info: {
        container: 'bg-white border-l-4 border-blue-500',
        icon: <Info size={18} className="text-blue-500 shrink-0" />,
        title: 'text-blue-700',
    },
    warning: {
        container: 'bg-white border-l-4 border-amber-500',
        icon: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
        title: 'text-amber-700',
    },
};

function ToastItem({ id, variant = 'info', title, message, onDismiss }) {
    const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.info;

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl shadow-slate-200/60 ${styles.container} min-w-[280px] max-w-sm w-full`}
            style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
            {styles.icon}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-black leading-tight ${styles.title}`}>{title}</p>
                {message && <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{message}</p>}
            </div>
            <button
                onClick={() => onDismiss(id)}
                className="p-1 text-slate-300 hover:text-slate-500 transition-colors rounded-lg hover:bg-slate-100 shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    );
}

// ─── Toast Provider ────────────────────────────────────────────────────
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback(({ variant = 'info', title, message, duration = 4000 }) => {
        const id = `toast_${Date.now()}_${Math.random()}`;
        setToasts(prev => [...prev, { id, variant, title, message }]);
        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
        return id;
    }, [dismiss]);

    // Convenience shortcuts
    const success = useCallback((title, message, opts = {}) => toast({ variant: 'success', title, message, ...opts }), [toast]);
    const error = useCallback((title, message, opts = {}) => toast({ variant: 'error', title, message, ...opts }), [toast]);
    const info = useCallback((title, message, opts = {}) => toast({ variant: 'info', title, message, ...opts }), [toast]);
    const warning = useCallback((title, message, opts = {}) => toast({ variant: 'warning', title, message, ...opts }), [toast]);

    return (
        <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem {...t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
