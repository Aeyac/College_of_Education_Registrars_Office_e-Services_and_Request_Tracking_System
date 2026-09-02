import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import Swal from 'sweetalert2';

const MySwal = Swal.mixin({
    customClass: {
        popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
        title: 'text-slate-900 font-extrabold text-2xl pt-4',
        htmlContainer: 'text-slate-500 text-sm font-medium',
        confirmButton: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md transition-colors outline-none',
        icon: 'border-0 scale-125 mt-6',
    },
    buttonsStyling: false,
});

const INTERNSHIP_SERVICE_CODE = 'internship_certificate';

const PROOF_DOCUMENT_TYPES = [
    { value: 'diploma', label: 'Diploma' },
    { value: 'tor', label: 'TOR' },
];

const ICON_PATHS = {
    newRequest: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    inquiry: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    uploadDocs: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
    faq: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    close: 'M6 18L18 6M6 6l12 12',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
};

function getStatusStyle(status) {
    const normalized = status ? status.toLowerCase() : '';
    if (normalized.includes('processing')) return 'bg-blue-100 text-blue-700';
    if (normalized.includes('ready') || normalized.includes('released')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-yellow-100 text-yellow-700';
}

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs font-medium text-red-500 mt-1.5">{message}</p>;
}

function Modal({ title, onClose, maxWidth = 'max-w-md', children }) {
    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`bg-white w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 shrink-0">
                    <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS.close} />
                        </svg>
                    </button>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

function StatCard({ iconPath, iconBg, iconColor, value, label }) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:border-yellow-200 transition-colors">
            <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center mb-3`}>
                <svg className={`w-4 h-4 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900">{value || 0}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
        </div>
    );
}

function QuickActionButton({ iconPath, name, onClick }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-3 group min-w-[80px] outline-none">
            <div className="w-14 h-14 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center group-hover:border-yellow-400 group-hover:bg-yellow-50 transition-all group-focus-visible:ring-2 ring-yellow-400">
                <svg className="w-6 h-6 text-slate-600 group-hover:text-slate-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                </svg>
            </div>
            <span className="text-[10px] font-bold text-slate-700 text-center leading-tight group-hover:text-slate-900 transition-colors">{name}</span>
        </button>
    );
}

function RequestRow({ request, onTrack }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-yellow-200 transition-all">
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICON_PATHS.newRequest} />
                    </svg>
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{request.document_type}</h4>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">#{request.id} • {request.created_at}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className={`hidden sm:inline-block px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(request.status)}`}>
                    {request.status}
                </span>
                <button onClick={() => onTrack(request)} className="text-yellow-700 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm">
                    Track
                </button>
            </div>
        </div>
    );
}

export default function UserDashboard({ auth, requests = [], stats, userRole, isAlumniVerified, services = [] }) {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [trackingRequest, setTrackingRequest] = useState(null);



    console.log(requests)
    const requestForm = useForm({
        service_id: '',
        purpose: '',
        delivery_mode: '',
        preferred_claiming_date: '',
        internship_school_or_agency: '',
        grade_level_handled: '',
        semester: '',
        school_year: '',
        requirement_file: null
    });

    const proofForm = useForm({ document_type: 'diploma', file: null });

    const selectedService = services.find((s) => s.id === Number(requestForm.data.service_id));
    const isInternshipService = selectedService?.code === INTERNSHIP_SERVICE_CODE;

    const closeRequestModal = () => { setIsRequestModalOpen(false); requestForm.reset(); requestForm.clearErrors(); };
    const closeProofModal = () => { setIsProofModalOpen(false); proofForm.reset(); proofForm.clearErrors(); };

    const handleServiceChange = (e) => {
        requestForm.setData({
            ...requestForm.data,
            service_id: e.target.value,
            internship_school_or_agency: '',
            grade_level_handled: '',
            semester: '',
            school_year: ''
        });
    };

    const handleDeliveryModeChange = (e) => {
        requestForm.setData('delivery_mode', e.target.value);
    };

    const submitRequest = (e) => {
        e.preventDefault();
        requestForm.post('/user/requests', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeRequestModal();
                MySwal.fire({ title: 'Request Sent!', text: 'Your document request was submitted successfully.', iconHtml: '<svg class="w-12 h-12 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" strokeLinejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>', timer: 2500, showConfirmButton: false });
            },
        });
    };

    const submitProof = (e) => {
        e.preventDefault();
        proofForm.post('/user/verify-alumni', {
            preserveScroll: true, forceFormData: true,
            onSuccess: () => {
                closeProofModal();
                MySwal.fire({ title: 'Uploaded!', text: 'Your proof of identity is pending review.', iconHtml: '<svg class="w-12 h-12 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" strokeLinejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>', timer: 2500, showConfirmButton: false });
            },
        });
    };

    const isAlumni = auth?.user?.user_type === 'alumni';

    const quickActions = [
        { name: 'New Request', iconPath: ICON_PATHS.newRequest, action: () => setIsRequestModalOpen(true) },
        { name: 'Submit Inquiry', iconPath: ICON_PATHS.inquiry, action: () => router.visit('/user/inquiries') },
        ...(isAlumni ? [{ name: 'Upload Docs', iconPath: ICON_PATHS.uploadDocs, action: () => setIsProofModalOpen(true) }] : []),
        { name: 'FAQ / Help', iconPath: ICON_PATHS.faq, action: () => router.visit('/user/faq') },
        { name: 'Academic Calendar', iconPath: ICON_PATHS.calendar, action: () => setIsCalendarModalOpen(true) },
    ];

    const inputClass = "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none";
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";

    return (
        <UserLayout userRole={userRole}>
            <Head title="Dashboard" />

            <div className="p-6 sm:p-8 pb-4 border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
                <p className="text-xs text-slate-500 mt-1">Welcome back, {auth?.user?.first_name || 'Student'}!</p>
            </div>

            <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-10">
                    <StatCard iconPath={ICON_PATHS.clock} iconBg="bg-yellow-50" iconColor="text-yellow-600" value={stats?.pending} label="Pending" />
                    <StatCard iconPath={ICON_PATHS.check} iconBg="bg-emerald-50" iconColor="text-emerald-600" value={stats?.completed} label="Completed" />
                </div>

                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
                <div className="flex justify-start items-center gap-4 sm:gap-6 overflow-x-auto mb-10 pb-4 custom-scrollbar">
                    {quickActions.map((action) => (
                        <QuickActionButton key={action.name} iconPath={action.iconPath} name={action.name} onClick={action.action} />
                    ))}
                </div>

                {isAlumni && !isAlumniVerified && (
                    <div className="mb-8 bg-white border border-yellow-300 shadow-sm rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-yellow-400"></div>
                        <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICON_PATHS.warning} /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Alumni Verification Required</h3>
                                <p className="text-slate-500 text-xs mt-0.5">Upload your Diploma or TOR to unlock document requests.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsProofModalOpen(true)} className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl text-xs shadow-sm w-full sm:w-auto transition-colors">Upload Now</button>
                    </div>
                )}

                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">My Recent Requests</h2>
                    {requests.length > 0 && (
                        <Link href="/user/requests" className="text-[11px] font-bold text-yellow-600 hover:text-yellow-700 transition-colors">View All</Link>
                    )}
                </div>
                <div className="space-y-3">
                    {requests.length > 0 ? requests.map((req) => <RequestRow key={req.id} request={req} onTrack={setTrackingRequest} />) : <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl"><p className="text-sm font-bold text-slate-700">No requests yet.</p><p className="text-xs text-slate-500 mt-1">Submit a new request to get started.</p></div>}
                </div>
            </div>

            {/* Tracking / Audit Trail Modal */}
            {trackingRequest && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">Track Request</h3>
                            <button onClick={() => setTrackingRequest(null)} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner mb-6">
                                <p className="mb-1"><strong className="text-slate-700">Document:</strong> <span className="font-semibold text-slate-900">{trackingRequest.document_type}</span></p>
                                <p><strong className="text-slate-700">Tracking ID:</strong> <span className="font-semibold text-slate-900">#{trackingRequest.id}</span></p>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 mb-4">Status History & Remarks</h4>
                            <div className="relative pl-4 border-l-2 border-slate-200 space-y-5 mt-4">
                                {trackingRequest.status_history?.length > 0 ? trackingRequest.status_history.map((log, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-yellow-400 rounded-full ring-4 ring-white"></div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <span className="font-bold text-slate-800">{log.status}</span>
                                                <span className="text-slate-400 font-medium text-[10px] shrink-0">{log.date}</span>
                                            </div>
                                            {log.note ? (
                                                <p className="text-slate-600 mt-1 italic leading-relaxed">"{log.note}"</p>
                                            ) : (
                                                <p className="text-slate-400 mt-1 italic">No remarks provided.</p>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-500 text-center">No tracking history available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Document Modal */}
            {isRequestModalOpen && (
                <Modal title="Request Document" onClose={closeRequestModal}>
                    <form onSubmit={submitRequest} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 mb-2">
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                                <span className="text-sm font-semibold text-slate-800">{auth?.user?.first_name} {auth?.user?.last_name}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Student Number</span>
                                <span className="text-sm font-semibold text-slate-800">{auth?.user?.student_number || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Program / Major</span>
                                <span className="text-sm font-semibold text-slate-800">{auth?.user?.course?.label || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Year / Batch</span>
                                <span className="text-sm font-semibold text-slate-800">{auth?.user?.year_level || auth?.user?.batch_year || 'N/A'}</span>
                            </div>
                            <div className="col-span-2 mt-1 border-t border-slate-200/60 pt-2">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Contact Email & Number</span>
                                <span className="text-sm font-semibold text-slate-800">{auth?.user?.email} | {auth?.user?.contact_number}</span>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Document Type</label>
                            <select value={requestForm.data.service_id} onChange={handleServiceChange} className={inputClass} required>
                                <option value="" disabled>Select Document...</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                            {requestForm.errors.service_id && <p className="text-xs text-red-600 mt-1.5">{requestForm.errors.service_id}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Delivery Mode</label>
                            <select value={requestForm.data.delivery_mode} onChange={handleDeliveryModeChange} className={inputClass} required>
                                <option value="" disabled>Select Delivery Mode...</option>
                                <option value="soft_copy">Soft Copy</option>
                                <option value="hard_copy">Hard Copy</option>
                            </select>
                            {requestForm.errors.delivery_mode && <p className="text-xs text-red-600 mt-1.5">{requestForm.errors.delivery_mode}</p>}
                        </div>

                        {/* Conditionally render Internship Fields */}
                        {isInternshipService && (
                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">Internship Details</p>
                                <div>
                                    <label className={labelClass}>School / Agency</label>
                                    <input type="text" value={requestForm.data.internship_school_or_agency} onChange={e => requestForm.setData('internship_school_or_agency', e.target.value)} className={inputClass} required />
                                    {requestForm.errors.internship_school_or_agency && <p className="text-xs text-red-600 mt-1.5">{requestForm.errors.internship_school_or_agency}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Grade Level Handled (if applicable)</label>
                                    <input type="text" value={requestForm.data.grade_level_handled} onChange={e => requestForm.setData('grade_level_handled', e.target.value)} className={inputClass} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Semester</label>
                                        <input type="text" placeholder="e.g. 1st Sem" value={requestForm.data.semester} onChange={e => requestForm.setData('semester', e.target.value)} className={inputClass} required />
                                        {requestForm.errors.semester && <p className="text-xs text-red-600 mt-1.5">{requestForm.errors.semester}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>School Year</label>
                                        <input type="text" placeholder="e.g. 2025-2026" value={requestForm.data.school_year} onChange={e => requestForm.setData('school_year', e.target.value)} className={inputClass} required />
                                        {requestForm.errors.school_year && <p className="text-xs text-red-600 mt-1.5">{requestForm.errors.school_year}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Purpose of Request</label>
                            <textarea rows="2" value={requestForm.data.purpose} onChange={e => requestForm.setData('purpose', e.target.value)} placeholder="Please state your reason..." className={`${inputClass} resize-none`} required />
                            {requestForm.errors.purpose && <p className="text-xs text-red-600 mt-1.5">{requestForm.errors.purpose}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Required Supporting Document/s (if any)</label>
                            <input type="file" onChange={e => requestForm.setData('requirement_file', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 cursor-pointer" />
                            {requestForm.errors.requirement_file && <p className="text-xs text-red-600 mt-1.5">{requestForm.errors.requirement_file}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>Preferred Claiming Date (Optional)</label>
                            <input type="date" value={requestForm.data.preferred_claiming_date} min={new Date().toISOString().split('T')[0]} onChange={e => requestForm.setData('preferred_claiming_date', e.target.value)} className={inputClass} />
                        </div>

                        <button type="submit" disabled={requestForm.processing} className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-60">
                            {requestForm.processing ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </Modal>
            )}

            {/* Upload Verification Modal */}
            {isProofModalOpen && (
                <Modal title="Upload Verification" onClose={closeProofModal} maxWidth="max-w-md">
                    <form onSubmit={submitProof} className="p-6 text-center">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-lg mb-1">Verify Alumni Status</h4>
                        <p className="text-sm text-slate-500 mb-6 px-4">Please upload a clear copy of your Diploma or Official Transcript of Records (TOR).</p>

                        <div className="grid grid-cols-2 gap-3 mb-5">
                            {PROOF_DOCUMENT_TYPES.map((type) => (
                                <label key={type.value} className={`border rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all ${proofForm.data.document_type === type.value ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                                    <input type="radio" value={type.value} checked={proofForm.data.document_type === type.value} onChange={(e) => proofForm.setData('document_type', e.target.value)} className="text-yellow-500 focus:ring-yellow-500 border-slate-300" />
                                    <span className="ml-2 text-sm font-bold text-slate-700">{type.label}</span>
                                </label>
                            ))}
                        </div>
                        <FieldError message={proofForm.errors.document_type} />

                        <div className="text-left">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload File (PDF, JPG, PNG)</label>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => proofForm.setData('file', e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold hover:file:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer" required />
                            <FieldError message={proofForm.errors.file} />
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button type="button" onClick={closeProofModal} className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors hover:bg-slate-200">Cancel</button>
                            <button type="submit" disabled={proofForm.processing} className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-md hover:bg-slate-800 transition-colors disabled:opacity-60">{proofForm.processing ? 'Uploading...' : 'Upload Proof'}</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Academic Calendar Modal */}
            {isCalendarModalOpen && (
                <Modal title="Academic Calendar" onClose={() => setIsCalendarModalOpen(false)} maxWidth="max-w-4xl">
                    <div className="p-6">
                        <p className="text-sm text-slate-500 mb-6 text-center">
                            Review the official academic calendar for the current school year.
                        </p>

                        <div className="w-full h-[60vh] sm:h-[70vh] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner mb-6 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium z-0">
                                Loading Calendar...
                            </div>
                            <iframe
                                src="/downloads/Academic-Calendar-for-SY-2026-27-Official V6.pdf"
                                title="Academic Calendar"
                                className="w-full h-full relative z-10"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCalendarModalOpen(false)}
                                className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors hover:bg-slate-200"
                            >
                                Close
                            </button>
                            <a
                                href="/downloads/Academic-Calendar-for-SY-2026-27-Official V6.pdf"
                                download="Academic-Calendar-for-SY-2026-27-Official V6.pdf"
                                className="flex-[2] py-3.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md transition-colors hover:bg-yellow-500 text-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
                            </a>
                        </div>
                    </div>
                </Modal>
            )}

        </UserLayout>
    );
}