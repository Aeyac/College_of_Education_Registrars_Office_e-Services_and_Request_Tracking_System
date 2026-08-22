import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ManageAnnouncements({ announcements = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Aesthetic Confirmation Modal State
    const [confirmArchive, setConfirmArchive] = useState({ show: false, id: null });
    
    const { data, setData, post, put, processing, reset } = useForm({ id: null, title: '', content: '' });

    const handleSave = (e) => {
        e.preventDefault();
        if (data.id) put(`/admin/announcements/${data.id}`, { onSuccess: () => setIsModalOpen(false), preserveScroll: true });
        else post('/admin/announcements', { onSuccess: () => setIsModalOpen(false), preserveScroll: true });
    };

    const executeArchive = () => {
        if (confirmArchive.id) {
            router.delete(`/admin/announcements/${confirmArchive.id}`, { 
                preserveScroll: true,
                onSuccess: () => setConfirmArchive({ show: false, id: null })
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Announcements" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex justify-between items-center gap-4">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Announcements</h2>
                <button onClick={() => { reset(); setIsModalOpen(true); }} className="px-5 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors">+ New Post</button>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
                {announcements.map((ann) => (
                    <div key={ann.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                            <h4 className="font-bold text-lg text-slate-900 leading-snug">{ann.title}</h4>
                            <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-md border border-yellow-200 whitespace-nowrap">{ann.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                        <div className="flex gap-3">
                            <button onClick={() => { setData(ann); setIsModalOpen(true); }} className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors">Edit Post</button>
                            <button onClick={() => setConfirmArchive({ show: true, id: ann.id })} className="px-5 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors">Archive</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Aesthetic Archive Confirmation Modal --- */}
            {confirmArchive.show && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Archive Post?</h3>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to remove this announcement from the student portal?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmArchive({ show: false, id: null })} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-sm transition-colors">
                                Cancel
                            </button>
                            <button onClick={executeArchive} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-red-500/20">
                                Yes, Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="font-bold text-lg mb-4">{data.id ? 'Edit' : 'New'} Announcement</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500 outline-none" placeholder="Title" required/>
                            <textarea rows="5" value={data.content} onChange={e => setData('content', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm resize-none focus:ring-yellow-500 outline-none" placeholder="Message" required></textarea>
                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-sm">Cancel</button>
                                <button type="submit" disabled={processing} className="flex-1 py-3 bg-yellow-400 font-bold rounded-xl text-sm shadow-md">Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}