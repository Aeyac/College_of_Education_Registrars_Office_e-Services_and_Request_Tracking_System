import { useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function ChatModal({ inquiry, onClose, basePath, onResolve }) {
    const [hoveredMsg, setHoveredMsg] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const replyForm = useForm({ message: '', parent_id: null, attachment: null });
    console.log(inquiry)


    useEffect(() => {
        if (!inquiry) return;

        const POLL_INTERVAL = 4000; // 4s — near-real-time without hammering the server
        let interval = null;

        const startPolling = () => {
            if (interval) return;
            interval = setInterval(() => {
                router.reload({ only: ['inquiries'], preserveScroll: true, preserveState: true });
            }, POLL_INTERVAL);
        };

        const stopPolling = () => {
            clearInterval(interval);
            interval = null;
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                // tab became visible again — refetch immediately, then resume polling
                router.reload({ only: ['inquiries'], preserveScroll: true, preserveState: true });
                startPolling();
            }
        };

        if (!document.hidden) startPolling();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [inquiry?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [inquiry?.messages?.length]);

    useEffect(() => {
        setReplyingTo(null);
        setEditingMsg(null);
        replyForm.reset();
    }, [inquiry?.id]);

    if (!inquiry) return null;

    const isImage = (fileName) => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName || '');

    const submitReply = (e) => {
        e.preventDefault();
        if (editingMsg) {
            replyForm.put(`${basePath}/messages/${editingMsg.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    replyForm.reset();
                    setEditingMsg(null);
                    router.reload({ only: ['inquiries'], preserveScroll: true, preserveState: true });
                },
            });
        } else {
            replyForm.post(`${basePath}/${inquiry.id}/reply`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    replyForm.reset();
                    setReplyingTo(null);
                    router.reload({ only: ['inquiries'], preserveScroll: true, preserveState: true });
                },
            });
        }
    };

    const handleDeleteMsg = (msgId) => {
        router.delete(`${basePath}/messages/${msgId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => router.reload({ only: ['inquiries'], preserveScroll: true, preserveState: true })
        });
    };

    const startReply = (msg) => {
        setReplyingTo(msg);
        setEditingMsg(null);
        replyForm.setData('parent_id', msg.id);
        replyForm.setData('message', '');
    };

    const startEdit = (msg) => {
        setEditingMsg(msg);
        setReplyingTo(null);
        replyForm.setData('message', msg.message);
        replyForm.setData('parent_id', msg.parent?.id || null);
    };

    const cancelComposerAction = () => {
        setReplyingTo(null);
        setEditingMsg(null);
        replyForm.reset();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-lg">{inquiry.subject}</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Status: {inquiry.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onResolve && inquiry.status !== 'resolved' && (
                            <button
                                onClick={() => onResolve(inquiry.id)}
                                className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors text-xs shadow-sm"
                            >
                                Mark Resolved
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
                    {inquiry.messages.map((msg) => (
                        <div
                            key={msg.id}
                            onMouseEnter={() => setHoveredMsg(msg.id)}
                            onMouseLeave={() => setHoveredMsg(null)}
                            className={`flex items-end gap-3 ${msg.is_own ? 'flex-row-reverse self-end ml-auto' : 'flex-row self-start mr-auto'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-bold text-xs text-slate-600 shadow-sm overflow-hidden mb-1">
                                {msg.sender_avatar ? <img src={msg.sender_avatar} className="w-full h-full object-cover" /> : msg.sender_name.charAt(0)}
                            </div>

                            <div className={`flex flex-col max-w-[75%] ${msg.is_own ? 'items-end' : 'items-start'}`}>
                                {/* Sender Name Label */}
                                <span className="text-[11px] font-bold text-slate-500 mb-1 px-1">
                                    {msg.sender_name} {msg.is_admin && <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-black ml-1">ADMIN</span>}
                                </span>

                                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm flex flex-col relative ${msg.is_own ? 'bg-yellow-400 text-slate-900 rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                                    {msg.parent && (
                                        <div className="bg-black/10 p-2 rounded-lg text-xs mb-2 border-l-2 border-black/20">
                                            <span className="font-bold block mb-0.5">{msg.parent.sender_name}</span>
                                            <span className="opacity-80 line-clamp-2">{msg.parent.message}</span>
                                        </div>
                                    )}
                                    {msg.attachment_url && (
                                        <div className="mb-2">
                                            {isImage(msg.attachment_name) ? (
                                                <a href={msg.attachment_url} target="_blank" rel="noreferrer">
                                                    <img src={msg.attachment_url} alt="Attachment" className="rounded-xl max-h-48 object-cover border border-black/10" />
                                                </a>
                                            ) : (
                                                <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/5 p-2 rounded-lg text-xs font-bold hover:bg-black/10 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    {msg.attachment_name}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap">{msg.message}</p>

                                    {/* Timestamp & Conditional Edited Label */}
                                    <div className="flex justify-end gap-2 items-center mt-1.5 opacity-50">
                                        {Boolean(msg.is_edited) && <span className="text-[9px] font-bold italic">(Edited)</span>}
                                        <span className="text-[9px] font-bold">{msg.created_at}</span>
                                    </div>
                                </div>
                            </div>

                            {hoveredMsg === msg.id && inquiry.status !== 'resolved' && (
                                <div className={`flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity ${msg.is_own ? 'flex-row-reverse' : ''}`}>
                                    <button onClick={() => startReply(msg)} className="p-1.5 hover:bg-slate-200 rounded-full" title="Reply">
                                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                    </button>
                                    {msg.is_own && (
                                        <>
                                            <button onClick={() => startEdit(msg)} className="p-1.5 hover:bg-slate-200 rounded-full" title="Edit text">
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

                {/* Composer */}
                {inquiry.status !== 'resolved' ? (
                    <div className="bg-white border-t border-slate-100 shrink-0 p-4">
                        {(replyingTo || editingMsg) && (
                            <div className="mb-3 px-4 py-2 bg-slate-100 rounded-xl flex justify-between items-center border border-slate-200">
                                <div className="text-xs truncate">
                                    <span className="font-bold text-slate-700 mr-2">
                                        {editingMsg ? 'Editing message' : `Replying to ${replyingTo.sender_name}`}:
                                    </span>
                                    <span className="text-slate-500 italic">{editingMsg ? editingMsg.message : replyingTo.message}</span>
                                </div>
                                <button onClick={cancelComposerAction} className="text-slate-400 hover:text-red-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                        <form onSubmit={submitReply} className="flex gap-2 items-center">
                            {!editingMsg && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={(e) => replyForm.setData('attachment', e.target.files[0])}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`p-2 rounded-full transition-colors ${replyForm.data.attachment ? 'bg-yellow-100 text-yellow-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    </button>
                                </>
                            )}
                            <textarea
                                rows="1"
                                value={replyForm.data.message}
                                onChange={(e) => replyForm.setData('message', e.target.value)}
                                placeholder={replyForm.data.attachment ? `Attached: ${replyForm.data.attachment.name}` : 'Type a message...'}
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
    );
}