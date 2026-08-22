import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function DashboardOverview({ stats }) {
    return (
        <AdminLayout>
            <Head title="Admin Overview" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview</h2>
                    <p className="text-slate-500 text-sm mt-1">Monitor system analytics and data.</p>
                </div>
            </div>
            
            <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Requests</p>
                        <div className="flex justify-between items-end">
                            <h3 className="text-4xl font-black text-slate-900">{stats?.pending || 0}</h3>
                            <div className="w-12 h-12 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Alumni</p>
                        <div className="flex justify-between items-end">
                            <h3 className="text-4xl font-black text-slate-900">{stats?.alumni || 0}</h3>
                            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Users</p>
                        <div className="flex justify-between items-end">
                            <h3 className="text-4xl font-black text-slate-900">{stats?.users || 0}</h3>
                            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                        </div>
                    </div>
                </div>

                <div className="text-center p-12 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
                    <p className="text-slate-600 font-medium">Ready to process student documents?</p>
                    <Link href="/admin/requests" className="mt-4 inline-block px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">Go to Requests</Link>
                </div>
            </div>
        </AdminLayout>
    );
}