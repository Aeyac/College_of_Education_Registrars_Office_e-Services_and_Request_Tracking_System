import { Link } from '@inertiajs/react';

const stripEntities = label => label.replace(/&laquo;|&raquo;/g, '').trim();

const base = 'min-w-[36px] px-3 py-2 rounded-lg text-xs font-bold text-center border transition-colors';

export default function Pagination({
    links = [],
    from,
    to,
    total,
    noun = 'requests',
    only,
    className = 'px-6 py-4',
}) {
    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 ${className}`}>
            <p className="text-xs text-slate-500" role="status" aria-live="polite">
                {total ? `Showing ${from} to ${to} of ${total} ${noun}` : `No ${noun}`}
            </p>
            {links.length > 3 && (
                <nav aria-label="Pagination" className="flex flex-wrap justify-center gap-1.5">
                    {links.map((l, i) => l.url ? (
                        <Link
                            key={i}
                            href={l.url}
                            preserveScroll
                            preserveState
                            only={only}
                            aria-current={l.active ? 'page' : undefined}
                            className={`${base} ${l.active
                                ? 'bg-yellow-400 border-yellow-400 text-slate-900'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                            {stripEntities(l.label)}
                        </Link>
                    ) : (
                        <span key={i} className={`${base} bg-white border-slate-100 text-slate-300 cursor-default`}>
                            {stripEntities(l.label)}
                        </span>
                    ))}
                </nav>
            )}
        </div>
    );
}