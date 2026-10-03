import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import PrintSchedule from '@/Components/PrintSchedule';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { useState, useRef } from 'react';
import axios from 'axios';

const fire = o => Swal.fire({ customClass: { popup: 'rounded-3xl' }, ...o });
const toast = (title, text, timer = 2500) => fire({ title, text, icon: 'success', timer, showConfirmButton: false });

const FIELDS = [
    ['role', 'Role / Position', 'e.g. Instructor I, Faculty'],
    ['department_or_program', 'Department / Program', 'e.g. DTLLSED'],
    ['room_or_location', 'Main Office Room', 'e.g. CED Rm 101']
];
const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BASE = 'border border-slate-300 bg-white rounded-xl text-sm';
const FOCUS = 'outline-none focus:ring-yellow-400 focus:border-yellow-400 shadow-sm';
const SELECT_CLS = `flex-1 sm:w-auto ${BASE} py-2 px-3 ${FOCUS}`;
const TIME_CLS = `flex-1 sm:w-auto ${BASE} py-2 px-2 ${FOCUS}`;
const TEXT_CLS = `flex-1 ${BASE} py-2 px-3 ${FOCUS}`;
const CLASS_ONLY_CLS = `${TEXT_CLS} disabled:bg-slate-100 disabled:text-slate-400`;

const Icon = ({ d, cls = 'w-4 h-4', stroke = true }) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke={stroke ? 'currentColor' : undefined}>
        {[].concat(d).map(p => <path key={p} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={p} />)}
    </svg>
);

