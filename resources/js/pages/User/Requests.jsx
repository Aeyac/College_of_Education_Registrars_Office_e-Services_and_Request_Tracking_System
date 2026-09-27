import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import FeedbackModal from './FeedbackModal';
import RequestDocumentModal from '@/Components/RequestDocumentModal';
import ComplianceModal from '@/Components/ComplianceModal';
import Swal from 'sweetalert2';
import SoftCopyViewerModal from '@/Components/SoftCopyViewerModal';

const LOCKED_STATUSES = new Set(['cancelled_returned', 'cancelled', 'released', 'rejected']);

const STATUS_FILTER_OPTIONS = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready_for_release', label: 'Ready for Release' },
    { value: 'released', label: 'Released' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'for_compliance', label: 'For Compliance' },
    { value: 'rejected', label: 'Rejected' },
];

const ICONS = {
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    close: 'M6 18L18 6M6 6l12 12',
    check: 'M5 13l4 4L19 7',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    eye: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
};


const showAlert = (title, text, iconPath) => Swal.mixin({
    customClass: {
        popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
        title: 'text-slate-900 font-extrabold text-2xl pt-4',
        htmlContainer: 'text-slate-500 text-sm font-medium',
        icon: 'border-0 scale-125 mt-6',
    },
    buttonsStyling: false,
}).fire({
    title,
    text,
    iconHtml: `<svg class="w-12 h-12 ${iconPath === ICONS.check ? 'text-emerald-500' : 'text-red-500'} mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPath}" /></svg>`,
    timer: 2500,
    showConfirmButton: false,
});

