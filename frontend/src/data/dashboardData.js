import {
    Home,
    MessageCircle,
    Search,
    User,
    Users,
    AlertCircle,
    CheckCircle2,
    LayoutDashboard,
    Droplets,
    FileText,
    Settings,
    Menu,
    LogOut
} from "lucide-react";

export const QUICK_ACTIONS = [
    { icon: "🩸", label: "Find Donors", path: "/donors", color: "#fff0f0" },
    { icon: "🆘", label: "Request Blood", action: "request", color: "#fff0f0" },
    { icon: "📋", label: "Blood Orders", path: "/dashboard", color: "#fff0f0" },
    { icon: "🚑", label: "Ambulances", path: "/dashboard", color: "#fff0f0" },
];

export const BOTTOM_NAV_ITEMS = [
    { id: "home", icon: Home, label: "Home" },
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "search", icon: Search, label: "Search" },
    { id: "profile", icon: User, label: "Profile" },
];

// ── Chart Data ─────────────────────────────────────────────────────────

export const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#64748b'];

export const lineChartData = [
    { name: 'Mon', requests: 4, donations: 2 },
    { name: 'Tue', requests: 3, donations: 5 },
    { name: 'Wed', requests: 7, donations: 6 },
    { name: 'Thu', requests: 5, donations: 4 },
    { name: 'Fri', requests: 9, donations: 8 },
    { name: 'Sat', requests: 12, donations: 10 },
    { name: 'Sun', requests: 8, donations: 7 },
];

export const pieChartData = [
    { name: 'A+', value: 35 },
    { name: 'O+', value: 45 },
    { name: 'B+', value: 25 },
    { name: 'AB+', value: 15 },
    { name: 'Others', value: 20 },
];

// ── Recent Activity ────────────────────────────────────────────────────

export const recentActivity = [
    { id: 1, type: 'New Donor', message: 'Sarah W. joined as a donor', time: '2 mins ago', icon: User, color: 'text-blue-500 bg-blue-50' },
    { id: 2, type: 'Request', message: 'Urgent B+ Request created', time: '15 mins ago', icon: AlertCircle, color: 'text-red-500 bg-red-50' },
    { id: 3, type: 'Camp', message: 'City Center Camp approved', time: '1 hour ago', icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
];

// ── Mock Data for Tables ──────────────────────────────────────────────

export const donors = [
    { id: 1, name: 'Sarah Williams', group: 'O+', location: 'New York, US', status: 'Active', lastDonation: '2024-02-10' },
    { id: 2, name: 'Michael Chen', group: 'A-', location: 'California, US', status: 'Active', lastDonation: '2024-01-15' },
    { id: 3, name: 'Jessica Taylor', group: 'AB+', location: 'London, UK', status: 'Inactive', lastDonation: '2023-11-05' },
    { id: 4, name: 'David Miller', group: 'B+', location: 'Toronto, CA', status: 'Active', lastDonation: '2024-02-20' },
];

export const bloodRequests = [
    { id: 1, patient: 'Amit Kumar', group: 'AB-', hospital: 'City Hospital', urgency: 'Critical', status: 'Pending' },
    { id: 2, patient: 'Priya Singh', group: 'O+', hospital: 'Apollo Clinic', urgency: 'Urgent', status: 'Active' },
    { id: 3, patient: 'Rahul Verma', group: 'B+', hospital: 'Max Healthcare', urgency: 'Normal', status: 'Completed' },
];