const formatTime = t => {
    if (!t) return '';
    const [hours, minutes] = t.split(':'), h = parseInt(hours, 10);
    return Number.isNaN(h) ? t : `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function Schedule({ faculty }) {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        role: faculty?.role || '',
        department_or_program: faculty?.department_or_program || '',
        room_or_location: faculty?.room_or_location || '',
        weekly_schedule: faculty?.weekly_schedule || []
    });

    const hasBlocks = (data.weekly_schedule || []).length > 0;
    const editedAt = faculty?.updated_at
        ? new Date(faculty.updated_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
        : null;

    const confirmClear = () => {
        fire({
            title: 'Clear your whole schedule?',
            text: 'Every block will be removed for you and for the registrar. You can add them again afterwards.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear it',
            cancelButtonText: 'Keep my schedule',
            reverseButtons: true
        }).then(result => {
            if (!result.isConfirmed) return;
            setData('weekly_schedule', []);
            clearErrors();
            toast('Cleared', 'Remember to press "Save Schedule" to publish the change.');
        });
    };

    const scheduleError = errors.weekly_schedule;
    const getBlockError = index => Object.entries(errors).find(([key]) => key.startsWith(`weekly_schedule.${index}.`))?.[1];

    const handleExportExcel = () => {
        setShowExportMenu(false);

        const ws_data = [
            ['Faculty Schedule'],
            ['Name:', faculty?.name || 'Not specified'],
            ['Role:', data.role || 'Not specified'],
            ['Department:', data.department_or_program || 'Not specified'],
            ['Office/Room:', data.room_or_location || 'Not specified'],
            [],
            ['Day', 'Start Time', 'End Time', 'Type', 'Room', 'Course Code', 'Section Code']
        ];

        if (data.weekly_schedule?.length) {
            data.weekly_schedule.forEach(b => ws_data.push([
                b.day, formatTime(b.start_time), formatTime(b.end_time),
                b.type === 'consultation' ? 'Consultation' : 'Class',
                b.room || 'TBA', b.course_code || '-', b.section_code || '-'
            ]));
        } else ws_data.push(['No schedule blocks added yet.']);

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!cols'] = [12, 12, 12, 15, 15, 15, 15].map(wch => ({ wch }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
        XLSX.writeFile(wb, `${faculty?.name ? faculty.name.replace(/\s+/g, '_') : 'Faculty'}_Schedule.xlsx`);
    };

    const handleExportPDF = () => {
        setShowExportMenu(false);
        window.print();
    };

    const handleFileUpload = async e => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);

        const formData = new FormData();
        formData.append('schedule_files[]', file);

        try {
            const response = await axios.post('/faculty/schedule/extract', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const result = (response.data.results || [])[0];

            if (!result || !result.success) {
                fire({ title: 'Scan Failed', text: result?.message || 'Could not read the document.', icon: 'warning' });
                return;
            }

            const extractedName = result.data.name || '', myName = faculty?.name || '';
            const matchFound = myName.toLowerCase().split(' ').filter(p => p.length > 2).some(part => extractedName.toLowerCase().includes(part));

            if (!matchFound && extractedName.trim() && myName.trim()) {
                fire({
                    title: 'Schedule Mismatch',
                    text: `The scanned schedule appears to belong to "${extractedName}". You are only allowed to upload and add your own schedule.`,
                    icon: 'error',
                    confirmButtonColor: '#e11d48'
                });
                return;
            }

            clearErrors();

            setData({
                ...data,
                role: result.data.role || data.role,
                department_or_program: result.data.department_or_program || data.department_or_program,
                room_or_location: result.data.room_or_location || data.room_or_location,
                weekly_schedule: result.data.weekly_schedule || []
            });

            toast('Scan Successful!', 'Your schedule has been loaded. Please review it before saving.');
        } catch (error) {
            fire({ title: 'Extraction Failed', text: error.response?.data?.message || 'Could not read the document. Please try again.', icon: 'error' });
        } finally {
            setIsExtracting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const addScheduleBlock = () => setData('weekly_schedule', [
        ...(data.weekly_schedule || []),
        { day: 'Monday', start_time: '', end_time: '', room: data.room_or_location || '', type: 'class', course_code: '', section_code: '' }
    ]);

    const updateScheduleBlock = (index, field, value) => {
        const newSchedule = [...(data.weekly_schedule || [])];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setData('weekly_schedule', newSchedule);
    };

    const removeScheduleBlock = index => {
        setData('weekly_schedule', (data.weekly_schedule || []).filter((_, i) => i !== index));
        clearErrors();
    };

    const handleSubmit = e => {
        e.preventDefault();

        put('/faculty/schedule', {
            preserveScroll: true,
            onSuccess: () => toast('Updated!', 'Your schedule has been successfully updated.', 2000),
            onError: errs => fire({ title: 'Validation Error', text: Object.values(errs)[0] || 'Please check your inputs.', icon: 'error', showConfirmButton: true })
        });
    };

    return (
        <UserLayout>
            <Head title="My Schedule" />

            <div className="max-w-4xl mx-auto py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                        <div className="flex items-center gap-4 min-w-0">
                            {faculty?.user?.profile_picture ? (
                                <img src={`/storage/${faculty.user.profile_picture}`} alt={faculty.name} className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-200 shrink-0" />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                                    {(faculty?.name || 'U').charAt(0)}
                                </div>
                            )}

                            <div className="min-w-0">
                                <h2 className="font-bold text-slate-900 text-lg truncate">{faculty?.name || 'My Schedule'}</h2>
                                <p className="text-xs font-bold text-yellow-600 uppercase tracking-wide truncate mt-0.5">
                                    {data.role || 'Unspecified Role'}
                                    <span className="text-slate-300 mx-1">•</span>
                                    {data.department_or_program || 'Unspecified Dept'}
                                    <span className="text-slate-300 mx-1">•</span>
                                    {data.room_or_location || 'TBA'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 relative">
                            <input type="file" ref={fileInputRef} className="hidden" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileUpload} />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isExtracting}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-60"
                            >
                                {isExtracting ? (
                                    <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                ) : <Icon cls="w-4 h-4 shrink-0" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />}
                                {isExtracting ? 'Scanning...' : 'Scan Document'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                            >
                                <Icon d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                Export Schedule
                                <Icon cls={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} d="M19 9l-7 7-7-7" stroke={false} />
                            </button>

                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        type="button"
                                        onClick={handleExportPDF}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-3 transition-colors"
                                    >
                                        <Icon cls="w-4 h-4 text-rose-500" d={['M7 21h10a2 2 0 002-2V9.414a2 2 0 00-.293-.707l-5.414-5.414A2 2 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', 'M9 9h1.5m1.5 0H12m2.5 4H9m6 4H9']} />
                                        Export as PDF
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleExportExcel}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-3 transition-colors border-t border-slate-100"
                                    >
                                        <Icon cls="w-4 h-4 text-emerald-500" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        Export as Excel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <PrintSchedule prof={{ ...faculty, ...data }} />

                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-6">

                            {faculty?.edited_by_role === 'admin' && (
                                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 text-blue-900 rounded-xl px-4 py-3 print:hidden">
                                    <Icon cls="w-4 h-4 shrink-0 mt-0.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <p className="text-xs font-semibold leading-relaxed">
                                        You and the registrar share this one schedule, so either of your edits appears on both sides.
                                        {editedAt && <> The registrar last changed it {editedAt}.</>}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {FIELDS.map(([field, label, placeholder]) => (
                                    <div key={field}>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
                                        <input
                                            type="text"
                                            value={data[field]}
                                            onChange={e => setData(field, e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-sm py-3 px-4 outline-none focus:ring-yellow-500 focus:bg-white transition-colors"
                                            placeholder={placeholder}
                                            required
                                        />
                                        {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <div className="flex justify-between items-center mb-4 print:hidden">
                                    <h4 className="text-sm font-bold text-slate-900">Weekly Schedule</h4>
                                    <button
                                        type="button"
                                        onClick={addScheduleBlock}
                                        className="text-xs font-bold text-slate-700 bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded-xl transition-colors border border-yellow-400 shadow-sm"
                                    >
                                        + Add Schedule Block
                                    </button>
                                </div>

                                <h4 className="hidden print:block text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Weekly Schedule</h4>

                                {scheduleError && <p className="text-red-500 text-xs font-bold mb-3 print:hidden">{scheduleError}</p>}

                                {data.weekly_schedule?.length ? (
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 print:hidden">
                                        {data.weekly_schedule.map((block, index) => {
                                            const blockError = getBlockError(index);
                                            const set = field => e => updateScheduleBlock(index, field, e.target.value);

                                            return (
                                                <div key={index} className={`bg-slate-50 p-4 rounded-xl border space-y-3 ${blockError ? 'border-red-300' : 'border-slate-200'}`}>
                                                    <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
                                                        <select value={block.day} onChange={set('day')} className={SELECT_CLS} required>
                                                            {DAY_OPTIONS.map(day => <option key={day}>{day}</option>)}
                                                        </select>

                                                        <input type="time" value={block.start_time} onChange={set('start_time')} className={TIME_CLS} required />

                                                        <span className="text-slate-400 text-xs font-bold">to</span>

                                                        <input type="time" value={block.end_time} onChange={set('end_time')} className={TIME_CLS} required />

                                                        <select value={block.type || 'class'} onChange={set('type')} className={SELECT_CLS} required>
                                                            <option value="class">Class</option>
                                                            <option value="consultation">Consultation</option>
                                                            <option value="other">Other</option>
                                                        </select>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeScheduleBlock(index)}
                                                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors ml-auto sm:ml-0 print:hidden"
                                                            title="Remove Block"
                                                        >
                                                            <Icon cls="w-5 h-5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
                                                        <input type="text" placeholder="Room (e.g. CED 105)" value={block.room || ''} onChange={set('room')} className={TEXT_CLS} required />
                                                        <input type="text" placeholder="Course (e.g. TLEIA 2102)" value={block.course_code || ''} onChange={set('course_code')} className={CLASS_ONLY_CLS} disabled={block.type !== 'class'} />
                                                        <input type="text" placeholder="Section (e.g. BTLED-IA_2-1)" value={block.section_code || ''} onChange={set('section_code')} className={CLASS_ONLY_CLS} disabled={block.type !== 'class'} />
                                                    </div>

                                                    {blockError && <p className="text-red-500 text-xs font-bold">{blockError}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                                                <path stroke="currentColor" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-slate-600 font-bold">No schedule blocks added yet.</p>
                                        <p className="text-xs text-slate-500 mt-1">Click the "Add Schedule Block" button to get started.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 rounded-b-2xl print:hidden">
                            <div className="flex gap-3">
                                {hasBlocks && (
                                    <button type="button" onClick={confirmClear} className="px-5 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl transition-colors text-sm hover:bg-red-50">
                                        Clear Schedule
                                    </button>
                                )}
                            </div>

                            <button type="submit" disabled={processing} className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm flex items-center justify-center">
                                {processing ? 'Saving...' : 'Save Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
}