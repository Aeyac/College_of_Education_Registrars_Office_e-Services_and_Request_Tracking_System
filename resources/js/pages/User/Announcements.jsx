import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

export default function Announcements({ announcements = [], userRole }) {
    return (
        <UserLayout userRole={userRole}>
            <Head title="Announcements" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Registrar Announcements</h2>
                <p className="text-xs text-slate-500 mt-1">Official updates and deadlines from the College of Education.</p>
            </div>

            <div className="p-6 sm:p-8">
                <div className="space-y-6">
                    {announcements.length > 0 ? announcements.map((ann) => (
                        <div key={ann.id} className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Accent line on hover */}
                            <div className="absolute left-0 top-0 w-1.5 h-full bg-slate-200 group-hover:bg-yellow-400 transition-colors"></div>
                            
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 pl-2">
                                <h4 className="font-bold text-lg text-slate-900 leading-snug">{ann.title}</h4>
                                <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-md border border-yellow-200 whitespace-nowrap">{ann.date}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed pl-2 whitespace-pre-wrap">{ann.content}</p>
                        </div>
                    )) : (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">No announcements posted yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}