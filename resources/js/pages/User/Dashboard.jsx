import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import Swal from 'sweetalert2';

export default function UserDashboard({ auth, requests = [], stats, userRole, isAlumniVerified }) {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    
    const requestForm = useForm({ document_type: '', format: 'Hard Copy', purpose: '' });
    const proofForm = useForm({ proof_file: null });

    // SweetAlert Theme matching CED Branding
    const MySwal = Swal.mixin({
        customClass: {
            popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
            title: 'text-slate-900 font-extrabold text-2xl pt-4',
            htmlContainer: 'text-slate-500 text-sm font-medium',
            confirmButton: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md transition-colors outline-none',
            icon: 'border-0 scale-125 mt-6'
        },
        buttonsStyling: false
    });

    const submitRequest = (e) => {
        e.preventDefault();
        requestForm.post('/user/requests', { 
            onSuccess: () => { 
                setIsRequestModalOpen(false); 
                requestForm.reset(); 
                MySwal.fire({
                    title: 'Request Sent!',
                    text: 'Your document request was submitted successfully.',
                    iconHtml: '✅',
                    timer: 2500,
                    showConfirmButton: false
                });
            }, 
            preserveScroll: true 
        });
    };

    const submitProof = (e) => {
        e.preventDefault();
        proofForm.post('/user/verify-alumni', { 
            onSuccess: () => { 
                setIsProofModalOpen(false); 
                proofForm.reset(); 
                MySwal.fire({
                    title: 'Uploaded!',
                    text: 'Your proof of identity is pending review.',
                    iconHtml: '📄',
                    timer: 2500,
                    showConfirmButton: false
                });
            }, 
            preserveScroll: true 
        });
    };

    const quickActions = [
        { name: "New Request", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", action: () => setIsRequestModalOpen(true) },
        { name: "Submit Inquiry", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", action: () => MySwal.fire({ title: 'Coming Soon', text: 'Inquiries module is under development.', iconHtml: '🚧', confirmButtonText: 'Got it' }) },
        { name: "Upload Docs", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12", action: () => setIsProofModalOpen(true) },
        { name: "FAQ / Help", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", action: () => router.visit('/user/faq') },
    ];

    const getStatusStyle = (status) => {
        const s = status ? status.toLowerCase() : '';
        if (s.includes('processing')) return 'bg-blue-100 text-blue-700';
        if (s.includes('ready') || s.includes('released')) return 'bg-emerald-100 text-emerald-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    return (
        <UserLayout userRole={userRole}>
            <Head title="Dashboard" />
            <div className="p-8 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
            </div>

            <div className="p-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mb-3"><svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                        <h3 className="text-2xl font-black text-slate-900">{stats?.pending || 0}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pending</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mb-3"><svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                        <h3 className="text-2xl font-black text-slate-900">{stats?.completed || 0}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Completed</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
                <div className="flex justify-between items-center gap-2 overflow-x-auto mb-10 pb-2">
                    {quickActions.map((action, idx) => (
                        <button key={idx} onClick={action.action} className="flex flex-col items-center gap-3 group min-w-[80px]">
                            <div className="w-14 h-14 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center group-hover:border-yellow-400 group-hover:bg-yellow-50 transition-colors">
                                <svg className="w-6 h-6 text-slate-600 group-hover:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} /></svg>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{action.name}</span>
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
                        <button onClick={() => setIsProofModalOpen(true)} className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl text-xs shadow-sm w-full sm:w-auto">Upload</button>
                    </div>
                )}

                {/* My Requests List */}
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">My Requests</h2>
                    <Link href="/user/requests" className="text-[11px] font-bold text-yellow-600 hover:text-yellow-700">View All</Link>
                </div>
                <div className="space-y-3">
                    {requests.length > 0 ? requests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">{req.document_type}</h4>
                                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{req.created_at}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)}`}>{req.status}</span>
                        </div>
                    )) : <p className="text-sm text-slate-500 text-center py-4 border border-slate-100 rounded-2xl">No recent requests found.</p>}
                </div>
            </div>

            {/* Request Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-lg">Request Document</h3>
                            <button onClick={() => setIsRequestModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={submitRequest} className="p-6 space-y-4">
                            <div>
                                <select value={requestForm.data.document_type} onChange={e => requestForm.setData('document_type', e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none" required>
                                    <option value="" disabled>Select Document...</option>
                                    <option value="Internship Certificate">Internship Certificate</option>
                                    <option value="Copy of COBC">Copy of COBC</option>
                                    <option value="Course Description">Course Description</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${requestForm.data.format === 'Hard Copy' ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400' : 'border-slate-200'}`}>
                                    <input type="radio" value="Hard Copy" checked={requestForm.data.format === 'Hard Copy'} onChange={(e) => requestForm.setData('format', e.target.value)} className="text-yellow-500 focus:ring-yellow-500 border-slate-300" />
                                    <span className="ml-2 text-sm font-bold text-slate-700">Hard Copy</span>
                                </label>
                                <label className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${requestForm.data.format === 'Soft Copy' ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400' : 'border-slate-200'}`}>
                                    <input type="radio" value="Soft Copy" checked={requestForm.data.format === 'Soft Copy'} onChange={(e) => requestForm.setData('format', e.target.value)} className="text-yellow-500 focus:ring-yellow-500 border-slate-300" />
                                    <span className="ml-2 text-sm font-bold text-slate-700">Soft Copy</span>
                                </label>
                            </div>
                            <textarea rows="3" value={requestForm.data.purpose} onChange={(e) => requestForm.setData('purpose', e.target.value)} placeholder="Reason for request..." className="w-full border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 p-3 resize-none outline-none" required></textarea>
                            <button type="submit" disabled={requestForm.processing} className="w-full py-3.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm">
                                {requestForm.processing ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Proof Modal */}
            {isProofModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Upload Verification</h3>
                        <p className="text-sm text-slate-500 mb-6">Upload your Diploma or TOR to verify your alumni status.</p>
                        <form onSubmit={submitProof}>
                            <input type="file" onChange={(e) => proofForm.setData('proof_file', e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-50 border border-slate-200 cursor-pointer mb-6" required />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsProofModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors hover:bg-slate-200">Cancel</button>
                                <button type="submit" disabled={proofForm.processing} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-md hover:bg-slate-800 transition-colors">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}