import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UserDashboard({ 
    auth, 
    requests = [
        { id: 'REQ-001', document_type: 'Internship Certificate', format: 'Hard Copy', created_at: 'Oct 24, 2026', status: 'Processing' },
        { id: 'REQ-002', document_type: 'Copy of COBC', format: 'Soft Copy', created_at: 'Oct 20, 2026', status: 'Ready for Release' }
    ], 
    announcements = [
        { id: 1, title: 'Internship Certificate Processing Schedule', content: 'Processing begins next week. Please ensure all requirements are submitted via the portal.', date: 'Oct 15, 2026' },
        { id: 2, title: 'Deadline Reminders for Requirements', content: 'Submit all missing documents to avoid cancellation of your request.', date: 'Sep 28, 2026' }
    ],
    faculty = [
        { id: 1, name: 'Dr. Jupeth T. Pentang', role: 'Technology Research', room: 'CED Rm 101', hours: 'Mon/Wed 1:00 PM - 3:00 PM' }
    ],
    isAlumniVerified = false 
}) {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Modals
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);

    const requestForm = useForm({ document_type: '', format: 'Hard Copy', purpose: '' });
    const proofForm = useForm({ proof_file: null });

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

    const openRequestModal = (service) => {
        requestForm.setData('document_type', service);
        setIsRequestModalOpen(true);
    };

    const submitRequest = (e) => {
        e.preventDefault();
        requestForm.post('/user/requests', { onSuccess: () => { setIsRequestModalOpen(false); requestForm.reset(); }, preserveScroll: true });
    };

    const submitProof = (e) => {
        e.preventDefault();
        proofForm.post('/user/verify-alumni', { onSuccess: () => { setIsProofModalOpen(false); proofForm.reset(); }, preserveScroll: true });
    };

    const userFirstName = auth?.user?.first_name || 'Juan';
    const userName = auth?.user?.first_name ? `${auth.user.first_name} ${auth.user.last_name}` : (auth?.user?.name || 'Juan Dela Cruz');
    const userRole = auth?.user?.user_type === 'alumni' ? 'Alumni' : 'BS Elementary Education • 2nd Year';

    // Sidebar Menu Items Setup matching the mockup
    const menuItems = [
        { name: 'Dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
        { name: 'My Requests', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
        { name: 'Faculty Schedules', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
        { name: 'Announcements', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /> },
        { name: 'Documents', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /> },
        { divider: true },
        { name: 'FAQ / Help Center', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        { name: 'Profile Settings', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
        { name: 'Change Password', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> },
        { divider: true },
        { name: 'About CED Registrar', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> },
        { name: 'Privacy Policy', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
        { name: 'Terms of Service', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    ];

    const quickActions = [
        { name: "New Request", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", action: () => openRequestModal('General Document') },
        { name: "Submit Inquiry", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", action: () => alert('Inquiry module opening...') },
        { name: "Upload Docs", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12", action: () => setIsProofModalOpen(true) },
        { name: "FAQ / Help", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", action: () => handleTabChange('FAQ / Help Center') },
    ];

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
            case 'Processing': return 'bg-blue-100 text-blue-800';
            case 'Ready for Release': return 'bg-emerald-100 text-emerald-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex overflow-hidden selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Student Portal - CED" />

            {/* --- SIDEBAR / DRAWER --- */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-r-sm flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Close Button (Mobile Only) */}
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Profile Section in Sidebar */}
                <div className="p-6 pt-10 flex flex-col items-center border-b border-slate-100">
                    <div className="relative mb-3">
                        <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-inner shadow-slate-950">
                            {userFirstName.charAt(0)}{auth?.user?.last_name?.charAt(0) || ''}
                        </div>
                        <span className="absolute bottom-0 right-1 w-5 h-5 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center text-[10px]">👋</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Hello, {userName}!</h3>
                    <p className="text-xs text-slate-500 font-medium mb-1">{userRole}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center mt-2">Welcome to CED Registrar <br/> e-Services Portal</p>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {menuItems.map((item, idx) => {
                        if (item.divider) return <div key={idx} className="h-px bg-slate-100 my-4 mx-2"></div>;
                        const isActive = activeTab === item.name;
                        return (
                            <button 
                                key={item.name} 
                                onClick={() => handleTabChange(item.name)} 
                                className={`w-full text-left px-4 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-3 text-sm ${isActive ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <svg className={`w-5 h-5 ${isActive ? 'text-yellow-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {item.icon}
                                </svg>
                                {item.name}
                            </button>
                        );
                    })}
                    
                    <div className="h-px bg-slate-100 my-4 mx-2"></div>
                    <Link href="/logout" method="post" as="button" className="w-full text-left px-4 py-3.5 rounded-xl font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-3 text-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Log Out
                    </Link>
                </div>

                <div className="p-4 text-center text-xs text-slate-400 font-medium">v1.0.0</div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-950/40 z-40 lg:hidden backdrop-blur-sm"></div>}

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
                
                {/* Slate-950 Header mimicking the dark header in the mockup */}
                <header className="bg-slate-950 text-white pt-5 pb-20 px-6 lg:px-10 flex justify-between items-start relative z-0 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-slate-950 z-0"></div>
                    <div className="flex items-center gap-4 relative z-10 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-white/80 hover:text-white">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <div className="lg:hidden">
                                <h1 className="text-xl font-bold tracking-tight">CED Registrar</h1>
                                <p className="text-slate-400 text-xs mt-0.5">e-Services Portal</p>
                            </div>
                        </div>

                        {/* Notification Bell */}
                        <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950"></span>
                        </button>
                    </div>
                </header>

                {/* Overlapping Content Container */}
                <main className="flex-1 overflow-y-auto relative z-10 -mt-10 lg:-mt-12 px-4 sm:px-6 lg:px-10 pb-10">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-sm border border-slate-200/60 min-h-full">
                        
                        {/* Dynamic Header inside the white container */}
                        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{activeTab}</h2>
                        </div>

                        <div className="p-6">
                            {/* --- TAB: DASHBOARD --- */}
                            {activeTab === 'Dashboard' && (
                                <div className="animate-in fade-in">
                                    {/* Search Bar Placeholder */}
                                    <div className="relative mb-8">
                                        <input type="text" placeholder="Search services, requests..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 shadow-sm transition-all outline-none" />
                                        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>

                                    {/* Analytics/Summary Cards */}
                                    <div className="flex gap-4 overflow-x-auto pb-4 mb-6 snap-x">
                                        <div className="min-w-[140px] bg-white border border-slate-200 p-5 rounded-2xl shadow-sm snap-center flex-1 text-center flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center mb-2"><svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                            <h3 className="text-2xl font-black text-slate-900">{requests.filter(r => r.status === 'Pending Review' || r.status === 'Processing').length}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pending</p>
                                        </div>
                                        <div className="min-w-[140px] bg-white border border-slate-200 p-5 rounded-2xl shadow-sm snap-center flex-1 text-center flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2"><svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                            <h3 className="text-2xl font-black text-slate-900">{requests.filter(r => r.status === 'Ready for Release' || r.status === 'Released').length}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Completed</p>
                                        </div>
                                    </div>

                                    {/* Quick Actions Grid matching the image */}
                                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
                                    <div className="grid grid-cols-4 gap-3 mb-8">
                                        {quickActions.map((action, idx) => (
                                            <button key={idx} onClick={action.action} className="flex flex-col items-center gap-2 group">
                                                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-colors shadow-sm">
                                                    <svg className="w-6 h-6 text-slate-600 group-hover:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} /></svg>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{action.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Alumni Alert */}
                                    {auth?.user?.user_type === 'alumni' && !isAlumniVerified && (
                                        <div className="mb-8 bg-white border border-yellow-300 shadow-sm rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm">Alumni Verification</h3>
                                                    <p className="text-slate-500 text-xs mt-1">Upload Diploma/TOR to unlock requests.</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setIsProofModalOpen(true)} className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl text-sm shadow-sm w-full sm:w-auto">Upload</button>
                                        </div>
                                    )}

                                    {/* My Requests List */}
                                    <div className="flex justify-between items-end mb-4">
                                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Requests</h2>
                                        <button onClick={() => handleTabChange('My Requests')} className="text-xs font-bold text-yellow-600 hover:text-yellow-700">View All</button>
                                    </div>
                                    <div className="space-y-3">
                                        {requests.length > 0 ? requests.slice(0, 3).map((req, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-900">{req.document_type}</h4>
                                                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{req.created_at}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        )) : <p className="text-sm text-slate-500 text-center py-4">No requests found.</p>}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: MY REQUESTS --- */}
                            {activeTab === 'My Requests' && (
                                <div className="animate-in fade-in">
                                    <button onClick={() => openRequestModal('General Document')} className="w-full py-3 mb-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition-colors">
                                        + Submit New Request
                                    </button>
                                    <div className="space-y-4">
                                        {requests.map((req, i) => (
                                            <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-sm text-slate-900">{req.document_type}</h4>
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)}`}>{req.status}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-500 font-medium">
                                                    <span>ID: {req.id}</span>
                                                    <span>{req.format}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: FACULTY SCHEDULES --- */}
                            {activeTab === 'Faculty Schedules' && (
                                <div className="animate-in fade-in space-y-4">
                                    <p className="text-sm text-slate-500 mb-6">Search and view consultation hours of CED professors.</p>
                                    {faculty.map((prof, i) => (
                                        <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0 border border-slate-200">{prof.name.charAt(4)}</div>
                                            <div className="overflow-hidden w-full">
                                                <h4 className="font-bold text-sm text-slate-900 truncate">{prof.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium mb-3 truncate">{prof.role}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="flex items-center gap-2 truncate"><svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> {prof.room}</span>
                                                    <span className="flex items-center gap-2 truncate"><svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {prof.hours}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* --- TAB: ANNOUNCEMENTS --- */}
                            {activeTab === 'Announcements' && (
                                <div className="animate-in fade-in space-y-4">
                                    {announcements.map((ann, i) => (
                                        <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                                <h4 className="font-bold text-sm text-slate-900 leading-snug">{ann.title}</h4>
                                                <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100 whitespace-nowrap">{ann.date}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* --- PLACEHOLDER TABS --- */}
                            {['Calendar', 'Documents', 'FAQ / Help Center', 'Profile Settings', 'About CED Registrar', 'Privacy Policy', 'Terms of Service'].includes(activeTab) && (
                                <div className="animate-in fade-in text-center py-16 px-4">
                                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{activeTab}</h3>
                                    <p className="text-sm text-slate-500 max-w-sm mx-auto">This module is part of the system documentation and will be populated with content soon.</p>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>

            {/* --- MODALS --- */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">Request Document</h3>
                            <button onClick={closeRequestModal} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={submitRequest} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Document Type</label>
                                    <select value={requestForm.data.document_type} onChange={e => requestForm.setData('document_type', e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-yellow-500 focus:border-yellow-500 outline-none" required>
                                        <option value="" disabled>Select Document...</option>
                                        <option value="Internship Certificate">Internship Certificate</option>
                                        <option value="Copy of COBC">Copy of COBC</option>
                                        <option value="Course Description">Course Description</option>
                                        <option value="Golden Grain (Yearbook)">Golden Grain (Yearbook)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Format</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${requestForm.data.format === 'Hard Copy' ? 'border-yellow-400 bg-yellow-50/50 ring-1 ring-yellow-400' : 'border-slate-200 hover:border-yellow-200'}`}>
                                            <input type="radio" value="Hard Copy" checked={requestForm.data.format === 'Hard Copy'} onChange={(e) => requestForm.setData('format', e.target.value)} className="text-yellow-500 focus:ring-yellow-500 border-slate-300" />
                                            <span className="ml-2 text-sm font-bold text-slate-700">Hard Copy</span>
                                        </label>
                                        <label className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${requestForm.data.format === 'Soft Copy' ? 'border-yellow-400 bg-yellow-50/50 ring-1 ring-yellow-400' : 'border-slate-200 hover:border-yellow-200'}`}>
                                            <input type="radio" value="Soft Copy" checked={requestForm.data.format === 'Soft Copy'} onChange={(e) => requestForm.setData('format', e.target.value)} className="text-yellow-500 focus:ring-yellow-500 border-slate-300" />
                                            <span className="ml-2 text-sm font-bold text-slate-700">Soft Copy</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purpose</label>
                                    <textarea rows="3" value={requestForm.data.purpose} onChange={(e) => requestForm.setData('purpose', e.target.value)} placeholder="Reason for request..." className="w-full border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 p-3 resize-none outline-none" required></textarea>
                                </div>
                                <button type="submit" disabled={requestForm.processing} className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm flex justify-center items-center">
                                    {requestForm.processing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isProofModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Upload Verification</h3>
                        <p className="text-sm text-slate-500 mb-6">Upload your Diploma or TOR to verify your alumni status.</p>
                        
                        <form onSubmit={submitProof}>
                            <input type="file" onChange={(e) => proofForm.setData('proof_file', e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-50 border border-slate-200 file:text-slate-700 cursor-pointer mb-6" required />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsProofModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors hover:bg-slate-200">Cancel</button>
                                <button type="submit" disabled={proofForm.processing} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md transition-colors">{proofForm.processing ? 'Uploading...' : 'Upload'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}