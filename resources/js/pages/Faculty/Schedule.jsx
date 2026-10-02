import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { useState, useRef } from 'react';
import axios from 'axios';

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

    // Server-side schedule errors. Inertia flattens nested errors into keys like
    // "weekly_schedule.0.start_time", so we look them up by prefix.
    const scheduleError = errors.weekly_schedule;
    const getBlockError = (index) =>
        Object.entries(errors).find(([key]) => key.startsWith(`weekly_schedule.${index}.`))?.[1];

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const h = parseInt(hours, 10);
        if (Number.isNaN(h)) return timeString;
        return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
    };

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

        if (data.weekly_schedule && data.weekly_schedule.length > 0) {
            data.weekly_schedule.forEach(block => {
                ws_data.push([
                    block.day,
                    formatTime(block.start_time),
                    formatTime(block.end_time),
                    block.type === 'consultation' ? 'Consultation' : 'Class',
                    block.room || 'TBA',
                    block.course_code || '-',
                    block.section_code || '-'
                ]);
            });
        } else {
            ws_data.push(['No schedule blocks added yet.']);
        }

        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        // Auto-size columns
        const colWidths = [
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }
        ];
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Schedule");
        XLSX.writeFile(wb, `${faculty?.name ? faculty.name.replace(/\s+/g, '_') : 'Faculty'}_Schedule.xlsx`);
    };

    const handleExportPDF = () => {
        setShowExportMenu(false);
        window.print();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        const formData = new FormData();
        formData.append('schedule_files[]', file);

        try {
            const response = await axios.post('/faculty/schedule/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const results = response.data.results || [];
            const result = results[0];

            if (!result || !result.success) {
                Swal.fire({
                    title: 'Scan Failed',
                    text: result?.message || 'Could not read the document.',
                    icon: 'warning',
                    customClass: { popup: 'rounded-3xl' }
                });
                return;
            }

            const extractedName = result.data.name || '';
            const myName = faculty?.name || '';

            // Very simple fuzzy matching: check if last name is in the extracted name
            const myNameParts = myName.toLowerCase().split(' ').filter(p => p.length > 2);
            let matchFound = false;

            for (const part of myNameParts) {
                if (extractedName.toLowerCase().includes(part)) {
                    matchFound = true;
                    break;
                }
            }

            if (!matchFound && extractedName.trim() !== '' && myName.trim() !== '') {
                Swal.fire({
                    title: 'Schedule Mismatch',
                    text: `The scanned schedule appears to belong to "${extractedName}". You are only allowed to upload and add your own schedule.`,
                    icon: 'error',
                    confirmButtonColor: '#e11d48', // rose-600
                    customClass: { popup: 'rounded-3xl' }
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

            Swal.fire({
                title: 'Scan Successful!',
                text: 'Your schedule has been loaded. Please review it before saving.',
                icon: 'success',
                timer: 2500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-3xl' }
            });

        } catch (error) {
            Swal.fire({
                title: 'Extraction Failed',
                text: error.response?.data?.message || 'Could not read the document. Please try again.',
                icon: 'error',
                customClass: { popup: 'rounded-3xl' }
            });
        } finally {
            setIsExtracting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const addScheduleBlock = () => {
        setData('weekly_schedule', [
            ...(data.weekly_schedule || []),
            { day: 'Monday', start_time: '', end_time: '', room: data.room_or_location || '', type: 'class', course_code: '', section_code: '' }
        ]);
    };

    const updateScheduleBlock = (index, field, value) => {
        const newSchedule = [...(data.weekly_schedule || [])];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setData('weekly_schedule', newSchedule);
    };

    const removeScheduleBlock = (index) => {
        const newSchedule = (data.weekly_schedule || []).filter((_, i) => i !== index);
        setData('weekly_schedule', newSchedule);
        // Block indexes shift after a removal, so old per-block errors no longer line up.
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/faculty/schedule', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Updated!',
                    text: 'Your schedule has been successfully updated.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-3xl' }
                });
            },
            onError: (errs) => {
                Swal.fire({
                    title: 'Validation Error',
                    text: Object.values(errs)[0] || 'Please check your inputs.',
                    icon: 'error',
                    showConfirmButton: true,
                    customClass: { popup: 'rounded-3xl' }
                });
            }
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
                                    {data.role || 'Unspecified Role'} <span className="text-slate-300 mx-1">•</span> {data.department_or_program || 'Unspecified Dept'} <span className="text-slate-300 mx-1">•</span> {data.room_or_location || 'TBA'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".png,.jpg,.jpeg,.pdf"
                                onChange={handleFileUpload}
                            />
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
                                ) : (
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                )}
                                {isExtracting ? 'Scanning...' : 'Scan Document'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Export Schedule
                                <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        type="button"
                                        onClick={handleExportPDF}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-3 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h1.5m1.5 0H12m2.5 4H9m6 4H9" /></svg>
                                        Export as PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleExportExcel}
                                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-3 transition-colors border-t border-slate-100"
                                    >
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Export as Excel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Print Only Header */}
                    <div className="hidden print:block p-8 border-b border-slate-200" id="print-section">
                        <div className="text-center mb-6">
                            <div className="flex justify-center items-center gap-4 mb-4">
                                <img src="/images/cedlogo.png" alt="CED Logo" className="w-16 h-16 object-contain" />
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">Faculty Schedule</h1>
                                    <p className="text-sm text-slate-600 mt-1">College of Education, Central Luzon State University</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                            {faculty?.user?.profile_picture ? (
                                <img src={`/storage/${faculty.user.profile_picture}`} alt={faculty.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-slate-200 shrink-0" />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-black text-3xl shrink-0 shadow-sm">
                                    {(faculty?.name || 'U').charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-bold text-slate-400 block text-xs uppercase tracking-wider mb-1">Name</span>
                                    <span className="font-bold text-slate-900 text-lg">{faculty?.name || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-400 block text-xs uppercase tracking-wider mb-1">Role</span>
                                    <span className="font-bold text-slate-900">{data.role || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-400 block text-xs uppercase tracking-wider mb-1">Department</span>
                                    <span className="font-bold text-slate-900">{data.department_or_program || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-400 block text-xs uppercase tracking-wider mb-1">Office/Room</span>
                                    <span className="font-bold text-slate-900">{data.room_or_location || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role / Position</label>
                                    <input
                                        type="text"
                                        value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-sm py-3 px-4 outline-none focus:ring-yellow-500 focus:bg-white transition-colors"
                                        placeholder="e.g. Instructor I, Faculty"
                                        required
                                    />
                                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department / Program</label>
                                    <input
                                        type="text"
                                        value={data.department_or_program}
                                        onChange={e => setData('department_or_program', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-sm py-3 px-4 outline-none focus:ring-yellow-500 focus:bg-white transition-colors"
                                        placeholder="e.g. DTLLSED"
                                        required
                                    />
                                    {errors.department_or_program && <p className="text-red-500 text-xs mt-1">{errors.department_or_program}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Office Room</label>
                                    <input
                                        type="text"
                                        value={data.room_or_location}
                                        onChange={e => setData('room_or_location', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-sm py-3 px-4 outline-none focus:ring-yellow-500 focus:bg-white transition-colors"
                                        placeholder="e.g. CED Rm 101"
                                        required
                                    />
                                    {errors.room_or_location && <p className="text-red-500 text-xs mt-1">{errors.room_or_location}</p>}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <div className="flex justify-between items-center mb-4 print:hidden">
                                    <h4 className="text-sm font-bold text-slate-900">Weekly Schedule</h4>
                                    <button type="button" onClick={addScheduleBlock} className="text-xs font-bold text-slate-700 bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded-xl transition-colors border border-yellow-400 shadow-sm">
                                        + Add Schedule Block
                                    </button>
                                </div>
                                <h4 className="hidden print:block text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Weekly Schedule</h4>

                                {scheduleError && (
                                    <p className="text-red-500 text-xs font-bold mb-3 print:hidden">{scheduleError}</p>
                                )}

                                {data.weekly_schedule && data.weekly_schedule.length > 0 ? (
                                    <>
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 print:hidden">
                                            {data.weekly_schedule.map((block, index) => {
                                                const blockError = getBlockError(index);

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`bg-slate-50 p-4 rounded-xl border space-y-3 ${blockError ? 'border-red-300' : 'border-slate-200'}`}
                                                    >
                                                        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
                                                            <select
                                                                value={block.day}
                                                                onChange={e => updateScheduleBlock(index, 'day', e.target.value)}
                                                                className="flex-1 sm:w-auto border border-slate-300 bg-white rounded-xl text-sm py-2 px-3 outline-none focus:ring-yellow-400 focus:border-yellow-400 shadow-sm"
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
                                                                className="flex-1 sm:w-auto border border-slate-300 bg-white rounded-xl text-sm py-2 px-2 outline-none focus:ring-yellow-400 focus:border-yellow-400 shadow-sm"
                                                                required
                                                            />
                                                            <span className="text-slate-400 text-xs font-bold">to</span>
                                                            <input
                                                                type="time"
                                                                value={block.end_time}
                                                                onChange={e => updateScheduleBlock(index, 'end_time', e.target.value)}
                                                                className="flex-1 sm:w-auto border border-slate-300 bg-white rounded-xl text-sm py-2 px-2 outline-none focus:ring-yellow-400 focus:border-yellow-400 shadow-sm"
                                                                required
                                                            />

                                                            <select
                                                                value={block.type || 'class'}
                                                                onChange={e => updateScheduleBlock(index, 'type', e.target.value)}
                                                                className="flex-1 sm:w-auto border border-slate-300 bg-white rounded-xl text-sm py-2 px-3 outline-none focus:ring-yellow-400 focus:border-yellow-400 shadow-sm"
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
                                                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors ml-auto sm:ml-0 print:hidden"
                                                                title="Remove Block"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>

                                                        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
                                                            <input
                                                                type="text"
                                                                placeholder="Room (e.g. CED 105)"
                                                                value={block.room}
                                                                onChange={e => updateScheduleBlock(index, 'room', e.target.value)}
                                                                className="flex-1 border border-slate-300 bg-white rounded-xl text-sm py-2 px-3 outline-none focus:ring-yellow-400 focus:border-yellow-400 shadow-sm"
                                                                required
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Course (e.g. TLEIA 2102)"
                                                                value={block.course_code || ''}
                                                                onChange={e => updateScheduleBlock(index, 'course_code', e.target.value)}
                                                                className="flex-1 border border-slate-300 bg-white rounded-xl text-sm py-2 px-3 outline-none focus:ring-yellow-400 focus:border-yellow-400 shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                                                                disabled={block.type !== 'class'}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Section (e.g. BTLED-IA_2-1)"
                                                                value={block.section_code || ''}
                                                                onChange={e => updateScheduleBlock(index, 'section_code', e.target.value)}
                                                                className="flex-1 border border-slate-300 bg-white rounded-xl text-sm py-2 px-3 outline-none focus:ring-yellow-400 focus:border-yellow-400 shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                                                                disabled={block.type !== 'class'}
                                                            />
                                                        </div>

                                                        {blockError && (
                                                            <p className="text-red-500 text-xs font-bold">{blockError}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Print Layout Table */}
                                        <div className="hidden print:block">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-100 border-y border-slate-300">
                                                        <th className="py-2 px-4 text-left text-sm font-bold text-slate-700">Day</th>
                                                        <th className="py-2 px-4 text-left text-sm font-bold text-slate-700">Time</th>
                                                        <th className="py-2 px-4 text-left text-sm font-bold text-slate-700">Type</th>
                                                        <th className="py-2 px-4 text-left text-sm font-bold text-slate-700">Course & Section</th>
                                                        <th className="py-2 px-4 text-left text-sm font-bold text-slate-700">Room</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.weekly_schedule.map((block, idx) => (
                                                        <tr key={idx} className="border-b border-slate-200 text-sm">
                                                            <td className="py-2 px-4 font-semibold">{block.day}</td>
                                                            <td className="py-2 px-4">{formatTime(block.start_time)} - {formatTime(block.end_time)}</td>
                                                            <td className="py-2 px-4 text-slate-600">{block.type === 'consultation' ? 'Consultation' : 'Class'}</td>
                                                            <td className="py-2 px-4 font-semibold">{block.course_code || '-'} {block.section_code ? `(${block.section_code})` : ''}</td>
                                                            <td className="py-2 px-4 text-slate-600">{block.room || 'TBA'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <p className="text-sm text-slate-600 font-bold">No schedule blocks added yet.</p>
                                        <p className="text-xs text-slate-500 mt-1">Click the "Add Schedule Block" button to get started.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl print:hidden">
                            <button type="submit" disabled={processing} className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm flex items-center">
                                {processing ? 'Saving...' : 'Save Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
}