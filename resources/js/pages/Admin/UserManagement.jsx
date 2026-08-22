import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UserManagement({ users = [] }) {
    
    // Aesthetic Confirmation Modal State
    const [confirmSuspend, setConfirmSuspend] = useState({ show: false, id: null });
    
    const executeSuspend = () => {
        if (confirmSuspend.id) {
            router.delete(`/admin/users/${confirmSuspend.id}`, { 
                preserveScroll: true,
                onSuccess: () => setConfirmSuspend({ show: false, id: null })
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="User Management" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
                <input type="text" placeholder="Search by ID or name..." className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none shadow-sm" />
            </div>
            
            <div className="p-6 sm:p-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Student ID</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Name</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Type</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Course</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.length > 0 ? users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{u.student_id || 'N/A'}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">{u.first_name} {u.last_name}</td>
                                        <td className="py-4 px-6 text-sm whitespace-nowrap"><span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${u.user_type === 'alumni' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{u.user_type}</span></td>
                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{u.course || 'N/A'}</td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <button className="text-slate-700 font-bold px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 mr-2">Edit</button>
                                            <button onClick={() => setConfirmSuspend({ show: true, id: u.id })} className="text-red-600 font-bold px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100">Suspend</button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="py-12 text-center text-slate-500 text-sm">No users found in database.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- Aesthetic Suspend Confirmation Modal --- */}
            {confirmSuspend.show && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Suspend User?</h3>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to suspend this user? They will lose access to the portal immediately.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmSuspend({ show: false, id: null })} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-sm transition-colors">
                                Cancel
                            </button>
                            <button onClick={executeSuspend} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-red-500/20">
                                Yes, Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}