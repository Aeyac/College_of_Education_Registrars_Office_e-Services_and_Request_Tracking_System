import { Head, useForm, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Swal from 'sweetalert2';
import sanitizeHtml from '@/Utils/sanitizeHtml';

export default function ManageAnnouncements({ announcements = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);
    const { data, setData, post, processing } = useForm({ id: null, title: '', content: '', attachments: [], existing_attachments: [], remove_attachments: [], _method: 'post' });

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    // Build/revoke an object URL whenever new files are selected so images
    // render right away instead of waiting for the form to be submitted.
    useEffect(() => {
        const files = (data.attachments || []).filter(file => file instanceof File);

        if (files.length === 0) {
            setPreviews([]);

            return undefined;
        }

        const urls = files.map(file => URL.createObjectURL(file));
        setPreviews(files.map((file, idx) => ({
            name: file.name,
            size: file.size,
            url: urls[idx],
            isImage: file.type.startsWith('image/'),
        })));

        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [data.attachments]);

    const resetFileInput = () => {
        setPreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openNewPost = () => {
        setData({ id: null, title: '', content: '', attachments: [], existing_attachments: [], remove_attachments: [], _method: 'post' });
        resetFileInput();
        setIsModalOpen(true);
    };

    const openEditPost = ann => {
        setData({ id: ann.id, title: ann.title || '', content: ann.content || '', attachments: [], existing_attachments: ann.attachments || [], remove_attachments: [], _method: 'put' });
        resetFileInput();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setData({ id: null, title: '', content: '', attachments: [], existing_attachments: [], remove_attachments: [], _method: 'post' });
        resetFileInput();
    };

    const handleRemoveNewFile = index => {
        setData('attachments', (data.attachments || []).filter((_, idx) => idx !== index));
    };

    const isImage = file => typeof file.type === 'string' && file.type.startsWith('image/');

    const formatSize = bytes => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

    const handleSave = e => {
        e.preventDefault();
        const onSuccess = () => {
            closeModal();
            Swal.fire({
                title: 'Success!',
                text: 'Announcement has been saved successfully.',
                icon: 'success',
                confirmButtonColor: '#eab308'
            });
        };
        data.id
            ? post(`/admin/announcements/${data.id}`, { onSuccess, preserveScroll: true })
            : post('/admin/announcements', { onSuccess, preserveScroll: true });
    };

    const executeDelete = () => {
        if (!confirmDelete.id) return;
        router.delete(`/admin/announcements/${confirmDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmDelete({ show: false, id: null });
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The announcement has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#eab308'
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Announcements" />

            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex justify-between items-center gap-4">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Announcements</h2>
                <button type="button" onClick={openNewPost} className="px-5 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors">+ New Post</button>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
                {announcements.map(ann => (
                    <div key={ann.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                            <h4 className="font-bold text-lg text-slate-900 leading-snug">{ann.title}</h4>
                            <span className="text-xs font-bold text-yellow-700 py-1.5 whitespace-nowrap">{ann.date}</span>
                        </div>

                        <div
                            className="text-sm text-slate-600 mb-4 leading-relaxed quill-content overflow-hidden break-words [overflow-wrap:anywhere]"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(ann.content) }}
                        />

                        {ann.attachments && ann.attachments.length > 0 && (
                            <div className="mb-6 space-y-3">
                                {ann.attachments.some(file => isImage(file)) && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {ann.attachments.filter(file => isImage(file)).map((file, idx) => (
                                            <a key={`img-${idx}`} href={`/storage/${file.path}`} target="_blank" rel="noopener noreferrer" className="group/img block overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                                <img src={`/storage/${file.path}`} alt={file.name} className="h-24 w-full object-cover transition-transform duration-200 group-hover/img:scale-105" />
                                                <p className="px-2 py-1.5 text-[11px] font-bold text-slate-600 truncate">{file.name}</p>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {ann.attachments.some(file => !isImage(file)) && (
                                    <div className="flex flex-wrap gap-2">
                                        {ann.attachments.filter(file => !isImage(file)).map((file, idx) => (
                                            <a key={`file-${idx}`} href={`/storage/${file.path}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-yellow-600 hover:border-yellow-200 hover:bg-yellow-50 transition-colors">
                                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                <span className="truncate max-w-[200px]">{file.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button type="button" onClick={() => openEditPost(ann)} className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors">Edit Post</button>
                            <button type="button" onClick={() => setConfirmDelete({ show: true, id: ann.id })} className="px-5 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {confirmDelete.show && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Delete Post?</h3>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to permanently delete this announcement from the student portal?</p>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setConfirmDelete({ show: false, id: null })} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-sm transition-colors">Cancel</button>
                            <button type="button" onClick={executeDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-red-500/20">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 shrink-0">
                            <h3 className="font-bold text-lg text-slate-900">{data.id ? 'Edit' : 'New'} Announcement</h3>
                        </div>

                        <form onSubmit={handleSave} className="flex flex-col min-h-0 flex-1">
                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Title</label>
                                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-yellow-500 focus:bg-white outline-none transition-colors" placeholder="Enter announcement title" required />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Content</label>
                                    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500">
                                        <ReactQuill theme="snow" modules={quillModules} value={data.content || ''} onChange={content => setData('content', content)} placeholder="Write your announcement here..." className="border-none [&_.ql-editor]:min-h-[200px]" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-700">Attachments</label>

                                    {data.existing_attachments && data.existing_attachments.filter(file => !data.remove_attachments.includes(file.path)).length > 0 && (
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Saved files</p>
                                    )}

                                    {data.existing_attachments && data.existing_attachments.map((file, idx) => {
                                        if (data.remove_attachments.includes(file.path)) return null;

                                        return (
                                            <div key={`existing-${idx}`} className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                                                {isImage(file) ? (
                                                    <img src={`/storage/${file.path}`} alt={file.name} className="h-12 w-12 shrink-0 object-cover rounded-md border border-slate-200" />
                                                ) : (
                                                    <div className="w-12 h-12 shrink-0 bg-white rounded-md border border-slate-200 flex items-center justify-center text-slate-400">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate font-medium text-slate-700">{file.name}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{formatSize(file.size || 0)}</p>
                                                </div>
                                                <button type="button" onClick={() => setData('remove_attachments', [...data.remove_attachments, file.path])} className="shrink-0 px-2 py-1 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded font-bold">Remove</button>
                                            </div>
                                        );
                                    })}

                                    {previews.length > 0 && (
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">New uploads</p>
                                    )}

                                    {previews.map((preview, idx) => (
                                        <div key={`preview-${idx}`} className="flex items-center gap-3 p-2 bg-yellow-50/60 border border-yellow-200 rounded-lg text-xs">
                                            {preview.isImage ? (
                                                <img src={preview.url} alt={preview.name} className="h-12 w-12 shrink-0 object-cover rounded-md border border-yellow-200 bg-white" />
                                            ) : (
                                                <div className="w-12 h-12 shrink-0 bg-white rounded-md border border-yellow-200 flex items-center justify-center text-slate-400">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate font-medium text-slate-700">{preview.name}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{formatSize(preview.size)}</p>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveNewFile(idx)} className="shrink-0 px-2 py-1 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded font-bold">Remove</button>
                                        </div>
                                    ))}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={e => setData('attachments', Array.from(e.target.files))}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-sm transition-colors">Cancel</button>
                                <button type="submit" disabled={processing} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl text-sm shadow-md transition-colors">{processing ? 'Saving...' : 'Post'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}