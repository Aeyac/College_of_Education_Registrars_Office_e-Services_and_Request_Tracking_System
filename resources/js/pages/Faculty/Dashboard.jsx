import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import { useState, useEffect } from 'react';

const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    if (Number.isNaN(h)) return timeString;
    return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
};

const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Dashboard({ faculty }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentHrs = currentTime.getHours().toString().padStart(2, '0');
    const currentMins = currentTime.getMinutes().toString().padStart(2, '0');
    const timeStr = `${currentHrs}:${currentMins}`;

    const schedule = faculty?.weekly_schedule || [];

    // Sort schedule
    const sortedSchedule = [...schedule].sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return (a.start_time || '').localeCompare(b.start_time || '');
    });

    const todaysSchedule = sortedSchedule.filter(block => block.day === currentDay);

    let currentBlock = null;
    let nextBlock = null;

    for (const block of todaysSchedule) {
        if (timeStr >= block.start_time && timeStr <= block.end_time) {
            currentBlock = block;
        } else if (timeStr < block.start_time && !nextBlock) {
            nextBlock = block;
        }
    }

    let status = { text: 'Available / Off Schedule', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    if (currentBlock) {
        if (currentBlock.type === 'consultation') {
            status = { text: 'Available for Consultation', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
        } else if (currentBlock.type === 'class') {
            status = { text: 'In Class', color: 'bg-rose-100 text-rose-800 border-rose-200' };
        } else {
            status = { text: 'Busy', color: 'bg-amber-100 text-amber-800 border-amber-200' };
        }
    }

    return (
        <UserLayout>
            <Head title="Faculty Dashboard" />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {faculty?.name || 'Faculty Member'}!</h1>
                        <p className="text-slate-500 mt-1">Here is your schedule and status for today, {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-slate-800 tracking-tighter">
                            {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                        <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                            <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
                            {status.text}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Today's Schedule</h3>
                                <Link href={route('faculty.schedule')} className="text-sm font-bold text-yellow-600 hover:text-yellow-700">View Full Schedule &rarr;</Link>
                            </div>

                            {todaysSchedule.length > 0 ? (
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    {todaysSchedule.map((block, idx) => {
                                        const isCurrent = currentBlock === block;
                                        const isPast = timeStr > block.end_time;
                                        const typeColors = block.type === 'consultation'
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-slate-50 border-slate-200';

                                        return (
                                            <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${isCurrent ? 'bg-yellow-400 text-white' : (isPast ? 'bg-slate-200' : 'bg-white text-slate-400')}`}>
                                                    {isCurrent ? (
                                                        <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    )}
                                                </div>
                                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border ${typeColors} shadow-sm transition-all ${isCurrent ? 'ring-2 ring-yellow-400 shadow-md scale-[1.02]' : (isPast ? 'opacity-60' : '')}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-xs font-bold uppercase tracking-wider ${block.type === 'consultation' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                                                            {block.type === 'consultation' ? 'Consultation' : (block.course_code || 'Class')}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">
                                                            {formatTime(block.start_time)} - {formatTime(block.end_time)}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-sm mt-2">{block.subject_name || block.subject || (block.type === 'consultation' ? 'Student Consultation' : 'Class Session')}</h4>
                                                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-600 font-medium">
                                                        <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                                                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            {block.room || 'TBA'}
                                                        </span>
                                                        {block.section_code && (
                                                            <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                                                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                                {block.section_code}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">No classes or consultations scheduled for today.</p>
                                    <p className="text-xs text-slate-500 mt-1">Enjoy your free day!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border">
                            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                Quick Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-yellow-600 text-xs font-medium mb-1">Role / Position</p>
                                    <p className="font-semibold text-slate-800 p-1">
                                       {faculty?.role || 'Not specified'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-yellow-600 text-xs font-medium mb-1">Department / Program</p>
                                    <p className="font-semibold text-slate-800 p-1">
                                        {faculty?.department_or_program || 'Not specified'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-yellow-600 text-xs font-medium mb-1">Main Office / Location</p>
                                    <p className="font-semibold text-slate-800 p-1">
                                        {faculty?.room_or_location || 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {nextBlock && (
                            <div className="bg-yellow-50 rounded-2xl shadow-sm border border-yellow-200 p-6">
                                <h3 className="font-bold text-yellow-800 text-sm uppercase tracking-wider mb-3">Up Next</h3>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-yellow-600">{blockTypeToName(nextBlock.type)}</span>
                                        <span className="text-xs font-bold text-slate-700">{formatTime(nextBlock.start_time)}</span>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">{nextBlock.course_code || nextBlock.subject_name || 'Class Session'}</p>
                                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {nextBlock.room || 'TBA'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}

function blockTypeToName(type) {
    if (type === 'consultation') return 'Consultation';
    if (type === 'class') return 'Class';
    return 'Other';
}
