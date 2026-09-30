import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, router, usePage } from '@inertiajs/react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useLiveRefresh from '@/hooks/useLiveRefresh';

const ICONS = {
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    starFull: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
    file: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    chat: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
};

const PAGE_PROPS = ['feedbacks', 'filters'];

const Stars = memo(function Stars({ rating }) {
    return (
        <div className="flex items-center gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    aria-hidden="true"
                    className={`w-4 h-4 ${i < rating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d={ICONS.starFull} />
                </svg>
            ))}
        </div>
    );
});

export default function StudentFeedback({ feedbacks, filters = {}, focus = null }) {
    const { url } = usePage();
    const rows = feedbacks?.data ?? [];

    // Current page path without query string or trailing slash, e.g. "/admin/feedback"
    const basePath = useMemo(() => url.split('?')[0].replace(/\/+$/, ''), [url]);

    const [searchTerm, setSearchTerm] = useState(filters.q ?? '');
    const [ratingFilter, setRatingFilter] = useState(filters.rating ?? 'all');
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(null);
    const [highlightId, setHighlightId] = useState(null);

    // New feedback arrives from students and nothing broadcasts a table refresh,
    // so this poll is what makes rows appear without a manual reload. Reuses
    // PAGE_PROPS, the same prop set the filter visits and Pagination already
    // request, so the current search, rating filter and page stay in sync.
    useLiveRefresh({ only: PAGE_PROPS, enabled: !loading });

    const exportTimer = useRef(null);
    const appliedRef = useRef({ q: filters.q ?? '', rating: filters.rating ?? 'all' });

    // Query string for the filters currently applied on the server, reused by exports
    const exportQuery = useMemo(() => {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.rating && filters.rating !== 'all') params.set('rating', filters.rating);
        const qs = params.toString();
        return qs ? `?${qs}` : '';
    }, [filters.q, filters.rating]);

    const excelUrl = `${basePath}/export/excel${exportQuery}`;
    const pdfUrl = `${basePath}/export/pdf${exportQuery}`;

    const applyFilters = useCallback((q, rating) => {
        const params = {};
        if (q.trim()) params.q = q.trim();
        if (rating !== 'all') params.rating = rating;

        appliedRef.current = { q: q.trim(), rating };

        router.get(basePath, params, {
            only: PAGE_PROPS,
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    }, [basePath]);

    // Debounced. Only fires when the inputs differ from what is already applied.
    useEffect(() => {
        const { q, rating } = appliedRef.current;
        if (searchTerm.trim() === q && ratingFilter === rating) return;

        const timer = setTimeout(() => applyFilters(searchTerm, ratingFilter), 350);
        return () => clearTimeout(timer);
    }, [searchTerm, ratingFilter, applyFilters]);

    useEffect(() => () => clearTimeout(exportTimer.current), []);

    // Notification redirect: clean up the 'open' query param and blink the row.
    useEffect(() => {
        if (!focus) return;

        const url = new URL(window.location.href);
        url.searchParams.delete('open');
        window.history.replaceState(window.history.state, '', url);

        setSearchTerm(filters.q ?? '');
        setRatingFilter(filters.rating ?? 'all');

        const fb = rows.find((r) => r.id === focus.id);
        if (!fb) return;

        setHighlightId(fb.id);
        requestAnimationFrame(() =>
            document.getElementById(`feedback-row-${fb.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        );

        const timer = setTimeout(() => setHighlightId(null), 3500);
        return () => clearTimeout(timer);
    }, [focus]);

    const clearFilters = () => {
        setSearchTerm('');
        setRatingFilter('all');
    };

    const handleExport = (e, type) => {
        // Block double clicks while an export is in progress
        if (exporting) {
            e.preventDefault();
            return;
        }
        setExporting(type);
        exportTimer.current = setTimeout(() => setExporting(null), 2500);
    };

    const hasFilters = searchTerm.trim() !== '' || ratingFilter !== 'all';
    const noResults = rows.length === 0;

    const exportBtn = (type, active, idle) =>
        `inline-flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${exporting === type ? `${active} pointer-events-none` : idle
        } ${exporting && exporting !== type ? 'opacity-60 pointer-events-none' : ''}`;

    return (
        <AdminLayout>
            <Head title="Student Feedback" />

            <div className="p-4 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        Student Feedback
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Monitor and export ratings and comments from students.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <a
                        href={excelUrl}
                        onClick={e => handleExport(e, 'excel')}
                        aria-disabled={exporting !== null}
                        className={exportBtn('excel', 'bg-emerald-100 text-emerald-700', 'bg-emerald-600 hover:bg-emerald-700 text-white')}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.download} />
                        </svg>
                        {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
                    </a>

                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener"
                        onClick={e => handleExport(e, 'pdf')}
                        aria-disabled={exporting !== null}
                        className={exportBtn('pdf', 'bg-rose-100 text-rose-700', 'bg-slate-900 hover:bg-slate-800 text-white')}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.file} />
                        </svg>
                        {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
                    </a>
                </div>
            </div>

            <div className="p-4 sm:p-8">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">

                    {/* Filters */}
                    <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="relative flex-1">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICONS.search} />
                            </svg>
                            <input
                                type="search"
                                aria-label="Search feedback"
                                placeholder="Search by name, request ID, document, or comments..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 shadow-sm transition-all"
                            />
                        </div>

                        <select
                            aria-label="Filter by rating"
                            value={ratingFilter}
                            onChange={e => setRatingFilter(e.target.value)}
                            className="w-full sm:w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>

                    <div className={`transition-opacity duration-150 ${loading ? 'opacity-50 pointer-events-none' : ''}`} aria-busy={loading}>
                        {noResults ? (
                            <div className="px-6 py-16 flex flex-col items-center justify-center text-slate-400">
                                <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d={ICONS.chat} />
                                </svg>
                                <span className="text-sm font-medium">
                                    {hasFilters ? 'No feedback matches your filters.' : 'No feedback has been submitted yet.'}
                                </span>
                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-3 text-xs font-bold text-sky-600 hover:text-sky-700 underline underline-offset-2"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Mobile: stacked cards, no horizontal scrolling */}
                                <ul className="md:hidden divide-y divide-slate-100">
                                        {rows.map(fb => (
                                        <li
                                            key={fb.id}
                                            id={`feedback-row-${fb.id}`}
                                            className={`p-4 space-y-2 ${highlightId === fb.id ? 'row-blink' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{fb.student_name}</p>
                                                    <p className="text-xs font-medium text-slate-500 mt-0.5">{fb.created_at}</p>
                                                </div>
                                                <Stars rating={fb.rating} />
                                            </div>
                                            <div className="text-xs">
                                                <span className="font-semibold text-slate-700">{fb.document_type}</span>
                                                <span className="text-sky-600 font-medium"> · Req ID: #{fb.tracking_id}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed break-words">
                                                {fb.comments || <span className="text-slate-400 italic">No comments provided.</span>}
                                            </p>
                                        </li>
                                    ))}
                                </ul>

                                {/* Tablet and up: table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th scope="col" className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Date & Student</th>
                                                <th scope="col" className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Request Info</th>
                                                <th scope="col" className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Rating</th>
                                                <th scope="col" className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest min-w-[300px]">Comments</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {rows.map(fb => (
                                                <tr
                                                    key={fb.id}
                                                    id={`feedback-row-${fb.id}`}
                                                    className={`hover:bg-slate-50/80 transition-colors ${highlightId === fb.id ? 'row-blink' : ''}`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900">{fb.student_name}</span>
                                                            <span className="text-xs font-medium text-slate-500 mt-0.5">{fb.created_at}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-700">{fb.document_type}</span>
                                                            <span className="text-xs font-medium text-sky-600 mt-0.5">Req ID: #{fb.tracking_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Stars rating={fb.rating} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-600 leading-relaxed max-w-xl break-words">
                                                            {fb.comments || <span className="text-slate-400 italic">No comments provided.</span>}
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    <Pagination
                        links={feedbacks?.links ?? []}
                        from={feedbacks?.from}
                        to={feedbacks?.to}
                        total={feedbacks?.total}
                        noun="feedback entries"
                        only={PAGE_PROPS}
                        className="px-4 sm:px-6 py-4"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}