// resources/js/Layouts/UserLayout.jsx
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
};

export default function UserLayout({ children, userRole }) {
    const { url, props } = usePage();
    const { auth } = props;
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);
    
    const notifications = auth?.notifications || [];
    const unreadCount = auth?.unreadNotificationsCount || 0;

    useEffect(() => {
        document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 🔥 REAL-TIME ECHO LISTENER
    useEffect(() => {
        let interval;
        if (auth?.user && typeof window !== 'undefined' && window.Echo) {
            window.Echo.private(`App.Models.User.${auth.user.id}`)
                .notification((notification) => {
                    router.reload({ preserveState: true, preserveScroll: true });
                });
        } else {
            interval = setInterval(() => {
                router.reload({ preserveState: true, preserveScroll: true });
            }, 30000);
        }
        return () => {
            if (auth?.user && typeof window !== 'undefined' && window.Echo) {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            }
            if (interval) clearInterval(interval);
        };
    }, [auth?.user]);

    const markAsRead = () => {
        router.post('/user/notifications/mark-as-read', {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setIsNotifOpen(false)
        });
    };

    const getStatusColor = (code) => {
        const c = code?.toLowerCase() || '';
        if (c === 'submitted') return 'bg-slate-100 text-slate-600 border-slate-200';
        if (c.includes('review')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (c === 'processing') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (c.includes('ready') || c === 'released') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (c.includes('compliance') || c.includes('cancelled') || c.includes('returned')) return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const userInitials = auth?.user?.first_name ? `${auth.user.first_name.charAt(0)}${auth.user.last_name?.charAt(0) || ''}` : 'JD';
    const userName = auth?.user?.first_name ? `${auth.user.first_name} ${auth.user.last_name}` : (auth?.user?.name || 'Juan Dela Cruz');
    const displayRole = userRole || (auth?.user?.user_type === 'alumni' ? 'Alumni' : 'Student');

    const menuItems = [
        { name: 'Dashboard', link: '/user/dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1m-6 0h6" /> },
        { name: 'My Requests', link: '/user/requests', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
        { name: 'Faculty Schedules', link: '/user/faculty', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
        { name: 'Announcements', link: '/user/announcements', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /> },
        { divider: true },
        { name: 'FAQ / Help Center', link: '/user/faq', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        { name: 'Profile Settings', link: '/profile', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
        { divider: true },
        { name: 'About CED Registrar', link: '/user/about', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> },
        { name: 'Privacy Policy', link: '/user/privacy-policy', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
        { name: 'Terms of Service', link: '/user/terms-of-service', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-yellow-300 selection:text-slate-900">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col z-20 shrink-0">
                <div className="p-8 pb-4 flex flex-col items-center border-b border-slate-100">
                    <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-inner">{userInitials}</div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{userName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mb-3 text-center uppercase tracking-wide">{displayRole}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest text-center mt-1 font-bold">Welcome to CED Registrar <br /> e-Services Portal</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                    {menuItems.map((item, idx) => {
                        if (item.divider) return <div key={idx} className="h-px bg-slate-100 my-4 mx-4"></div>;
                        const isActive = url.startsWith(item.link);
                        return (
                            <Link key={item.name} href={item.link} className={`w-full text-left px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 text-sm ${isActive ? 'bg-slate-50 border border-slate-200 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-yellow-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                    <div className="h-px bg-slate-100 my-4 mx-4"></div>
                    <Link href="/logout" method="post" as="button" className="w-full text-left px-5 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-3 text-sm">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Log Out
                    </Link>
                </div>
            </aside>

            {/* Mobile Drawer */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                <div className="p-8 pb-4 flex flex-col items-center border-b border-slate-100">
                    <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-inner">{userInitials}</div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{userName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mb-3 text-center uppercase tracking-wide">{displayRole}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest text-center mt-1 font-bold">Welcome to CED Registrar <br /> e-Services Portal</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                    {menuItems.map((item, idx) => {
                        if (item.divider) return <div key={idx} className="h-px bg-slate-100 my-4 mx-4"></div>;
                        const isActive = url.startsWith(item.link);
                        return (
                            <Link key={item.name} href={item.link} onClick={() => setIsSidebarOpen(false)} className={`w-full text-left px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 text-sm ${isActive ? 'bg-slate-50 border border-slate-200 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-yellow-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                    <div className="h-px bg-slate-100 my-4 mx-4"></div>
                    <Link href="/logout" method="post" as="button" className="w-full text-left px-5 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-3 text-sm">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Log Out
                    </Link>
                </div>
            </div>

            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"></div>}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="py-4 px-6 lg:px-10 flex justify-between items-center shrink-0 border-b-2">
                    <div className="flex items-center gap-4 relative z-10 w-full justify-between lg:justify-end">
                        <div className="flex items-center gap-4 lg:hidden">
                            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>
                        
                        {/* FUNCTIONAL NOTIFICATION BELL DROPDOWN */}
                        <div className="relative z-[100]" ref={notifRef}>
                            <button 
                                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                                className={`relative p-2.5 transition-colors rounded-full ${isNotifOpen ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2.5 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Panel - Fixed for Responsiveness */}
                            {isNotifOpen && (
                                <div className="absolute right-0 sm:-right-2 top-full mt-2 w-[90vw] max-w-[360px] sm:w-[400px] sm:max-w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                                        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAsRead} className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 uppercase tracking-wider transition-colors">
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[55vh] sm:max-h-[350px] overflow-y-auto overscroll-contain bg-white">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div key={notif.id} className={`p-5 border-b border-slate-50 transition-colors flex gap-4 items-start ${notif.read_at === null ? 'bg-blue-50/40 hover:bg-blue-50/80' : 'bg-white hover:bg-slate-50'}`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${notif.read_at === null ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0"> {/* min-w-0 stops flex child from expanding infinitely */}
                                                        <div className="flex justify-between items-start mb-1 gap-2">
                                                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                                                {notif.data.service_label}
                                                            </p>
                                                            <span className="text-[10px] font-semibold text-slate-400 shrink-0 whitespace-nowrap">
                                                                {timeAgo(notif.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className={`text-xs leading-relaxed mb-2.5 break-words ${notif.read_at === null ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                                                            {notif.data.message || 'New update available.'}
                                                        </p>
                                                        {notif.data.status_label && (
                                                            <span className={`px-2 py-1 rounded border text-[9px] font-bold uppercase tracking-wider inline-block ${getStatusColor(notif.data.status_code)}`}>
                                                                {notif.data.status_label}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-5 py-12 text-center flex flex-col items-center justify-center bg-white">
                                                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                                    <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">You're all caught up!</p>
                                                <p className="text-xs text-slate-500 mt-1">No recent notifications right now.</p>
                                            </div>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="p-3 border-t border-slate-100 bg-slate-50 shrink-0">
                                            <Link href="/user/requests" onClick={() => setIsNotifOpen(false)} className="block w-full py-2.5 rounded-lg text-center text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                                View My Requests
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </header>

                <main className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-10">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}