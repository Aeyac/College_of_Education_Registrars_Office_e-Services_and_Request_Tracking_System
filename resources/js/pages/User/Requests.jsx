import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import Swal from 'sweetalert2';

export default function MyRequests({ requests = [], userRole, auth, isAlumniVerified }) {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    
    const requestForm = useForm({ document_type: '', format: 'Hard Copy', purpose: '' });

    const MySwal = Swal.mixin({
        customClass: {
            popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
            title: 'text-slate-900 font-extrabold text-2xl pt-4',
            htmlContainer: 'text-slate-500 text-sm font-medium',
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
                    title: 'Request Submitted!',
                    text: 'Your document request has been successfully sent.',
                    iconHtml: '✅',
                    timer: 2500,
                    showConfirmButton: false
                });
            }, 
            preserveScroll: true 
        });
    };

    const getStatusStyle = (status) => {
        const s = status ? status.toLowerCase() : '';
        if (s.includes('processing')) return 'bg-blue-100 text-blue-700';
        if (s.includes('ready') || s.includes('released')) return 'bg-emerald-100 text-emerald-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    return (
        <UserLayout userRole={userRole}>
            <Head title="My Requests" />
            
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Requests</h2>
                    <p className="text-xs text-slate-500 mt-1">Track and manage your official document requests.</p>
                </div>
                <button 
                    onClick={() => setIsRequestModalOpen(true)} 
                    disabled={auth?.user?.user_type === 'alumni' && !isAlumniVerified}
                    className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    + Submit New Request
                </button>
            </div>

            <div className="p-6 sm:p-8">
                <div className="space-y-4">
                    {requests.length > 0 ? requests.map((req) => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-slate-900">{req.document_type}</h4>
                                    <div className="flex gap-3 text-xs text-slate-400 font-medium mt-1">
                                        <span>Tracking ID: {req.id}</span>
                                        <span>•</span>
                                        <span>{req.format}</span>
                                        <span>•</span>
                                        <span>{req.created_at}</span>
                                    </div>
                                </div>
                            </div>
                            <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)} self-start sm:self-auto`}>{req.status}</span>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium">You haven't made any requests yet.</p>
                            <button onClick={() => setIsRequestModalOpen(true)} className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700">Submit your first request</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Request Document Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-lg">Request Document</h3>
                            <button onClick={() => setIsRequestModalOpen(false)} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={submitRequest} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Document Type</label>
                                <select value={requestForm.data.document_type} onChange={e => requestForm.setData('document_type', e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none" required>
                                    <option value="" disabled>Select Document...</option>
                                    <option value="Internship Certificate">Internship Certificate</option>
                                    <option value="Copy of COBC">Copy of COBC</option>
                                    <option value="Course Description">Course Description</option>
                                    <option value="Golden Grain (Yearbook)">Golden Grain (Yearbook)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Format</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${requestForm.data.format === 'Hard Copy' ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400' : 'border-slate-200 hover:border-yellow-200'}`}>
                                        <input type="radio" value="Hard Copy" checked={requestForm.data.format === 'Hard Copy'} onChange={(e) => requestForm.setData('format', e.target.value)} className="text-yellow-500 focus:ring-yellow-500 border-slate-300" />
                                        <span className="ml-2 text-sm font-bold text-slate-700">Hard Copy</span>
                                    </label>
                                    <label className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${requestForm.data.format === 'Soft Copy' ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400' : 'border-slate-200 hover:border-yellow-200'}`}>
                                        <input type="radio" value="Soft Copy" checked={requestForm.data.format === 'Soft Copy'} onChange={(e) => requestForm.setData('format', e.target.value)} className="text-yellow-500 focus:ring-yellow-500 border-slate-300" />
                                        <span className="ml-2 text-sm font-bold text-slate-700">Soft Copy</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Purpose of Request</label>
                                <textarea rows="3" value={requestForm.data.purpose} onChange={(e) => requestForm.setData('purpose', e.target.value)} placeholder="Please state your reason..." className="w-full border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 p-3 resize-none outline-none" required></textarea>
                            </div>
                            <button type="submit" disabled={requestForm.processing} className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm">
                                {requestForm.processing ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}