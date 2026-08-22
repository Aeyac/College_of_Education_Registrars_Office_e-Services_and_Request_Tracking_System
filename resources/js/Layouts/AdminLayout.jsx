import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }) {
    // FIX: Extract url and props correctly from Inertia's usePage hook
    const { url, props } = usePage(); 
    const { auth } = props; 
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isSidebarOpen]);

    const adminName = auth?.user?.first_name ? `${auth.user.first_name} ${auth.user.last_name}` : 'Registrar Admin';
    const adminInitials = auth?.user?.first_name ? auth.user.first_name.charAt(0) : 'A';

    const menuItems = [
        { name: 'Overview', link: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Manage Requests', link: '/admin/requests', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Alumni Verifications', link: '/admin/alumni', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { name: 'Faculty Schedules', link: '/admin/faculty', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Announcements', link: '/admin/announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { name: 'User Management', link: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex overflow-hidden selection:bg-yellow-300 selection:text-slate-900">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-slate-950 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <img src="/images/cedlogo.png" alt="CED Logo" className="w-10 h-10 rounded-full border-2 border-yellow-400" />
                        <span className="font-bold text-white text-lg tracking-tight">CED Registrar</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2 mt-4">Modules</div>
                    {menuItems.map((item) => {
                        const isActive = url.startsWith(item.link);
                        return (
                            <Link key={item.name} href={item.link} className={`w-full text-left px-4 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-3 text-sm ${isActive ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
                                <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                </svg>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-6 border-t border-slate-800">
                    <Link href="/logout" method="post" as="button" className="w-full text-left px-4 py-3.5 rounded-xl font-semibold text-red-400 hover:bg-slate-900 hover:text-red-300 transition-colors flex items-center gap-3 text-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Log Out
                    </Link>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm"></div>}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
                <header className="bg-slate-950 text-white pt-5 pb-20 px-6 lg:px-10 flex justify-between items-start relative z-0 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-slate-950 z-0"></div>
                    <div className="flex items-center gap-4 relative z-10 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-white/80 hover:text-yellow-400 transition-colors">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <div className="lg:hidden">
                                <h1 className="text-xl font-bold tracking-tight text-white">CED Admin</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="hidden md:block font-bold text-sm">{adminName}</span>
                            <div className="w-9 h-9 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-black shadow-inner">{adminInitials}</div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto relative z-10 -mt-10 lg:-mt-12 px-4 sm:px-6 lg:px-10 pb-10">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-sm border border-slate-200/60 min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}