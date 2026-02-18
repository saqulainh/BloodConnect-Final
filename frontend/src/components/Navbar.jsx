import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Droplets } from "lucide-react";
import gsap from "gsap";

const NAV_LINKS = [
    { label: "Home", to: "/" },
    { label: "Donors", to: "/donors" },
    { label: "For Patients", to: "/patients" },
    { label: "Donations", to: "/donations" },
];

export default function Navbar() {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        if (!navRef.current) return;
        gsap.fromTo(
            navRef.current,
            { y: -60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
    }, []);

    return (
        <nav
            ref={navRef}
            className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100"
        >
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-gray-800">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm leading-tight">
                        Blood Donor &<br />
                        <span className="text-red-600">Receiver Platform</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`nav-link text-sm font-medium transition-colors ${location.pathname === link.to
                                    ? "text-red-600"
                                    : "text-gray-600 hover:text-red-600"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                    <Link
                        to="/login"
                        className="hidden md:inline-flex items-center px-4 py-2 text-sm font-semibold text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="hidden md:inline-flex items-center px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    >
                        Register
                    </Link>
                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm font-medium text-gray-700 hover:text-red-600 py-1"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex gap-2 pt-2">
                        <Link
                            to="/login"
                            onClick={() => setMenuOpen(false)}
                            className="flex-1 text-center py-2 text-sm font-semibold text-red-600 border border-red-600 rounded-lg"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            onClick={() => setMenuOpen(false)}
                            className="flex-1 text-center py-2 text-sm font-semibold bg-red-600 text-white rounded-lg"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
