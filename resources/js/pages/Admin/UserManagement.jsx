import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

export default function UserManagement({ users = [], courses = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state matching all database columns
    const { data, setData, post, put, processing, reset, errors } = useForm({ 
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

    // Handle dependent dropdown for Majors
    const selectedCourse = courses.find((c) => c.id === Number(data.course_id));
    const availableMajors = selectedCourse?.majors ?? [];

    const handleCourseChange = (e) => {
        setData(prev => ({ ...prev, course_id: e.target.value, major_id: '' }));
    };

    // Client-side search filtering
    const filteredUsers = users.filter(u => 
        (u.first_name && u.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.last_name && u.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.student_id && u.student_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.course && u.course.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // SweetAlert Theme
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
            password: '' // Keep empty unless they want to change it
        });
        setIsModalOpen(true);
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
            
            <div className="p-6 sm:p-8">
                {/* Search */}
                <div className="relative mb-6 max-w-lg">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by ID, name, or course..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm" 
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Student ID</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Name</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Type</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Course & Major</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{u.student_id || 'N/A'}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">{u.first_name} {u.last_name}</td>
                                        <td className="py-4 px-6 whitespace-nowrap"><span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${u.user_type === 'alumni' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{u.user_type}</span></td>
                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                                            {u.course || 'N/A'}
                                            {u.major && <span className="block text-[10px] uppercase font-bold text-slate-400 mt-0.5">{u.major}</span>}
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <button onClick={() => openEditModal(u)} className="text-slate-700 font-bold px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 mr-2 transition-colors">Edit</button>
                                            <button onClick={() => confirmSuspend(u.id)} className="text-red-600 font-bold px-4 py-2 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors">Suspend</button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="5" className="py-12 text-center text-slate-500 text-sm">No users match your search.</td></tr>}
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