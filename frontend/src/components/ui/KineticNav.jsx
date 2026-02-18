import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Droplets } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(CustomEase);
}

const NAV_ITEMS = [
    { label: "Home", to: "/" },
    { label: "Find Donors", to: "/donors" },
    { label: "Register", to: "/register" },
    { label: "Dashboard", to: "/dashboard" },
];

export default function KineticNav() {
    const containerRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Shape hover effects
    useEffect(() => {
        if (!containerRef.current) return;

        try {
            if (!gsap.parseEase("main")) {
                CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
                gsap.defaults({ ease: "main", duration: 0.7 });
            }
        } catch (e) {
            gsap.defaults({ ease: "power2.out", duration: 0.7 });
        }

        const ctx = gsap.context(() => {
            const menuItems = containerRef.current.querySelectorAll(".menu-list-item[data-shape]");
            const shapesContainer = containerRef.current.querySelector(".ambient-background-shapes");

            menuItems.forEach((item) => {
                const shapeIndex = item.getAttribute("data-shape");
                const shape = shapesContainer?.querySelector(`.bg-shape-${shapeIndex}`);
                if (!shape) return;
                const shapeEls = shape.querySelectorAll(".shape-element");

                const onEnter = () => {
                    shapesContainer?.querySelectorAll(".bg-shape").forEach((s) => s.classList.remove("active"));
                    shape.classList.add("active");
                    gsap.fromTo(shapeEls,
                        { scale: 0.5, opacity: 0, rotation: -10 },
                        { scale: 1, opacity: 1, rotation: 0, duration: 0.6, stagger: 0.08, ease: "back.out(1.7)", overwrite: "auto" }
                    );
                };
                const onLeave = () => {
                    gsap.to(shapeEls, {
                        scale: 0.8, opacity: 0, duration: 0.3, ease: "power2.in",
                        onComplete: () => shape.classList.remove("active"),
                        overwrite: "auto"
                    });
                };

                item.addEventListener("mouseenter", onEnter);
                item.addEventListener("mouseleave", onLeave);
                item._cleanup = () => {
                    item.removeEventListener("mouseenter", onEnter);
                    item.removeEventListener("mouseleave", onLeave);
                };
            });
        }, containerRef);

        return () => {
            ctx.revert();
            containerRef.current?.querySelectorAll(".menu-list-item[data-shape]").forEach((item) => item._cleanup?.());
        };
    }, []);

    // Open/close animation
    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const navWrap = containerRef.current.querySelector(".nav-overlay-wrapper");
            const menu = containerRef.current.querySelector(".menu-content");
            const overlay = containerRef.current.querySelector(".overlay");
            const bgPanels = containerRef.current.querySelectorAll(".backdrop-layer");
            const menuLinks = containerRef.current.querySelectorAll(".nav-link-text");
            const menuButton = containerRef.current.querySelector(".nav-close-btn");
            const menuButtonTexts = menuButton?.querySelectorAll("p");
            const menuButtonIcon = menuButton?.querySelector(".menu-button-icon");

            const tl = gsap.timeline();

            if (isMenuOpen) {
                navWrap?.setAttribute("data-nav", "open");
                tl.set(navWrap, { display: "block" })
                    .set(menu, { xPercent: 0 }, "<")
                    .fromTo(menuButtonTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 })
                    .fromTo(menuButtonIcon, { rotate: 0 }, { rotate: 315 }, "<")
                    .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
                    .fromTo(bgPanels, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
                    .fromTo(menuLinks, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, "<+=0.35");
            } else {
                navWrap?.setAttribute("data-nav", "closed");
                tl.to(overlay, { autoAlpha: 0 })
                    .to(menu, { xPercent: 120 }, "<")
                    .to(menuButtonTexts, { yPercent: 0 }, "<")
                    .to(menuButtonIcon, { rotate: 0 }, "<")
                    .set(navWrap, { display: "none" });
            }
        }, containerRef);

        return () => ctx.revert();
    }, [isMenuOpen]);

    // Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") setIsMenuOpen(false); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const handleNavClick = (to) => {
        setIsMenuOpen(false);
        setTimeout(() => navigate(to), 300);
    };

    return (
        <div ref={containerRef}>
            {/* ── Fixed Header ── */}
            <div className="site-header-wrapper">
                <header className="header">
                    <div className="container is--full">
                        <nav className="nav-row">
                            {/* Logo */}
                            <Link to="/" className="nav-logo-row" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", fontWeight: 800, fontSize: 15, color: "#111" }}>
                                <div style={{ width: 34, height: 34, background: "#e53935", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Droplets size={18} color="white" />
                                </div>
                                <span style={{ lineHeight: 1.2 }}>
                                    Blood Donor &<br />
                                    <span style={{ color: "#e53935" }}>Receiver Platform</span>
                                </span>
                            </Link>

                            {/* Desktop quick links */}
                            <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden-mobile">
                                {NAV_ITEMS.slice(0, 4).map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        style={{ fontSize: 14, fontWeight: 600, color: "#444", textDecoration: "none", transition: "color 0.2s" }}
                                        onMouseEnter={(e) => (e.target.style.color = "#e53935")}
                                        onMouseLeave={(e) => (e.target.style.color = "#444")}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>

                            {/* Right side */}
                            <div className="nav-row__right">
                                <Link
                                    to="/login"
                                    style={{ fontSize: 13, fontWeight: 700, color: "#e53935", border: "1.5px solid #e53935", borderRadius: 8, padding: "7px 18px", textDecoration: "none", transition: "all 0.2s" }}
                                    onMouseEnter={(e) => { e.target.style.background = "#e53935"; e.target.style.color = "#fff"; }}
                                    onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#e53935"; }}
                                >
                                    Sign In
                                </Link>

                                {/* Kinetic menu button */}
                                <button className="nav-close-btn" onClick={() => setIsMenuOpen((p) => !p)}>
                                    <div className="menu-button-text">
                                        <p className="p-large">Menu</p>
                                        <p className="p-large">Close</p>
                                    </div>
                                    <div className="icon-wrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 16 16" fill="none" className="menu-button-icon">
                                            <path d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z" fill="currentColor" />
                                            <path d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z" fill="currentColor" />
                                            <path d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z" fill="currentColor" />
                                            <path d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z" fill="currentColor" />
                                            <path d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z" fill="currentColor" />
                                            <path d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z" fill="currentColor" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </header>
            </div>

            {/* ── Fullscreen Kinetic Menu ── */}
            <section className="fullscreen-menu-container">
                <div data-nav="closed" className="nav-overlay-wrapper">
                    <div className="overlay" onClick={() => setIsMenuOpen(false)}></div>
                    <nav className="menu-content">
                        <div className="menu-bg">
                            <div className="backdrop-layer first"></div>
                            <div className="backdrop-layer second"></div>
                            <div className="backdrop-layer"></div>

                            {/* Ambient blood-themed shapes */}
                            <div className="ambient-background-shapes">
                                {/* Shape 1 */}
                                <svg className="bg-shape bg-shape-1" viewBox="0 0 400 400" fill="none">
                                    <circle className="shape-element" cx="80" cy="120" r="50" fill="rgba(229,57,53,0.12)" />
                                    <circle className="shape-element" cx="300" cy="80" r="70" fill="rgba(183,28,28,0.1)" />
                                    <circle className="shape-element" cx="200" cy="300" r="90" fill="rgba(229,57,53,0.08)" />
                                </svg>
                                {/* Shape 2 */}
                                <svg className="bg-shape bg-shape-2" viewBox="0 0 400 400" fill="none">
                                    <path className="shape-element" d="M0 200 Q100 100, 200 200 T 400 200" stroke="rgba(229,57,53,0.2)" strokeWidth="60" fill="none" />
                                    <path className="shape-element" d="M0 280 Q100 180, 200 280 T 400 280" stroke="rgba(183,28,28,0.15)" strokeWidth="40" fill="none" />
                                </svg>
                                {/* Shape 3 */}
                                <svg className="bg-shape bg-shape-3" viewBox="0 0 400 400" fill="none">
                                    {[50, 150, 250, 350].map((x) => [50, 150, 250, 350].map((y) => (
                                        <circle key={`${x}-${y}`} className="shape-element" cx={x} cy={y} r="8" fill="rgba(229,57,53,0.25)" />
                                    )))}
                                </svg>
                                {/* Shape 4 */}
                                <svg className="bg-shape bg-shape-4" viewBox="0 0 400 400" fill="none">
                                    <path className="shape-element" d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100" fill="rgba(229,57,53,0.12)" />
                                    <path className="shape-element" d="M250 200 Q300 150, 350 200 Q400 250, 350 300 Q300 350, 250 300 Q200 250, 250 200" fill="rgba(183,28,28,0.1)" />
                                </svg>
                                {/* Shape 5 */}
                                <svg className="bg-shape bg-shape-5" viewBox="0 0 400 400" fill="none">
                                    <line className="shape-element" x1="0" y1="100" x2="300" y2="400" stroke="rgba(229,57,53,0.15)" strokeWidth="30" />
                                    <line className="shape-element" x1="100" y1="0" x2="400" y2="300" stroke="rgba(183,28,28,0.12)" strokeWidth="25" />
                                </svg>
                            </div>
                        </div>

                        <div className="menu-content-wrapper">
                            <ul className="menu-list">
                                {NAV_ITEMS.map((item, i) => (
                                    <li key={item.to} className="menu-list-item" data-shape={i + 1}>
                                        <button
                                            onClick={() => handleNavClick(item.to)}
                                            className="nav-link w-inline-block"
                                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", width: "100%" }}
                                        >
                                            <p className="nav-link-text">{item.label}</p>
                                            <div className="nav-link-hover-bg"></div>
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {/* Bottom CTA in menu */}
                            <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid #eee" }}>
                                <button
                                    onClick={() => handleNavClick("/register")}
                                    style={{ background: "#e53935", color: "#fff", border: "none", borderRadius: 10, padding: "14px 32px", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "background 0.2s" }}
                                    onMouseEnter={(e) => (e.target.style.background = "#b71c1c")}
                                    onMouseLeave={(e) => (e.target.style.background = "#e53935")}
                                >
                                    Become a Donor →
                                </button>
                            </div>
                        </div>
                    </nav>
                </div>
            </section>
        </div>
    );
}
