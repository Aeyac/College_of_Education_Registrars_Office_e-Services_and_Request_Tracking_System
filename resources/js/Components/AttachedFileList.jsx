import { useEffect, useMemo } from 'react';

const formatSize = bytes =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const isImage = file => file.type.startsWith('image/');

export default function AttachedFileList({ files, onRemove, disabled = false }) {
    // One object URL per file, created together and revoked together when the list changes.
    const previews = useMemo(
        () => files.map(file => ({ file, url: URL.createObjectURL(file) })),
        [files]
    );

    useEffect(() => () => previews.forEach(p => URL.revokeObjectURL(p.url)), [previews]);

    if (!files.length) return null;

    return (
        <ul className="space-y-2 mt-3" aria-label="Attached files">
            {previews.map(({ file, url }, index) => (
                <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-slate-400">
                        {isImage(file) ? (
                            <img src={url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                    </div>

                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open file in a new tab"
                        className="min-w-0 flex-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 group"
                    >
                        <span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-amber-700 group-hover:underline">
                            {file.name}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">{formatSize(file.size)}</span>
                    </a>

                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        disabled={disabled}
                        aria-label={`Remove ${file.name}`}
                        className="p-2 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                    >
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </li>
            ))}
        </ul>
    );
}