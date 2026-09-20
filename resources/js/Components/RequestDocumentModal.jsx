import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

const INTERNSHIP_SERVICE_CODE = 'internship_certificate';

const SUCCESS_ICON =
    '<svg class="w-12 h-12 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';

const ERROR_ICON =
    '<svg class="w-12 h-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';

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

const inputClass =
    'w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all';
const labelClass = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2';

// Format as YYYY-MM-DD in LOCAL time (toISOString() uses UTC, which is off by a day
// for PH users between 12:00 AM and 8:00 AM)
const toLocalDateString = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// Earliest claiming date = today + 3 days (minimum processing time)
const minClaimingDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return toLocalDateString(d);
};

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-red-600 mt-1.5">{message}</p>;
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
        requirement_file: null,
    });

    const isInternship =
        services.find((s) => String(s.id) === String(form.data.service_id))?.code ===
        INTERNSHIP_SERVICE_CODE;

    // Changing the document type clears the internship-only fields
    const handleServiceChange = (e) => {
        form.setData({
            ...form.data,
            service_id: e.target.value,
            internship_school_or_agency: '',
            grade_level_handled: '',
            semester: '',
            school_year: '',
        });
    };

    const submitRequest = (e) => {
        e.preventDefault();

        // The `min` attribute only guards the calendar picker, so check typed values too.
        // YYYY-MM-DD strings compare correctly as plain strings.
        const minDate = minClaimingDate();
        const chosenDate = form.data.preferred_claiming_date;
        if (chosenDate && chosenDate < minDate) {
            form.setError('preferred_claiming_date', `Preferred claiming date must be on or after ${minDate}.`);
            return;
        }

        form.post('/user/requests', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                showAlert('Request Submitted!', 'Your document request has been successfully sent.', SUCCESS_ICON);
            },
            onError: () =>
                showAlert('Could Not Submit', 'Please check the form for errors and try again.', ERROR_ICON),
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                    <h3 className="font-bold text-slate-900 text-lg">Request Document</h3>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={submitRequest} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                    <div>
                        <label className={labelClass}>Document Type</label>
                        <select value={form.data.service_id} onChange={handleServiceChange} className={inputClass} required>
                            <option value="" disabled>Select Document...</option>
                            {services.map((s) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                        <FieldError message={form.errors.service_id} />
                    </div>

                    <div>
                        <label className={labelClass}>Delivery Mode</label>
                        <select
                            value={form.data.delivery_mode}
                            onChange={(e) => form.setData('delivery_mode', e.target.value)}
                            className={inputClass}
                            required
                        >
                            <option value="" disabled>Select Delivery Mode...</option>
                            <option value="soft_copy">Soft Copy</option>
                            <option value="hard_copy">Hard Copy</option>
                        </select>
                        <FieldError message={form.errors.delivery_mode} />
                    </div>

                    {isInternship && (
                        <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">
                                Internship Details
                            </p>

                            <div>
                                <label className={labelClass}>School / Agency</label>
                                <input
                                    type="text"
                                    value={form.data.internship_school_or_agency}
                                    onChange={(e) => form.setData('internship_school_or_agency', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                <FieldError message={form.errors.internship_school_or_agency} />
                            </div>

                            <div>
                                <label className={labelClass}>Grade Level Handled (if applicable)</label>
                                <input
                                    type="text"
                                    value={form.data.grade_level_handled}
                                    onChange={(e) => form.setData('grade_level_handled', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Semester</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1st Sem"
                                        value={form.data.semester}
                                        onChange={(e) => form.setData('semester', e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                    <FieldError message={form.errors.semester} />
                                </div>
                                <div>
                                    <label className={labelClass}>School Year</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2025-2026"
                                        value={form.data.school_year}
                                        onChange={(e) => form.setData('school_year', e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                    <FieldError message={form.errors.school_year} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>Purpose of Request</label>
                        <textarea
                            rows="2"
                            value={form.data.purpose}
                            onChange={(e) => form.setData('purpose', e.target.value)}
                            placeholder="Please state your reason..."
                            className={`${inputClass} resize-none`}
                            required
                        />
                        <FieldError message={form.errors.purpose} />
                    </div>

                    <div>
                        <label className={labelClass}>Required Supporting Document/s (if any)</label>
                        <input
                            type="file"
                            onChange={(e) => form.setData('requirement_file', e.target.files[0])}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 cursor-pointer"
                        />
                        <FieldError message={form.errors.requirement_file} />
                    </div>

                    <div>
                        <label className={labelClass}>Preferred Claiming Date (Optional, min. 3 days processing)</label>
                        <input
                            type="date"
                            value={form.data.preferred_claiming_date}
                            min={minClaimingDate()}
                            onChange={(e) => {
                                form.setData('preferred_claiming_date', e.target.value);
                                form.clearErrors('preferred_claiming_date');
                            }}
                            className={inputClass}
                        />
                        <FieldError message={form.errors.preferred_claiming_date} />
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-60"
                    >
                        {form.processing ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}