import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, X, Info, Megaphone, Droplets, MapPin, Award } from 'lucide-react';
import * as API from '../../services/api';
import Pusher from 'pusher-js';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

export default function NotificationBell({ userId }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    // Fetch initial notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await API.apiFetch('/notifications?limit=20');
            if (res.success) {
                setNotifications(res.data.list);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        // Request Native Notification Permission
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        // Setup Pusher for real-time notifications
        if (!PUSHER_KEY) return;

        const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
        const globalChannel = pusher.subscribe('global-updates');

        const handleNewNotification = (data) => {
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Trigger OS-level native push notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(data.title || "BloodConnect Alert", {
                    body: data.message,
                    icon: "/vite.svg", // Fallback icon
                });
            }
        };

        globalChannel.bind('newNotification', handleNewNotification);

        let userChannel;
        if (userId) {
            userChannel = pusher.subscribe(`user-${userId}`);
            userChannel.bind('newNotification', handleNewNotification);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            globalChannel.unbind_all();
            pusher.unsubscribe('global-updates');
            if (userChannel) {
                userChannel.unbind_all();
                pusher.unsubscribe(`user-${userId}`);
            }
        };
    }, [userId]);

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();

        // Optimistic UI update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await API.apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
        } catch (error) {
            console.error("Failed to mark as read:", error);
            // Revert on failure
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        try {
            await API.apiFetch('/notifications/read-all', { method: 'PATCH' });
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            fetchNotifications();
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'broadcast': return <Megaphone size={16} className="text-amber-500" />;
            case 'request': return <Droplets size={16} className="text-red-500" />;
            case 'camp': return <MapPin size={16} className="text-blue-500" />;
            case 'match': return <Check size={16} className="text-emerald-500" />;
            case 'reward': return <Award size={16} className="text-purple-500" />;
            default: return <Info size={16} className="text-indigo-500" />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-red-500 hover:bg-slate-800/50 rounded-xl transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-[#0a0a0f]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111118] border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/40">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-200">Notices</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[11px] font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                            >
                                <Check size={12} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        {loading ? (
                            <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                                <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                <p className="text-xs">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center gap-3 text-slate-500">
                                <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                                    <Bell size={20} className="text-slate-600" />
                                </div>
                                <p className="text-sm font-medium">All caught up!</p>
                                <p className="text-[11px] text-slate-600 text-center">No new notifications right now.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 flex gap-3 transition-colors ${notif.isRead ? 'opacity-70 hover:opacity-100 hover:bg-slate-800/30' : 'bg-slate-800/10 hover:bg-slate-800/40'} ${notif.link ? 'cursor-pointer' : ''}`}
                                        onClick={() => {
                                            if (!notif.isRead) markAsRead(notif._id);
                                            if (notif.link) window.location.href = notif.link;
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.isRead ? 'bg-slate-800' : 'bg-slate-800 ring-1 ring-inset ring-slate-700'}`}>
                                            {getIcon(notif.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                <p className={`text-sm tracking-tight ${notif.isRead ? 'text-slate-300 font-medium' : 'text-slate-100 font-bold'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.isRead && (
                                                    <div className="shrink-0 w-2 h-2 rounded-full bg-red-500 mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mb-2 leading-relaxed line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                                <Clock size={10} />
                                                {formatTime(notif.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* View All footer (optional) */}
                    {notifications.length > 5 && (
                        <div className="p-2 border-t border-slate-800/80 bg-[#0d0d12]">
                            <button className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/30 hover:bg-slate-800/60 rounded-lg transition-colors">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
