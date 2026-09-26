import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

const SUBJECT_OPTIONS = [
    'Document Request Follow-up',
    'Enrollment / Grades',
    'Alumni Verification Issue',
    'General Inquiry',
];

export default function NewInquiryModal({ isOpen, onClose, onSuccess }) {
    const form = useForm({ subject: '', message: '', attachment: null });

    if (!isOpen) return null;

    const handleClose = () => {
        form.reset();
        form.clearErrors();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        form.post('/user/inquiries', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
                Swal.fire({ title: 'Sent!', text: 'Your inquiry has been submitted.', icon: 'success', timer: 2500, showConfirmButton: false });
                onSuccess?.();
            },
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-900 text-lg">New Inquiry</h3>
                    <button onClick={handleClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                        <select value={form.data.subject} onChange={e => form.setData('subject', e.target.value)} className="w-full border border-slate-300 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none cursor-pointer" required>
                            <option value="" disabled>Select a subject...</option>
                            {SUBJECT_OPTIONS.map((subj) => (
                                <option key={subj} value={subj}>{subj === 'General Inquiry' ? 'General Inquiry / Other' : subj}</option>
                            ))}
                        </select>
                        {form.errors.subject && <p className="text-xs text-red-500 mt-1">{form.errors.subject}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message</label>
                        <textarea rows="4" value={form.data.message} onChange={e => form.setData('message', e.target.value)} placeholder="Provide details about your inquiry..." className="w-full border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 p-3 resize-none outline-none" required />
                        {form.errors.message && <p className="text-xs text-red-500 mt-1">{form.errors.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Attachment (Optional)</label>
                        <input type="file" onChange={e => form.setData('attachment', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 border border-slate-200" />
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={handleClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                        <button type="submit" disabled={form.processing} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-60">Send Message</button>
                    </div>
                </form>
            </div>
        </div>
    );
}