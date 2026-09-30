import { Head, useForm, router, usePage } from '@inertiajs/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

const PAGE_PROPS = ['users', 'filters'];

const SORT_LABELS = {
    student_id: 'Student ID',
    name: 'Name',
    user_type: 'Type',
    course: 'Course & Major',
};

const inputCls = 'w-full border-slate-300 rounded-xl text-sm focus:ring-yellow-400 focus:border-yellow-400';

// Created once instead of on every render
const MySwal = Swal.mixin({
    customClass: {
        popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
        title: 'text-slate-900 font-extrabold text-2xl pt-4',
        htmlContainer: 'text-slate-500 text-sm font-medium',
        confirmButton: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md outline-none',
        cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-8 py-3.5 mx-2 outline-none',
        icon: 'border-0 scale-125 mt-6',
    },
    buttonsStyling: false,
});

const svgIcon = (color, path) =>
    `<svg class="w-12 h-12 ${color} mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${path}" /></svg>`;

const ICON_OK = svgIcon('text-yellow-500', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z');
const ICON_TRASH = svgIcon('text-red-500', 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16');
const ICON_CHECK = svgIcon('text-emerald-500', 'M5 13l4 4L19 7');

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
        {children}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

const RoleBadge = memo(function RoleBadge({ type }) {
    const cls =
        type === 'admin'
            ? 'bg-slate-800 text-white border-slate-700'
            : type === 'alumni'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200';
    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
            {type}
        </span>
    );
});

export default function UserManagement({ users, courses = [], filters = {} }) {
    const { url, props: pageProps } = usePage();
    const rows = users?.data ?? [];

    // Current page path without query string, e.g. "/admin/users"
    const basePath = useMemo(() => url.split('?')[0].replace(/\/+$/, ''), [url]);

    const current = {
        q: filters.q ?? '',
        type: filters.type ?? 'all',
        course: filters.course ?? 'all',
        sort: filters.sort ?? 'name',
        dir: filters.dir ?? 'asc',
    };

    // Always holds the latest server-applied filters, so timers never use stale values
    const currentRef = useRef(current);
    currentRef.current = current;

    const [searchTerm, setSearchTerm] = useState(current.q);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
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
        password: '',
    });

    const selectedCourse = courses.find((c) => c.id === Number(data.course_id));
    const availableMajors = selectedCourse?.majors ?? [];

    // ---------- Server-side filtering / sorting ----------
    const applyFilters = (overrides = {}) => {
        const next = { ...currentRef.current, q: searchTerm.trim(), ...overrides };

        const params = {};
        if (next.q) params.q = next.q;
        if (next.type !== 'all') params.type = next.type;
        if (next.course !== 'all') params.course = next.course;
        if (next.sort !== 'name' || next.dir !== 'asc') {
            params.sort = next.sort;
            params.dir = next.dir;
        }

        router.get(basePath, params, {
            only: PAGE_PROPS, // skips re-sending courses
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

    // Debounced search: only fires when the text differs from what's already applied
    useEffect(() => {
        if (searchTerm.trim() === currentRef.current.q) return;
        const timer = setTimeout(() => {
            if (searchTerm.trim() !== currentRef.current.q) applyFilters();
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const handleSort = (field) => {
        if (current.sort === field) {
            applyFilters({ dir: current.dir === 'asc' ? 'desc' : 'asc' });
        } else {
            applyFilters({ sort: field, dir: 'asc' });
        }
    };

    const hasActiveFilters = searchTerm !== '' || current.type !== 'all' || current.course !== 'all';

    const resetFilters = () => {
        setSearchTerm('');
        applyFilters({ q: '', type: 'all', course: 'all', sort: 'name', dir: 'asc' });
    };

    // ---------- Form handlers ----------
    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    // Close the modal with Escape
    useEffect(() => {
        if (!isModalOpen) return;
        const onKey = (e) => e.key === 'Escape' && closeModal();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen]);

    const handleCourseChange = (e) => {
        setData((prev) => ({ ...prev, course_id: e.target.value, major_id: '' }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const isEditing = !!data.id;

        const onSuccess = () => {
            closeModal();
            MySwal.fire({
                title: isEditing ? 'Updated!' : 'Added!',
                text: isEditing ? 'User profile updated successfully.' : 'New user registered successfully.',
                iconHtml: ICON_OK,
                timer: 2000,
                showConfirmButton: false,
            });
        };

        if (isEditing) {
            put(`/admin/users/${data.id}`, { onSuccess, preserveScroll: true });
        } else {
            post('/admin/users', { onSuccess, preserveScroll: true });
        }
    };

    const confirmDelete = (id) => {
        MySwal.fire({
            title: 'Deactivate User?',
            text: 'The account will be deactivated and can no longer sign in. Their records are kept.',
            iconHtml: ICON_TRASH,
            showCancelButton: true,
            confirmButtonText: 'Yes, Deactivate',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (!result.isConfirmed) return;

            router.delete(`/admin/users/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // The controller refuses self-deactivation with a validation error
                    if (pageProps.errors?.delete) return;
                    MySwal.fire({
                        title: 'Deactivated!',
                        text: 'User account has been deactivated.',
                        iconHtml: ICON_CHECK,
                        timer: 2500,
                        showConfirmButton: false,
                    });
                },
                onError: (errs) => {
                    MySwal.fire({ title: 'Could not deactivate', text: errs.delete || 'Something went wrong.', icon: 'error' });
                },
            });
        });
    };

    const openEditModal = (user) => {
        clearErrors();
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
            password: '',
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // ---------- Render helpers ----------
    const renderSortIndicator = (field) => {
        const isActive = current.sort === field;
        return (
            <span className={`inline-flex ml-1.5 ${isActive ? 'text-slate-900 font-black' : 'text-slate-300 group-hover:text-slate-400'}`}>
                {isActive ? (current.dir === 'asc' ? '↑' : '↓') : '↕'}
            </span>
        );
    };

    const SortTh = ({ field }) => (
        <th
            scope="col"
            aria-sort={current.sort === field ? (current.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
            onClick={() => handleSort(field)}
            className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100/70 transition-colors group"
        >
            <div className="flex items-center">
                {SORT_LABELS[field]} {renderSortIndicator(field)}
            </div>
        </th>
    );

    const ActionButtons = ({ u }) => (
        <>
            <button onClick={() => openEditModal(u)} className="text-slate-700 font-bold px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 text-xs transition-colors">
                Edit
            </button>
            <button onClick={() => confirmDelete(u.id)} className="text-red-600 font-bold px-3.5 py-1.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 text-xs transition-colors">
                Delete
            </button>
        </>
    );

    const selectCls =
        'bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl px-4 py-3 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm cursor-pointer';

    return (
        <AdminLayout>
            <Head title="User Management" />

            <div className="p-4 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage all registered students, alumni, and admins.</p>
                </div>
                <button onClick={openAddModal} className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors">
                    + Add User
                </button>
            </div>

            <div className="p-4 sm:p-8 space-y-4">
                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                    <div className="relative flex-1">
                        <input
                            type="search"
                            aria-label="Search users"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by ID, name, email, course, or major..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm transition-all"
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
                        <select
                            aria-label="Filter by course"
                            value={current.course}
                            onChange={(e) => applyFilters({ course: e.target.value })}
                            className={`${selectCls} flex-1 sm:flex-none min-w-0 sm:max-w-[16rem]`}
                        >
                            <option value="all">All Courses</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>{c.label || c.name || `Course #${c.id}`}</option>
                            ))}
                        </select>

                        <select
                            aria-label="Filter by role"
                            value={current.type}
                            onChange={(e) => applyFilters({ type: e.target.value })}
                            className={`${selectCls} flex-1 sm:flex-none`}
                        >
                            <option value="all">All Roles</option>
                            <option value="student">Student</option>
                            <option value="alumni">Alumni</option>
                            <option value="admin">Admin</option>
                        </select>

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

                {/* Mobile sort control (the table headers are hidden on phones) */}
                <div className="flex md:hidden gap-2">
                    <select
                        aria-label="Sort by"
                        value={current.sort}
                        onChange={(e) => applyFilters({ sort: e.target.value, dir: 'asc' })}
                        className={`${selectCls} flex-1 py-2.5`}
                    >
                        {Object.entries(SORT_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>Sort: {v}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => applyFilters({ dir: current.dir === 'asc' ? 'desc' : 'asc' })}
                        className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm"
                        aria-label="Toggle sort direction"
                    >
                        {current.dir === 'asc' ? '↑ A-Z' : '↓ Z-A'}
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className={`transition-opacity duration-150 ${loading ? 'opacity-50 pointer-events-none' : ''}`} aria-busy={loading}>
                        {rows.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm px-4">
                                <div className="font-semibold text-slate-600">No users match your criteria</div>
                                <p className="text-xs mt-1 text-slate-400">Try adjusting your search filters or clearing the search query.</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile: stacked cards */}
                                <ul className="md:hidden divide-y divide-slate-100">
                                    {rows.map((u) => (
                                        <li key={u.id} className="p-4 space-y-2.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{u.first_name} {u.last_name}</p>
                                                    {u.email && <p className="text-xs text-slate-400 truncate">{u.email}</p>}
                                                </div>
                                                <RoleBadge type={u.user_type} />
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                <span className="font-bold text-slate-900">{u.student_id || 'N/A'}</span>
                                                <span className="mx-1.5 text-slate-300">•</span>
                                                <span className="font-medium">{u.course || 'N/A'}</span>
                                                {u.major && <span className="block text-[10px] uppercase font-bold text-slate-400 mt-0.5">{u.major}</span>}
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <ActionButtons u={u} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Tablet and up: table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100 select-none">
                                            <tr>
                                                <SortTh field="student_id" />
                                                <SortTh field="name" />
                                                <SortTh field="user_type" />
                                                <SortTh field="course" />
                                                <th scope="col" className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {rows.map((u) => (
                                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{u.student_id || 'N/A'}</td>
                                                    <td className="py-4 px-6 text-sm font-medium text-slate-700">
                                                        <div className="font-semibold text-slate-900">{u.first_name} {u.last_name}</div>
                                                        {u.email && <div className="text-xs text-slate-400 font-normal break-all">{u.email}</div>}
                                                    </td>
                                                    <td className="py-4 px-6 whitespace-nowrap"><RoleBadge type={u.user_type} /></td>
                                                    <td className="py-4 px-6 text-sm text-slate-600">
                                                        <span className="font-medium text-slate-800">{u.course || 'N/A'}</span>
                                                        {u.major && <span className="block text-[10px] uppercase font-bold text-slate-400 mt-0.5">{u.major}</span>}
                                                    </td>
                                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                                        <div className="inline-flex gap-2"><ActionButtons u={u} /></div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    <Pagination
                        links={users?.links ?? []}
                        from={users?.from}
                        to={users?.to}
                        total={users?.total}
                        noun="users"
                        only={PAGE_PROPS}
                        className="px-4 sm:px-6 py-4"
                    />
                </div>
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
                >
                    <div role="dialog" aria-modal="true" className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 shrink-0 bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-lg">{data.id ? 'Edit User Profile' : 'Register New User'}</h3>
                            <button type="button" aria-label="Close" onClick={closeModal} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4 sm:p-6">
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="First Name" error={errors.first_name}>
                                        <input type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className={inputCls} required />
                                    </Field>
                                    <Field label="Last Name" error={errors.last_name}>
                                        <input type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className={inputCls} required />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Email Address" error={errors.email}>
                                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputCls} required />
                                    </Field>
                                    <Field label="Contact Number" error={errors.contact_number}>
                                        <input type="text" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} className={inputCls} />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Account Type" error={errors.user_type}>
                                        <select
                                            value={data.user_type}
                                            onChange={(e) => setData((prev) => ({ ...prev, user_type: e.target.value, student_number: '', year_level: '', batch_year: '', course_id: '', major_id: '' }))}
                                            className={inputCls}
                                        >
                                            <option value="student">Student</option>
                                            <option value="alumni">Alumni</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </Field>

                                    {data.user_type === 'student' && (
                                        <Field label="Student Number" error={errors.student_number}>
                                            <input type="text" value={data.student_number} onChange={(e) => setData('student_number', e.target.value)} className={inputCls} required />
                                        </Field>
                                    )}
                                    {data.user_type === 'alumni' && (
                                        <Field label="Batch Year" error={errors.batch_year}>
                                            <input type="number" value={data.batch_year} onChange={(e) => setData('batch_year', e.target.value)} className={inputCls} required />
                                        </Field>
                                    )}
                                </div>

                                {data.user_type !== 'admin' && (
                                    <>
                                        <Field label="Course" error={errors.course_id}>
                                            <select value={data.course_id} onChange={handleCourseChange} className={inputCls} required>
                                                <option value="" disabled>Select course</option>
                                                {courses.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                                            </select>
                                        </Field>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Major" error={errors.major_id}>
                                                <select
                                                    value={data.major_id || ''}
                                                    onChange={(e) => setData('major_id', e.target.value)}
                                                    className={`${inputCls} disabled:bg-slate-100`}
                                                    disabled={availableMajors.length === 0}
                                                    required={availableMajors.length > 0}
                                                >
                                                    <option value="" disabled>{availableMajors.length > 0 ? 'Select major' : 'No major for this course'}</option>
                                                    {availableMajors.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                                                </select>
                                            </Field>

                                            {data.user_type === 'student' && (
                                                <Field label="Year Level" error={errors.year_level}>
                                                    <select value={data.year_level} onChange={(e) => setData('year_level', e.target.value)} className={inputCls} required>
                                                        <option value="" disabled>Select year</option>
                                                        {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </Field>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="border-t border-slate-100 pt-4 mt-2">
                                    <Field label={data.id ? 'Change Password (Optional)' : 'Password'} error={errors.password}>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={inputCls}
                                            placeholder={data.id ? 'Leave blank to keep current' : 'Create password (min. 8 characters)'}
                                            autoComplete="new-password"
                                            required={!data.id}
                                        />
                                    </Field>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={closeModal} className="flex-1 py-3.5 bg-slate-100 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={processing} className="flex-1 py-3.5 bg-yellow-400 font-bold rounded-xl text-sm hover:bg-yellow-500 shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
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