import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ManageRequests({ requests = [] }) {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { data, setData, put, processing, reset } = useForm({ status_code: '', note: '' });

    const handleUpdate = (e) => {
        e.preventDefault();
        put(`/admin/requests/${selectedRequest.id}`, { onSuccess: () => { setSelectedRequest(null); reset(); } });
    };

    const getStatusStyle = (status) => {
        if (!status) return 'bg-slate-100 text-slate-800 border-slate-200';
        const s = status.toLowerCase();
        if (s.includes('pending') || s.includes('review')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (s.includes('processing')) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (s.includes('ready') || s.includes('released')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        return 'bg-slate-100 text-slate-800 border-slate-200';
    };

    const filteredRequests = requests.filter(req => 
        req.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(req.id).includes(searchTerm) ||
        req.document_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <Head title="Manage Requests" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Requests</h2>
                    <p className="text-xs text-slate-500 mt-1">Review, process, and export student document requests.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <a 
                        href={route('admin.export.excel')} 
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export Excel
                    </a>
                    <a 
                        href={route('admin.export.pdf')} 
                        target="_blank"
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export PDF
                    </a>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tracking ID or name..." 
                    className="w-full sm:w-80 px-4 py-3 mb-6 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-sm"
                />
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[950px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking ID</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Document Type</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Format</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{req.created_at}</td>
                                        <td className="py-4 px-6 text-sm font-bold text-slate-500 whitespace-nowrap">#{req.id}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">{req.student_name}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{req.document_type}</td>
                                        <td className="py-4 px-6 text-sm whitespace-nowrap"><span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200 bg-slate-100 text-slate-700">{req.format}</span></td>
                                        <td className="py-4 px-6 whitespace-nowrap"><span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(req.status)}`}>{req.status}</span></td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <button onClick={() => { setSelectedRequest(req); setData('status_code', req.status_code || 'processing'); }} className="text-yellow-700 font-bold px-4 py-2 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors border border-yellow-200">Review</button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="7" className="py-12 text-center text-slate-500 text-sm">No requests found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <h3 className="font-bold text-slate-900 text-lg mb-4 border-b border-slate-100 pb-4 shrink-0">Update Request</h3>
                        <div className="overflow-y-auto custom-scrollbar pr-2">
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner mb-4">
                                    <p className="mb-1"><strong className="text-slate-700">Student:</strong> <span className="font-semibold text-slate-900">{selectedRequest.student_name}</span></p>
                                    <p><strong className="text-slate-700">Document:</strong> <span className="font-semibold text-slate-900">{selectedRequest.document_type}</span></p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Change Status</label>
                                    <select value={data.status_code} onChange={e => setData('status_code', e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-xl p-3 text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none">
                                        <option value="for_review">Pending Review</option>
                                        <option value="processing">Processing</option>
                                        <option value="ready_for_release">Ready for Release</option>
                                        <option value="released">Released</option>
                                        <option value="cancelled_returned">Rejected / Return</option>
                                        <option value="for_compliance">For Compliance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Note / Remarks</label>
                                    <textarea rows="3" value={data.note} onChange={e => setData('note', e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-xl p-3 text-sm focus:ring-yellow-500 outline-none resize-none" placeholder="Required for compliance/returns..."></textarea>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={() => setSelectedRequest(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm">Save Changes</button>
                                </div>
                            </form>

                            {/* Audit Trail Section */}
                            {selectedRequest.status_history && selectedRequest.status_history.length > 0 && (
                                <div className="mt-6 border-t border-slate-100 pt-4">
                                    <h4 className="text-sm font-bold text-slate-900 mb-3">Audit Trail / Activity Log</h4>
                                    <div className="space-y-3">
                                        {selectedRequest.status_history.map((log, idx) => (
                                            <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                                <div className="flex justify-between items-start mb-1 gap-2">
                                                    <span className="font-bold text-slate-800">{log.status}</span>
                                                    <span className="text-slate-400 font-medium text-[10px] shrink-0">{log.date}</span>
                                                </div>
                                                <p className="text-slate-600 mb-1">Updated by: <span className="font-semibold">{log.changed_by}</span></p>
                                                {log.note && <p className="text-slate-500 italic mt-1 leading-relaxed">"{log.note}"</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}