import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import ChatModal from '@/Components/ChatModal';
import Swal from 'sweetalert2';

export default function MyInquiries({ userRole, inquiries = [] }) {
    const { auth } = usePage().props;
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    const newForm = useForm({ subject: '', message: '', attachment: null });
    const selectedInquiry = inquiries.find(i => i.id === selectedInquiryId);

    const submitNewInquiry = (e) => {
        e.preventDefault();
        newForm.post('/user/inquiries', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsNewModalOpen(false);
                newForm.reset();
                Swal.fire({ title: 'Sent!', text: 'Your inquiry has been submitted.', icon: 'success', timer: 2500, showConfirmButton: false });
            }
        });
    };

    const openThread = (inq) => {
        setSelectedInquiryId(inq.id);
        if (!inq.is_read) {
            router.put(`/user/inquiries/${inq.id}/read`, {}, { preserveScroll: true, preserveState: true });
        }
    };

    const toggleReadStatus = (inq) => {
        const action = inq.is_read ? 'unread' : 'read';
        router.put(`/user/inquiries/${inq.id}/${action}`, {}, { preserveScroll: true, preserveState: true });
    };

    const deleteThread = (id) => {
        Swal.fire({
            title: 'Delete Thread?',
            text: 'This will permanently remove the entire conversation.',
            iconHtml: '<svg class="w-12 h-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
                title: 'text-slate-900 font-extrabold text-2xl pt-4',
                htmlContainer: 'text-slate-500 text-sm font-medium',
                confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md outline-none',
                cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-8 py-3.5 mx-2 outline-none',
                icon: 'border-0 scale-125 mt-6'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/user/inquiries/${id}`, { preserveScroll: true });
            }
        });
    };

    const isImage = (fileName) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
    };

    return (
        <UserLayout userRole={userRole}>
            <Head title="My Inquiries" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Inquiries</h2>
                    <p className="text-xs text-slate-500 mt-1">Message the CED Registrar's Office directly.</p>
                </div>
                <button onClick={() => setIsNewModalOpen(true)} className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors text-sm">
                    + New Inquiry
                </button>
            </div>

            <div className="p-6 sm:p-8">
                {inquiries.length > 0 ? (
                    <div className="space-y-4">
                        {inquiries.map((inq) => (
                            <div key={inq.id} className={`p-5 border rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors ${!inq.is_read ? 'bg-blue-50/50 border-blue-200 border-l-4 border-l-blue-500' : 'bg-white border-slate-100 hover:border-yellow-300'}`}>
                                <div>
                                    <h4 className={`text-base ${!inq.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>{inq.subject}</h4>
                                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Updated on {inq.date}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${inq.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                        {inq.status}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <button onClick={() => toggleReadStatus(inq)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={inq.is_read ? "Mark as Unread" : "Mark as Read"}>
                                            {inq.is_read ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                            )}
                                        </button>
                                        <button onClick={() => deleteThread(inq.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Thread">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>

                                    <button onClick={() => openThread(inq)} className="text-slate-700 font-bold px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200 text-xs">
                                        Open Thread
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-sm font-bold text-slate-800">No active inquiries</p>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Need help? Send us a message.</p>
                    </div>
                )}
            </div>

            <ChatModal
                inquiry={selectedInquiry}
                onClose={() => setSelectedInquiryId(null)}
                basePath="/user/inquiries"
            />

            {isNewModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-lg">New Inquiry</h3>
                            <button onClick={() => setIsNewModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={submitNewInquiry} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                                <select value={newForm.data.subject} onChange={e => newForm.setData('subject', e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none cursor-pointer" required>
                                    <option value="" disabled>Select a subject...</option>
                                    <option value="Document Request Follow-up">Document Request Follow-up</option>
                                    <option value="Enrollment / Grades">Enrollment / Grades</option>
                                    <option value="Alumni Verification Issue">Alumni Verification Issue</option>
                                    <option value="General Inquiry">General Inquiry / Other</option>
                                </select>
                                {newForm.errors.subject && <p className="text-xs text-red-500 mt-1">{newForm.errors.subject}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message</label>
                                <textarea rows="4" value={newForm.data.message} onChange={e => newForm.setData('message', e.target.value)} placeholder="Provide details about your inquiry..." className="w-full border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 p-3 resize-none outline-none" required />
                                {newForm.errors.message && <p className="text-xs text-red-500 mt-1">{newForm.errors.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Attachment (Optional)</label>
                                <input type="file" onChange={e => newForm.setData('attachment', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 border border-slate-200" />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsNewModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={newForm.processing} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-60">Send Message</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}