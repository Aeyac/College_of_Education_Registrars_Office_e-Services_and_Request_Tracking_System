import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function UserManagement({ users = [], courses = [] }) {
    // --- Filter & Sort States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state matching database columns[cite: 1]
    const { data, setData, post, put, processing, reset } = useForm({ 
        id: null, 
        first_name: '', 
        last_name: '', 
        email: '',
        contact_number: '',
        user_type: 'student',
        student_number: '',
        course_id: '',
        major_id: '',
        year_level: '',
        batch_year: '',
        password: ''
    });

    // Handle dependent dropdown for Majors[cite: 1]
    const selectedCourse = courses.find((c) => c.id === Number(data.course_id));
    const availableMajors = selectedCourse?.majors ?? [];

    const handleCourseChange = (e) => {
        setData(prev => ({ ...prev, course_id: e.target.value, major_id: '' }));
    };

    // Sort Handler
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Combined Filter & Sort Engine
    const processedUsers = useMemo(() => {
        return users
            .filter((u) => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch =
                    !searchTerm ||
                    `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(searchLower) ||
                    (u.student_id && u.student_id.toLowerCase().includes(searchLower)) ||
                    (u.email && u.email.toLowerCase().includes(searchLower)) ||
                    (u.course && u.course.toLowerCase().includes(searchLower)) ||
                    (u.major && u.major.toLowerCase().includes(searchLower));

                const matchesType = typeFilter === 'all' || u.user_type === typeFilter;
                
                const matchesCourse = 
                    courseFilter === 'all' || 
                    String(u.course_id) === String(courseFilter) || 
                    u.course === courseFilter;

                return matchesSearch && matchesType && matchesCourse;
            })
            .sort((a, b) => {
                let aVal = '';
                let bVal = '';

                switch (sortField) {
                    case 'student_id':
                        aVal = a.student_id || '';
                        bVal = b.student_id || '';
                        break;
                    case 'name':
                        aVal = `${a.last_name || ''} ${a.first_name || ''}`.trim();
                        bVal = `${b.last_name || ''} ${b.first_name || ''}`.trim();
                        break;
                    case 'user_type':
                        aVal = a.user_type || '';
                        bVal = b.user_type || '';
                        break;
                    case 'course':
                        aVal = `${a.course || ''} ${a.major || ''}`.trim();
                        bVal = `${b.course || ''} ${b.major || ''}`.trim();
                        break;
                    default:
                        aVal = a.id || 0;
                        bVal = b.id || 0;
                }

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    const comp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
                    return sortDirection === 'asc' ? comp : -comp;
                }

                return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
            });
    }, [users, searchTerm, typeFilter, courseFilter, sortField, sortDirection]);

    const resetFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setCourseFilter('all');
        setSortField('name');
        setSortDirection('asc');
    };

    const hasActiveFilters = searchTerm !== '' || typeFilter !== 'all' || courseFilter !== 'all';

    // SweetAlert Theme[cite: 1]
    const MySwal = Swal.mixin({
        customClass: {
            popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
            title: 'text-slate-900 font-extrabold text-2xl pt-4',
            htmlContainer: 'text-slate-500 text-sm font-medium',
            confirmButton: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md outline-none',
            cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-8 py-3.5 mx-2 outline-none',
            icon: 'border-0 scale-125 mt-6'
        },
        buttonsStyling: false
    });

    const handleSave = (e) => {
        e.preventDefault();
        const isEditing = !!data.id;
        const onSuccessCallback = () => {
            setIsModalOpen(false); 
            reset();
            MySwal.fire({
                title: isEditing ? 'Updated!' : 'Added!',
                text: isEditing ? 'User profile updated successfully.' : 'New user registered successfully.',
                iconHtml: '✅',
                timer: 2000,
                showConfirmButton: false
            });
        };

        if (isEditing) {
            put(`/admin/users/${data.id}`, { onSuccess: onSuccessCallback, preserveScroll: true });
        } else {
            post('/admin/users', { onSuccess: onSuccessCallback, preserveScroll: true });
        }
    };

    const confirmSuspend = (id) => {
        MySwal.fire({
            title: 'Suspend User?',
            text: "They will lose access to the portal immediately.",
            iconHtml: '🚫',
            showCancelButton: true,
            confirmButtonText: 'Yes, Suspend',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/users/${id}`, { 
                    preserveScroll: true,
                    onSuccess: () => {
                        MySwal.fire({ title: 'Suspended!', text: 'User access has been revoked.', iconHtml: '✅', timer: 2000, showConfirmButton: false });
                    }
                });
            }
        });
    };

    const openEditModal = (user) => {
        setData({
            id: user.id,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            contact_number: user.contact_number || '',
            user_type: user.user_type || 'student',
            student_number: user.student_id || '',
            course_id: user.course_id || '',
            major_id: user.major_id || '',
            year_level: user.year_level || '',
            batch_year: user.batch_year || '',
            password: ''
        });
        setIsModalOpen(true);
    };

    const renderSortIndicator = (field) => {
        const isActive = sortField === field;
        return (
            <span className={`inline-flex ml-1.5 transition-transform duration-200 ${isActive ? 'text-slate-900 font-black' : 'text-slate-300 group-hover:text-slate-400'}`}>
                {isActive && sortDirection === 'desc' ? '↓' : '↑'}
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title="User Management" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage all registered students and alumni.</p>
                </div>
                <button onClick={() => { reset(); setIsModalOpen(true); }} className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors">
                    + Add User
                </button>
            </div>
            
            <div className="p-6 sm:p-8 space-y-4">
                {/* --- Filter & Search Controls --- */}
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by ID, name, email, course, or major..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm transition-all" 
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
                        {/* Course Filter */}
                        <select 
                            value={courseFilter} 
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl px-4 py-3 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm flex-1 sm:flex-none cursor-pointer"
                        >
                            <option value="all">All Courses</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.label || c.name || `Course #${c.id}`}</option>
                            ))}
                        </select>

                        {/* User Type Filter */}
                        <select 
                            value={typeFilter} 
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl px-4 py-3 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm flex-1 sm:flex-none cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="student">Student</option>
                            <option value="alumni">Alumni</option>
                        </select>

                        {/* Reset Filter Button */}
                        {hasActiveFilters && (
                            <button 
                                onClick={resetFilters}
                                className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors whitespace-nowrap"
                                title="Reset all filters"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* --- Results Count Banner --- */}
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-1">
                    <span>Showing {processedUsers.length} of {users.length} users</span>
                    <span>Sorted by <strong className="text-slate-700 capitalize">{sortField.replace('_', ' ')}</strong> ({sortDirection.toUpperCase()})</span>
                </div>

                {/* --- Table --- */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-slate-50 border-b border-slate-100 select-none">
                                <tr>
                                    <th 
                                        onClick={() => handleSort('student_id')}
                                        className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/70 transition-colors group"
                                    >
                                        <div className="flex items-center">
                                            Student ID {renderSortIndicator('student_id')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('name')}
                                        className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/70 transition-colors group"
                                    >
                                        <div className="flex items-center">
                                            Name {renderSortIndicator('name')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('user_type')}
                                        className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/70 transition-colors group"
                                    >
                                        <div className="flex items-center">
                                            Type {renderSortIndicator('user_type')}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('course')}
                                        className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/70 transition-colors group"
                                    >
                                        <div className="flex items-center">
                                            Course & Major {renderSortIndicator('course')}
                                        </div>
                                    </th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {processedUsers.length > 0 ? processedUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{u.student_id || 'N/A'}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">
                                            <div className="font-semibold text-slate-900">{u.first_name} {u.last_name}</div>
                                            {u.email && <div className="text-xs text-slate-400 font-normal">{u.email}</div>}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                                u.user_type === 'alumni' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {u.user_type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                                            <span className="font-medium text-slate-800">{u.course || 'N/A'}</span>
                                            {u.major && <span className="block text-[10px] uppercase font-bold text-slate-400 mt-0.5">{u.major}</span>}
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <button onClick={() => openEditModal(u)} className="text-slate-700 font-bold px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 mr-2 text-xs transition-colors">Edit</button>
                                            <button onClick={() => confirmSuspend(u.id)} className="text-red-600 font-bold px-3.5 py-1.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 text-xs transition-colors">Suspend</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">
                                            <div className="font-semibold text-slate-600">No users match your criteria</div>
                                            <p className="text-xs mt-1 text-slate-400">Try adjusting your search filters or clearing the search query.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- Add/Edit User Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 shrink-0 bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-lg">{data.id ? 'Edit User Profile' : 'Register New User'}</h3>
                            <button type="button" onClick={() => { setIsModalOpen(false); reset(); }} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">First Name</label><input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500" required/></div>
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Last Name</label><input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500" required/></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label><input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500" required/></div>
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact Number</label><input type="text" value={data.contact_number} onChange={e => setData('contact_number', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500" required/></div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Type</label>
                                        <select value={data.user_type} onChange={e => setData(prev => ({...prev, user_type: e.target.value, student_number: '', year_level: '', batch_year: ''}))} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500">
                                            <option value="student">Student</option>
                                            <option value="alumni">Alumni</option>
                                        </select>
                                    </div>
                                    {data.user_type === 'student' ? (
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student Number</label><input type="text" value={data.student_number} onChange={e => setData('student_number', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500" required/></div>
                                    ) : (
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Batch Year</label><input type="number" value={data.batch_year} onChange={e => setData('batch_year', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500" required/></div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Course</label>
                                    <select value={data.course_id} onChange={handleCourseChange} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500" required>
                                        <option value="" disabled>Select course</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Major</label>
                                        <select value={data.major_id} onChange={e => setData('major_id', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500 disabled:bg-slate-100" disabled={availableMajors.length === 0} required={availableMajors.length > 0}>
                                            <option value="" disabled>{availableMajors.length > 0 ? 'Select major' : 'No major for this course'}</option>
                                            {availableMajors.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                        </select>
                                    </div>
                                    {data.user_type === 'student' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Year Level</label>
                                            <select value={data.year_level} onChange={e => setData('year_level', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500" required>
                                                <option value="" disabled>Select year</option>
                                                {[1,2,3,4,5].map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 pt-4 mt-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{data.id ? 'Change Password (Optional)' : 'Password'}</label>
                                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-500" placeholder={data.id ? 'Leave blank to keep current' : 'Create password'} required={!data.id} />
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={() => { setIsModalOpen(false); reset(); }} className="flex-1 py-3.5 bg-slate-100 font-bold rounded-xl text-sm hover:bg-slate-200">Cancel</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-3.5 bg-yellow-400 font-bold rounded-xl text-sm hover:bg-yellow-500 shadow-md">
                                        {processing ? 'Saving...' : 'Save User'}
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