import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import FeedbackModal from './FeedbackModal';
import RequestDocumentModal from '@/Components/RequestDocumentModal';
import ComplianceModal from '@/Components/ComplianceModal';
import StatusHistoryTimeline from '@/Components/StatusHistoryTimeline';
import Swal from 'sweetalert2';
import SoftCopyViewerModal from '@/Components/SoftCopyViewerModal';
import Pagination from '@/Components/Pagination';
import useHighlightRow from '@/hooks/useHighlightRow';
import useLiveRefresh from '@/hooks/useLiveRefresh';

const LOCKED_STATUSES = new Set(['cancelled_returned', 'cancelled', 'released', 'rejected']);
const RELOAD_ONLY = ['requests', 'showingArchived', 'statusFilter'];
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
    back: 'M15 19l-7-7 7-7',
    archive: 'M5 8h14M5 8a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    search: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z',
    chat: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
};

const BTN_BASE =
    'inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-all duration-200 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed border border-transparent';
const BTN_VARIANTS = {
    primary: 'bg-yellow-400 text-slate-900 hover:bg-yellow-500 hover:shadow-md shadow-sm',
    secondary: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
    danger: 'text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-100',
};

const Icon = ({ d, className = 'w-4 h-4' }) => (
    <svg aria-hidden="true" focusable="false" className={`${className} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ActionButton = ({ variant = 'secondary', icon, className = '', children, ...props }) => (
    <button type="button" className={`${BTN_BASE} ${BTN_VARIANTS[variant]} ${className}`} {...props}>
        {icon && <Icon d={icon} className="w-3.5 h-3.5" />}
        {children}
    </button>
);

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
    if (lower.includes('processing')) return { badge: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' };
    if (/ready|released|received/.test(lower)) return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' };
    if (/rejected|cancelled/.test(lower)) return { badge: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' };
    return { badge: 'bg-amber-50 text-amber-800 border-amber-100', dot: 'bg-amber-500' };
};

const StatusBadge = ({ label }) => {
    const style = getStatusStyle(label);
    return (
        <span className={`inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${style.badge}`}>
            <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {label}
        </span>
    );
};

function TrackingModal({ request, viewerId, onClose }) {
    useEffect(() => {
        const onKey = e => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="tracking-title"
                onClick={e => e.stopPropagation()}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                    <h3 id="tracking-title" className="font-bold text-slate-900 text-lg">Track Request</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close tracking dialog"
                        className="p-2.5 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    >
                        <Icon d={ICONS.close} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner mb-6">
                        <p className="mb-1"><strong className="text-slate-700">Document:</strong> <span className="font-semibold text-slate-900">{request.document_type}</span></p>
                        <p><strong className="text-slate-700">Tracking ID:</strong> <span className="font-semibold text-slate-900">#{request.id}</span></p>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-4">Status History & Remarks</h4>
                    <StatusHistoryTimeline history={request.status_history} viewerId={viewerId} />
                </div>
            </div>
        </div>
    );
}

export default function MyRequests({ requests, services = [], auth, isAlumniVerified, showingArchived = false, statusFilter: initialStatusFilter = 'all' }) {
    useHighlightRow('request-row');
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

    // Suspended while any modal is open or a row action is in flight, so an
    // open form is never replaced underneath the user.
    const isBusy = Boolean(
        isModalOpen || trackingRequest || feedbackTarget || complyingRequest
        || softCopyRequest || receivingId || archiving || cancellingId
    );

    // The notification bell announces a status change in real time, but the list
    // itself has no broadcast event, so this poll keeps rows current.
    useLiveRefresh({ only: RELOAD_ONLY, enabled: !isBusy });

    const requestList = requests?.data ?? [];
    const fromCount = requests?.meta?.from || requests?.from;
    const toCount = requests?.meta?.to || requests?.to;
    const totalCount = requests?.meta?.total || requests?.total;

    const documentTypes = useMemo(() => [...new Set(requestList.map(r => r.document_type).filter(Boolean))].sort(), [requestList]);

    const filteredRequestList = useMemo(() => {
        const term = searchTerm.toLowerCase();
        const PENDING_CODES = ['submitted', 'for_review', 'processing', 'for_compliance'];
        const COMPLETED_CODES = ['ready_for_release', 'released'];
        return requestList.filter(req => {
            const matchesTerm = String(req.id).includes(term) || (req.document_type || '').toLowerCase().includes(term);
            const code = req.status_code || '';
            const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'pending' ? PENDING_CODES.includes(code) : statusFilter === 'completed' ? COMPLETED_CODES.includes(code) : code === statusFilter;
            return matchesTerm && matchesStatus && (docTypeFilter === 'all' || req.document_type === docTypeFilter);
        });
    }, [requestList, searchTerm, statusFilter, docTypeFilter]);

    const handleReceive = req => {
        setReceivingId(req.id);
        router.post(`/user/requests/${req.id}/receive`, {}, {
            preserveScroll: true,
            onSuccess: () => showAlert('Document Received', 'Thanks for confirming! Feel free to leave feedback.', ICONS.check).then(() => setFeedbackTarget(req)),
            onError: () => showAlert('Something Went Wrong', 'Could not confirm receipt. Please try again.', ICONS.warning),
            onFinish: () => setReceivingId(null),
        });
    };

    const handleArchive = id => {
        if (!window.confirm('Archive this request? You can bring it back anytime from the Archived view.')) return;
        setArchiving(id);
        router.patch(`/user/requests/${id}/archive`, {}, { preserveScroll: true, onFinish: () => setArchiving(null) });
    };

    const handleCancel = id => {
        if (!window.confirm('Cancel this request? This action cannot be undone.')) return;
        setCancellingId(id);
        router.patch(`/user/requests/${id}/cancel`, {}, { preserveScroll: true, onFinish: () => setCancellingId(null) });
    };

    const handleComply = req => setComplyingRequest(req);

    const handleUnarchive = id => {
        setArchiving(id);
        router.patch(`/user/requests/${id}/unarchive`, {}, { preserveScroll: true, onFinish: () => setArchiving(null) });
    };

    const toggleArchivedView = () => {
        router.get(window.location.pathname, { archived: showingArchived ? 0 : 1 }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDocTypeFilter('all');
    };

    const fieldClass = 'w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3 sm:px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400';

    const paginationText = totalCount
        ? `Showing ${fromCount || 1}–${toCount || requestList.length} of ${totalCount} requests`
        : `${filteredRequestList.length} of ${requestList.length} requests`;

    return (
        <UserLayout>
            <Head title="My Requests" />

            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 bg-white rounded-t-3xl flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div className="min-w-0">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
                        My Requests
                        {showingArchived && <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider">Archived</span>}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {showingArchived ? 'Viewing archived requests. Restore any of these to bring them back to your active list.' : 'Track and manage your official document requests.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2.5 w-full lg:w-auto">
                    <ActionButton variant="secondary" onClick={toggleArchivedView} icon={showingArchived ? ICONS.back : ICONS.archive} className="w-full lg:w-auto">
                        {showingArchived ? 'Back to Active' : 'Show Archived'}
                    </ActionButton>
                    {!showingArchived && (
                        <ActionButton
                            variant="primary"
                            onClick={() => setIsModalOpen(true)}
                            disabled={auth?.user?.user_type === 'alumni' && !isAlumniVerified}
                            className="w-full lg:w-auto"
                        >
                            + Submit New Request
                        </ActionButton>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-3">
                    <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Icon d={ICONS.search} /></span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            aria-label="Search by tracking ID or document type"
                            placeholder="Search tracking ID or document type..."
                            className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-10 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm transition-all"
                        />
                        {searchTerm && (
                            <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
                                <Icon d={ICONS.close} />
                            </button>
                        )}
                    </div>

                    <select value={docTypeFilter} onChange={e => setDocTypeFilter(e.target.value)} aria-label="Filter by document type" className={fieldClass}>
                        <option value="all">All Document Types</option>
                        {documentTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select>

                    <select
                        value={statusFilter}
                        aria-label="Filter by status"
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            router.get(window.location.pathname, {
                                archived: showingArchived ? 1 : undefined,
                                status: e.target.value === 'all' ? undefined : e.target.value,
                            }, { preserveState: true, preserveScroll: true, replace: true });
                        }}
                        className={fieldClass}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">All Pending</option>
                        <option value="completed">All Completed</option>
                        <optgroup label="Specific Statuses">{STATUS_FILTER_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</optgroup>
                    </select>
                </div>

                <p className="text-xs text-slate-500" role="status" aria-live="polite">{paginationText}</p>

                <ul className="space-y-3.5">
                    {filteredRequestList.length ? filteredRequestList.map(req => {
                        const status = (req.status_code || req.status || '').toLowerCase();
                        const isCompleted = ['ready_for_release', 'released'].includes(status);
                        const hasFeedback = req.has_feedback || Boolean(req.feedback);
                        const isReceived = Boolean(req.received_at);

                        // The page knows it is on the archived view, so trust that
                        // instead of relying only on a flag in the resource.
                        const isArchived = showingArchived || Boolean(req.is_archived);

                        const canCancel = status === 'submitted' && !isArchived;
                        const needsCompliance = status === 'for_compliance' && !isArchived;
                        const needsReceipt = isCompleted && !isReceived && !isArchived;
                        const canArchive = !isArchived && LOCKED_STATUSES.has(status);
                        const label = `${req.document_type}, request #${req.id}`;

                        return (
                            <li key={req.id} id={`request-row-${req.id}`} className="relative flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:shadow-md transition-all gap-4 overflow-hidden group">
                                {/* Top Section: Title & Inline Status */}
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 shrink-0 text-slate-500 mt-0.5">
                                        <Icon d={ICONS.document} className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-bold text-[15px] text-slate-900 leading-snug">{req.document_type}</h3>
                                            <StatusBadge label={isReceived ? 'Received' : req.status} />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-slate-400 font-medium mt-1">
                                            <span className="text-slate-500 uppercase tracking-wide">ID: #{req.id}</span>
                                            <span aria-hidden="true">•</span>
                                            <span>{req.created_at}</span>
                                            {isReceived && (
                                                <>
                                                    <span aria-hidden="true">•</span>
                                                    <span className="text-emerald-600">Received {req.received_at}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Section: Actions */}
                                <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {needsReceipt && (
                                            <ActionButton variant="primary" icon={ICONS.check} onClick={() => handleReceive(req)} disabled={receivingId === req.id} aria-busy={receivingId === req.id} aria-label={`Confirm receipt of ${label}`}>
                                                {receivingId === req.id ? 'Confirming...' : 'Confirm Receipt'}
                                            </ActionButton>
                                        )}

                                        {needsCompliance && (
                                            <ActionButton variant="primary" icon={ICONS.check} onClick={() => handleComply(req)} aria-label={`Mark ${label} as complied`}>
                                                Mark as Complied
                                            </ActionButton>
                                        )}

                                        {req.soft_copy_available && (
                                            <ActionButton variant="secondary" icon={ICONS.eye} onClick={() => setSoftCopyRequest(req)} aria-label={`View document for ${label}`}>
                                                View Document
                                            </ActionButton>
                                        )}

                                        {isReceived && (
                                            <ActionButton variant="secondary" icon={ICONS.chat} onClick={() => setFeedbackTarget(req)} aria-label={`${hasFeedback ? 'View' : 'Add'} feedback for ${label}`}>
                                                {hasFeedback ? 'View Feedback' : 'Add Feedback'}
                                            </ActionButton>
                                        )}

                                        <ActionButton variant="secondary" icon={ICONS.clock} onClick={() => setTrackingRequest(req)} aria-label={`Track ${label}`}>
                                            Track
                                        </ActionButton>
                                    </div>

                                    {/* Housekeeping actions. Archive and Restore never render together. */}
                                    {(canCancel || isArchived || canArchive) && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            {canCancel && (
                                                <ActionButton variant="danger" icon={ICONS.close} onClick={() => handleCancel(req.id)} disabled={cancellingId === req.id} aria-busy={cancellingId === req.id} aria-label={`Cancel ${label}`}>
                                                    {cancellingId === req.id ? 'Cancelling...' : 'Cancel Request'}
                                                </ActionButton>
                                            )}

                                            {isArchived ? (
                                                <ActionButton variant="secondary" icon={ICONS.refresh} onClick={() => handleUnarchive(req.id)} disabled={archiving === req.id} aria-busy={archiving === req.id}  aria-label={`Restore ${label}`}>
                                                    {archiving === req.id ? 'Restoring...' : 'Restore'}
                                                </ActionButton>
                                            ) : (
                                                canArchive && (
                                                    <ActionButton variant="ghost" icon={ICONS.archive} onClick={() => handleArchive(req.id)} disabled={archiving === req.id} aria-busy={archiving === req.id} aria-label={`Archive ${label}`}>
                                                        {archiving === req.id ? 'Archiving...' : 'Archive'}
                                                    </ActionButton>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    }) : requestList.length ? (
                        <li className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-600 font-medium">No requests match your search or filters.</p>
                            <button type="button" onClick={clearFilters} className="mt-3 min-h-[44px] px-3 text-sm font-bold text-amber-700 hover:text-amber-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">Clear all filters</button>
                        </li>
                    ) : (
                        <li className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-600 font-medium">{showingArchived ? 'No archived requests.' : "You haven't made any requests yet."}</p>
                            {!showingArchived && <button type="button" onClick={() => setIsModalOpen(true)} className="mt-3 min-h-[44px] px-3 text-sm font-bold text-amber-700 hover:text-amber-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">Submit your first request</button>}
                        </li>
                    )}
                </ul>

                <Pagination
                    links={requests?.links}
                    from={requests?.from}
                    to={requests?.to}
                    total={requests?.total}
                    noun="requests"
                    only={RELOAD_ONLY}
                />
            </div>

            {/* Modals */}
            {feedbackTarget && <FeedbackModal request={feedbackTarget} onClose={() => setFeedbackTarget(null)} />}
            {trackingRequest && <TrackingModal request={trackingRequest} viewerId={auth?.user?.id} onClose={() => setTrackingRequest(null)} />}
            {isModalOpen && <RequestDocumentModal services={services} onClose={() => setIsModalOpen(false)} />}
            {softCopyRequest && <SoftCopyViewerModal request={softCopyRequest} onClose={() => setSoftCopyRequest(null)} />}
            {complyingRequest && <ComplianceModal request={complyingRequest} onClose={() => setComplyingRequest(null)} />}
        </UserLayout>
    );
}