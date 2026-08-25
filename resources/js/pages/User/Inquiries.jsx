import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import Swal from 'sweetalert2';

export default function MyInquiries({ userRole, inquiries = [] }) {
    const { auth } = usePage().props;
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [hoveredMsg, setHoveredMsg] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
    
    const messagesEndRef = useRef(null);

    const newForm = useForm({ subject: '', message: '', attachment: null });
    const replyForm = useForm({ message: '', parent_id: null, attachment: null });

    const selectedInquiry = inquiries.find(i => i.id === selectedInquiryId);

    // Background Polling
    useEffect(() => {
        let interval;
        if (selectedInquiryId) {
            interval = setInterval(() => {
                router.reload({ only: ['inquiries'], preserveScroll: true, preserveState: true });
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [selectedInquiryId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedInquiry?.messages?.length]);

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

    const submitReply = (e) => {
        e.preventDefault();
        if (editingMsg) {
            replyForm.put(`/user/inquiries/messages/${editingMsg.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    replyForm.reset();
                    setEditingMsg(null);
                }
            });
        } else {
            replyForm.post(`/user/inquiries/${selectedInquiry.id}/reply`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    replyForm.reset();
                    setReplyingTo(null);
                }
            });
        }
    };

    const handleDeleteMsg = (msgId) => {
        router.delete(`/user/inquiries/messages/${msgId}`, { preserveScroll: true, preserveState: true });
    };

    // Thread Actions
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
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
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

                                    {/* Action Icons */}
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

            {selectedInquiry && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg">{selectedInquiry.subject}</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Status: {selectedInquiry.status}</p>
                            </div>
                            <button onClick={() => { setSelectedInquiryId(null); replyForm.reset(); }} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
                            {selectedInquiry.messages.map((msg) => (
                                <div key={msg.id} onMouseEnter={() => setHoveredMsg(msg.id)} onMouseLeave={() => setHoveredMsg(null)} className={`flex items-end gap-3 ${msg.is_own ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                                    
                                    {/* Avatar Bubble */}
                                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-bold text-xs text-slate-600 shadow-sm overflow-hidden">
                                        {msg.sender_avatar ? <img src={msg.sender_avatar} className="w-full h-full object-cover" /> : msg.sender_name.charAt(0)}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm flex flex-col relative ${msg.is_own ? 'bg-yellow-400 text-slate-900 rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                                        
                                        {msg.parent && (
                                            <div className="bg-black/10 p-2 rounded-lg text-xs mb-2 border-l-2 border-black/20">
                                                <span className="font-bold block mb-0.5">{msg.parent.sender_name}</span>
                                                <span className="opacity-80 line-clamp-2">{msg.parent.message}</span>
                                            </div>
                                        )}
                                        
                                        {/* Attachments */}
                                        {msg.attachment_url && (
                                            <div className="mb-2">
                                                {isImage(msg.attachment_name) ? (
                                                    <a href={msg.attachment_url} target="_blank"><img src={msg.attachment_url} alt="Attachment" className="rounded-xl max-h-48 object-cover border border-black/10" /></a>
                                                ) : (
                                                    <a href={msg.attachment_url} target="_blank" className="flex items-center gap-2 bg-black/5 p-2 rounded-lg text-xs font-bold hover:bg-black/10 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                        {msg.attachment_name}
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        <p className="whitespace-pre-wrap">{msg.message}</p>
                                        
                                        <div className="flex justify-end gap-2 items-center mt-1.5 opacity-50">
                                            {msg.is_edited && <span className="text-[9px] font-bold italic">(Edited)</span>}
                                            <span className="text-[9px] font-bold">{msg.created_at}</span>
                                        </div>
                                    </div>

                                    {/* Hover Actions */}
                                    {hoveredMsg === msg.id && selectedInquiry.status !== 'resolved' && (
                                        <div className={`flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity ${msg.is_own ? 'flex-row-reverse' : ''}`}>
                                            <button onClick={() => { setReplyingTo(msg); setEditingMsg(null); replyForm.setData('parent_id', msg.id); replyForm.setData('message', ''); }} className="p-1.5 hover:bg-slate-200 rounded-full" title="Reply">
                                                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                            </button>
                                            {msg.is_own && (
                                                <>
                                                    <button onClick={() => { setEditingMsg(msg); setReplyingTo(null); replyForm.setData('message', msg.message); replyForm.setData('parent_id', msg.parent?.id || null); }} className="p-1.5 hover:bg-slate-200 rounded-full" title="Edit text">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteMsg(msg.id)} className="p-1.5 hover:bg-slate-200 rounded-full" title="Delete">
                                                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {selectedInquiry.status !== 'resolved' ? (
                            <div className="bg-white border-t border-slate-100 shrink-0 p-4">
                                {(replyingTo || editingMsg) && (
                                    <div className="mb-3 px-4 py-2 bg-slate-100 rounded-xl flex justify-between items-center border border-slate-200">
                                        <div className="text-xs truncate">
                                            <span className="font-bold text-slate-700 mr-2">{editingMsg ? 'Editing message' : `Replying to ${replyingTo.sender_name}`}:</span>
                                            <span className="text-slate-500 italic">{editingMsg ? editingMsg.message : replyingTo.message}</span>
                                        </div>
                                        <button onClick={() => { setReplyingTo(null); setEditingMsg(null); replyForm.reset(); }} className="text-slate-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    </div>
                                )}
                                <form onSubmit={submitReply} className="flex gap-2 items-center">
                                    {!editingMsg && (
                                        <>
                                            <input type="file" id="attachment" className="hidden" onChange={e => replyForm.setData('attachment', e.target.files[0])} />
                                            <button type="button" onClick={() => document.getElementById('attachment').click()} className={`p-2 rounded-full transition-colors ${replyForm.data.attachment ? 'bg-yellow-100 text-yellow-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                            </button>
                                        </>
                                    )}
                                    <textarea 
                                        rows="1" 
                                        value={replyForm.data.message} 
                                        onChange={e => replyForm.setData('message', e.target.value)} 
                                        placeholder={replyForm.data.attachment ? `Attached: ${replyForm.data.attachment.name}` : "Type a message..."} 
                                        className="flex-1 border border-slate-200 bg-slate-50 rounded-2xl px-5 py-3 text-sm focus:ring-yellow-400 focus:bg-white outline-none resize-none shadow-inner" 
                                        required 
                                    />
                                    <button type="submit" disabled={replyForm.processing} className="px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md py-3">
                                        {replyForm.processing ? '...' : (editingMsg ? 'Save' : 'Send')}
                                    </button>
                                </form>
                                {replyForm.errors.message && <p className="text-xs text-red-500 mt-2 font-medium">{replyForm.errors.message}</p>}
                                {replyForm.errors.attachment && <p className="text-xs text-red-500 mt-2 font-medium">{replyForm.errors.attachment}</p>}
                            </div>
                        ) : (
                            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs font-bold text-slate-500 uppercase tracking-widest shrink-0">
                                This inquiry has been resolved and closed.
                            </div>
                        )}
                    </div>
                </div>
            )}

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