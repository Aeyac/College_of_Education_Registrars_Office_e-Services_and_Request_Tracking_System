import { Head } from '@inertiajs/react';
import { useState } from 'react';
import sanitizeHtml from '@/Utils/sanitizeHtml';
import UserLayout from '@/Layouts/UserLayout';
import useHighlightRow from '@/hooks/useHighlightRow';

export default function Announcements({ announcements = [] }) {
    useHighlightRow('announcement-row');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    return (
        <UserLayout>
            <Head title="Announcements" />

            <div className="p-6 sm:p-8 border-b border-slate-100 bg-white/90 backdrop-blur-md rounded-t-3xl">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Registrar Announcements</h2>
                <p className="text-xs text-slate-500 mt-1">Official updates and deadlines from the College of Education.</p>
            </div>

            <div className="p-6 sm:p-8">
                <div className="space-y-6">
                    {announcements.length > 0 ? announcements.map((ann) => (
                        <button key={ann.id} id={`announcement-row-${ann.id}`} type="button" onClick={() => setSelectedAnnouncement(ann)}
                            className="w-full min-w-0 text-left p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md 
                            hover:border-slate-300 transition-all relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                            <div className="absolute left-0 top-0 w-1.5 h-full bg-slate-200 group-hover:bg-yellow-400 transition-colors" />
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 pl-2">
                                <h4 className="font-bold text-lg text-slate-900 leading-snug break-words min-w-0">{ann.title}</h4>
                                <span className="self-end sm:self-auto text-xs font-bold text-yellow-700 py-1.5 whitespace-nowrap">{ann.date}</span>
                            </div>
                            <div className="text-sm text-slate-600 leading-relaxed pl-2 quill-content line-clamp-3 overflow-hidden break-words [overflow-wrap:anywhere]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(ann.content) }} />
                            <div className="pl-2 mt-4 text-xs font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors">Click to view announcement →</div>
                        </button>
                    )) : (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">No announcements posted yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedAnnouncement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto overflow-x-hidden" onClick={() => setSelectedAnnouncement(null)}>
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl min-w-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4 p-6 sm:p-8 border-b border-slate-100">
                            <div className="min-w-0 flex-1">
                                <span className="inline-block text-xs font-bold text-yellow-700 py-1.5 mb-3">{selectedAnnouncement.date}</span>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight break-words">{selectedAnnouncement.title}</h3>
                            </div>
                            <button type="button" onClick={() => setSelectedAnnouncement(null)} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" aria-label="Close announcement">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto overflow-x-hidden max-h-[65vh] min-w-0">
                            <div className="text-sm sm:text-base text-slate-700 leading-relaxed quill-content min-w-0 break-words [overflow-wrap:anywhere]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedAnnouncement.content) }} />
                        </div>

                        <div className="flex justify-end p-4 sm:p-6 border-t border-slate-100 bg-slate-50">
                            <button type="button" onClick={() => setSelectedAnnouncement(null)} className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}
