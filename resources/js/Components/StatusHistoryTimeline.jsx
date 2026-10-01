const ROLE_BADGES = {
    admin: { label: 'Admin', className: 'bg-slate-200 text-slate-600' },
    faculty: { label: 'Faculty', className: 'bg-sky-50 text-sky-700' },
};

function ActorLine({ log, viewerId }) {
    if (!log.changed_by_name) return null;

    const isViewer = Boolean(viewerId) && log.changed_by_id === viewerId;
    const badge = ROLE_BADGES[log.changed_by_role];

    return (
        <p className="text-[10px] font-medium text-slate-400 mt-1.5 flex flex-wrap items-center gap-1.5">
            <span>Updated by</span>
            <span className="font-semibold text-slate-500">{isViewer ? 'You' : log.changed_by_name}</span>
            {!isViewer && badge && (
                <span className={`px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide text-[9px] ${badge.className}`}>
                    {badge.label}
                </span>
            )}
            {!isViewer && !badge && log.changed_by_role && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-wide text-[9px]">
                    {log.changed_by_role}
                </span>
            )}
        </p>
    );
}

/**
 * Status transition timeline shared by the Track Request modals, so both
 * screens name the same actor for the same history row.
 */
export default function StatusHistoryTimeline({ history = [], viewerId = null, emptyText = 'No tracking history available.' }) {
    if (!history?.length) {
        return <p className="text-sm text-slate-500 text-center">{emptyText}</p>;
    }

    return (
        <div className="relative pl-4 border-l-2 border-slate-200 space-y-5 mt-4">
            {history.map((log, i) => (
                <div key={i} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 bg-yellow-400 rounded-full ring-4 ring-white" />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-start mb-1 gap-2">
                            <span className="font-bold text-slate-800">{log.status}</span>
                            <span className="text-slate-400 font-medium text-[10px] shrink-0">{log.date}</span>
                        </div>
                        {log.note ? (
                            <p className="text-slate-600 mt-1 italic leading-relaxed break-words">"{log.note}"</p>
                        ) : (
                            <p className="text-slate-400 mt-1 italic">No remarks provided.</p>
                        )}
                        <ActorLine log={log} viewerId={viewerId} />
                    </div>
                </div>
            ))}
        </div>
    );
}
