import { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icon';
import Swal from 'sweetalert2';

const LOCKED_STATUSES = new Set(['cancelled', 'released', 'rejected']);
const NOTE_REQ_STATUSES = new Set(['rejected', 'for_compliance']);
const OUTPUT_REQUIRED_STATUSES = new Set(['ready_for_release', 'released']);
const RELOAD_ONLY = ['requests', 'filters', 'showingArchived'];
const SEARCH_DEBOUNCE_MS = 350;

const ICONS = {
    close: 'M6 18L18 6M6 6l12 12',
    back: 'M15 19l-7-7 7-7',
    search: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z',
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    archive: 'M5 8h14M5 8a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    eye: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    excel: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    pdf: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

const STATUS_MAP = [
    { keys: ['pending', 'review'], style: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { keys: ['processing'], style: 'bg-blue-100 text-blue-800 border-blue-200' },
    { keys: ['compliance'], style: 'bg-purple-100 text-purple-800 border-purple-200' },
    { keys: ['cancel', 'rejected'], style: 'bg-red-100 text-red-800 border-red-200' },
    { keys: ['ready', 'released'], style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

const getStatusStyle = (status = '') => {
    const lower = status.toLowerCase();
    return STATUS_MAP.find(m => m.keys.some(k => lower.includes(k)))?.style ?? 'bg-slate-100 text-slate-800 border-slate-200';
};

const STATUS_FILTER_OPTIONS = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'for_review', label: 'Pending Review' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready_for_release', label: 'Ready for Release' },
    { value: 'released', label: 'Released' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'for_compliance', label: 'For Compliance' },
    { value: 'rejected', label: 'Rejected' },
];
const STATUS_UPDATE_OPTIONS = STATUS_FILTER_OPTIONS.filter(s => !['cancelled', 'submitted'].includes(s.value));

// Drops empty values so URLs stay short and the server sees only real filters.
const cleanParams = params =>
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== 'all' && v !== 0 && v != null));

const Badge = ({ children, className }) => (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${className}`}>{children}</span>
);

const ROW_TONES = {
    neutral: 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200 px-5',
    danger: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100 px-4',
    info: 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 px-4',
    warn: 'text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 px-4',
};

const RowButton = ({ tone, icon, children, ...props }) => (
    <button
        type="button"
        className={`inline-flex items-center gap-1.5 font-bold py-2 border rounded-xl text-xs transition-colors disabled:opacity-60 ${ROW_TONES[tone]}`}
        {...props}
    >
        <Icon path={icon} className="w-3.5 h-3.5" />
        {children}
    </button>
);

function RowActions({ req, busy, onSelect, onArchive, onUnarchive }) {
    if (req.is_archived) {
        return (
            <>
                <RowButton tone="neutral" icon={ICONS.eye} onClick={() => onSelect(req, '')}>View</RowButton>
                <RowButton tone="info" icon={ICONS.refresh} disabled={busy} onClick={() => onUnarchive(req.id)}>
                    {busy ? 'Restoring...' : 'Restore'}
                </RowButton>
            </>
        );
    }
    if (LOCKED_STATUSES.has(req.status_code)) {
        return (
            <>
                <RowButton tone="neutral" icon={ICONS.eye} onClick={() => onSelect(req, '')}>View</RowButton>
                <RowButton tone="danger" icon={ICONS.archive} disabled={busy} onClick={() => onArchive(req.id)}>
                    {busy ? 'Archiving...' : 'Archive'}
                </RowButton>
            </>
        );
    }
    return <RowButton tone="warn" icon={ICONS.edit} onClick={() => onSelect(req, 'processing')}>Review</RowButton>;
}

function Pagination({ links = [], from, to, total }) {
    const label = l => l.label.replace(/&laquo;|&raquo;/g, '').trim();
    const base = 'min-w-[36px] px-3 py-2 rounded-lg text-xs font-bold text-center border transition-colors';

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500" role="status" aria-live="polite">
                {total ? `Showing ${from} to ${to} of ${total} requests` : 'No requests'}
            </p>
            {links.length > 3 && (
                <nav aria-label="Pagination" className="flex flex-wrap justify-center gap-1.5">
                    {links.map((l, i) => l.url ? (
                        <Link
                            key={i}
                            href={l.url}
                            preserveScroll
                            preserveState
                            only={RELOAD_ONLY}
                            aria-current={l.active ? 'page' : undefined}
                            className={`${base} ${l.active
                                ? 'bg-yellow-400 border-yellow-400 text-slate-900'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                            {label(l)}
                        </Link>
                    ) : (
                        <span key={i} className={`${base} bg-white border-slate-100 text-slate-300 cursor-default`}>{label(l)}</span>
                    ))}
                </nav>
            )}
        </div>
    );
}

