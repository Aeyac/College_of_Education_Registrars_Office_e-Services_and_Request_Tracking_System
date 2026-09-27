import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useState } from 'react';

const SUCCESS_ICON = '<svg class="w-12 h-12 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
const ERROR_ICON = '<svg class="w-12 h-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';

const showAlert = (title, text, iconHtml) =>
    Swal.mixin({
        customClass: {
            popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
            title: 'text-slate-900 font-extrabold text-2xl pt-4',
            htmlContainer: 'text-slate-500 text-sm font-medium',
            icon: 'border-0 scale-125 mt-6',
        },
        buttonsStyling: false,
    }).fire({ title, text, iconHtml, timer: 2500, showConfirmButton: false });

export default function ComplianceModal({ request, onClose }) {
    const form = useForm({
        compliance_files: [],
    });

    const submitCompliance = (e) => {
        e.preventDefault();

        form.post(`/user/requests/${request.id}/comply`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                showAlert('Compliance Submitted', 'Your request is now under review again.', SUCCESS_ICON);
            },
            onError: () => showAlert('Could Not Submit', 'Please check the file requirements.', ERROR_ICON),
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                    <h3 className="font-bold text-slate-900 text-lg">Submit Compliance</h3>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={submitCompliance} className="p-6 space-y-5 overflow-y-auto">
                    <div>
                        <p className="text-sm text-slate-600 mb-4">
                            Please upload the required documents as requested by the admin to proceed with your request (Tracking ID: #{request.id}).
                        </p>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Files</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => form.setData('compliance_files', Array.from(e.target.files))}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">You can upload multiple files (Max 5 files).</p>
                        {form.errors.compliance_files && (
                            <p className="text-xs text-red-600 mt-1.5">{form.errors.compliance_files}</p>
                        )}
                        {/* Display individual file errors if validation fails */}
                        {Object.keys(form.errors).filter(k => k.startsWith('compliance_files.')).map(k => (
                            <p key={k} className="text-xs text-red-600 mt-1">{form.errors[k]}</p>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-60"
                    >
                        {form.processing ? 'Submitting...' : 'Submit Compliance'}
                    </button>
                </form>
            </div>
        </div>
    );
}
