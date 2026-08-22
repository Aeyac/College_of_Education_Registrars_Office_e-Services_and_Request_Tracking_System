import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AlumniVerifications({ alumni = [] }) {
    const [selectedAlumni, setSelectedAlumni] = useState(null);

    // Using router.put to send pure data directly to the controller
    const handleVerify = (status) => {
        router.put(`/admin/alumni/${selectedAlumni.id}`, { status: status }, { 
            onSuccess: () => setSelectedAlumni(null),
            preserveScroll: true 
        });
    };

    const getStatusStyle = (status) => {
        const s = status.toLowerCase();
        if (s.includes('verified')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (s.includes('rejected')) return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    return (
        <AdminLayout>
            <Head title="Alumni Verifications" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Alumni Verifications</h2>
            </div>
            <div className="p-6 sm:p-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Proof</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {alumni.length > 0 ? alumni.map((alum) => (
                                    <tr key={alum.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{alum.name}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{alum.batch}</td>
                                        <td className="py-4 px-6 text-sm whitespace-nowrap">
                                            <a href="#" className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                {alum.proof}
                                            </a>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap"><span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(alum.status)}`}>{alum.status}</span></td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap"><button onClick={() => setSelectedAlumni(alum)} className="text-slate-700 font-bold px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors">Verify Data</button></td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="py-12 text-center text-slate-500 text-sm">No verifications needed.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedAlumni && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Verify {selectedAlumni.name}</h3>
                        <p className="text-sm text-slate-500 mb-6">Review the uploaded proof to grant access to certificate requests.</p>
                        <span className="inline-block px-4 py-3 bg-slate-50 text-slate-800 font-bold rounded-xl text-sm mb-6 w-full border border-slate-200 truncate shadow-sm">{selectedAlumni.proof}</span>
                        <div className="flex gap-3">
                            <button onClick={() => handleVerify('rejected')} className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold rounded-xl text-sm transition-colors">Reject</button>
                            <button onClick={() => handleVerify('verified')} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md transition-colors">Approve</button>
                        </div>
                        <button onClick={() => setSelectedAlumni(null)} className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel & Close</button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}