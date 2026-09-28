import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Activity, Phone, Mail, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToSection = (id) => {
        if (location.pathname === '/') {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            navigate(`/#${id}`);
        }
    };

    return (
        <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
            {/* Background glow accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-red-600/10 blur-[90px] pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
                    
                    {/* Brand Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="inline-flex items-center gap-2 text-white font-black text-2xl tracking-tight group">
                            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg shadow-red-600/20">
                                <Heart className="w-5 h-5 fill-current" />
                            </div>
                            <span>Blood<span className="text-red-500">Connect</span></span>
                        </Link>
                        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                            Connecting voluntary blood donors with patients and verified blood banks in real time. Bridging the critical seconds when every drop counts.
                        </p>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            24/7 Real-Time Emergency Matching Network Active
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-red-500" />
                            Platform
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="hover:text-white transition-colors text-left flex items-center gap-1 group py-1"
                                >
                                    <span>Features</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-400" />
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection('how-it-works')}
                                    className="hover:text-white transition-colors text-left flex items-center gap-1 group py-1"
                                >
                                    <span>How It Works</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-400" />
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection('impact')}
                                    className="hover:text-white transition-colors text-left flex items-center gap-1 group py-1"
                                >
                                    <span>Live Impact</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-400" />
                                </button>
                            </li>
                            <li>
                                <Link
                                    to="/blood-banks"
                                    className="hover:text-white transition-colors flex items-center gap-1 group py-1"
                                >
                                    <span>Find Blood Banks</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-red-400" />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Safety */}
                    <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-red-500" />
                            Trust & Legal
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link to="/privacy-policy" className="hover:text-white transition-colors block py-1">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-white transition-colors block py-1">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-white transition-colors block py-1">
                                    Contact Support
                                </Link>
                            </li>
                            <li>
                                <a 
                                    href="tel:108"
                                    className="text-red-400 hover:text-red-300 font-semibold transition-colors block py-1"
                                >
                                    National Ambulance: 108
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Direct Contact & Emergency */}
                    <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
                            Emergency Contact
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                                <span className="text-slate-400 text-xs leading-relaxed">
                                    National Blood Transfusion Network, New Delhi, India
                                </span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                                <a href="tel:1910" className="hover:text-white transition-colors text-xs">
                                    Helpline: 1910 / +91-11-23359330
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                                <a href="mailto:support@bloodconnect.org" className="hover:text-white transition-colors text-xs">
                                    support@bloodconnect.org
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} BloodConnect Platform. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
                        <Link to="/blood-banks" className="hover:text-slate-400 transition-colors">Directory</Link>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-400">Saving Lives Everyday</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
