import { Head } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';

export default function FacultySchedules({ faculty = [], userRole }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Instant client-side search filtering across faculty names, departments, and rooms
    const filteredFaculty = faculty.filter(prof => 
        (prof.name && prof.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prof.role && prof.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prof.room && prof.room.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <UserLayout userRole={userRole}>
            <Head title="Faculty Schedules" />
            
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Faculty Consultation Schedules</h2>
                    <p className="text-xs text-slate-500 mt-1">Search and view active consultation hours of CED professors.</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-yellow-800 self-start sm:self-auto shrink-0">
                    {filteredFaculty.length} {filteredFaculty.length === 1 ? 'Professor' : 'Professors'} Listed
                </div>
            </div>

            <div className="p-6 sm:p-8">
                {/* Search Bar */}
                <div className="relative mb-8 max-w-lg">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by professor name, department, or room..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-sm" 
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-3 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200 px-2 py-1 rounded-md">
                            Clear
                        </button>
                    )}
                </div>

                {/* Faculty Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredFaculty.length > 0 ? filteredFaculty.map((prof) => (
                        <div key={prof.id} className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-yellow-400 flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                                        {prof.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden w-full">
                                        <h4 className="font-bold text-base text-slate-900 leading-snug break-words">{prof.name}</h4>
                                        <p className="text-xs font-bold text-yellow-600 uppercase tracking-wide mt-0.5 break-words">{prof.role}</p>
                                    </div>
                                </div>

                                <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700">
                                    <div className="flex items-start gap-2.5">
                                        <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <div>
                                            <span className="font-bold text-slate-500 block">Room / Location:</span>
                                            <span className="font-semibold text-slate-800">{prof.room || 'To Be Announced'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <span className="font-bold text-slate-500 block">Consultation Schedule:</span>
                                            <span className="font-semibold text-slate-800">{prof.hours}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-bold text-slate-800">No faculty schedules match your search.</p>
                            <p className="text-xs text-slate-500 mt-1">Try searching with different keywords or clear the filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}