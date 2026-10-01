import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Icon } from '@/Components/Icon';
import useLiveRefresh from '@/hooks/useLiveRefresh';

const RELOAD_ONLY = ['alumni', 'filters'];
const SEARCH_DEBOUNCE_MS = 350;
const OPEN_MODAL_ON_REDIRECT = false; // true = also open the verify modal

const ICONS = {
    search: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z',
    close: 'M6 18L18 6M6 6l12 12',
    eye: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
};

const COLUMNS = [
    { label: 'Alumni ID', sort: 'id' },
    { label: 'Name', sort: 'name' },
    { label: 'Course & Major', sort: 'course' },
    { label: 'Batch', sort: 'batch' },
    { label: 'Proof' },
    { label: 'Status', sort: 'status' },
    { label: 'Action', right: true },
];

const SORTABLE_COLUMNS = COLUMNS.filter(col => col.sort);

const STATUS_MAP = [
    { keys: ['verified'], style: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' } },
    { keys: ['rejected'], style: { badge: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' } },
    { keys: ['pending'], style: { badge: 'bg-amber-50 text-amber-800 border-amber-100', dot: 'bg-amber-500' } },
];

const getStatusStyle = (status = '') => {
    const lower = status.toLowerCase();
    return STATUS_MAP.find(m => m.keys.some(k => lower.includes(k)))?.style
        ?? { badge: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
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

const BTN_BASE =
    'inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-all duration-200 ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed border border-transparent';
const BTN_VARIANTS = {
    primary: 'bg-yellow-400 text-slate-900 hover:bg-yellow-500 hover:shadow-md shadow-sm',
    secondary: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm',
    info: 'text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100',
};

const ActionButton = ({ variant = 'secondary', icon, className = '', children, ...props }) => (
    <button type="button" className={`${BTN_BASE} ${BTN_VARIANTS[variant]} ${className}`} {...props}>
        {icon && <Icon path={icon} className="w-3.5 h-3.5 shrink-0" />}
        {children}
    </button>
);

const ActionLink = ({ variant = 'secondary', icon, className = '', children, ...props }) => (
    <a
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN_BASE} ${BTN_VARIANTS[variant]} ${className}`}
        {...props}
    >
        {icon && <Icon path={icon} className="w-3.5 h-3.5 shrink-0" />}
        {children}
    </a>
);

// Drops empty values but keeps 'all', because the server default status here is 'pending'.
const cleanParams = params =>
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));

export default function AlumniVerifications({ alumni, courses = [], filters: rawFilters, focus = null }) {
    const filters = rawFilters ?? {};
    const rows = alumni?.data ?? [];
    const sort = filters.sort ?? 'id';
    const direction = filters.direction ?? 'desc';

    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [highlightId, setHighlightId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'pending');
    const [courseFilter, setCourseFilter] = useState(String(filters.course ?? 'all'));
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || courseFilter !== 'all';

    // New proof submissions arrive from outside this page and nothing broadcasts
    // them, so this poll is what surfaces them in the pending queue. Suspended
    // while a verification modal is open or a decision is being submitted.
    useLiveRefresh({
        only: RELOAD_ONLY,
        enabled: !selectedAlumni && !submitting && !loading,
    });

    const visit = (overrides = {}) => {
        router.get(
            window.location.pathname,
            cleanParams({
                search: searchTerm.trim(),
                status: statusFilter,
                course: courseFilter === 'all' ? '' : courseFilter,
                sort,
                direction,
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
            status: filters.status ?? 'pending',
            course: String(filters.course ?? 'all'),
        };
        if (searchTerm === applied.search && statusFilter === applied.status && courseFilter === applied.course) return;

        const delay = searchTerm !== applied.search ? SEARCH_DEBOUNCE_MS : 0;
        const timer = setTimeout(() => visit(), delay);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, courseFilter]);

    // Notification redirect: sync inputs with the filters the server chose, then highlight the row.
    useEffect(() => {
        if (!focus) return;

        // Strip ?open so a refresh doesn't replay it
        const url = new URL(window.location.href);
        url.searchParams.delete('open');
        window.history.replaceState(window.history.state, '', url);

        setSearchTerm(filters.search ?? '');
        setStatusFilter(filters.status ?? 'pending');
        setCourseFilter(String(filters.course ?? 'all'));

        const alum = rows.find(a => a.id === focus.id);
        if (!alum) return;

        setHighlightId(alum.id);

        // The card and the table row are both in the DOM but only one is laid
        // out at a time, so scroll to whichever one is actually visible.
        const target = [`alumni-row-${alum.id}`, `alumni-row-table-${alum.id}`]
            .map(id => document.getElementById(id))
            .find(el => el && el.offsetParent !== null);

        requestAnimationFrame(() => target?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        if (OPEN_MODAL_ON_REDIRECT) setSelectedAlumni(alum);

        const timer = setTimeout(() => setHighlightId(null), 3500);
        return () => clearTimeout(timer);
    }, [focus]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCourseFilter('all');
    };

    const handleSort = field =>
        visit({ sort: field, direction: sort === field && direction === 'asc' ? 'desc' : 'asc' });

    const toggleDirection = () => visit({ direction: direction === 'asc' ? 'desc' : 'asc' });

    const handleVerify = status => {
        setSubmitting(true);
        router.put(`/admin/alumni/${selectedAlumni.id}`, { status }, {
            preserveScroll: true,
            onSuccess: () => setSelectedAlumni(null),
            onFinish: () => setSubmitting(false),
        });
    };

    const fieldClass = 'w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-3 sm:px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400';

    const paginationText = alumni?.total
        ? `Showing ${alumni?.from || 1}â€“${alumni?.to || rows.length} of ${alumni?.total} alumni`
        : `${rows.length} alumni`;

    return (
        <AdminLayout>
            <Head title="Alumni Verifications" />
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 sm:sticky sm:top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Alumni Verifications</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Verify identity proofs for system access.</p>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-4" aria-busy={loading}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] gap-3">
                    <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                        <Icon path={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            aria-label="Search alumni"
                            placeholder="Search name, Alumni ID, major..."
                            className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-10 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                            >
                                <Icon path={ICONS.close} />
                            </button>
                        )}
                    </div>
                    <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} aria-label="Filter by course" className={fieldClass}>
                        <option value="all">All Courses</option>
                        {courses.map(c => <option key={c.id} value={String(c.id)}>{c.label}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status" className={fieldClass}>
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Sort controls stand in for the clickable table headers, which the card list has no room for */}
                <div className="lg:hidden grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
                    <select
                        value={sort}
                        onChange={e => handleSort(e.target.value)}
                        aria-label="Sort by"
                        className={fieldClass}
                    >
                        {SORTABLE_COLUMNS.map(col => (
                            <option key={col.sort} value={col.sort}>Sort: {col.label}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={toggleDirection}
                        aria-label="Toggle sort direction"
                        className={`${BTN_BASE} ${BTN_VARIANTS.secondary} min-w-[92px]`}
                    >
                        {direction === 'asc' ? 'A â†’ Z' : 'Z â†’ A'}
                    </button>
                </div>

                <p className="lg:hidden text-xs text-slate-500" role="status" aria-live="polite">{paginationText}</p>

                <ul className={`lg:hidden space-y-3.5 transition-opacity ${loading ? 'opacity-60' : ''}`}>
                    {rows.length > 0 ? rows.map(alum => (
                        <li
                            key={alum.id}
                            id={`alumni-row-${alum.id}`}
                            className={`relative flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:shadow-md transition-all gap-4 ${highlightId === alum.id ? 'row-blink' : ''}`}
                        >
                            <div className="flex items-start gap-3.5 min-w-0">
                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 shrink-0 text-slate-500 mt-0.5">
                                    <Icon path={ICONS.shield} className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-bold text-[15px] text-slate-900 leading-snug break-words">{alum.name}</h3>
                                        <StatusBadge label={alum.status} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-slate-400 font-medium mt-1">
                                        <span className="text-slate-500 uppercase tracking-wide">ID: #{alum.id}</span>
                                        <span aria-hidden="true">â€¢</span>
                                        <span>{alum.course}</span>
                                        {alum.major !== 'N/A' && (
                                            <>
                                                <span aria-hidden="true">â€¢</span>
                                                <span className="uppercase font-bold text-slate-400">{alum.major}</span>
                                            </>
                                        )}
                                        <span aria-hidden="true">â€¢</span>
                                        <span>Batch {alum.batch}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <ActionLink variant="secondary" icon={ICONS.eye} href={alum.proof_url}>
                                        View Proof
                                    </ActionLink>
                                    <ActionButton variant="primary" icon={ICONS.shield} onClick={() => setSelectedAlumni(alum)}>
                                        Review
                                    </ActionButton>
                                </div>
                            </div>
                        </li>
                    )) : (
                        <li className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                            <Icon path={ICONS.shield} className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                            <p className="text-sm text-slate-600 font-medium">
                                {statusFilter === 'all' ? 'No verifications found.' : `No ${statusFilter} verifications found.`}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-3 min-h-[44px] px-3 text-sm font-bold text-amber-700 hover:text-amber-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </li>
                    )}
                </ul>

                <div className="lg:hidden">
                    <Pagination
                        links={alumni?.links}
                        from={alumni?.from}
                        to={alumni?.to}
                        total={alumni?.total}
                        noun="alumni"
                        only={RELOAD_ONLY}
                    />
                </div>

                <div
                    className={`hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-opacity ${loading ? 'opacity-60' : ''}`}
                >
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-slate-50 border-b border-slate-100 select-none">
                                <tr>
                                    {COLUMNS.map(col => (
                                        <th
                                            key={col.label}
                                            aria-sort={col.sort && sort === col.sort ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}
                                            className={`py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.right ? 'text-right' : ''}`}
                                        >
                                            {col.sort ? (
                                                <button type="button" onClick={() => handleSort(col.sort)} className="uppercase font-bold hover:text-slate-800">
                                                    {col.label}
                                                    {sort === col.sort && <span aria-hidden="true">{direction === 'asc' ? ' â–²' : ' â–¼'}</span>}
                                                </button>
                                            ) : col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length > 0 ? rows.map(alum => (
                                    <tr
                                        key={alum.id}
                                        id={`alumni-row-table-${alum.id}`}
                                        className={`hover:bg-slate-50 transition-colors ${highlightId === alum.id ? 'row-blink' : ''}`}
                                    >
                                        <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{alum.id}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">{alum.name}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                                            <span className="font-medium text-slate-800 block truncate max-w-[200px]">{alum.course}</span>
                                            {alum.major !== 'N/A' && <span className="block text-[10px] uppercase font-bold text-slate-400 mt-0.5">{alum.major}</span>}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{alum.batch}</td>
                                        <td className="py-4 px-6 text-sm whitespace-nowrap">
                                            <a href={alum.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                                                View Proof
                                            </a>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <StatusBadge label={alum.status} />
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <button type="button" onClick={() => setSelectedAlumni(alum)} className="text-slate-700 font-bold px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors">Action</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center">
                                            <Icon path={ICONS.shield} className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                            <p className="text-slate-500 text-sm font-medium">
                                                {statusFilter === 'all' ? 'No verifications found.' : `No ${statusFilter} verifications found.`}
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

                    <Pagination
                        links={alumni?.links}
                        from={alumni?.from}
                        to={alumni?.to}
                        total={alumni?.total}
                        noun="alumni"
                        only={RELOAD_ONLY}
                    />
                </div>
            </div>

            {selectedAlumni && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setSelectedAlumni(null)}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="verify-alumni-title"
                        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                    >
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <h3 id="verify-alumni-title" className="font-bold text-slate-900 text-lg">Verify Identity</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedAlumni(null)}
                                aria-label="Close"
                                className="p-2.5 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                            >
                                <Icon path={ICONS.close} />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon path={ICONS.shield} className="w-8 h-8" />
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-lg mb-2 break-words">{selectedAlumni.name}</h4>
                            <p className="text-sm text-slate-500 mb-6">Review the uploaded proof to grant access to certificate requests.</p>

                            <a href={selectedAlumni.proof_url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-3 bg-slate-50 text-blue-700 font-bold rounded-xl text-sm mb-6 w-full border border-slate-200 truncate shadow-sm hover:bg-slate-100">
                                {selectedAlumni.proof}
                            </a>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleVerify('rejected')}
                                    className="flex-1 min-h-[44px] bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 font-bold rounded-xl text-sm transition-colors disabled:opacity-60"
                                >
                                    Reject
                                </button>
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handleVerify('verified')}
                                    className="flex-1 min-h-[44px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md transition-colors disabled:opacity-60"
                                >
                                    Approve
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedAlumni(null)}
                                className="mt-4 px-4 min-h-[44px] text-sm font-bold text-slate-500 rounded-md hover:text-slate-700 transition-colors"
                            >
                                Cancel &amp; Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}