import { useState, useEffect, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icon';

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

const STATUS_FILTER_OPTIONS = [
    { value: 'for_review', label: 'Pending Review' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready_for_release', label: 'Ready for Release' },
    { value: 'released', label: 'Released' },
    { value: 'cancelled_returned', label: 'Rejected / Return' },
    { value: 'for_compliance', label: 'For Compliance' },
];

const Badge = ({ children, className }) => (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${className}`}>
        {children}
    </span>
);

export default function ManageRequests({ requests = [], showingArchived = false }) {

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [docTypeFilter, setDocTypeFilter] = useState('all');
    const [exporting, setExporting] = useState(null);
    const [archiving, setArchiving] = useState(null); // holds the id currently being archived/restored
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

    const handleArchive = (id) => {
        if (!window.confirm('Archive this request? You can restore it later from the Archived view.')) return;
        setArchiving(id);
        router.patch(`/admin/requests/${id}/archive`, {}, {
            preserveScroll: true,
            onFinish: () => setArchiving(null),
            onSuccess: () => selectedRequest?.id === id && closeModal(),
        });
    };

    const handleUnarchive = (id) => {
        setArchiving(id);
        router.patch(`/admin/requests/${id}/unarchive`, {}, {
            preserveScroll: true,
            onFinish: () => setArchiving(null),
            onSuccess: () => selectedRequest?.id === id && closeModal(),
        });
    };

    const toggleArchivedView = () => {
        router.get(window.location.pathname, { archived: showingArchived ? 0 : 1 }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (!selectedRequest) return;
        const onKeyDown = (e) => e.key === 'Escape' && closeModal();
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedRequest]);

    const documentTypes = useMemo(() => {
        return [...new Set(requests.map(r => r.document_type).filter(Boolean))].sort();
    }, [requests]);

    const filteredRequests = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return requests.filter(r => {
            const matchesTerm =
                r.student_name.toLowerCase().includes(term) ||
                String(r.id).includes(term) ||
                r.document_type.toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || r.status_code === statusFilter;
            const matchesDocType = docTypeFilter === 'all' || r.document_type === docTypeFilter;
            return matchesTerm && matchesStatus && matchesDocType;
        });
    }, [requests, searchTerm, statusFilter, docTypeFilter]);

    const noteIsRequired = NOTE_REQ_STATUSES.has(data.status_code);
    const isViewOnly = selectedRequest && (LOCKED_STATUSES.has(selectedRequest.status_code) || selectedRequest.is_archived);

    return (
        <AdminLayout>
            <Head title="Manage Requests" />

            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Manage Requests
                        {showingArchived && (
                            <span className="ml-2 align-middle text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Archived
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        {showingArchived
                            ? 'Viewing archived requests. Restore any of these to bring them back to the active list.'
                            : 'Review, process, and export student document requests.'}
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={toggleArchivedView}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Icon path={showingArchived
                            ? "M15 19l-7-7 7-7"
                            : "M5 8h14M5 8a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"} />
                        {showingArchived ? 'Back to Active' : 'Show Archived'}
                    </button>
                    {[
                        { type: 'excel', label: 'Export Excel', hrefBase: route('admin.export.excel'), bg: 'bg-emerald-600 hover:bg-emerald-700', icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
                        { type: 'pdf', label: 'Export PDF', hrefBase: route('admin.export.pdf'), bg: 'bg-slate-900 hover:bg-slate-800', icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", target: "_blank" }
                    ].map(exp => {
                        const isFiltered = filteredRequests.length !== requests.length;
                        const href = isFiltered
                            ? `${exp.hrefBase}?ids=${filteredRequests.map(r => r.id).join(',')}`
                            : exp.hrefBase;
                        return (
                            <a key={exp.type} href={href} target={exp.target} onClick={() => handleExport(exp.type)} aria-disabled={exporting === exp.type}
                                className={`flex-1 sm:flex-none px-4 py-2.5 ${exp.bg} text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60`}>
                                {exporting === exp.type ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                ) : <Icon path={exp.icon} />}
                                {exporting === exp.type ? 'Exporting...' : exp.label}
                            </a>
                        );
                    })}
                </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-col lg:flex-row gap-3 justify-between">
                    <div className="relative flex-1">
                        <Icon path="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search tracking ID or name..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-9 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm transition-all"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                <Icon path="M6 18L18 6M6 6l12 12" />
                            </button>
                        )}
                    </div>
                    <select
                        value={docTypeFilter}
                        onChange={(e) => setDocTypeFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                        <option value="all">All Document Types</option>
                        {documentTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                        <option value="all">All Statuses</option>
                        {STATUS_FILTER_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <p className="text-xs text-slate-400">{filteredRequests.length} of {requests.length} requests</p>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[950px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {['Date Submitted', 'Tracking ID', 'Student', 'Document Type', 'Delivery Mode', 'Status', 'Actions'].map((h, i) => (
                                        <th key={h} className={`py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRequests.length > 0 ? filteredRequests.map((req) => {
                                    const isLocked = LOCKED_STATUSES.has(req.status_code);
                                    const isBusy = archiving === req.id;
                                    return (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{req.created_at}</td>
                                            <td className="py-4 px-6 text-sm font-bold text-slate-500 whitespace-nowrap">#{req.id}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">{req.student_name}</td>
                                            <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{req.document_type}</td>
                                            <td className="py-4 px-6 text-sm whitespace-nowrap">
                                                <Badge className="bg-slate-100 text-slate-700 border-slate-200">{req.delivery_mode}</Badge>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <Badge className={`py-1.5 ${getStatusStyle(req.status)}`}>{req.status}</Badge>
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-2">
                                                    {req.is_archived ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSelect(req, '')}
                                                                className="inline-flex items-center gap-1.5 text-slate-600 font-bold px-5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs hover:bg-slate-200 transition-colors"
                                                            >
                                                                <Icon path="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" className="w-3.5 h-3.5" />
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleUnarchive(req.id)}
                                                                disabled={isBusy}
                                                                className="inline-flex items-center gap-1.5 text-blue-700 font-bold px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs hover:bg-blue-100 transition-colors disabled:opacity-60"
                                                            >
                                                                <Icon path="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className="w-3.5 h-3.5" />
                                                                {isBusy ? 'Restoring...' : 'Restore'}
                                                            </button>
                                                        </>
                                                    ) : isLocked ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSelect(req, '')}
                                                                className="inline-flex items-center gap-1.5 text-slate-600 font-bold px-5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs hover:bg-slate-200 transition-colors"
                                                            >
                                                                <Icon path="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" className="w-3.5 h-3.5" />
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleArchive(req.id)}
                                                                disabled={isBusy}
                                                                className="inline-flex items-center gap-1.5 text-red-600 font-bold px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs hover:bg-red-100 transition-colors disabled:opacity-60"
                                                            >
                                                                <Icon path="M5 8h14M5 8a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" className="w-3.5 h-3.5" />
                                                                {isBusy ? 'Archiving...' : 'Archive'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSelect(req, 'processing')}
                                                            className="inline-flex items-center gap-1.5 text-yellow-700 font-bold px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-xs hover:bg-yellow-100 transition-colors"
                                                        >
                                                            <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className="w-3.5 h-3.5" />
                                                            Review
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center">
                                            <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                            <p className="text-slate-500 text-sm font-medium">
                                                {showingArchived ? 'No archived requests.' : 'No requests found.'}
                                            </p>
                                            {(searchTerm || statusFilter !== 'all' || docTypeFilter !== 'all') && (
                                                <p className="text-slate-400 text-xs mt-1">
                                                    Try different filters, or{' '}
                                                    <button
                                                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDocTypeFilter('all'); }}
                                                        className="text-yellow-700 font-semibold hover:underline"
                                                    >
                                                        clear all filters
                                                    </button>.
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
                            <h3 className="font-bold text-slate-900 text-lg">
                                {selectedRequest.is_archived ? 'Archived Request' : 'Update Request'}
                            </h3>
                            <button onClick={closeModal} aria-label="Close" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors">
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner">
                                <p className="mb-1"><strong className="text-slate-700">Student:</strong> <span className="font-semibold text-slate-900">{selectedRequest.student_name}</span></p>
                                <p><strong className="text-slate-700">Document:</strong> <span className="font-semibold text-slate-900">{selectedRequest.document_type}</span></p>
                                <p><strong className="text-slate-700">Delivery Mode:</strong> <span className="font-semibold text-slate-900">{selectedRequest.delivery_mode}</span></p>
                                {selectedRequest.is_archived && (
                                    <p className="mt-1"><strong className="text-slate-700">Archived On:</strong> <span className="font-semibold text-slate-900">{selectedRequest.archived_at}</span></p>
                                )}
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
                                            {STATUS_FILTER_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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

                            {selectedRequest.is_archived ? (
                                <div className="pt-2">
                                    <button
                                        onClick={() => handleUnarchive(selectedRequest.id)}
                                        disabled={archiving === selectedRequest.id}
                                        className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl text-sm border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-60"
                                    >
                                        {archiving === selectedRequest.id ? 'Restoring...' : 'Restore to Active'}
                                    </button>
                                </div>
                            ) : isViewOnly && (
                                <div className="pt-2">
                                    <button
                                        onClick={() => handleArchive(selectedRequest.id)}
                                        disabled={archiving === selectedRequest.id}
                                        className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-60"
                                    >
                                        {archiving === selectedRequest.id ? 'Archiving...' : 'Archive Request'}
                                    </button>
                                </div>
                            )}

                            {selectedRequest.status_history && selectedRequest.status_history.length > 0 && (
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