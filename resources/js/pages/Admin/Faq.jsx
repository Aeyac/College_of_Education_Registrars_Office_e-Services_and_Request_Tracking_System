import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Faq({ faqs = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        question: '',
        answer: '',
        category: '',
        sort_order: '',
    });

    const openCreateModal = () => {
        setEditingFaq(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (faq) => {
        setEditingFaq(faq);
        setData({
            question: faq.question ?? '',
            answer: faq.answer ?? '',
            category: faq.category ?? '',
            sort_order: faq.sort_order ?? '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFaq(null);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingFaq) {
            put(route('admin.faqs.update', editingFaq.id), {
                preserveScroll: true,
                onSuccess: closeModal,
            });
        } else {
            post(route('admin.faqs.store'), {
                preserveScroll: true,
                onSuccess: closeModal,
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.faqs.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AdminLayout>
            <Head title="Manage FAQs" />

            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Manage FAQs</h2>
                    <p className="text-xs text-slate-500 mt-1">Add, edit, or remove entries shown in the student Help Center.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-yellow-500/20 text-sm shrink-0"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add FAQ
                </button>
            </div>

            <div className="p-6 sm:p-8">
                {faqs.length > 0 ? (
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div key={faq.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                                <div className="px-5 py-4 flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <span className="w-6 h-6 mt-0.5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 shrink-0 font-black">{index + 1}</span>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-800">{faq.question}</p>
                                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{faq.answer}</p>
                                            {faq.category && (
                                                <span className="inline-block mt-2 px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wide">{faq.category}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => openEditModal(faq)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => setDeleteTarget(faq)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                        No FAQ entries yet. Click "Add FAQ" to create the first one.
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <h3 className="font-extrabold text-slate-900 text-lg">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
                            <button onClick={closeModal} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Question</label>
                                <input
                                    type="text"
                                    value={data.question}
                                    onChange={(e) => setData('question', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-colors"
                                    placeholder="e.g. How do I request a document?"
                                />
                                {errors.question && <p className="text-xs text-red-500 mt-1">{errors.question}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Answer</label>
                                <textarea
                                    rows={4}
                                    value={data.answer}
                                    onChange={(e) => setData('answer', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-colors resize-none"
                                    placeholder="Answer shown to students"
                                />
                                {errors.answer && <p className="text-xs text-red-500 mt-1">{errors.answer}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                        Category <span className="normal-case font-medium text-slate-400">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-colors"
                                        placeholder="e.g. Requests"
                                    />
                                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                        Sort Order <span className="normal-case font-medium text-slate-400">(optional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-colors"
                                        placeholder="Auto"
                                    />
                                    {errors.sort_order && <p className="text-xs text-red-500 mt-1">{errors.sort_order}</p>}
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex gap-3">
                            <button onClick={closeModal} type="button" className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm">
                                Cancel
                            </button>
                            <button onClick={submit} type="submit" disabled={processing} className="flex-1 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-yellow-500/20 text-sm disabled:opacity-60">
                                {processing ? 'Saving...' : editingFaq ? 'Save Changes' : 'Add FAQ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Delete FAQ?</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            This will permanently remove "<span className="font-semibold text-slate-700">{deleteTarget.question}</span>" from the Help Center. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-sm">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}