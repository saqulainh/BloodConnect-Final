import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation: {
            "Home": "Home",
            "How it Works": "How it Works",
            "Become a Donor": "Become a Donor",
            "Go to Dashboard": "Go to Dashboard",
            "Sign In": "Sign In",
            "Save a Life": "Save a Life",
            "Be a Hero": "Be a Hero",
            "Connect directly with verified blood donors in your area. Fast, secure, and completely free — because every second counts in an emergency.": "Connect directly with verified blood donors in your area. Fast, secure, and completely free — because every second counts in an emergency.",
            "Every Drop Counts.": "Every Drop Counts.",
            "Be Someone's Hero.": "Be Someone's Hero.",
            "Register as a donor today and get notified when someone in your area urgently needs blood that matches yours.": "Register as a donor today and get notified when someone in your area urgently needs blood that matches yours.",
            "Language": "Language",
            "Register": "Register"
        }
    },
    hi: {
        translation: {
            "Home": "मुख्य पृष्ठ",
            "How it Works": "यह कैसे काम करता है",
            "Become a Donor": "रक्तदाता बनें",
            "Go to Dashboard": "डैशबोर्ड पर जाएं",
            "Sign In": "लॉग इन",
            "Save a Life": "एक जीवन बचाएं",
            "Be a Hero": "नायक बनें",
            "Connect directly with verified blood donors in your area. Fast, secure, and completely free — because every second counts in an emergency.": "अपने क्षेत्र के सत्यापित रक्तदाताओं से सीधे जुड़ें। तेज, सुरक्षित और पूरी तरह से मुफ्त — क्योंकि आपातकाल में एक-एक सेकंड कीमती है।",
            "Every Drop Counts.": "हर बूंद कीमती है।",
            "Be Someone's Hero.": "किसी के नायक बनें।",
            "Register as a donor today and get notified when someone in your area urgently needs blood that matches yours.": "आज ही रक्तदाता के रूप में पंजीकरण करें और जब आपके क्षेत्र में किसी को आपके रक्त समूह की सख्त जरूरत हो तो सूचना प्राप्त करें।",
            "Language": "भाषा",
            "Register": "पंजीकरण करें"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
