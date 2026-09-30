import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const INTERNSHIP_SERVICE_CODE = 'internship_certificate';
const SUCCESS_ICON = '<svg class="w-12 h-12 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
const ERROR_ICON = '<svg class="w-12 h-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';

const inputClass = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all';
const labelClass = 'block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5';

// Guidance text per service. Whether proof is mandatory comes from the server (requires_proof).
const PROOF_COPY = {
    internship_certificate: { title: 'Diploma', description: 'Upload a clear copy of your diploma.' },
    copc: { title: 'Proof of Graduate — TOR or Diploma', description: 'Upload your proof of graduation (TOR or diploma).' },
    golden_grain: { title: 'Receipt', description: 'Upload a clear copy of the required receipt.' },
};

const FALLBACK_PROOF_COPY = {
    required: { title: 'Proof of Requirement', description: 'Upload the document required for this service.' },
    optional: { title: 'Optional / As Requested', description: 'Attach any supporting document for this service, if applicable.' },
};

const showAlert = (title, text, iconHtml) => Swal.mixin({
    customClass: {
        popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
        title: 'text-slate-900 font-extrabold text-2xl pt-4',
        htmlContainer: 'text-slate-500 text-sm font-medium',
        icon: 'border-0 scale-125 mt-6'
    },
    buttonsStyling: false
}).fire({ title, text, iconHtml, timer: 2500, showConfirmButton: false });

const toLocalDateString = d => {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'),
        day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const minClaimingDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return toLocalDateString(d);
};

function FieldError({ message }) {
    if (!message) return null;
    return (
        <p className="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
        </p>
    );
}

function RequiredBadge() {
    return (
        <span className="ml-2 inline-block align-middle rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Required
        </span>
    );
}

function SectionBadge({ number, title, subtitle }) {
    return (
        <div className="flex items-center gap-2.5 pb-2">
            <div className="w-6 h-6 rounded-lg bg-yellow-400 text-slate-900 flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                {number}
            </div>
            <div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight">{title}</h4>
                {subtitle && <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>}
            </div>
        </div>
    );
}

