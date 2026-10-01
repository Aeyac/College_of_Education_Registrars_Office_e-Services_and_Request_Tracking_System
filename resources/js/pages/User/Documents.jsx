import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

export default function Documents({ auth, userRole, documents = [] }) {
    return (
        <UserLayout userRole={userRole}>
            <Head title="My Documents" />
            
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Documents</h2>
                    <p className="text-xs text-slate-500 mt-1">Upload, organize, and access important files and resources.</p>
                </div>
                <button className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors text-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Upload New
                </button>
            </div>

            <div className="p-6 sm:p-8">
                {/* Storage Overview */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 flex items-center justify-between gap-6">
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-sm mb-1">Storage Overview</h3>
                        <p className="text-xs text-slate-500 mb-3">You are using 2.45 GB of 10 GB</p>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '24%' }}></div>
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-yellow-400 flex items-center justify-center font-black text-slate-900 text-sm bg-white shrink-0">
                        24%
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <input type="text" placeholder="Search documents..." className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none" />
                        <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                        <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg whitespace-nowrap shadow-sm">All Documents</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg whitespace-nowrap">Personal</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg whitespace-nowrap">Templates</button>
                    </div>
                </div>

                {/* File List */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Documents</h3>
                    {[
                        { name: 'Academic Advising Guidelines.pdf', type: 'PDF', size: '2.1 MB', date: 'May 19, 2026', color: 'bg-red-50 text-red-600' },
                        { name: 'Consultation Feedback Template.docx', type: 'DOCX', size: '45 KB', date: 'May 18, 2026', color: 'bg-blue-50 text-blue-600' },
                        { name: 'Student Checklist.xlsx', type: 'XLSX', size: '98 KB', date: 'May 17, 2026', color: 'bg-emerald-50 text-emerald-600' },
                    ].map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-4">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 ${doc.color}`}>
                                    {doc.type}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-sm text-slate-900 truncate">{doc.name}</h4>
                                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Uploaded {doc.date} • {doc.size}</p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </UserLayout>
    );
}