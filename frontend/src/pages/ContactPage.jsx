import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <nav className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link to="/" className="text-lg font-black">Blood<span className="text-red-600">Connect</span></Link>
                    <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600">
                        <ArrowLeft size={16} /> Back to home
                    </Link>
                </div>
            </nav>
            <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
                <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-12">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">BloodConnect Support</p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Contact support</h1>
                    <p className="mt-5 max-w-xl leading-7 text-slate-600">
                        Need help with your account, a blood request, or donor matching? Our support team can help you find the right next step.
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <a href="mailto:support@bloodconnect.org" className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 font-bold hover:border-red-200 hover:text-red-600">
                            <Mail className="text-red-600" size={20} /> support@bloodconnect.org
                        </a>
                        <a href="tel:+918804385786" className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 font-bold hover:border-red-200 hover:text-red-600">
                            <Phone className="text-red-600" size={20} /> +91 88043 85786
                        </a>
                    </div>
                    <p className="mt-8 text-sm text-slate-500">For medical emergencies, contact your local emergency services or hospital immediately.</p>
                </div>
            </section>
        </main>
    );
}