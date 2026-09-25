import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import UserLayout from '@/Layouts/UserLayout';

export default function FacultySchedules({ faculty = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [selectedProf, setSelectedProf] = useState(null);

    const computedDepartments = useMemo(() => {
        return [...new Set(faculty.map(prof => prof.role || prof.department_or_program || '').filter(Boolean))];
    }, [faculty]);

    const processedFaculty = useMemo(() => {
        return faculty.filter(prof => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                (prof.name && prof.name.toLowerCase().includes(searchLower)) ||
                (prof.role && prof.role.toLowerCase().includes(searchLower)) ||
                (prof.room && prof.room.toLowerCase().includes(searchLower));
            
            const matchesDept = deptFilter === 'all' || prof.role === deptFilter || prof.department_or_program === deptFilter;
            
            return matchesSearch && matchesDept;
        });
    }, [faculty, searchTerm, deptFilter]);

    // Format time for 12-hour display
    const formatTime = (timeString) => {
        if (!timeString) return '';
        try {
            const [hours, minutes] = timeString.split(':');
            const h = parseInt(hours, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const formattedH = h % 12 || 12;
            return `${formattedH}:${minutes} ${ampm}`;
        } catch (e) {
            return timeString;
        }
    };

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const getConsultationBlocks = (schedule) => {
        if (!schedule) return [];
        
        const targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        const consultations = [];
        
        const toMins = (timeStr) => {
            if (!timeStr) return 0;
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };
        
        const toTimeStr = (mins) => {
            const h = Math.floor(mins / 60).toString().padStart(2, '0');
            const m = (mins % 60).toString().padStart(2, '0');
            return `${h}:${m}`;
        };

        targetDays.forEach(day => {
            const classes = schedule.filter(c => c.day === day && c.start_time && c.end_time);
            
            let freeSlots = [
                { start: 480, end: 720 }, // 08:00 - 12:00
                { start: 780, end: 1020 } // 13:00 - 17:00
            ];
            
            classes.forEach(c => {
                const cStart = toMins(c.start_time);
                const cEnd = toMins(c.end_time);
                
                let newFreeSlots = [];
                freeSlots.forEach(slot => {
                    if (cStart < slot.end && cEnd > slot.start) {
                        if (slot.start < cStart) {
                            newFreeSlots.push({ start: slot.start, end: cStart });
                        }
                        if (slot.end > cEnd) {
                            newFreeSlots.push({ start: cEnd, end: slot.end });
                        }
                    } else {
                        newFreeSlots.push(slot);
                    }
                });
                freeSlots = newFreeSlots;
            });
            
            freeSlots.forEach(slot => {
                if (slot.end - slot.start >= 30) {
                    consultations.push({
                        day: day,
                        start_time: toTimeStr(slot.start),
                        end_time: toTimeStr(slot.end),
                        room: 'Main Office',
                        type: 'consultation',
                        isAuto: true
                    });
                }
            });
        });
        
        return consultations;
    };

    const getSortedSchedule = (schedule) => {
        if (!schedule) return [];
        
        const autoConsultations = getConsultationBlocks(schedule);
        const combined = [...schedule, ...autoConsultations];
        
        return combined.sort((a, b) => {
            const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
            if (dayDiff !== 0) return dayDiff;
            return (a.start_time || '').localeCompare(b.start_time || '');
        });
    };

    return (
        <UserLayout>
            <Head title="Faculty Schedules" />
            
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Schedules</h2>
                    <p className="text-xs text-slate-500 mt-1">View consultation hours and class schedules of CED professors.</p>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-lg">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by professor name, department, or room..." 
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {processedFaculty.length > 0 ? processedFaculty.map((prof) => (
                        <div key={prof.id} className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer" onClick={() => setSelectedProf(prof)}>
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-yellow-400 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                                        {(prof.name || 'U').charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-slate-900 text-base truncate group-hover:text-yellow-600 transition-colors">{prof.name}</h4>
                                        <p className="text-xs font-bold text-slate-500 truncate uppercase tracking-wide mt-0.5">{prof.role || prof.department_or_program}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                    <p className="flex items-center gap-2 truncate"><svg className="w-4 h-4 text-yellow-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> <strong className="text-slate-500 font-semibold">Office:</strong> <span className="font-semibold text-slate-800">{prof.room || prof.room_or_location}</span></p>
                                    <p className="flex items-center gap-2 truncate"><svg className="w-4 h-4 text-yellow-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> <strong className="text-slate-500 font-semibold">Classes:</strong> <span className="font-semibold text-slate-800">{prof.weekly_schedule?.length || 0} scheduled</span></p>
                                </div>
                            </div>
                            <div className="mt-5">
                                <button className="w-full py-2.5 text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl group-hover:bg-yellow-400 group-hover:text-slate-900 group-hover:border-yellow-400 transition-all shadow-sm">
                                    View Schedule
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <p className="text-sm font-bold text-slate-800">No faculty schedules match your search.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule View Modal */}
            {selectedProf && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedProf(null)}>
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="p-6 sm:px-8 sm:pt-8 sm:pb-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
                            <div className="flex gap-5 items-center relative z-10">
                                <div className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center font-black text-2xl shrink-0 shadow-lg border-4 border-slate-700">
                                    {(selectedProf.name || 'U').charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight leading-tight">{selectedProf.name}</h3>
                                    <p className="text-sm text-slate-300 font-medium uppercase tracking-wider mt-1">{selectedProf.role || selectedProf.department_or_program}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedProf(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors relative z-10">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
                            <div className="mb-6 flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Main Office</p>
                                    <p className="font-bold text-slate-800">{selectedProf.room || selectedProf.room_or_location || 'TBA'}</p>
                                </div>
                            </div>

                            {selectedProf.weekly_schedule && selectedProf.weekly_schedule.length > 0 ? (
                                <div className="space-y-8">
                                    {/* Class Schedule Section */}
                                    <div>
                                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                            Class Schedule
                                        </h4>
                                        <div className="space-y-3">
                                            {getSortedSchedule(selectedProf.weekly_schedule).filter(b => b.type !== 'consultation').map((block, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-300 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-24 shrink-0 text-center py-1.5 px-3 bg-blue-50 rounded-lg">
                                                            <span className="text-xs font-bold text-blue-700 uppercase">{block.day}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-900">
                                                                {formatTime(block.start_time)} <span className="text-slate-400 mx-1">-</span> {formatTime(block.end_time)}
                                                            </span>
                                                            <span className="text-xs font-medium text-slate-500 mt-0.5">Class Session</span>
                                                        </div>
                                                    </div>
                                                    <div className="sm:text-right bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                                                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full inline-block truncate max-w-[150px]" title={block.room}>
                                                            📍 {block.room || 'TBA'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Consultation Hours Section */}
                                    <div>
                                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                            Consultation Availability
                                        </h4>
                                        <div className="space-y-3">
                                            {getSortedSchedule(selectedProf.weekly_schedule).filter(b => b.type === 'consultation').map((block, idx) => (
                                                <div key={idx} className="bg-emerald-50/30 p-4 rounded-2xl shadow-sm border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-24 shrink-0 text-center py-1.5 px-3 bg-emerald-100 rounded-lg">
                                                            <span className="text-xs font-bold text-emerald-700 uppercase">{block.day}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-emerald-900">
                                                                {formatTime(block.start_time)} <span className="text-emerald-400 mx-1">-</span> {formatTime(block.end_time)}
                                                            </span>
                                                            <span className="text-xs font-medium text-emerald-600 mt-0.5">Available for Students</span>
                                                        </div>
                                                    </div>
                                                    <div className="sm:text-right bg-white sm:bg-transparent p-2 sm:p-0 rounded-lg">
                                                        <span className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-full inline-block truncate max-w-[150px]" title={block.room}>
                                                            📍 {block.room || 'Main Office'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {getSortedSchedule(selectedProf.weekly_schedule).filter(b => b.type === 'consultation').length === 0 && (
                                                <div className="text-center py-8 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200">
                                                    <p className="text-sm text-emerald-600 font-medium">No consultation hours available.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-sm text-slate-500 font-bold">No classes scheduled.</p>
                                </div>
                            )}

                            <div className="mt-8 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                <p className="text-xs text-blue-700 leading-relaxed font-medium flex items-start gap-2">
                                    <span className="text-lg">💡</span>
                                    <span>
                                        <strong className="text-blue-900 block mb-0.5">Consultation Availability</strong>
                                        Any vacant periods between 8:00 AM to 5:00 PM outside of these scheduled classes are generally available for student consultation. Please verify with the professor's main office.
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}