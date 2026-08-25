import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Chatbox from '@/Components/Chatbox';

const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.round((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
};

export default function AdminLayout({ children }) {
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
            if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let interval;
        if (auth?.user && typeof window !== 'undefined' && window.Echo) {
            window.Echo.private(`App.Models.User.${auth.user.id}`)
                .notification(() => router.reload({ only: ['auth'], preserveState: true, preserveScroll: true }));
        } else {
            interval = setInterval(() => {
                router.reload({ only: ['auth'], preserveState: true, preserveScroll: true });
            }, 30000);
        }

        return () => {
            if (auth?.user && typeof window !== 'undefined' && window.Echo) window.Echo.leave(`App.Models.User.${auth.user.id}`);
            if (interval) clearInterval(interval);
        };
    }, [auth?.user]);

    const markAsRead = () => {
        router.post('/admin/notifications/mark-as-read', {}, { preserveScroll: true, preserveState: true, onSuccess: () => setIsNotifOpen(false) });
    };

    const adminName = auth?.user?.first_name ? `${auth.user.first_name} ${auth.user.last_name}` : 'Registrar Admin';
    
    const userAvatar = auth?.user?.profile_picture 
        ? <img src={`/storage/${auth.user.profile_picture}`} alt="Profile" className="w-full h-full object-cover rounded-full" />
        : (auth?.user?.first_name ? `${auth.user.first_name.charAt(0)}${auth.user.last_name?.charAt(0) || ''}` : 'A');

    const menuItems = [
        { name: 'Overview', link: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 001 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Manage Requests', link: '/admin/requests', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Alumni Verifications', link: '/admin/alumni', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { name: 'Faculty Schedules', link: '/admin/faculty', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Announcements', link: '/admin/announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { name: 'Student Inquiries', link: '/admin/inquiries', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
        { name: 'User Management', link: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { divider: true },
        { name: 'Profile Settings', link: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-yellow-300 selection:text-slate-900">
            <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col z-20 shrink-0">
                <div className="p-8 pb-4 flex flex-col items-center border-b border-slate-100">
                    <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-inner border-2 border-white overflow-hidden">
                            {userAvatar}
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{adminName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mb-3 text-center uppercase tracking-wide">Administrator</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                    {menuItems.map((item, idx) => {
                        if (item.divider) return <div key={idx} className="h-px bg-slate-100 my-4 mx-4"></div>;
                        const isActive = (url || '').startsWith(item.link);
                        return (
                            <Link key={item.name} href={item.link} className={`w-full text-left px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 text-sm ${isActive ? 'bg-amber-50 text-amber-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
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

            <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                 <div className="p-8 pb-4 flex flex-col items-center border-b border-slate-100">
                     <div className="relative mb-3">
                         <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-inner border-2 border-white overflow-hidden">{userAvatar}</div>
                     </div>
                     <h3 className="font-bold text-slate-900 text-lg">{adminName}</h3>
                     <p className="text-[11px] text-slate-500 font-medium mb-3 text-center uppercase tracking-wide">Administrator</p>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                     {menuItems.map((item, idx) => {
                         if (item.divider) return <div key={idx} className="h-px bg-slate-100 my-4 mx-4"></div>;
                         const isActive = (url || '').startsWith(item.link);
                         return (
                             <Link key={item.name} href={item.link} onClick={() => setIsSidebarOpen(false)} className={`w-full text-left px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 text-sm ${isActive ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                                 <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-yellow-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
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

            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <header className="py-4 px-6 lg:px-10 flex justify-between items-center shrink-0 border-b-2 bg-white sticky top-0 z-30">
                    <div className="flex items-center gap-4 relative z-10 w-full justify-between lg:justify-end">
                        <div className="flex items-center gap-4 lg:hidden">
                             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900">
                                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                             </button>
                         </div>
                        
                        <div className="relative z-[100]" ref={notifRef}>
                            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`relative p-2.5 transition-colors rounded-full ${isNotifOpen ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {unreadCount > 0 && <span className="absolute top-2 right-2.5 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span></span>}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute right-0 top-full mt-3 w-[320px] bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                                        <h3 className="font-extrabold text-slate-900 text-sm">System Alerts</h3>
                                        <button onClick={markAsRead} className="text-[10px] font-bold text-amber-600">Mark read</button>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto">
                                        {notifications.length > 0 ? notifications.map((notif) => (
                                            <div key={notif.id} className="px-6 py-5 border-b border-slate-50 text-xs text-slate-700">
                                                <p className="font-bold mb-1">{notif.data.message}</p>
                                                <span className="text-[10px] text-slate-400">{timeAgo(notif.created_at)}</span>
                                            </div>
                                        )) : <div className="p-8 text-center text-slate-500 text-sm">No new alerts.</div>}
                                    </div>
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
            <Chatbox />
        </div>
    );
}