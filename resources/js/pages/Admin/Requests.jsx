import { useState, useEffect, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const LOCKED_STATUSES = new Set(['cancelled_returned', 'released', 'ready_for_release']);
const NOTE_REQ_STATUSES = new Set(['cancelled_returned', 'for_compliance']);

const STATUS_MAP = [
    { keys: ['pending', 'review'], style: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { keys: ['processing'], style: 'bg-blue-100 text-blue-800 border-blue-200' },
    { keys: ['compliance'], style: 'bg-purple-100 text-purple-800 border-purple-200' },
    { keys: ['cancel', 'return'], style: 'bg-red-100 text-red-800 border-red-200' },
    { keys: ['ready', 'released'], style: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
];

const getStatusStyle = (status = '') => {
    const lower = status.toLowerCase();
    const match = STATUS_MAP.find(m => m.keys.some(k => lower.includes(k)));
    return match ? match.style : 'bg-slate-100 text-slate-800 border-slate-200';
};

// Reusable UI primitives
const Icon = ({ path, className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const Badge = ({ children, className }) => (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${className}`}>
        {children}
    </span>
);

export default function ManageRequests({ requests = [] }) {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [exporting, setExporting] = useState(null);
    const { data, setData, put, processing, reset } = useForm({ status_code: '', note: '' });

    const closeModal = () => { setSelectedRequest(null); reset(); };

    const handleSelect = (req, code) => {
        setSelectedRequest(req);
        setData('status_code', req.status_code || code);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        put(`/admin/requests/${selectedRequest.id}`, { onSuccess: closeModal });
    };

    const handleExport = (type) => {
        setExporting(type);
        setTimeout(() => setExporting(null), 2000);
    };

    useEffect(() => {
        if (!selectedRequest) return;
        const onKeyDown = (e) => e.key === 'Escape' && closeModal();
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedRequest]);

    const filteredRequests = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return requests.filter(r =>
            r.student_name.toLowerCase().includes(term) ||
            String(r.id).includes(term) ||
            r.document_type.toLowerCase().includes(term)
        );
    }, [requests, searchTerm]);

    const noteIsRequired = NOTE_REQ_STATUSES.has(data.status_code);
    const isViewOnly = selectedRequest && LOCKED_STATUSES.has(selectedRequest.status_code);

    return (
        <AdminLayout>
            <Head title="Manage Requests" />

            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Requests</h2>
                    <p className="text-xs text-slate-500 mt-1">Review, process, and export student document requests.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {[
                        { type: 'excel', label: 'Export Excel', href: route('admin.export.excel'), bg: 'bg-emerald-600 hover:bg-emerald-700', icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
                        { type: 'pdf', label: 'Export PDF', href: route('admin.export.pdf'), bg: 'bg-slate-900 hover:bg-slate-800', icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", target: "_blank" }
                    ].map(exp => (
                        <a key={exp.type} href={exp.href} target={exp.target} onClick={() => handleExport(exp.type)} aria-disabled={exporting === exp.type}
                            className={`flex-1 sm:flex-none px-4 py-2.5 ${exp.bg} text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60`}>
                            {exporting === exp.type ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                            ) : <Icon path={exp.icon} />}
                            {exporting === exp.type ? 'Exporting...' : exp.label}
                        </a>
                    ))}
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div className="relative w-full sm:w-80">
                        <Icon path="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tracking ID or name..." className="w-full pl-10 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-sm" />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                <Icon path="M6 18L18 6M6 6l12 12" />
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 sm:text-right">{filteredRequests.length} of {requests.length} requests</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[950px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Date Submitted', 'Tracking ID', 'Student', 'Document Type', 'Format', 'Status', 'Actions'].map((h, i) => (
                                        <th key={h} className={`py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRequests.length > 0 ? filteredRequests.map((req) => {
                                    const isLocked = LOCKED_STATUSES.has(req.status_code);
                                    return (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{req.created_at}</td>
                                            <td className="py-4 px-6 text-sm font-bold text-slate-500 whitespace-nowrap">#{req.id}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">{req.student_name}</td>
                                            <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{req.document_type}</td>
                                            <td className="py-4 px-6 text-sm whitespace-nowrap">
                                                <Badge className="bg-slate-100 text-slate-700 border-slate-200">{req.format}</Badge>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <Badge className={`py-1.5 ${getStatusStyle(req.status)}`}>{req.status}</Badge>
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleSelect(req, isLocked ? '' : 'processing')}
                                                    className={`inline-flex items-center gap-1.5 font-bold rounded-xl text-xs transition-colors border ${isLocked
                                                            ? 'text-slate-600 px-5 py-2 bg-slate-100 border-slate-200 hover:bg-slate-200'
                                                            : 'text-yellow-700 px-4 py-2 bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                                                        }`}
                                                >
                                                    <Icon path={isLocked ? "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} className="w-3.5 h-3.5" />
                                                    {isLocked ? 'View' : 'Review'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center">
                                            <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                            <p className="text-slate-500 text-sm font-medium">No requests found.</p>
                                            {searchTerm && (
                                                <p className="text-slate-400 text-xs mt-1">
                                                    Try a different search term, or <button onClick={() => setSearchTerm('')} className="text-yellow-700 font-semibold hover:underline">clear the search</button>.
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">Update Request</h3>
                            <button onClick={closeModal} aria-label="Close" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors">
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner">
                                <p className="mb-1"><strong className="text-slate-700">Student:</strong> <span className="font-semibold text-slate-900">{selectedRequest.student_name}</span></p>
                                <p><strong className="text-slate-700">Document:</strong> <span className="font-semibold text-slate-900">{selectedRequest.document_type}</span></p>
                            </div>

                            {isViewOnly ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                                    <Badge className={`py-2 text-xs ${getStatusStyle(selectedRequest.status)}`}>{selectedRequest.status}</Badge>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdate} className="space-y-4">
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
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                            Note / Remarks {noteIsRequired && <span className="text-red-500 normal-case font-medium">(required for this status)</span>}
                                        </label>
                                        <textarea rows="3" value={data.note} onChange={e => setData('note', e.target.value)} required={noteIsRequired}
                                            placeholder="Required for compliance/returns..."
                                            className={`w-full border rounded-xl p-3 text-sm outline-none resize-none text-slate-900 ${noteIsRequired ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-slate-300 focus:ring-yellow-500 focus:border-yellow-500'
                                                }`} />
                                    </div>

                                    <div className="pt-2 flex gap-3">
                                        <button type="button" onClick={closeModal} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                        <button type="submit" disabled={processing} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm">
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {selectedRequest.status_history?.length > 0 && (
                                <div className="border-t border-slate-100 pt-4">
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