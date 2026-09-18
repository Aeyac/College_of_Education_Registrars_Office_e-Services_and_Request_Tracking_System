import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const eventColors = {
    created: 'bg-emerald-50 text-emerald-600',
    updated: 'bg-amber-50 text-amber-600',
    deleted: 'bg-red-50 text-red-600',
    default: 'bg-slate-100 text-slate-600',
};

function EventBadge({ event }) {
    const cls = eventColors[event] || eventColors.default;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${cls}`}>
            {event}
        </span>
    );
}

function ChangesPreview({ changes }) {
    if (!changes || changes.length === 0) return <span className="text-slate-400 text-xs">—</span>;

    return (
        <div className="flex flex-col gap-1">
            {changes.slice(0, 3).map((change, idx) => (
                <div key={idx} className="text-xs">
                    <span className="font-semibold text-slate-600">{change.field}:</span>{' '}
                    <span className="text-red-500 line-through">{change.from}</span>{' '}
                    <span className="text-slate-400">→</span>{' '}
                    <span className="text-emerald-600 font-medium">{change.to}</span>
                </div>
            ))}
            {changes.length > 3 && (
                <span className="text-[11px] text-slate-400">+{changes.length - 3} more field(s)</span>
            )}
        </div>
    );
}

const formatTimestamp = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

export default function AuditTrail({ logs, filters, logNames, events, certificateTypes }) {
    const [search, setSearch] = useState(filters.search || '');
    const [logName, setLogName] = useState(filters.log_name || '');
    const [event, setEvent] = useState(filters.event || '');
    const [serviceId, setServiceId] = useState(filters.service_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const isFirstRun = useRef(true);
    const [expandedRow, setExpandedRow] = useState(null);

    const applyFilters = (overrides = {}) => {
        router.get('/admin/audit-trail', {
            search, log_name: logName, event, service_id: serviceId,
            date_from: dateFrom, date_to: dateTo,
            ...overrides,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Debounce the free-text search only; other filters apply immediately via onChange
    useEffect(() => {
        if (isFirstRun.current) { isFirstRun.current = false; return; }
        const timeout = setTimeout(() => applyFilters({ search }), 400);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleSelectChange = (setter, key) => (e) => {
        const value = e.target.value;
        setter(value);
        applyFilters({ [key]: value });
    };

    const clearFilters = () => {
        setSearch(''); setLogName(''); setEvent(''); setServiceId(''); setDateFrom(''); setDateTo('');
        router.get('/admin/audit-trail', {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasActiveFilters = search || logName || event || serviceId || dateFrom || dateTo;

    return (
        <AdminLayout>
            <div className="p-6 lg:p-10 border-b border-slate-100">
                <h1 className="text-2xl font-extrabold text-slate-900">Audit Trail</h1>
                <p className="text-sm text-slate-500 mt-1">A record of system activity — who did what, and when.</p>
            </div>

            {/* Filters */}
            <div className="p-6 lg:p-10 pb-0">
                <div className="flex flex-wrap gap-3 items-end mb-6">
                    <div className="flex-1 min-w-[220px]">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Search</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search description, admin name, subject name..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    <div className="min-w-[150px]">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Log Name</label>
                        <select
                            value={logName}
                            onChange={handleSelectChange(setLogName, 'log_name')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">All</option>
                            {logNames.map((name) => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>

                    <div className="min-w-[140px]">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Event</label>
                        <select
                            value={event}
                            onChange={handleSelectChange(setEvent, 'event')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">All</option>
                            {events.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>

                    <div className="min-w-[190px]">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Certificate Type</label>
                        <select
                            value={serviceId}
                            onChange={handleSelectChange(setServiceId, 'service_id')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        >
                            <option value="">All</option>
                            {certificateTypes.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">From</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={handleSelectChange(setDateFrom, 'date_from')}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">To</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={handleSelectChange(setDateTo, 'date_to')}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-y border-slate-100 bg-slate-50/60 text-left">
                            <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Event</th>
                            <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Description</th>
                            <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Subject</th>
                            <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Causer</th>
                            <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">Changes</th>
                            <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wide">When</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.data.length > 0 ? logs.data.map((log) => (
                            <tr
                                key={log.id}
                                onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                                className="border-b border-slate-50 hover:bg-slate-50/60 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4"><EventBadge event={log.event} /></td>
                                <td className="px-6 py-4 text-slate-700 max-w-xs truncate">{log.description}</td>
                                <td className="px-6 py-4 text-slate-050">
                                    <div className="font-medium text-slate-700">{log.subject_name || '—'}</div>
                                    <div className="text-[11px] text-slate-400">{log.subject_type} #{log.subject_id}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-700 font-medium">{log.causer_name}</td>
                                <td className="px-6 py-4"><ChangesPreview changes={log.changes} /></td>
                                <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">{formatTimestamp(log.created_at)}</td>   </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                                    No activity found for the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {logs.data.length > 0 && (
                <div className="flex items-center justify-between px-6 lg:px-10 py-5 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Showing <span className="font-bold text-slate-700">{logs.from}</span>–<span className="font-bold text-slate-700">{logs.to}</span> of <span className="font-bold text-slate-700">{logs.total}</span>
                    </p>
                    <div className="flex gap-1">
                        {logs.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${link.active
                                    ? 'bg-slate-900 text-white'
                                    : link.url
                                        ? 'text-slate-500 hover:bg-slate-100'
                                        : 'text-slate-300 cursor-not-allowed'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}