export default function RequestDocumentModal({ services = [], onClose }) {
    const form = useForm({
        service_id: '',
        delivery_mode: '',
        purpose: '',
        preferred_claiming_date: '',
        internship_school_or_agency: '',
        grade_level_handled: '',
        semester: '',
        school_year: '',
        requirement_files: []
    });

    // Changing this key remounts the file input so the browser clears its selected files.
    const [fileInputKey, setFileInputKey] = useState(0);

    useEffect(() => {
        const onKey = e => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const selectedService = services.find(s => String(s.id) === String(form.data.service_id));
    const isInternship = selectedService?.code === INTERNSHIP_SERVICE_CODE;
    const proofRequired = Boolean(selectedService?.requires_proof);

    const proofCopy = selectedService
        ? PROOF_COPY[selectedService.code] ?? FALLBACK_PROOF_COPY[proofRequired ? 'required' : 'optional']
        : null;

    // Collects "requirement_files" plus per-file errors such as "requirement_files.0".
    const fileErrors = Object.entries(form.errors)
        .filter(([key]) => key === 'requirement_files' || key.startsWith('requirement_files.'))
        .map(([, message]) => message);

    const handleServiceChange = e => {
        form.setData({
            ...form.data,
            service_id: e.target.value,
            internship_school_or_agency: '',
            grade_level_handled: '',
            semester: '',
            school_year: '',
            requirement_files: []
        });
        form.clearErrors('requirement_files');
        setFileInputKey(k => k + 1);
    };

    const handleFilesChange = e => {
        form.setData('requirement_files', Array.from(e.target.files));
        form.clearErrors('requirement_files');
    };

    const submitRequest = e => {
        e.preventDefault();
        const minDate = minClaimingDate();
        const chosenDate = form.data.preferred_claiming_date;

        if (chosenDate && chosenDate < minDate) {
            form.setError('preferred_claiming_date', `Preferred claiming date must be on or after ${minDate}.`);
            return;
        }

        if (proofRequired && form.data.requirement_files.length === 0) {
            form.setError('requirement_files', 'Please upload the required proof document for this request.');
            return;
        }

        form.post('/user/requests', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                showAlert('Request Submitted!', 'Your document request has been successfully sent.', SUCCESS_ICON);
            },
            onError: () => showAlert('Could Not Submit', 'Please check the form for errors and try again.', ERROR_ICON)
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="request-modal-title"
                onClick={e => e.stopPropagation()}
                className="bg-white w-full sm:max-w-xl rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100"
            >
                {/* Header */}
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <div>
                        <h3 id="request-modal-title" className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">Request Document</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Fill out the details below to submit your request.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="p-2.5 bg-white rounded-full text-slate-400 hover:text-slate-700 border border-slate-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Content */}
                <form id="request-doc-form" onSubmit={submitRequest} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    {/* Step 1: Request Details */}
                    <section className="space-y-4">
                        <SectionBadge number="1" title="Request Details" />

                        <div>
                            <label htmlFor="service_id" className={labelClass}>Document Type</label>
                            <select id="service_id" value={form.data.service_id} onChange={handleServiceChange} className={inputClass} required>
                                <option value="" disabled>Select document type...</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                            <FieldError message={form.errors.service_id} />
                        </div>

                        {proofCopy && (
                            <div className={`rounded-2xl border p-4 ${proofRequired ? 'border-amber-200/80 bg-amber-50/60' : 'border-slate-200 bg-slate-50/60'}`}>
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 shrink-0 rounded-xl bg-amber-400/20 text-amber-900 flex items-center justify-center mt-0.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded-full">
                                            {proofRequired ? 'Required Document' : 'Supporting Documents'}
                                        </span>
                                        <p className="mt-1 text-sm font-bold text-slate-900">{proofCopy.title}</p>
                                        <p className="mt-0.5 text-xs text-slate-600 leading-relaxed font-medium">{proofCopy.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="delivery_mode" className={labelClass}>Delivery Mode</label>
                            <select
                                id="delivery_mode"
                                value={form.data.delivery_mode}
                                onChange={e => form.setData('delivery_mode', e.target.value)}
                                className={inputClass}
                                required
                            >
                                <option value="" disabled>Select delivery mode...</option>
                                <option value="soft_copy">Soft Copy (Digital)</option>
                                <option value="hard_copy">Hard Copy (Physical Pick-up)</option>
                            </select>
                            <FieldError message={form.errors.delivery_mode} />

                            {form.data.delivery_mode === 'hard_copy' && (
                                <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start">
                                    <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs leading-relaxed text-slate-600 font-medium">
                                        <strong className="text-slate-900">For authorized claimants:</strong> Please present an <strong>Authorization Letter</strong> along with a copy of the <strong>claimant's valid ID</strong> upon pickup.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Step 2 (Conditional): Internship Details */}
                    {isInternship && (
                        <section className="space-y-4 rounded-2xl bg-slate-50/80 border border-slate-200 p-4">
                            <SectionBadge number="2" title="Internship Details" subtitle="Additional information required for this certificate." />

                            <div>
                                <label htmlFor="internship_school_or_agency" className={labelClass}>School / Agency</label>
                                <input
                                    id="internship_school_or_agency"
                                    type="text"
                                    placeholder="e.g. DepEd Central Office"
                                    value={form.data.internship_school_or_agency}
                                    onChange={e => form.setData('internship_school_or_agency', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <FieldError message={form.errors.internship_school_or_agency} />
                            </div>

                            <div>
                                <label htmlFor="grade_level_handled" className={labelClass}>Grade Level Handled <span className="normal-case tracking-normal font-normal text-slate-400">(Optional)</span></label>
                                <input
                                    id="grade_level_handled"
                                    type="text"
                                    placeholder="e.g. Grade 10"
                                    value={form.data.grade_level_handled}
                                    onChange={e => form.setData('grade_level_handled', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="semester" className={labelClass}>Semester</label>
                                    <input
                                        id="semester"
                                        type="text"
                                        placeholder="e.g. 1st Sem"
                                        value={form.data.semester}
                                        onChange={e => form.setData('semester', e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                    <FieldError message={form.errors.semester} />
                                </div>
                                <div>
                                    <label htmlFor="school_year" className={labelClass}>School Year</label>
                                    <input
                                        id="school_year"
                                        type="text"
                                        placeholder="e.g. 2025-2026"
                                        value={form.data.school_year}
                                        onChange={e => form.setData('school_year', e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                    <FieldError message={form.errors.school_year} />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Step 2 or 3: Additional Information */}
                    <section className="space-y-4">
                        <SectionBadge number={isInternship ? '3' : '2'} title="Additional Information" />

                        <div>
                            <label htmlFor="purpose" className={labelClass}>Purpose of Request</label>
                            <textarea
                                id="purpose"
                                rows="2"
                                value={form.data.purpose}
                                onChange={e => form.setData('purpose', e.target.value)}
                                placeholder="State your reason for requesting this document..."
                                className={`${inputClass} resize-none`}
                                required
                            />
                            <FieldError message={form.errors.purpose} />
                        </div>

                        <div>
                            <label htmlFor="requirement_files" className={labelClass}>
                                Upload Supporting Document
                                {proofRequired && <RequiredBadge />}
                            </label>
                            <div className={`rounded-2xl border-2 border-dashed bg-slate-50/60 hover:bg-slate-50 p-4 transition-colors ${fileErrors.length ? 'border-rose-300' : 'border-slate-200'}`}>
                                <input
                                    key={fileInputKey}
                                    id="requirement_files"
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    required={proofRequired}
                                    aria-required={proofRequired}
                                    onChange={handleFilesChange}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                                />

                                {form.data.requirement_files?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {form.data.requirement_files.map((file, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
                                                📎 {file.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">
                                    {proofRequired
                                        ? 'Upload the required proof specified above. '
                                        : 'Attach a supporting document if you have one. '}
                                    Accepted: PDF, JPG, PNG (up to 5 files, 10 MB each). Hold Ctrl/Cmd to attach <strong>multiple files</strong>.
                                </p>
                            </div>
                            {[...new Set(fileErrors)].map((message, i) => <FieldError key={i} message={message} />)}
                        </div>

                        <div>
                            <label htmlFor="preferred_claiming_date" className={labelClass}>Preferred Claiming Date</label>
                            <input
                                id="preferred_claiming_date"
                                type="date"
                                value={form.data.preferred_claiming_date}
                                min={minClaimingDate()}
                                onChange={e => {
                                    form.setData('preferred_claiming_date', e.target.value);
                                    form.clearErrors('preferred_claiming_date');
                                }}
                                className={inputClass}
                                required
                            />
                            <p className="text-[11px] text-slate-400 font-medium mt-1">Must be at least 3 days from today to allow standard office processing time.</p>
                            <FieldError message={form.errors.preferred_claiming_date} />
                        </div>
                    </section>
                </form>

                {/* Footer (Sticky Actions) */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Double check all fields before submitting.</p>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-1/2 sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all min-h-[42px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="request-doc-form"
                            disabled={form.processing}
                            className="w-1/2 sm:w-auto px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed min-h-[42px] focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                        >
                            {form.processing ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}