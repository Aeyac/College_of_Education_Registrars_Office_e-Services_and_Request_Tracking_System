import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function FacultySchedules({ faculty = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');

    // Form state matching database columns exactly
    const { data, setData, post, put, processing, reset } = useForm({ 
        id: null, 
        name: '', 
        department_or_program: '', 
        room_or_location: '', 
        consultation_days: '',
        consultation_time_start: '',
        consultation_time_end: '' 
    });

    // Custom SweetAlert configuration to perfectly match your Slate/Yellow branding
    const MySwal = Swal.mixin({
        customClass: {
            popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
            title: 'text-slate-900 font-extrabold text-2xl pt-4',
            htmlContainer: 'text-slate-500 text-sm font-medium',
            confirmButton: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md transition-colors outline-none',
            cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-8 py-3.5 mx-2 transition-colors outline-none',
            icon: 'border-0 scale-125 mt-6'
        },
        buttonsStyling: false
    });

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

    // Save/Update Handler with SweetAlert Success Animation
    const handleSave = (e) => {
        e.preventDefault();
        const isEditing = !!data.id;
        
        const onSuccessCallback = () => {
            setIsModalOpen(false); 
            reset();
            MySwal.fire({
                title: isEditing ? 'Updated!' : 'Added!',
                text: isEditing ? 'The schedule has been successfully updated.' : 'A new faculty schedule has been created.',
                iconHtml: '🎉', // Aesthetic custom icon
                timer: 2000,
                showConfirmButton: false
            });
        };

        if (isEditing) {
            put(`/admin/faculty/${data.id}`, { onSuccess: onSuccessCallback, preserveScroll: true });
        } else {
            post('/admin/faculty', { onSuccess: onSuccessCallback, preserveScroll: true });
        }
    };

    // Beautiful Delete Confirmation Modal
    const confirmDelete = (id) => {
        MySwal.fire({
            title: 'Delete Schedule?',
            text: "You won't be able to revert this! The schedule will be permanently removed.",
            iconHtml: '🗑️',
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
                            iconHtml: '✅',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Faculty Schedules" />
            
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Schedules</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage consultation hours for CED professors.</p>
                </div>
                <button onClick={() => { reset(); setIsModalOpen(true); }} className="w-full sm:w-auto px-6 py-3 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add Faculty
                </button>
            </div>

            <div className="p-6 sm:p-8">
                {/* Search Bar & Department Filter */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {processedFaculty.length > 0 ? processedFaculty.map((prof) => (
                        <div key={prof.id} className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-slate-900 text-yellow-400 flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
                                        {(prof.name || 'U').charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-slate-900 text-base truncate">{prof.name}</h4>
                                        <p className="text-xs font-bold text-yellow-600 truncate uppercase tracking-wide mt-0.5">{prof.role || prof.department_or_program}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="flex items-center gap-2 truncate"><svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> <strong className="text-slate-500">Room:</strong> <span className="font-semibold text-slate-800">{prof.room || prof.room_or_location}</span></p>
                                    <p className="flex items-center gap-2 truncate"><svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> <strong className="text-slate-500">Hours:</strong> <span className="font-semibold text-slate-800">{prof.hours || `${prof.consultation_days} ${prof.consultation_time_start} - ${prof.consultation_time_end}`}</span></p>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={() => { setData(prof); setIsModalOpen(true); }} className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors shadow-sm">Edit</button>
                                <button onClick={() => confirmDelete(prof.id)} className="flex-1 py-2.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors shadow-sm">Remove</button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <p className="text-sm font-bold text-slate-800">No faculty schedules match your search.</p>
                            <p className="text-xs text-slate-500 mt-1">Try searching with different keywords or clear the filter.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Faculty Form Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">{data.id ? 'Edit' : 'Add'} Faculty Schedule</h3>
                            <button onClick={() => { setIsModalOpen(false); reset(); }} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none transition-colors" placeholder="e.g. Dr. Maria Santos" required/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department / Role</label>
                                    <input type="text" value={data.department_or_program} onChange={e => setData('department_or_program', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none transition-colors" placeholder="e.g. BS Elementary Education" required/>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room / Location</label>
                                        <input type="text" value={data.room_or_location} onChange={e => setData('room_or_location', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none transition-colors" placeholder="e.g. CED Rm 101" required/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Days</label>
                                        <input type="text" value={data.consultation_days} onChange={e => setData('consultation_days', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none transition-colors" placeholder="e.g. Mon, Wed" required/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Time</label>
                                        <input type="time" value={data.consultation_time_start} onChange={e => setData('consultation_time_start', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none transition-colors" required/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Time</label>
                                        <input type="time" value={data.consultation_time_end} onChange={e => setData('consultation_time_end', e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl shadow-sm text-sm focus:ring-yellow-500 focus:border-yellow-500 py-3 outline-none transition-colors" required/>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => { setIsModalOpen(false); reset(); }} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm flex justify-center items-center">
                                        {processing ? 'Saving...' : 'Save Schedule'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}