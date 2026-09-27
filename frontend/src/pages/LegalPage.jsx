import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Droplets, ShieldCheck } from "lucide-react";

const legalContent = {
    privacy: {
        title: "Privacy Policy",
        intro: "Your privacy matters to BloodConnect. This policy explains what information we collect, why we use it, and the choices available to you.",
        sections: [
            ["Information we collect", "We may collect account details, contact information, blood group, location, verification details, and activity needed to match donors with blood requests."],
            ["How we use information", "We use this information to provide donor matching, verify accounts, protect the platform, send important notifications, and improve our services."],
            ["Sharing and visibility", "We only share the information needed to facilitate a blood connection or provide a requested service. We do not sell personal information."],
            ["Security and retention", "We use reasonable technical and organisational safeguards and retain information only while it is needed for the purposes described here or required by law."],
            ["Your choices", "You can request access, correction, or deletion of your personal information by contacting us at 8804385786."],
        ],
    },
    terms: {
        title: "Terms of Service",
        intro: "By using BloodConnect, you agree to use the platform responsibly and in accordance with these terms.",
        sections: [
            ["Using BloodConnect", "BloodConnect helps users connect with potential blood donors. It does not replace medical advice, hospital services, or emergency services."],
            ["Accurate information", "You must provide accurate information, keep your account secure, and update details that affect donor or recipient matching."],
            ["Safety and responsibility", "Do not misuse the platform, impersonate another person, harass users, submit false requests, or use the service for unlawful purposes."],
            ["Medical disclaimer", "Blood availability and matching information should be verified with a qualified hospital or medical professional before any transfusion or treatment decision."],
            ["Changes and contact", "We may update these terms as the service evolves. Questions about these terms can be directed to 8804385786."],
        ],
    },
};

export default function LegalPage() {
    const { pathname } = useLocation();
    const content = pathname === "/terms" ? legalContent.terms : legalContent.privacy;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <nav className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-2 font-black text-lg">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white">
                            <Droplets size={19} className="fill-white" />
                        </span>
                        Blood<span className="text-red-600">Connect</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600">
                        <ArrowLeft size={16} /> Back to home
                    </Link>
                </div>
            </nav>

            <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
                <div className="mb-10 rounded-3xl bg-gradient-to-br from-red-600 to-red-500 p-8 text-white shadow-xl shadow-red-100 sm:p-12">
                    <ShieldCheck size={34} className="mb-5" />
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-red-100">BloodConnect</p>
                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{content.title}</h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-red-50">{content.intro}</p>
                </div>

                <div className="space-y-5">
                    {content.sections.map(([heading, text]) => (
                        <section key={heading} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900">{heading}</h2>
                            <p className="mt-2 leading-7 text-slate-600">{text}</p>
                        </section>
                    ))}
                </div>

                <p className="mt-8 text-sm text-slate-500">
                    Developed by Nowic Studio · Contact: <a href="tel:+918804385786" className="font-bold text-red-600 hover:underline">8804385786</a>
                </p>
            </article>
        </main>
    );
}