const getStatusStyle = (s = '') => {
    const lower = s.toLowerCase();
    if (lower.includes('processing')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (/ready|released/.test(lower)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (/rejected|cancelled/.test(lower)) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
};

function TrackingModal({ request, onClose }) {
    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                    <h3 className="font-bold text-slate-900 text-lg">Track Request</h3>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.close} />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner mb-6">
                        <p className="mb-1"><strong className="text-slate-700">Document:</strong> <span className="font-semibold text-slate-900">{request.document_type}</span></p>
                        <p><strong className="text-slate-700">Tracking ID:</strong> <span className="font-semibold text-slate-900">#{request.id}</span></p>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-4">Status History & Remarks</h4>

                    <div className="relative pl-4 border-l-2 border-slate-200 space-y-5 mt-4">
                        {request.status_history?.length > 0 ? request.status_history.map((log, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[23px] top-1 w-3 h-3 bg-yellow-400 rounded-full ring-4 ring-white" />
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <span className="font-bold text-slate-800">{log.status}</span>
                                        <span className="text-slate-400 font-medium text-[10px] shrink-0">{log.date}</span>
                                    </div>
                                    {log.note ? (
                                        <p className="text-slate-600 mt-1 italic leading-relaxed">"{log.note}"</p>
                                    ) : (
                                        <p className="text-slate-400 mt-1 italic">No remarks provided.</p>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 text-center">No tracking history available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MyRequests({
    requests,
    services = [],
    userRole,
    auth,
    isAlumniVerified,
    showingArchived = false,
    statusFilter: initialStatusFilter = 'all',
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trackingRequest, setTrackingRequest] = useState(null);
    const [feedbackTarget, setFeedbackTarget] = useState(null);
    const [receivingId, setReceivingId] = useState(null);
    const [complyingRequest, setComplyingRequest] = useState(null);
    const [archiving, setArchiving] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter || 'all');
    const [docTypeFilter, setDocTypeFilter] = useState('all');
    const [softCopyRequest, setSoftCopyRequest] = useState(null);

    const requestList = requests?.data ?? [];
    const paginationLinks = requests?.meta?.links ?? requests?.links ?? [];

    const [viewing, setViewing] = useState(null);

    const documentTypes = useMemo(
        () => [...new Set(requestList.map(r => r.document_type).filter(Boolean))].sort(),
        [requestList]
    );

    const filteredRequestList = useMemo(() => {
        const term = searchTerm.toLowerCase();
        
        const PENDING_CODES = ['submitted', 'for_review', 'processing', 'for_compliance'];
        const COMPLETED_CODES = ['ready_for_release', 'released'];

        return requestList.filter(req => {
            const matchesTerm =
                String(req.id).includes(term) ||
                (req.document_type || '').toLowerCase().includes(term);

            let matchesStatus = false;
            const code = req.status_code || '';
            
            if (statusFilter === 'all') matchesStatus = true;
            else if (statusFilter === 'pending') matchesStatus = PENDING_CODES.includes(code);
            else if (statusFilter === 'completed') matchesStatus = COMPLETED_CODES.includes(code);
            else matchesStatus = code === statusFilter;

            return (
                matchesTerm &&
                matchesStatus &&
                (docTypeFilter === 'all' || req.document_type === docTypeFilter)
            );
        });
    }, [requestList, searchTerm, statusFilter, docTypeFilter]);

    const handleReceive = req => {
        setReceivingId(req.id);

        router.post(`/user/requests/${req.id}/receive`, {}, {
            preserveScroll: true,
            onSuccess: () => showAlert('Document Received', 'Thanks for confirming! Feel free to leave feedback.', ICONS.check)
                .then(() => setFeedbackTarget(req)),
            onError: () => showAlert('Something Went Wrong', 'Could not confirm receipt. Please try again.', ICONS.warning),
            onFinish: () => setReceivingId(null),
        });
    };

    const handleArchive = id => {
        if (!window.confirm('Archive this request? You can bring it back anytime from the Archived view.')) return;

        setArchiving(id);
        router.patch(`/user/requests/${id}/archive`, {}, {
            preserveScroll: true,
            onFinish: () => setArchiving(null),
        });
    };

    const handleCancel = id => {
        if (!window.confirm('Cancel this request? This action cannot be undone.')) return;

        setCancellingId(id);
        router.patch(`/user/requests/${id}/cancel`, {}, {
            preserveScroll: true,
            onFinish: () => setCancellingId(null),
        });
    };

    const handleComply = req => {
        setComplyingRequest(req);
    };

    const handleUnarchive = id => {
        setArchiving(id);
        router.patch(`/user/requests/${id}/unarchive`, {}, {
            preserveScroll: true,
            onFinish: () => setArchiving(null),
        });
    };

    const toggleArchivedView = () => {
        router.get(window.location.pathname, {
            archived: showingArchived ? 0 : 1,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDocTypeFilter('all');
    };

    return (
        <UserLayout userRole={userRole}>
            <Head title="My Requests" />

            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div className="min-w-0">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
                        My Requests
                        {showingArchived && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Archived
                            </span>
                        )}
                    </h2>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {showingArchived
                            ? 'Viewing archived requests. Restore any of these to bring them back to your active list.'
                            : 'Track and manage your official document requests.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2.5 w-full lg:w-auto">
                    <button
                        onClick={toggleArchivedView}
                        className="w-full lg:w-auto lg:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={showingArchived ? 'M15 19l-7-7 7-7' : 'M5 8h14M5 8a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'} />
                        </svg>
                        <span>{showingArchived ? 'Back to Active' : 'Show Archived'}</span>
                    </button>

                    {!showingArchived && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={auth?.user?.user_type === 'alumni' && !isAlumniVerified}
                            className="w-full lg:w-auto lg:flex-none px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            + Submit New Request
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-3">
                    <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                        </svg>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search tracking ID or document type..."
                            className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-9 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm transition-all"
                        />

                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.close} />
                                </svg>
                            </button>
                        )}
                    </div>

                    <select
                        value={docTypeFilter}
                        onChange={e => setDocTypeFilter(e.target.value)}
                        className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3 sm:px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                        <option value="all">All Document Types</option>
                        {documentTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            // Also update the URL so the backend returns all records if we clear it
                            router.get(window.location.pathname, {
                                archived: showingArchived ? 1 : undefined,
                                status: e.target.value === 'all' ? undefined : e.target.value,
                            }, { preserveState: true, preserveScroll: true, replace: true });
                        }}
                        className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3 sm:px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">All Pending</option>
                        <option value="completed">All Completed</option>
                        <optgroup label="Specific Statuses">
                            {STATUS_FILTER_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </optgroup>
                    </select>
                </div>

                <p className="text-xs text-slate-400">
                    {filteredRequestList.length} of {requestList.length} requests
                </p>

                <div className="space-y-4">
                    {filteredRequestList.length ? filteredRequestList.map(req => {
                        const status = (req.status_code || req.status || '').toLowerCase();
                        const isCompleted = ['ready_for_release', 'released'].includes(status);
                        const hasFeedback = req.has_feedback || Boolean(req.feedback);
                        const isReceived = Boolean(req.received_at);

                        return (
                            <div key={req.id} className="flex flex-col p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.document} />
                                        </svg>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-base text-slate-900 break-words leading-snug">{req.document_type}</h4>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-medium mt-1.5">
                                            <span>Tracking ID: #{req.id}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>{req.created_at}</span>
                                            {isReceived && (
                                                <>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="text-emerald-600 font-semibold">Received {req.received_at}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
                                    {!isReceived && (
                                        <span className={`inline-flex max-w-full w-fit px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(req.status)}`}>
                                            {req.status}
                                        </span>
                                    )}



                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                        {isCompleted && (
                                            !isReceived ? (
                                                <button
                                                    onClick={() => handleReceive(req)}
                                                    disabled={receivingId === req.id}
                                                    className="inline-flex items-center justify-center gap-1.5 min-h-[42px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.check} />
                                                    </svg>
                                                    {receivingId === req.id ? 'Confirming...' : 'Confirm Receipt'}
                                                </button>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center justify-center gap-1.5 min-h-[42px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-default select-none"
                                                    title={req.received_at ? `Received on ${req.received_at}` : 'Already received'}
                                                >
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.check} />
                                                    </svg>
                                                    Received
                                                </span>
                                            )
                                        )}

                                        {isReceived && (
                                            <button
                                                onClick={() => setFeedbackTarget(req)}
                                                className={`inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm ${hasFeedback
                                                    ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
                                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                                    }`}
                                            >
                                                <span>{hasFeedback ? 'View Feedback' : 'Add Feedback'}</span>
                                            </button>
                                        )}

                                        {status === 'submitted' && !req.is_archived && (
                                            <button
                                                onClick={() => handleCancel(req.id)}
                                                disabled={cancellingId === req.id}
                                                className="inline-flex items-center justify-center gap-1.5 min-h-[42px] text-rose-700 font-bold px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[10px] uppercase tracking-wider hover:bg-rose-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.close} />
                                                </svg>
                                                {cancellingId === req.id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        )}

                                        {status === 'for_compliance' && !req.is_archived && (
                                            <button
                                                onClick={() => handleComply(req)}
                                                className="inline-flex items-center justify-center gap-1.5 min-h-[42px] text-purple-700 font-bold px-3 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-[10px] uppercase tracking-wider hover:bg-purple-100 transition-colors shadow-sm"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.check} />
                                                </svg>
                                                Mark as Complied
                                            </button>
                                        )}

                                        {req.soft_copy_available && (
                                            <button
                                                onClick={() => setSoftCopyRequest(req)}
                                                className="inline-flex items-center justify-center gap-1.5 min-h-[42px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.eye} />
                                                </svg>
                                                View Document
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setTrackingRequest(req)}
                                            className="inline-flex items-center justify-center min-h-[42px] text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                        >
                                            Track
                                        </button>

                                        {req.is_archived ? (
                                            <button
                                                onClick={() => handleUnarchive(req.id)}
                                                disabled={archiving === req.id}
                                                className="inline-flex items-center justify-center gap-1.5 min-h-[42px] text-blue-700 font-bold px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] uppercase tracking-wider hover:bg-blue-100 transition-colors disabled:opacity-60"
                                            >
                                                <span>{archiving === req.id ? 'Restoring...' : 'Restore'}</span>
                                            </button>
                                        ) : LOCKED_STATUSES.has(status) && (
                                            <button
                                                onClick={() => handleArchive(req.id)}
                                                disabled={archiving === req.id}
                                                className="inline-flex items-center justify-center gap-1.5 min-h-[42px] text-slate-600 font-bold px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[10px] uppercase tracking-wider hover:bg-slate-200 transition-colors disabled:opacity-60"
                                            >
                                                <span>{archiving === req.id ? 'Archiving...' : 'Archive'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }) : requestList.length ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium">No requests match your search or filters.</p>
                            <button onClick={clearFilters} className="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700">
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium">
                                {showingArchived ? 'No archived requests.' : "You haven't made any requests yet."}
                            </p>
                            {!showingArchived && (
                                <button onClick={() => setIsModalOpen(true)} className="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700">
                                    Submit your first request
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {paginationLinks.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-8">
                        {paginationLinks.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${link.active
                                    ? 'bg-yellow-400 text-slate-900'
                                    : link.url
                                        ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        : 'bg-white border border-slate-100 text-slate-300 cursor-not-allowed'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {feedbackTarget && (
                <FeedbackModal request={feedbackTarget} onClose={() => setFeedbackTarget(null)} />
            )}

            {trackingRequest && (
                <TrackingModal request={trackingRequest} onClose={() => setTrackingRequest(null)} />
            )}

            {isModalOpen && (
                <RequestDocumentModal
                    services={services}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {softCopyRequest && (
                <SoftCopyViewerModal request={softCopyRequest} onClose={() => setSoftCopyRequest(null)} />
            )}
            
            {complyingRequest && (
                <ComplianceModal request={complyingRequest} onClose={() => setComplyingRequest(null)} />
            )}
        </UserLayout>
    );
}
