import { useEffect } from 'react';
import { Icon } from '@/Components/Icon';

export default function SoftCopyViewerModal({ request, onClose }) {
    useEffect(() => {
        const onKeyDown = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const viewUrl = route('requests.soft-copy.show', request.id);
    const downloadUrl = route('requests.soft-copy.download', request.id);

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
                    <h3 className="font-bold text-slate-900 text-lg">Soft Copy</h3>
                    <button onClick={onClose} aria-label="Close"
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors">
                        <Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 shrink-0">
                    <a href={viewUrl} target="_blank" rel="noopener noreferrer"
                        className="font-semibold text-sm text-blue-700 hover:underline truncate">
                        {request.output_document_name ?? 'Open document'}
                    </a>
                    <a href={downloadUrl}
                        className="shrink-0 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg px-4 py-2">
                        Download
                    </a>
                </div>

                <iframe src={viewUrl} title="Soft copy preview"
                    className="w-full h-[60vh] rounded-xl border border-slate-200" />
            </div>
        </div>
    );
}