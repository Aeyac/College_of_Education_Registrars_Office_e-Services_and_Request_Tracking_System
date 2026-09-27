import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const ICONS = {
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    starFull: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
};

export default function StudentFeedback({ feedbacks = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [exporting, setExporting] = useState(null);

    const filteredFeedback = useMemo(() => {
        return feedbacks.filter(fb => {
            const matchesSearch = 
                fb.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                String(fb.tracking_id).includes(searchTerm) ||
                fb.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (fb.comments && fb.comments.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesRating = ratingFilter === 'all' || String(fb.rating) === ratingFilter;

            return matchesSearch && matchesRating;
        });
    }, [feedbacks, searchTerm, ratingFilter]);

    const handleExport = (type) => {
        setExporting(type);
        setTimeout(() => setExporting(null), 2000);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <svg 
                key={i} 
                className={`w-4 h-4 ${i < rating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`} 
                fill="currentColor" 
                viewBox="0 0 24 24"
            >
                <path d={ICONS.starFull} />
            </svg>
        ));
    };

    return (
        <AdminLayout>
            <Head title="Student Feedback" />

            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Student Feedback
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Monitor and export ratings and comments from students.
                    </p>
                </div>

                <div className="flex gap-2">
                    <a 
                        href={route('admin.feedback.export.excel', { ids: filteredFeedback.map(f => f.id).join(',') })}
                        target="_blank"
                        onClick={() => handleExport('excel')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${exporting === 'excel' ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.download} />
                        </svg>
                        {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
                    </a>
                    
                    <a 
                        href={route('admin.feedback.export.pdf', { ids: filteredFeedback.map(f => f.id).join(',') })}
                        target="_blank"
                        onClick={() => handleExport('pdf')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${exporting === 'pdf' ? 'bg-rose-100 text-rose-700 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
                    </a>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                    
                    {/* Filters */}
                    <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICONS.search} />
                            </svg>
                            <input 
                                type="text" 
                                placeholder="Search by name, request ID, or comments..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm transition-all"
                            />
                        </div>
                        
                        <select 
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

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Date & Student</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Request Info</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest whitespace-nowrap">Rating</th>
                                    <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest min-w-[300px]">Comments</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredFeedback.length > 0 ? filteredFeedback.map((fb) => (
                                    <tr key={fb.id} className="hover:bg-slate-50/80 transition-colors group">
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
                                            <div className="flex items-center gap-1">
                                                {renderStars(fb.rating)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                                                {fb.comments || <span className="text-slate-400 italic">No comments provided.</span>}
                                            </p>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                </svg>
                                                <span className="text-sm font-medium">No feedback matches your filters.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-medium text-slate-500">
                        <span>Showing {filteredFeedback.length} of {feedbacks.length} feedback entries</span>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
