import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import Swal from 'sweetalert2';

export default function MyRequests({ requests, services = [], userRole, auth, isAlumniVerified }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const form = useForm({ service_id: '', delivery_mode: 'hard_copy', purpose: '', preferred_claiming_date: '', internship_school_or_agency: '', grade_level_handled: '', semester: '', school_year: '' });

    const showAlert = (title, text, iconHtml) => Swal.mixin({
        customClass: { popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4', title: 'text-slate-900 font-extrabold text-2xl pt-4', htmlContainer: 'text-slate-500 text-sm font-medium', icon: 'border-0 scale-125 mt-6' },
        buttonsStyling: false
    }).fire({ title, text, iconHtml, timer: 2500, showConfirmButton: false });

    const requestList = requests?.data ?? [];
    const paginationLinks = requests?.meta?.links ?? requests?.links ?? [];
    const isInternship = services.find(s => String(s.id) === String(form.data.service_id))?.code === 'internship_certificate';

    const closeModal = () => { setIsModalOpen(false); form.reset(); form.clearErrors(); };
    const submitRequest = (e) => {
        e.preventDefault();
        form.post('/user/requests', {
            onSuccess: () => { closeModal(); showAlert('Request Submitted!', 'Your document request has been successfully sent.', '✅'); },
            onError: () => showAlert('Could Not Submit', 'Please check the form for errors and try again.', '⚠️'),
            preserveScroll: true
        });
    };

    const getStatusStyle = (s = '') => s.toLowerCase().includes('processing') ? 'bg-blue-100 text-blue-700' : s.toLowerCase().match(/ready|released/) ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700';
    const inputClass = "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none";
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";

    return (
        <UserLayout userRole={userRole}>
            <Head title="My Requests" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div><h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Requests</h2><p className="text-xs text-slate-500 mt-1">Track and manage your official document requests.</p></div>
                <button onClick={() => setIsModalOpen(true)} disabled={auth?.user?.user_type === 'alumni' && !isAlumniVerified} className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">+ Submit New Request</button>
            </div>

            <div className="p-6 sm:p-8">
                <div className="space-y-4">
                    {requestList.length ? requestList.map((req) => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-slate-900">{req.document_type}</h4>
                                    <div className="flex gap-3 text-xs text-slate-400 font-medium mt-1">
                                        <span>Tracking ID: {req.id}</span>•<span>{req.format}</span>•<span>{req.created_at}</span>
                                    </div>
                                </div>
                            </div>
                            <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)} self-start sm:self-auto`}>{req.status}</span>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium">You haven't made any requests yet.</p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700">Submit your first request</button>
                        </div>
                    )}
                </div>

                {paginationLinks.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-8">
                        {paginationLinks.map((l, i) => (
                            <Link key={i} href={l.url || '#'} preserveScroll dangerouslySetInnerHTML={{ __html: l.label }} className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${l.active ? 'bg-yellow-400 text-slate-900' : l.url ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-white border border-slate-100 text-slate-300 cursor-not-allowed'}`} />
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">Request Document</h3>
                            <button onClick={closeModal} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={submitRequest} className="p-6 space-y-5 overflow-y-auto">
                            <div>
                                <label className={labelClass}>Document Type</label>
                                <select value={form.data.service_id} onChange={e => form.setData('service_id', e.target.value)} className={inputClass} required>
                                    <option value="" disabled>Select Document...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                                {form.errors.service_id && <p className="text-xs text-red-600 mt-1.5">{form.errors.service_id}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Preferred Format</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['hard_copy', 'soft_copy'].map(mode => (
                                        <label key={mode} className={`border rounded-xl p-3 flex items-center cursor-pointer transition-all ${form.data.delivery_mode === mode ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400' : 'border-slate-200 hover:border-yellow-200'}`}>
                                            <input type="radio" value={mode} checked={form.data.delivery_mode === mode} onChange={e => form.setData('delivery_mode', e.target.value)} className="text-yellow-500 focus:ring-yellow-500 border-slate-300" />
                                            <span className="ml-2 text-sm font-bold text-slate-700 capitalize">{mode.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                                {form.errors.delivery_mode && <p className="text-xs text-red-600 mt-1.5">{form.errors.delivery_mode}</p>}
                            </div>

                            {isInternship && (
                                <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Internship Certificate Details</p>
                                    {[
                                        { id: 'internship_school_or_agency', label: 'School / Agency', req: true },
                                        { id: 'grade_level_handled', label: 'Grade Level Handled (optional)' }
                                    ].map(f => (
                                        <div key={f.id}>
                                            <label className={labelClass}>{f.label}</label>
                                            <input type="text" value={form.data[f.id]} onChange={e => form.setData(f.id, e.target.value)} className={inputClass} required={f.req} />
                                            {form.errors[f.id] && <p className="text-xs text-red-600 mt-1.5">{form.errors[f.id]}</p>}
                                        </div>
                                    ))}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'semester', label: 'Semester', ph: 'e.g. 1st Sem' },
                                            { id: 'school_year', label: 'School Year', ph: 'e.g. 2025-2026' }
                                        ].map(f => (
                                            <div key={f.id}>
                                                <label className={labelClass}>{f.label}</label>
                                                <input type="text" placeholder={f.ph} value={form.data[f.id]} onChange={e => form.setData(f.id, e.target.value)} className={inputClass} required />
                                                {form.errors[f.id] && <p className="text-xs text-red-600 mt-1.5">{form.errors[f.id]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>Purpose of Request</label>
                                <textarea rows="3" value={form.data.purpose} onChange={e => form.setData('purpose', e.target.value)} placeholder="Please state your reason..." className={`${inputClass} resize-none`} required />
                                {form.errors.purpose && <p className="text-xs text-red-600 mt-1.5">{form.errors.purpose}</p>}
                            </div>

                            <button type="submit" disabled={form.processing} className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-60">
                                {form.processing ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}