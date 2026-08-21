import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminDashboard({ 
    auth, 
    requests = [
        { id: 'REQ-003', student_name: 'Maria Clara', document_type: 'Golden Grain (Yearbook)', format: 'Hard Copy', created_at: 'Oct 24, 2026', status: 'Pending Review' },
        { id: 'REQ-004', student_name: 'Jose Rizal', document_type: 'Course Description', format: 'Soft Copy', created_at: 'Oct 23, 2026', status: 'Processing' }
    ], 
    stats = { pending: 24, completed: 12, inquiries: 8 },
    alumni = [
        { id: 'ALV-001', name: 'Juan Luna', batch: '2024', proof: 'diploma_luna.pdf', status: 'Pending' }
    ],
    faculty = [
        { id: 1, name: 'Dr. Jupeth T. Pentang', role: 'Technology Research', room: 'CED Rm 101', hours: 'Mon/Wed 1:00 PM - 3:00 PM' }
    ],
    announcements = [
        { id: 1, title: 'Internship Certificate Processing Schedule', content: 'Processing begins next week. Please inform all students.', date: 'Oct 15, 2026', status: 'Published' }
    ]
}) {
    const [activeTab, setActiveTab] = useState('Overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Modals
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

    // Forms
    const requestForm = useForm({ status: '', remarks: '' });
    const alumniForm = useForm({ status: '' });
    const facultyForm = useForm({ id: null, name: '', role: '', room: '', hours: '' });
    const announceForm = useForm({ id: null, title: '', content: '', is_published: true });

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

    // Form Submissions
    const handleUpdateRequest = (e) => {
        e.preventDefault();
        requestForm.put(`/admin/requests/${selectedRequest.id}`, { onSuccess: () => setIsReviewModalOpen(false), preserveScroll: true });
    };

    const handleVerifyAlumni = (status) => {
        alumniForm.transform((data) => ({ ...data, status })).put(`/admin/alumni/${selectedAlumni.id}`, { onSuccess: () => setIsVerifyModalOpen(false), preserveScroll: true });
    };

    const handleSaveFaculty = (e) => {
        e.preventDefault();
        if (facultyForm.data.id) facultyForm.put(`/admin/faculty/${facultyForm.data.id}`, { onSuccess: () => setIsFacultyModalOpen(false), preserveScroll: true });
        else facultyForm.post('/admin/faculty', { onSuccess: () => setIsFacultyModalOpen(false), preserveScroll: true });
    };

    const handleSaveAnnouncement = (e) => {
        e.preventDefault();
        if (announceForm.data.id) announceForm.put(`/admin/announcements/${announceForm.data.id}`, { onSuccess: () => setIsAnnouncementModalOpen(false), preserveScroll: true });
        else announceForm.post('/admin/announcements', { onSuccess: () => setIsAnnouncementModalOpen(false), preserveScroll: true });
    };

    const adminFirstName = auth?.user?.first_name || 'Admin';
    const adminName = auth?.user?.first_name ? `${auth.user.first_name} ${auth.user.last_name}` : (auth?.user?.name || 'Registrar Admin');

    // Sidebar Menu Items for Admin
    const menuItems = [
        { name: 'Overview', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
        { name: 'Manage Requests', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
        { name: 'Alumni Verifications', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
        { name: 'Faculty Schedules', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
        { name: 'Announcements', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /> },
    ];

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Pending Review': 
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'Processing': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'Ready for Release': 
            case 'Verified': 
            case 'Published': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-slate-100 text-slate-800 border border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex overflow-hidden selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Registrar Admin - CED" />

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
                            {adminFirstName.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-1 w-5 h-5 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-slate-900 font-bold">A</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{adminName}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-1">College Registrar</p>
                    <p className="text-[10px] text-yellow-600 uppercase tracking-widest text-center mt-2 font-bold bg-yellow-50 px-3 py-1 rounded-md">Full Access</p>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Registrar Modules</div>
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.name;
                        return (
                            <button 
                                key={item.name} 
                                onClick={() => handleTabChange(item.name)} 
                                className={`w-full text-left px-4 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-3 text-sm ${isActive ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <svg className={`w-5 h-5 ${isActive ? 'text-yellow-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon}</svg>
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
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-950/40 z-40 lg:hidden backdrop-blur-sm"></div>}

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
                
                {/* Dark Slate Header */}
                <header className="bg-slate-950 text-white pt-5 pb-20 px-6 lg:px-10 flex justify-between items-start relative z-0 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-slate-950 z-0"></div>
                    <div className="flex items-center gap-4 relative z-10 w-full justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-white/80 hover:text-yellow-400">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <div className="lg:hidden">
                                <h1 className="text-xl font-bold tracking-tight">CED Admin</h1>
                                <p className="text-yellow-400 text-xs mt-0.5">Registrar Portal</p>
                            </div>
                        </div>

                        {/* Notification Bell */}
                        <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            {stats.inquiries > 0 && <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950"></span>}
                        </button>
                    </div>
                </header>

                {/* Overlapping Content Container */}
                <main className="flex-1 overflow-y-auto relative z-10 -mt-10 lg:-mt-12 px-4 sm:px-6 lg:px-10 pb-10">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-sm border border-slate-200/60 min-h-full">
                        
                        {/* Dynamic Header inside the white container */}
                        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{activeTab}</h2>
                            
                            {/* Contextual Top Actions */}
                            {activeTab === 'Manage Requests' && (
                                <a href="/admin/export" className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors w-full sm:w-auto text-center">Export Report</a>
                            )}
                            {activeTab === 'Faculty Schedules' && (
                                <button onClick={() => { facultyForm.reset(); setIsFacultyModalOpen(true); }} className="px-5 py-2 bg-yellow-400 text-slate-900 text-sm font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors w-full sm:w-auto text-center">+ Add Faculty</button>
                            )}
                            {activeTab === 'Announcements' && (
                                <button onClick={() => { announceForm.reset(); setIsAnnouncementModalOpen(true); }} className="px-5 py-2 bg-yellow-400 text-slate-900 text-sm font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors w-full sm:w-auto text-center">+ New Post</button>
                            )}
                        </div>

                        <div className="p-6">
                            {/* --- TAB: OVERVIEW --- */}
                            {activeTab === 'Overview' && (
                                <div className="animate-in fade-in">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Analytics Overview</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                        <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 shadow-sm flex items-center justify-between">
                                            <div><p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">Pending Requests</p><h3 className="text-3xl font-black text-yellow-900">{stats.pending}</h3></div>
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                                        </div>
                                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
                                            <div><p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Completed Requests</p><h3 className="text-3xl font-black text-emerald-900">{stats.completed}</h3></div>
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                                        </div>
                                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                                            <div><p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Unread Inquiries</p><h3 className="text-3xl font-black text-blue-900">{stats.inquiries}</h3></div>
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
                                        </div>
                                    </div>
                                    <div className="text-center p-12 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                                        <p className="text-slate-600 font-medium">Ready to process student documents?</p>
                                        <button onClick={() => handleTabChange('Manage Requests')} className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">Go to Requests</button>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: MANAGE REQUESTS --- */}
                            {activeTab === 'Manage Requests' && (
                                <div className="animate-in fade-in">
                                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                        <input type="text" placeholder="Search tracking ID or student name..." className="w-full sm:max-w-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none" />
                                        <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none w-full sm:w-auto">
                                            <option>All Statuses</option>
                                            <option>Pending Review</option>
                                            <option>Processing</option>
                                        </select>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto pb-2">
                                            <table className="w-full text-left min-w-[900px]">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking ID</th>
                                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Document Type</th>
                                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Format</th>
                                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {requests.length > 0 ? requests.map((req, i) => (
                                                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                            <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{req.id}</td>
                                                            <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">{req.student_name}</td>
                                                            <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{req.document_type}</td>
                                                            <td className="py-4 px-6 text-sm whitespace-nowrap"><span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">{req.format}</span></td>
                                                            <td className="py-4 px-6 text-sm whitespace-nowrap"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)}`}>{req.status}</span></td>
                                                            <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                                                                <button onClick={() => { setSelectedRequest(req); requestForm.setData('status', req.status); setIsReviewModalOpen(true); }} className="text-yellow-700 font-bold px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors shadow-sm">Review & Update</button>
                                                            </td>
                                                        </tr>
                                                    )) : <tr><td colSpan="6" className="py-12 text-center text-slate-500 text-sm">No requests found.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: ALUMNI VERIFICATIONS --- */}
                            {activeTab === 'Alumni Verifications' && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in overflow-hidden">
                                    <div className="overflow-x-auto pb-2">
                                        <table className="w-full text-left min-w-[800px]">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Alumni Name</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch Year</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Proof</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alumni.map((alum, i) => (
                                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                        <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{alum.name}</td>
                                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{alum.batch}</td>
                                                        <td className="py-4 px-6 text-sm whitespace-nowrap">
                                                            <a href="#" className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                                {alum.proof}
                                                            </a>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm whitespace-nowrap"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(alum.status)}`}>{alum.status}</span></td>
                                                        <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                                                            <button onClick={() => { setSelectedAlumni(alum); setIsVerifyModalOpen(true); }} className="text-slate-700 font-bold px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors shadow-sm">Verify Data</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: FACULTY SCHEDULES --- */}
                            {activeTab === 'Faculty Schedules' && (
                                <div className="animate-in fade-in space-y-4">
                                    {faculty.map((prof, i) => (
                                        <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center gap-6">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xl shrink-0">{prof.name.charAt(4)}</div>
                                            <div className="flex-grow overflow-hidden">
                                                <h4 className="font-bold text-slate-900 text-lg truncate">{prof.name}</h4>
                                                <p className="text-sm font-bold text-yellow-600 mb-3 truncate">{prof.role}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="flex items-center gap-2 truncate"><strong className="text-slate-400">Room:</strong> {prof.room}</span>
                                                    <span className="flex items-center gap-2 truncate"><strong className="text-slate-400">Hours:</strong> {prof.hours}</span>
                                                </div>
                                            </div>
                                            <div className="flex sm:flex-col gap-2 w-full sm:w-32 shrink-0">
                                                <button onClick={() => { facultyForm.setData({ id: prof.id, name: prof.name, role: prof.role, room: prof.room, hours: prof.hours }); setIsFacultyModalOpen(true); }} className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors">Edit</button>
                                                <button onClick={() => confirm('Delete schedule?') && router.delete(`/admin/faculty/${prof.id}`)} className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors">Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* --- TAB: ANNOUNCEMENTS --- */}
                            {activeTab === 'Announcements' && (
                                <div className="animate-in fade-in space-y-4">
                                    {announcements.map((ann, i) => (
                                        <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                                <h4 className="font-bold text-lg text-slate-900">{ann.title}</h4>
                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 whitespace-nowrap">{ann.date}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">{ann.content}</p>
                                            <div className="flex gap-3">
                                                <button onClick={() => { announceForm.setData({ id: ann.id, title: ann.title, content: ann.content, is_published: true }); setIsAnnouncementModalOpen(true); }} className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors shadow-sm">Edit Post</button>
                                                <button onClick={() => confirm('Archive post?') && router.delete(`/admin/announcements/${ann.id}`)} className="px-5 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors shadow-sm">Archive</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>

            {/* --- ADMIN MODALS --- */}
            {isReviewModalOpen && selectedRequest && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">Update Request</h3>
                            <button onClick={closeReviewModal} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleUpdateRequest} className="space-y-5">
                                <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner">
                                    <p className="mb-1"><strong className="text-slate-700">Student:</strong> <span className="font-semibold text-slate-900">{selectedRequest.student_name}</span></p>
                                    <p><strong className="text-slate-700">Document:</strong> <span className="font-semibold text-slate-900">{selectedRequest.document_type}</span></p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Change Status</label>
                                    <select value={requestForm.data.status} onChange={(e) => requestForm.setData('status', e.target.value)} className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-yellow-500 focus:border-yellow-500 outline-none shadow-sm">
                                        <option value="Pending Review">Pending Review</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Ready for Release">Ready for Release</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={closeReviewModal} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button type="submit" disabled={requestForm.processing} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm">{requestForm.processing ? 'Saving...' : 'Save Changes'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isVerifyModalOpen && selectedAlumni && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Verify {selectedAlumni.name}</h3>
                        <p className="text-sm text-slate-500 mb-6">Review the uploaded proof to grant access to certificate requests.</p>
                        <a href="#" className="inline-block px-4 py-3 bg-slate-50 text-slate-800 font-bold rounded-xl text-sm mb-6 w-full border border-slate-200 truncate hover:bg-slate-100 transition-colors shadow-sm">{selectedAlumni.proof}</a>
                        <div className="flex gap-3">
                            <button onClick={() => handleVerifyAlumni('Rejected')} className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold rounded-xl text-sm transition-colors">Reject</button>
                            <button onClick={() => handleVerifyAlumni('Verified')} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md transition-colors">Approve</button>
                        </div>
                        <button onClick={() => setIsVerifyModalOpen(false)} className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel & Close</button>
                    </div>
                </div>
            )}

            {isFacultyModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">{facultyForm.data.id ? 'Edit' : 'Add'} Faculty</h3>
                            <button onClick={() => setIsFacultyModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleSaveFaculty} className="space-y-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label><input type="text" value={facultyForm.data.name} onChange={e => facultyForm.setData('name', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none" required/></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role/Dept</label><input type="text" value={facultyForm.data.role} onChange={e => facultyForm.setData('role', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none" required/></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room</label><input type="text" value={facultyForm.data.room} onChange={e => facultyForm.setData('room', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none" required/></div>
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hours</label><input type="text" value={facultyForm.data.hours} onChange={e => facultyForm.setData('hours', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none" required/></div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsFacultyModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button type="submit" disabled={facultyForm.processing} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm">{facultyForm.processing ? 'Saving...' : 'Save Schedule'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isAnnouncementModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">{announceForm.data.id ? 'Edit' : 'New'} Post</h3>
                            <button onClick={() => setIsAnnouncementModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label><input type="text" value={announceForm.data.title} onChange={e => announceForm.setData('title', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none" required/></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label><textarea rows="5" value={announceForm.data.content} onChange={e => announceForm.setData('content', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 p-3 resize-none outline-none" required></textarea></div>
                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={() => setIsAnnouncementModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button type="submit" disabled={announceForm.processing} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm">{announceForm.processing ? 'Posting...' : 'Post Announcement'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}