function DocumentPreviewModal({ doc, onClose }) {
    const isImage = ['jpg', 'jpeg', 'png'].includes(doc.extension);
    const isPdf = doc.extension === 'pdf';

    return (
        <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={`Preview of ${doc.name}`}
                className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{doc.name}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                        <a href={doc.download_url} className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-100">
                            Download
                        </a>
                        <button onClick={onClose} aria-label="Close preview" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors">
                            <Icon path={ICONS.close} className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 min-h-0 bg-slate-100">
                    {isImage && <img src={doc.view_url} alt={doc.name} className="w-full h-full object-contain" />}
                    {isPdf && <iframe src={doc.view_url} title={doc.name} className="w-full h-full border-0" />}
                    {!isImage && !isPdf && (
                        <div className="h-full flex items-center justify-center text-sm text-slate-500">
                            This file type cannot be previewed. Use Download instead.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ManageRequests({ requests, services = [], filters = {}, showingArchived = false }) {
    const rows = requests?.data ?? [];

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [serviceFilter, setServiceFilter] = useState(String(filters.service ?? 'all'));
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(null);
    const [archiving, setArchiving] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        _method: 'put',
        status_code: '',
        note: '',
        soft_copy: null,
    });

    const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || serviceFilter !== 'all';

    // Every list change goes through here. Changing a filter never sends a page number,
    // so the results always start from page 1.
    const visit = (overrides = {}) => {
        router.get(
            window.location.pathname,
            cleanParams({
                search: searchTerm.trim(),
                status: statusFilter,
                service: serviceFilter,
                archived: showingArchived ? 1 : 0,
                ...overrides,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: RELOAD_ONLY,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            }
        );
    };

    // Apply filters once the inputs differ from what the server last returned.
    useEffect(() => {
        const applied = {
            search: filters.search ?? '',
            status: filters.status ?? 'all',
            service: String(filters.service ?? 'all'),
        };
        if (searchTerm === applied.search && statusFilter === applied.status && serviceFilter === applied.service) return;

        const delay = searchTerm !== applied.search ? SEARCH_DEBOUNCE_MS : 0;
        const timer = setTimeout(() => visit(), delay);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, serviceFilter]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setServiceFilter('all');
    };

    const toggleArchivedView = () => visit({ archived: showingArchived ? 0 : 1 });

    const closeModal = () => { setSelectedRequest(null); setPreviewDoc(null); reset(); };

    const handleSelect = (req, code) => {
        setSelectedRequest(req);
        setData('status_code', req.status_code || code);
    };

    const handleUpdate = e => {
        e.preventDefault();
        post(`/admin/requests/${selectedRequest.id}`, {
            forceFormData: true,
            onSuccess: () => {
                closeModal();
                Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    customClass: {
                        popup: 'rounded-xl shadow-lg border border-slate-100 bg-white',
                        title: 'text-sm font-bold text-slate-800',
                    },
                }).fire({ icon: 'success', title: 'Request updated successfully' });
            },
        });
    };

    const runArchiveAction = (id, action) => {
        setArchiving(id);
        router.patch(`/admin/requests/${id}/${action}`, {}, {
            preserveScroll: true,
            onFinish: () => setArchiving(null),
            onSuccess: () => selectedRequest?.id === id && closeModal(),
        });
    };

    const handleArchive = id => {
        if (!window.confirm('Archive this request? You can restore it later from the Archived view.')) return;
        runArchiveAction(id, 'archive');
    };

    const handleUnarchive = id => runArchiveAction(id, 'unarchive');

    const handleExport = type => {
        setExporting(type);
        setTimeout(() => setExporting(null), 2000);
    };

    useEffect(() => {
        if (!selectedRequest) return;
        const onKeyDown = e => {
            if (e.key !== 'Escape') return;
            if (previewDoc) setPreviewDoc(null);
            else closeModal();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedRequest, previewDoc]);

    // Exports receive the filters that produced the current list, not the visible row ids.
    const exportQuery = new URLSearchParams(cleanParams({
        search: filters.search,
        status: filters.status,
        service: filters.service,
        archived: showingArchived ? 1 : 0,
    })).toString();

    const exportButtons = [
        { type: 'excel', label: 'Export Excel', base: route('admin.export.excel'), bg: 'bg-emerald-600 hover:bg-emerald-700', icon: ICONS.excel },
        { type: 'pdf', label: 'Export PDF', base: route('admin.export.pdf'), bg: 'bg-slate-900 hover:bg-slate-800', icon: ICONS.pdf, target: '_blank' },
    ];

    const noteIsRequired = NOTE_REQ_STATUSES.has(data.status_code);
    const mustUpload = selectedRequest?.is_soft_copy && OUTPUT_REQUIRED_STATUSES.has(data.status_code) && !selectedRequest.output_document;
    const isViewOnly = selectedRequest && (LOCKED_STATUSES.has(selectedRequest.status_code) || selectedRequest.is_archived);

    const selectClass = 'bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400';

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
                        <Icon path={showingArchived ? ICONS.back : ICONS.archive} />
                        {showingArchived ? 'Back to Active' : 'Show Archived'}
                    </button>
                    {exportButtons.map(exp => (
                        <a
                            key={exp.type}
                            href={exportQuery ? `${exp.base}?${exportQuery}` : exp.base}
                            target={exp.target}
                            onClick={() => handleExport(exp.type)}
                            aria-disabled={exporting === exp.type}
                            className={`flex-1 sm:flex-none px-4 py-2.5 ${exp.bg} text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2`}
                        >
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

            <div className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-col lg:flex-row gap-3 justify-between">
                    <div className="relative flex-1">
                        <Icon path={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            aria-label="Search by tracking ID, student name, or document type"
                            placeholder="Search tracking ID, name, or document..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-9 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm transition-all"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                <Icon path={ICONS.close} />
                            </button>
                        )}
                    </div>
                    <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} aria-label="Filter by document type" className={`${selectClass} lg:px-6`}>
                        <option value="all">All Document Types</option>
                        {services.map(s => <option key={s.id} value={String(s.id)}>{s.label}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status" className={selectClass}>
                        <option value="all">All Statuses</option>
                        {STATUS_FILTER_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                <div
                    aria-busy={loading}
                    className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-opacity ${loading ? 'opacity-60' : ''}`}
                >
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
                                {rows.length > 0 ? rows.map(req => (
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
                                                <RowActions
                                                    req={req}
                                                    busy={archiving === req.id}
                                                    onSelect={handleSelect}
                                                    onArchive={handleArchive}
                                                    onUnarchive={handleUnarchive}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center">
                                            <Icon path={ICONS.document} className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                            <p className="text-slate-500 text-sm font-medium">
                                                {showingArchived ? 'No archived requests.' : 'No requests found.'}
                                            </p>
                                            {hasActiveFilters && (
                                                <p className="text-slate-400 text-xs mt-1">
                                                    Try different filters, or{' '}
                                                    <button onClick={clearFilters} className="text-yellow-700 font-semibold hover:underline">clear all filters</button>.
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination links={requests?.links} from={requests?.from} to={requests?.to} total={requests?.total} />
                </div>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">
                                {selectedRequest.is_archived ? 'Archived Request' : 'Update Request'}
                            </h3>
                            <button onClick={closeModal} aria-label="Close" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors">
                                <Icon path={ICONS.close} className="w-5 h-5" />
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

                            {selectedRequest.is_soft_copy && (
                                <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Soft Copy</p>
                                    {selectedRequest.output_document ? (
                                        <div className="flex items-center justify-between gap-3">
                                            <a href={route('requests.soft-copy.show', selectedRequest.id)} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline truncate">
                                                {selectedRequest.output_document.name}
                                            </a>
                                            <a href={route('requests.soft-copy.download', selectedRequest.id)} className="shrink-0 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-100">
                                                Download
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500">No soft copy uploaded yet. Set the status to Ready for Release to upload.</p>
                                    )}
                                </div>
                            )}

                            <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Submitted Documents</p>
                                {(selectedRequest.requirement_documents ?? []).length > 0 ? (
                                    <ul className="space-y-2">
                                        {selectedRequest.requirement_documents.map(doc => (
                                            <li key={doc.id} className="flex items-center justify-between gap-3">
                                                <span className="font-semibold text-slate-800 truncate" title={doc.name}>{doc.name}</span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewDoc(doc)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-100"
                                                    >
                                                        <Icon path={ICONS.eye} className="w-3.5 h-3.5" />
                                                        Preview
                                                    </button>
                                                    <a href={doc.download_url} className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-100">
                                                        Download
                                                    </a>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-slate-500">No proof document was uploaded.</p>
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
                                        <select
                                            value={data.status_code}
                                            onChange={e => {
                                                const code = e.target.value;
                                                setData(d => ({ ...d, status_code: code, soft_copy: OUTPUT_REQUIRED_STATUSES.has(code) ? d.soft_copy : null }));
                                            }}
                                            className="w-full border border-slate-300 text-slate-900 rounded-xl p-3 text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                                        >
                                            {STATUS_UPDATE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                    </div>

                                    {selectedRequest.is_soft_copy && OUTPUT_REQUIRED_STATUSES.has(data.status_code) && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                                {selectedRequest.output_document ? 'Replace Soft Copy' : 'Upload Soft Copy'}{' '}
                                                <span className={`normal-case font-medium ${mustUpload ? 'text-red-500' : 'text-slate-400'}`}>
                                                    ({mustUpload ? 'required' : 'optional'}, PDF, max 5 MB)
                                                </span>
                                            </label>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                required={mustUpload}
                                                onChange={e => setData('soft_copy', e.target.files[0] ?? null)}
                                                className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold hover:file:bg-slate-200"
                                            />
                                            {errors.soft_copy && <p className="text-xs text-red-500 mt-1">{errors.soft_copy}</p>}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                            Note / Remarks {noteIsRequired && <span className="text-red-500 normal-case font-medium">(required for this status)</span>}
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={data.note}
                                            onChange={e => setData('note', e.target.value)}
                                            required={noteIsRequired}
                                            placeholder="Required for compliance/returns..."
                                            className={`w-full border rounded-xl p-3 text-sm outline-none resize-none text-slate-900 ${noteIsRequired ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-slate-300 focus:ring-yellow-500 focus:border-yellow-500'}`}
                                        />
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
                        </div>
                    </div>
                </div>
            )}

            {previewDoc && <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
        </AdminLayout>
    );
}