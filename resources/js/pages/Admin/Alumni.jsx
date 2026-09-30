import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Icon } from '@/Components/Icon';
import useLiveRefresh from '@/hooks/useLiveRefresh';

const RELOAD_ONLY = ['alumni', 'filters'];
const SEARCH_DEBOUNCE_MS = 350;
const OPEN_MODAL_ON_REDIRECT = false; // true = also open the verify modal
const SHIELD_ICON = 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';

const COLUMNS = [
    { label: 'Alumni ID', sort: 'id' },
    { label: 'Name', sort: 'name' },
    { label: 'Course & Major', sort: 'course' },
    { label: 'Batch', sort: 'batch' },
    { label: 'Proof' },
    { label: 'Status', sort: 'status' },
    { label: 'Action', right: true },
];

const getStatusStyle = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('verified')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s.includes('rejected')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
};

// Drops empty values but keeps 'all', because the server default status here is 'pending'.
const cleanParams = params =>
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));

export default function AlumniVerifications({ alumni, courses = [], filters: rawFilters, focus = null }) {
    const filters = rawFilters ?? {};
    const rows = alumni?.data ?? [];
    const sort = filters.sort ?? 'id';
    const direction = filters.direction ?? 'desc';

    console.log({ alumni, filters })
    
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
        requestAnimationFrame(() =>
            document.getElementById(`alumni-row-${alum.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        );
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

    const handleVerify = status => {
        setSubmitting(true);
        router.put(`/admin/alumni/${selectedAlumni.id}`, { status }, {
            preserveScroll: true,
            onSuccess: () => setSelectedAlumni(null),
            onFinish: () => setSubmitting(false),
        });
    };

    const selectClass = 'bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-yellow-400';

    return (
        <AdminLayout>
            <Head title="Alumni Verifications" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Alumni Verifications</h2>
                <p className="text-xs text-slate-500 mt-1">Verify identity proofs for system access.</p>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-col lg:flex-row gap-3 justify-between">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        aria-label="Search alumni"
                        placeholder="Search name, Alumni ID, major..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm"
                    />
                    <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} aria-label="Filter by course" className={selectClass}>
                        <option value="all">All Courses</option>
                        {courses.map(c => <option key={c.id} value={String(c.id)}>{c.label}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status" className={`${selectClass} lg:px-8`}>
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div
                    aria-busy={loading}
                    className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-opacity ${loading ? 'opacity-60' : ''}`}
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
                                                    {sort === col.sort && <span aria-hidden="true">{direction === 'asc' ? ' ▲' : ' ▼'}</span>}
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
                                        id={`alumni-row-${alum.id}`}
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
                                            <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(alum.status)}`}>{alum.status}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <button onClick={() => setSelectedAlumni(alum)} className="text-slate-700 font-bold px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors">Action</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="py-16 text-center">
                                            <Icon path={SHIELD_ICON} className="w-10 h-10 mx-auto text-slate-300 mb-3" />
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
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Verify {selectedAlumni.name}</h3>
                        <p className="text-sm text-slate-500 mb-6">Review the uploaded proof to grant access to certificate requests.</p>

                        <a href={selectedAlumni.proof_url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-3 bg-slate-50 text-blue-700 font-bold rounded-xl text-sm mb-6 w-full border border-slate-200 truncate shadow-sm hover:bg-slate-100">
                            {selectedAlumni.proof}
                        </a>

                        <div className="flex gap-3">
                            <button disabled={submitting} onClick={() => handleVerify('rejected')} className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold rounded-xl text-sm transition-colors disabled:opacity-60">Reject</button>
                            <button disabled={submitting} onClick={() => handleVerify('verified')} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md transition-colors disabled:opacity-60">Approve</button>
                        </div>
                        <button
                            onClick={() => setSelectedAlumni(null)}
                            className="mt-6 px-4 py-2 text-sm font-bold text-slate-500 rounded-md hover:text-slate-700 transition-colors"
                        >
                            Cancel & Close
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}