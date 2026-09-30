import { Head } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import UserLayout from '@/Layouts/UserLayout';

const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getProgram = (prof) => prof.department_or_program && prof.department_or_program !== 'Not specified' ? prof.department_or_program : 'Unspecified Dept';
const getRole = (prof) => prof.role && prof.role !== 'Not specified' ? prof.role : 'Unspecified Role';

const getOffice = (prof) => prof.room || prof.room_or_location || 'TBA';

const getSubject = (block) =>
    block.subject_name || block.subject || block.course_title || block.course_name || block.description || null;

const isConsultation = (block) => block.type === 'consultation';

const getCourses = (schedule = []) => [
    ...new Set(schedule.filter((b) => !isConsultation(b)).map((b) => b.course_code).filter(Boolean)),
];

const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    if (Number.isNaN(h)) return timeString;
    return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
};

const getSortedSchedule = (schedule) => {
    if (!schedule) return [];
    return [...schedule].sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return (a.start_time || '').localeCompare(b.start_time || '');
    });
};

export default function FacultySchedules({ faculty = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [selectedProf, setSelectedProf] = useState(null);

    const departments = useMemo(
        () => [...new Set(faculty.map(getProgram).filter((d) => d !== 'Unspecified'))],
        [faculty]
    );

    useEffect(() => {
        if (selectedProf) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedProf]);

    const processedFaculty = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return faculty.filter((prof) => {
            if (deptFilter !== 'all' && getProgram(prof) !== deptFilter) return false;
            if (!q) return true;

            const haystack = [
                prof.name,
                getProgram(prof),
                getRole(prof),
                getOffice(prof),
                ...(prof.weekly_schedule || []).flatMap((b) => [b.course_code, b.section_code, getSubject(b)]),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(q);
        });
    }, [faculty, searchTerm, deptFilter]);

    const modalSchedule = selectedProf ? getSortedSchedule(selectedProf.weekly_schedule) : [];
    const classBlocks = modalSchedule.filter((b) => !isConsultation(b));
    const consultBlocks = modalSchedule.filter(isConsultation);

    return (
        <UserLayout>
            <Head title="Faculty Schedules" />

            <div className="p-6 sm:p-8 border-b border-slate-100 bg-white/90 backdrop-blur-md rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Schedules</h2>
                    <p className="text-xs text-slate-500 mt-1">View courses, class schedules, and consultation hours of CED professors.</p>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1 max-w-lg">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by professor, course, subject, or room..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-sm"
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="w-full lg:w-64 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-sm"
                    >
                        <option value="all">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {processedFaculty.length > 0 ? (
                        processedFaculty.map((prof) => {
                            const courses = getCourses(prof.weekly_schedule);
                            const classCount = (prof.weekly_schedule || []).filter((b) => !isConsultation(b)).length;

                            return (
                                <div
                                    key={prof.id}
                                    onClick={() => setSelectedProf(prof)}
                                    className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
                                >
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            {/* Light Background Profile Avatar */}
                                            {prof.user?.profile_picture ? (
                                                <img src={`/storage/${prof.user.profile_picture}`} alt={prof.name} className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-200 shrink-0" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                                                    {(prof.name || 'U').charAt(0)}
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-slate-900 text-base truncate">{prof.name}</h4>
                                                <p className="text-xs font-bold text-yellow-600 truncate uppercase tracking-wide mt-0.5">
                                                    {getRole(prof)} <span className="text-slate-300 mx-1">•</span> {getProgram(prof)}
                                                </p>
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

                                    <div className="mt-5">
                                        <button className="w-full py-2.5 text-xs font-bold text-slate-900 bg-yellow-400 rounded-xl hover:bg-yellow-500 transition-colors shadow-sm">
                                            View Schedule
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <p className="text-sm font-bold text-slate-800">No faculty schedules match your search.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedProf && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
                    onClick={() => setSelectedProf(null)}
                >
                    <div
                        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-white shrink-0">
                            <div className="flex items-center gap-4 min-w-0">
                                {/* Light Background Profile Avatar (Modal Header) */}
                                {selectedProf.user?.profile_picture ? (
                                    <img src={`/storage/${selectedProf.user.profile_picture}`} alt={selectedProf.name} className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200 shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                                        {(selectedProf.name || 'U').charAt(0)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-900 text-lg truncate">{selectedProf.name}</h3>
                                    <p className="text-xs font-bold text-yellow-600 uppercase tracking-wide truncate">
                                        {getRole(selectedProf)} <span className="text-slate-300 mx-1">•</span> {getProgram(selectedProf)} <span className="text-slate-300 mx-1">•</span> {getOffice(selectedProf)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedProf(null)}
                                aria-label="Close"
                                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Class Schedule</h4>
                                {classBlocks.length > 0 ? (
                                    <div className="space-y-3">
                                        {classBlocks.map((block, idx) => {
                                            const subject = getSubject(block);
                                            return (
                                                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-bold text-slate-900 text-sm">{block.course_code || 'Class Session'}</span>
                                                            {block.section_code && (
                                                                <span className="text-[11px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-md">
                                                                    {block.section_code}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {subject && <p className="text-sm text-slate-600 mt-0.5 truncate">{subject}</p>}
                                                        <p className="text-xs text-slate-500 mt-1.5">
                                                            <span className="font-bold text-slate-700">{block.day}</span>
                                                            <span className="mx-1.5 text-slate-300">|</span>
                                                            {formatTime(block.start_time)} – {formatTime(block.end_time)}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                                                        {block.room || 'TBA'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <p className="text-sm text-slate-500 font-medium">No classes scheduled.</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Consultation Hours</h4>
                                {consultBlocks.length > 0 ? (
                                    <div className="space-y-3">
                                        {consultBlocks.map((block, idx) => (
                                            <div key={idx} className="bg-yellow-50/60 p-4 rounded-xl border border-dashed border-yellow-300 flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {block.day} <span className="mx-1 text-yellow-400">•</span> {formatTime(block.start_time)} – {formatTime(block.end_time)}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Available for students</p>
                                                </div>
                                                <span className="shrink-0 text-xs font-bold text-yellow-800 bg-yellow-100 px-3 py-1.5 rounded-lg">
                                                    {block.room || getOffice(selectedProf)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <p className="text-sm text-slate-500 font-medium">No consultation hours listed.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                                    <strong className="text-yellow-900 block mb-0.5">💡 Consultation hours are set by the professor</strong>
                                    Please verify in person for any changes.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
                            <button
                                onClick={() => setSelectedProf(null)}
                                className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}