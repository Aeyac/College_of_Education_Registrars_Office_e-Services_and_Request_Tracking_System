import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import FeedbackModal from './FeedbackModal';
import Swal from 'sweetalert2';

// Only requests in one of these final states can be archived
// no point archiving something still being processed, since you'd lose track of it.
const LOCKED_STATUSES = new Set(['cancelled_returned', 'released', 'ready_for_release']);

// Same status vocabulary as the admin's Manage Requests filter.
const STATUS_FILTER_OPTIONS = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'for_review', label: 'Pending Review' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready_for_release', label: 'Ready for Release' },
    { value: 'released', label: 'Released' },
    { value: 'cancelled_returned', label: 'Rejected / Return' },
    { value: 'for_compliance', label: 'For Compliance' },
];

export default function MyRequests({ requests, services = [], userRole, auth, isAlumniVerified, showingArchived = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trackingRequest, setTrackingRequest] = useState(null);
    const [feedbackTarget, setFeedbackTarget] = useState(null);
    const [receivingId, setReceivingId] = useState(null);
    const [archiving, setArchiving] = useState(null); // holds the id currently being archived/restored
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [docTypeFilter, setDocTypeFilter] = useState('all');
    console.log(requests)

    const form = useForm({
        service_id: '',
        delivery_mode: '',
        purpose: '',
        preferred_claiming_date: '',
        internship_school_or_agency: '',
        grade_level_handled: '',
        semester: '',
        school_year: '',
        requirement_file: null
    });

    const showAlert = (title, text, iconHtml) => Swal.mixin({
        customClass: {
            popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
            title: 'text-slate-900 font-extrabold text-2xl pt-4',
            htmlContainer: 'text-slate-500 text-sm font-medium',
            icon: 'border-0 scale-125 mt-6'
        },
        buttonsStyling: false
    }).fire({ title, text, iconHtml, timer: 2500, showConfirmButton: false });

    const requestList = requests?.data ?? [];
    const paginationLinks = requests?.meta?.links ?? requests?.links ?? [];

    const isInternship = services.find(s => String(s.id) === String(form.data.service_id))?.code === 'internship_certificate';

    const documentTypes = useMemo(() => {
        return [...new Set(requestList.map(r => r.document_type).filter(Boolean))].sort();
    }, [requestList]);

    const filteredRequestList = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return requestList.filter(req => {
            const matchesTerm =
                String(req.id).includes(term) ||
                (req.document_type || '').toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || (req.status_code || '') === statusFilter;
            const matchesDocType = docTypeFilter === 'all' || req.document_type === docTypeFilter;
            return matchesTerm && matchesStatus && matchesDocType;
        });
    }, [requestList, searchTerm, statusFilter, docTypeFilter]);

    const minClaimingDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toISOString().split('T')[0];
    };

    const closeModal = () => { setIsModalOpen(false); form.reset(); form.clearErrors(); };

    const handleServiceChange = (e) => {
        form.setData({
            ...form.data,
            service_id: e.target.value,
            internship_school_or_agency: '',
            grade_level_handled: '',
            semester: '',
            school_year: ''
        });
    };

    const handleDeliveryModeChange = (e) => {
        form.setData('delivery_mode', e.target.value);
    };

    const submitRequest = (e) => {
        e.preventDefault();
        form.post('/user/requests', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                showAlert('Request Submitted!', 'Your document request has been successfully sent.', '<svg class="w-12 h-12 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>');
            },
            onError: () => showAlert('Could Not Submit', 'Please check the form for errors and try again.', '<svg class="w-12 h-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>')
        });
    };

    const handleReceive = (req) => {
        setReceivingId(req.id);
        router.post(`/user/requests/${req.id}/receive`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                showAlert('Document Received', 'Thanks for confirming! Feel free to leave feedback.', '<svg class="w-12 h-12 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>')
                    .then(() => setFeedbackTarget(req));
            },
            onError: () => showAlert('Something Went Wrong', 'Could not confirm receipt. Please try again.', '<svg class="w-12 h-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'),
            onFinish: () => setReceivingId(null),
        });
    };

    const handleArchive = (id) => {
        if (!window.confirm('Archive this request? You can bring it back anytime from the Archived view.')) return;
        setArchiving(id);
        router.patch(`/user/requests/${id}/archive`, {}, {
            preserveScroll: true,
            onFinish: () => setArchiving(null),
        });
    };

    const handleUnarchive = (id) => {
        setArchiving(id);
        router.patch(`/user/requests/${id}/unarchive`, {}, {
            preserveScroll: true,
            onFinish: () => setArchiving(null),
        });
    };

    const toggleArchivedView = () => {
        router.get(window.location.pathname, { archived: showingArchived ? 0 : 1 }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const getStatusStyle = (s = '') => {
        const lower = s.toLowerCase();
        if (lower.includes('processing')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (lower.match(/ready|released/)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (lower.includes('rejected') || lower.includes('cancelled')) return 'bg-rose-100 text-rose-700 border-rose-200';
        return 'bg-amber-100 text-amber-800 border-amber-200';
    };

    const inputClass = "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all";
    const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

    return (
        <UserLayout userRole={userRole}>
            <Head title="My Requests" />

            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl flex flex-col lg:flex-row justify-between lg:items-center gap-4 z-10">
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
                        {/* Keep your existing SVG here */}
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={showingArchived
                                ? "M15 19l-7-7 7-7"
                                : "M5 8h14M5 8a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"} />
                        </svg>
                        <span className="truncate">
                            {showingArchived ? 'Back to Active' : 'Show Archived'}
                        </span>
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
                    {/* Search */}
                    <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                            />
                        </svg>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search tracking ID or document type..."
                            className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-9 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm transition-all"
                        />

                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Document Type */}
                    <select
                        value={docTypeFilter}
                        onChange={(e) => setDocTypeFilter(e.target.value)}
                        className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3 sm:px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                        <option value="all">All Document Types</option>
                        {documentTypes.map(dt => (
                            <option key={dt} value={dt}>{dt}</option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3 sm:px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                        <option value="all">All Statuses</option>
                        {STATUS_FILTER_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                <p className="text-xs text-slate-400">
                    {filteredRequestList.length} of {requestList.length} requests
                </p>


                <div className="space-y-4">
                    {filteredRequestList.length ? filteredRequestList.map((req) => {
                        const status = (req.status_code || req.status || '').toLowerCase();
                        const isCompleted = status.includes('released') || status.includes('ready');
                        const hasFeedback = req.has_feedback || Boolean(req.feedback);
                        const isReceived = Boolean(req.received_at);

                        return (
                            <div
                                key={req.id}
                                className="flex flex-col p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4"
                            >
                                {/* Request Information */}
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                        <svg
                                            className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-base text-slate-900 break-words leading-snug">
                                            {req.document_type}
                                        </h4>

                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-medium mt-1.5">
                                            <span>Tracking ID: #{req.id}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>{req.created_at}</span>

                                            {isReceived && (
                                                <>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="text-emerald-600 font-semibold">
                                                        Received {req.received_at}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Status + Actions */}
                                <div className="border-t border-slate-100 pt-3 flex flex-col gap-3">
                                    {/* Status */}
                                    {!isReceived && (
                                        <div>
                                            <span className={`inline-flex max-w-full px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                        {/* RECEIVE / RECEIVED */}
                                        {isCompleted && (
                                            !isReceived ? (
                                                <button
                                                    onClick={() => handleReceive(req)}
                                                    disabled={receivingId === req.id}
                                                    className="inline-flex items-center justify-center gap-1.5 min-h-[42px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-center">
                                                        {receivingId === req.id ? 'Confirming...' : 'Confirm Receipt'}
                                                    </span>
                                                </button>
                                            ) : (
                                                <span
                                                    className="inline-flex items-center justify-center gap-1.5 min-h-[42px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-default select-none"
                                                    title={req.received_at ? `Received on ${req.received_at}` : 'Already received'}
                                                >
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Received
                                                </span>
                                            )
                                        )}

                                        {/* FEEDBACK */}
                                        {isReceived && (
                                            hasFeedback ? (
                                                <button
                                                    onClick={() => setFeedbackTarget(req)}
                                                    className="inline-flex items-center justify-center gap-1.5 min-h-[42px] bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5 shrink-0 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>View Feedback</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setFeedbackTarget(req)}
                                                    className="inline-flex items-center justify-center gap-1.5 min-h-[42px] bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5 shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.914c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                    <span>Add Feedback</span>
                                                </button>
                                            )
                                        )}

                                        {/* TRACK */}
                                        <button
                                            onClick={() => setTrackingRequest(req)}
                                            className="inline-flex items-center justify-center min-h-[42px] text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                        >
                                            Track
                                        </button>

                                        {/* ARCHIVE / RESTORE */}
                                        {req.is_archived ? (
                                            <button
                                                onClick={() => handleUnarchive(req.id)}
                                                disabled={archiving === req.id}
                                                className="inline-flex items-center justify-center gap-1.5 min-h-[42px] text-blue-700 font-bold px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] uppercase tracking-wider hover:bg-blue-100 transition-colors disabled:opacity-60"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                <span>{archiving === req.id ? 'Restoring...' : 'Restore'}</span>
                                            </button>
                                        ) : LOCKED_STATUSES.has(status) && (
                                            <button
                                                onClick={() => handleArchive(req.id)}
                                                disabled={archiving === req.id}
                                                className="inline-flex items-center justify-center gap-1.5 min-h-[42px] text-slate-600 font-bold px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[10px] uppercase tracking-wider hover:bg-slate-200 transition-colors disabled:opacity-60"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                </svg>
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
                            <button
                                onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDocTypeFilter('all'); }}
                                className="mt-3 text-sm font-bold text-amber-600 hover:text-amber-700"
                            >
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
                        {paginationLinks.map((l, i) => (
                            <Link
                                key={i}
                                href={l.url || '#'}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: l.label }}
                                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${l.active ? 'bg-yellow-400 text-slate-900' : l.url ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-white border border-slate-100 text-slate-300 cursor-not-allowed'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Imported External Component */}
            {feedbackTarget && (
                <FeedbackModal
                    request={feedbackTarget}
                    onClose={() => setFeedbackTarget(null)}
                />
            )}

            {/* Tracking / Audit Trail Modal */}
            {trackingRequest && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">Track Request</h3>
                            <button onClick={() => setTrackingRequest(null)} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner mb-6">
                                <p className="mb-1"><strong className="text-slate-700">Document:</strong> <span className="font-semibold text-slate-900">{trackingRequest.document_type}</span></p>
                                <p><strong className="text-slate-700">Tracking ID:</strong> <span className="font-semibold text-slate-900">#{trackingRequest.id}</span></p>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 mb-4">Status History & Remarks</h4>
                            <div className="relative pl-4 border-l-2 border-slate-200 space-y-5 mt-4">
                                {trackingRequest.status_history?.length > 0 ? trackingRequest.status_history.map((log, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-yellow-400 rounded-full ring-4 ring-white"></div>
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
            )}

            {/* Document Request Submission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">Request Document</h3>
                            <button onClick={closeModal} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitRequest} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className={labelClass}>Document Type</label>
                                <select value={form.data.service_id} onChange={handleServiceChange} className={inputClass} required>
                                    <option value="" disabled>Select Document...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                                {form.errors.service_id && <p className="text-xs text-red-600 mt-1.5">{form.errors.service_id}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Delivery Mode</label>
                                <select value={form.data.delivery_mode} onChange={handleDeliveryModeChange} className={inputClass} required>
                                    <option value="" disabled>Select Delivery Mode...</option>
                                    <option value="soft_copy">Soft Copy</option>
                                    <option value="hard_copy">Hard Copy</option>
                                </select>
                                {form.errors.delivery_mode && <p className="text-xs text-red-600 mt-1.5">{form.errors.delivery_mode}</p>}
                            </div>

                            {isInternship && (
                                <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">Internship Details</p>
                                    <div>
                                        <label className={labelClass}>School / Agency</label>
                                        <input type="text" value={form.data.internship_school_or_agency} onChange={e => form.setData('internship_school_or_agency', e.target.value)} className={inputClass} required />
                                        {form.errors.internship_school_or_agency && <p className="text-xs text-red-600 mt-1.5">{form.errors.internship_school_or_agency}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Grade Level Handled (if applicable)</label>
                                        <input type="text" value={form.data.grade_level_handled} onChange={e => form.setData('grade_level_handled', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Semester</label>
                                            <input type="text" placeholder="e.g. 1st Sem" value={form.data.semester} onChange={e => form.setData('semester', e.target.value)} className={inputClass} required />
                                            {form.errors.semester && <p className="text-xs text-red-600 mt-1.5">{form.errors.semester}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>School Year</label>
                                            <input type="text" placeholder="e.g. 2025-2026" value={form.data.school_year} onChange={e => form.setData('school_year', e.target.value)} className={inputClass} required />
                                            {form.errors.school_year && <p className="text-xs text-red-600 mt-1.5">{form.errors.school_year}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>Purpose of Request</label>
                                <textarea rows="2" value={form.data.purpose} onChange={e => form.setData('purpose', e.target.value)} placeholder="Please state your reason..." className={`${inputClass} resize-none`} required />
                                {form.errors.purpose && <p className="text-xs text-red-600 mt-1.5">{form.errors.purpose}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Required Supporting Document/s (if any)</label>
                                <input type="file" onChange={e => form.setData('requirement_file', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 cursor-pointer" />
                                {form.errors.requirement_file && <p className="text-xs text-red-600 mt-1.5">{form.errors.requirement_file}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Preferred Claiming Date (Optional, min. 3 days processing)</label>
                                <input type="date" value={form.data.preferred_claiming_date} min={minClaimingDate()} onChange={e => form.setData('preferred_claiming_date', e.target.value)} className={inputClass} />
                                {form.errors.preferred_claiming_date && <p className="text-xs text-red-600 mt-1.5">{form.errors.preferred_claiming_date}</p>}
                            </div>

                            <button type="submit" disabled={form.processing} className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-60">
                                {form.processing ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}