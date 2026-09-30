import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';
import axios from 'axios';

const MAX_FILES = 5;

const getProgram = (prof) => {
    const value = [prof.department_or_program, prof.role].find((v) => v && v !== 'Not specified');
    return value || 'Unspecified';
};

const getOffice = (prof) => prof.room || prof.room_or_location || 'TBA';

const isConsultation = (block) => block.type === 'consultation';

const getCourses = (schedule = []) => [
    ...new Set(schedule.filter((b) => !isConsultation(b)).map((b) => b.course_code).filter(Boolean)),
];

export default function FacultySchedules({ faculty = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');

    const [isExtracting, setIsExtracting] = useState(false);
    const fileInputRef = useRef(null);

    // Queue of successfully-extracted records still waiting to be reviewed
    // and saved. Each upload can return up to MAX_FILES records; the admin
    // reviews/edits/saves them one at a time instead of everything at once.
    const [extractionQueue, setExtractionQueue] = useState([]);
    const [queuePosition, setQueuePosition] = useState(0);

    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        id: null,
        name: '',
        department_or_program: '',
        room_or_location: '',
        consultation_days: '',
        consultation_time_start: '',
        consultation_time_end: '',
        weekly_schedule: []
    });

    const MySwal = Swal.mixin({
        customClass: {
            popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
            title: 'text-slate-900 font-extrabold text-2xl pt-4',
            htmlContainer: 'text-slate-500 text-sm font-medium',
            confirmButton: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md transition-colors outline-none',
            cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-8 py-3.5 mx-2 transition-colors outline-none'
        },
        buttonsStyling: false
    });

    const computedDepartments = useMemo(
        () => [...new Set(faculty.map(getProgram).filter((d) => d !== 'Unspecified'))],
        [faculty]
    );

    const processedFaculty = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return faculty.filter((prof) => {
            if (deptFilter !== 'all' && getProgram(prof) !== deptFilter) return false;
            if (!q) return true;

            const haystack = [
                prof.name,
                getProgram(prof),
                getOffice(prof),
                ...(prof.weekly_schedule || []).flatMap((b) => [b.course_code, b.section_code]),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(q);
        });
    }, [faculty, searchTerm, deptFilter]);

    // Loads one queued extraction result into the form for review/editing.
    const loadQueueItem = (item) => {
        clearErrors();
        setData({
            id: null,
            name: item.data.name,
            department_or_program: item.data.department_or_program,
            room_or_location: item.data.room_or_location,
            consultation_days: '',
            consultation_time_start: '',
            consultation_time_end: '',
            weekly_schedule: item.data.weekly_schedule,
        });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        if (files.length > MAX_FILES) {
            MySwal.fire({
                title: 'Too many files',
                text: `You can upload up to ${MAX_FILES} schedules at a time. Please select fewer files.`,
                icon: 'warning',
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsExtracting(true);
        const formData = new FormData();
        files.forEach((file) => formData.append('schedule_files[]', file));

        try {
            const response = await axios.post('/admin/faculty/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const results = response.data.results || [];
            const succeeded = results.filter((r) => r.success);
            const failed = results.filter((r) => !r.success);

            if (failed.length) {
                MySwal.fire({
                    title: succeeded.length ? 'Some files need manual entry' : 'Extraction failed',
                    html: `Could not read:<br/><strong>${failed.map((f) => f.file_name).join(', ')}</strong><br/><span class="text-xs">${failed[0]?.message || ''}</span>`,
                    icon: 'warning',
                });
            }

            if (succeeded.length) {
                setExtractionQueue(succeeded);
                setQueuePosition(0);
                loadQueueItem(succeeded[0]);
                setIsModalOpen(true);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Could not read the documents.';
            MySwal.fire({
                title: 'Extraction Failed',
                text: errorMessage,
                icon: 'error',
                showConfirmButton: true
            });
        } finally {
            setIsExtracting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const advanceQueueOrClose = (afterMessage) => {
        const nextPosition = queuePosition + 1;

        if (nextPosition < extractionQueue.length) {
            setQueuePosition(nextPosition);
            loadQueueItem(extractionQueue[nextPosition]);
            MySwal.fire({
                title: afterMessage,
                text: `Loaded the next schedule (${nextPosition + 1} of ${extractionQueue.length}).`,
                icon: 'success',
                timer: 1800,
                showConfirmButton: false
            });
            return;
        }

        setIsModalOpen(false);
        reset();
        setExtractionQueue([]);
        setQueuePosition(0);
        MySwal.fire({
            title: afterMessage,
            text: 'All uploaded schedules have been reviewed.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const addScheduleBlock = () => {
        setData('weekly_schedule', [
            ...(data.weekly_schedule || []),
            { day: 'Monday', start_time: '', end_time: '', room: '', type: 'class', course_code: '', section_code: '' }
        ]);
    };

    const updateScheduleBlock = (index, field, value) => {
        const newSchedule = [...(data.weekly_schedule || [])];
        newSchedule[index][field] = value;
        setData('weekly_schedule', newSchedule);
    };

    const removeScheduleBlock = (index) => {
        const newSchedule = (data.weekly_schedule || []).filter((_, i) => i !== index);
        setData('weekly_schedule', newSchedule);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const isEditing = !!data.id;
        const isFromQueue = extractionQueue.length > 0;

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (isFromQueue) {
                    advanceQueueOrClose(isEditing ? 'Updated!' : 'Added!');
                    return;
                }
                setIsModalOpen(false);
                reset();
                MySwal.fire({
                    title: isEditing ? 'Updated!' : 'Added!',
                    text: isEditing ? 'The schedule has been successfully updated.' : 'A new faculty schedule has been created.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            onError: () => {
                MySwal.fire({
                    title: 'Validation Error',
                    text: 'Please make sure all required fields are filled out correctly.',
                    icon: 'warning',
                    showConfirmButton: true
                });
            }
        };

        if (isEditing) {
            put(`/admin/faculty/${data.id}`, options);
        } else {
            post('/admin/faculty', options);
        }
    };

    const handleSkipQueueItem = () => {
        if (extractionQueue.length === 0) return;
        advanceQueueOrClose('Skipped');
    };

    const confirmDelete = (id) => {
        MySwal.fire({
            title: 'Delete Schedule?',
            text: "You won't be able to revert this! The schedule will be permanently removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete it',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/faculty/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        MySwal.fire({
                            title: 'Deleted!',
                            text: 'The faculty schedule has been removed.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setExtractionQueue([]);
        setQueuePosition(0);
    };

    return (
        <AdminLayout>
            <Head title="Faculty Schedules" />

            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Schedules</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage consultation hours for CED professors.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.pdf"
                        multiple
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isExtracting}
                        className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isExtracting ? 'AI is Scanning...' : `Upload/Scan Schedules (up to ${MAX_FILES})`}
                    </button>

                    <button onClick={() => { reset(); clearErrors(); setExtractionQueue([]); setQueuePosition(0); setIsModalOpen(true); }} className="w-full sm:w-auto px-6 py-3 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Manual Add
                    </button>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-lg">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by professor name, course, or room..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-sm"
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-full lg:w-64 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-sm">
                        <option value="all">All Departments</option>
                        {computedDepartments.map((dept, i) => <option key={i} value={dept}>{dept}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {processedFaculty.length > 0 ? processedFaculty.map((prof) => {
                        const courses = getCourses(prof.weekly_schedule);
                        const classCount = (prof.weekly_schedule || []).filter((b) => !isConsultation(b)).length;

                        return (
                            <div key={prof.id} className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                                            {(prof.name || 'U').charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-slate-900 text-base truncate">{prof.name}</h4>
                                            <p className="text-xs font-bold text-yellow-600 truncate uppercase tracking-wide mt-0.5">{getProgram(prof)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Courses</p>
                                            {courses.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {courses.slice(0, 4).map((code) => (
                                                        <span key={code} className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                                                            {code}
                                                        </span>
                                                    ))}
                                                    {courses.length > 4 && (
                                                        <span className="text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-lg">
                                                            +{courses.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400">No courses assigned</p>
                                            )}
                                        </div>
                                        <div className="pt-3 border-t border-slate-200/70 space-y-2">
                                            <p className="flex items-center gap-2 truncate">
                                                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                <strong className="text-slate-500">Main Office:</strong>
                                                <span className="font-semibold text-slate-800">{getOffice(prof)}</span>
                                            </p>
                                            <p className="flex items-center gap-2 truncate">
                                                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <strong className="text-slate-500">Classes:</strong>
                                                <span className="font-semibold text-slate-800">{classCount} scheduled</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* keep your existing Edit / Remove buttons block here, unchanged */}
                                <div className="flex gap-3 mt-5">
                                    <button onClick={() => { setExtractionQueue([]); setQueuePosition(0); setData(prof); clearErrors(); setIsModalOpen(true); }} className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors shadow-sm">Edit</button>
                                    <button onClick={() => confirmDelete(prof.id)} className="flex-1 py-2.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors shadow-sm">Remove</button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <p className="text-sm font-bold text-slate-800">No faculty schedules match your search.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{data.id ? 'Edit' : 'Add'} Faculty Schedule</h3>
                                {extractionQueue.length > 0 && (
                                    <p className="text-xs font-bold text-yellow-600 mt-0.5">
                                        Reviewing {queuePosition + 1} of {extractionQueue.length} uploaded schedules — {extractionQueue[queuePosition]?.file_name}
                                    </p>
                                )}
                            </div>
                            <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>

                        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                            <div className="overflow-y-auto p-6 custom-scrollbar space-y-6">

                                {Object.keys(errors).length > 0 && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold">
                                        Please fix the errors below before saving.
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Basic Info</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:bg-white py-3 px-4 outline-none transition-colors" placeholder="e.g. Dr. Maria Santos" required />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department / Role</label>
                                            <input type="text" value={data.department_or_program} onChange={e => setData('department_or_program', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:bg-white py-3 px-4 outline-none transition-colors" placeholder="e.g. BS Elementary Education" required />
                                            {errors.department_or_program && <p className="text-red-500 text-xs mt-1">{errors.department_or_program}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Office Room</label>
                                            <input type="text" value={data.room_or_location} onChange={e => setData('room_or_location', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:bg-white py-3 px-4 outline-none transition-colors" placeholder="e.g. CED Rm 101" required />
                                            {errors.room_or_location && <p className="text-red-500 text-xs mt-1">{errors.room_or_location}</p>}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <h4 className="text-sm font-bold text-slate-900">Class Schedule</h4>
                                            <button type="button" onClick={addScheduleBlock} className="text-xs font-bold text-slate-700 bg-yellow-300 hover:bg-yellow-400 px-3 py-1.5 rounded-lg transition-colors border border-yellow-200">
                                                + Add Schedule
                                            </button>
                                        </div>

                                        {data.weekly_schedule && data.weekly_schedule.length > 0 ? (
                                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                                {data.weekly_schedule.map((block, index) => (
                                                    <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                                                        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                                                            <select
                                                                value={block.day}
                                                                onChange={e => updateScheduleBlock(index, 'day', e.target.value)}
                                                                className="flex-1 sm:w-auto border-slate-300 rounded-lg text-xs py-2 px-3 outline-none focus:ring-yellow-400"
                                                                required
                                                            >
                                                                <option value="Monday">Monday</option>
                                                                <option value="Tuesday">Tuesday</option>
                                                                <option value="Wednesday">Wednesday</option>
                                                                <option value="Thursday">Thursday</option>
                                                                <option value="Friday">Friday</option>
                                                                <option value="Saturday">Saturday</option>
                                                            </select>

                                                            <input
                                                                type="time"
                                                                value={block.start_time}
                                                                onChange={e => updateScheduleBlock(index, 'start_time', e.target.value)}
                                                                className="flex-1 sm:w-auto border-slate-300 rounded-lg text-xs py-2 px-2 outline-none focus:ring-yellow-400"
                                                                required
                                                            />
                                                            <span className="text-slate-400 text-xs font-medium">to</span>
                                                            <input
                                                                type="time"
                                                                value={block.end_time}
                                                                onChange={e => updateScheduleBlock(index, 'end_time', e.target.value)}
                                                                className="flex-1 sm:w-auto border-slate-300 rounded-lg text-xs py-2 px-2 outline-none focus:ring-yellow-400"
                                                                required
                                                            />

                                                            <select
                                                                value={block.type || 'class'}
                                                                onChange={e => updateScheduleBlock(index, 'type', e.target.value)}
                                                                className="flex-1 sm:w-auto border-slate-300 rounded-lg text-xs py-2 px-3 outline-none focus:ring-yellow-400"
                                                                title="Block type"
                                                                required
                                                            >
                                                                <option value="class">Class</option>
                                                                <option value="consultation">Consultation</option>
                                                                <option value="other">Other</option>
                                                            </select>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeScheduleBlock(index)}
                                                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Remove Block"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>

                                                        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                                                            <input
                                                                type="text"
                                                                placeholder="Room (e.g. CED 105)"
                                                                value={block.room}
                                                                onChange={e => updateScheduleBlock(index, 'room', e.target.value)}
                                                                className="flex-1 sm:w-auto border-slate-300 rounded-lg text-xs py-2 px-3 outline-none focus:ring-yellow-400"
                                                                required
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Course (e.g. TLEIA 2102)"
                                                                value={block.course_code || ''}
                                                                onChange={e => updateScheduleBlock(index, 'course_code', e.target.value)}
                                                                className="flex-1 sm:w-auto border-slate-300 rounded-lg text-xs py-2 px-3 outline-none focus:ring-yellow-400"
                                                                disabled={block.type !== 'class'}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Section (e.g. BTLED-IA_2-1)"
                                                                value={block.section_code || ''}
                                                                onChange={e => updateScheduleBlock(index, 'section_code', e.target.value)}
                                                                className="flex-1 sm:w-auto border-slate-300 rounded-lg text-xs py-2 px-3 outline-none focus:ring-yellow-400"
                                                                disabled={block.type !== 'class'}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <p className="text-sm text-slate-500 font-medium">No class schedules loaded.</p>
                                                <p className="text-xs text-slate-400 mt-1">Upload a document to let the AI scanner extract it, or add manually.</p>
                                            </div>
                                        )}
                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                            <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                                <strong className="text-yellow-900 block mb-0.5">💡 Consultation hours are explicit</strong>
                                                A free slot on this professor's schedule is just free — it is not automatically shown to students as consultation time. If a block above is a consultation slot, set its type to "Consultation" so students only see hours the professor has actually committed to.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                                {extractionQueue.length > 0 && queuePosition < extractionQueue.length - 1 && (
                                    <button type="button" onClick={handleSkipQueueItem} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">Skip this one</button>
                                )}
                                <button type="submit" disabled={processing} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm flex justify-center items-center">
                                    {processing ? 'Saving...' : 'Save & Publish Schedule'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </AdminLayout>
    );
}