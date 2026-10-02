import { Head, useForm, router, usePage } from '@inertiajs/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Icon } from '@/Components/Icon';
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

// Mirrors the helpers the registration page (pages/Auth/Register.jsx) uses, so both
// forms derive the same messages before the server ever sees the payload.
const MAX_YEAR_LEVEL = 6;
const ACADEMIC_YEAR_START_MONTH = 6; // June
const MIN_BATCH_YEAR = 1900;
const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();
// Jan-May still belongs to the academic year that started last June.
const ACADEMIC_YEAR = TODAY.getMonth() + 1 >= ACADEMIC_YEAR_START_MONTH ? CURRENT_YEAR : CURRENT_YEAR - 1;
const MIN_YEAR = ACADEMIC_YEAR - (MAX_YEAR_LEVEL - 1);
const toYearCode = (year) => String(year % 100).padStart(2, '0');
const YEAR_CODE_RANGE = `${toYearCode(MIN_YEAR)}–${toYearCode(ACADEMIC_YEAR)}`;
const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year' };

// "26-1234" -> 1 (Dec 2026 - May 2027), 2 (from June 2027). Null if out of range.
const getYearLevel = (studentNumber) => {
    if (!studentNumber || studentNumber.length < 2) return null;
    const enrollmentYear = 2000 + Number(studentNumber.slice(0, 2));
    const level = ACADEMIC_YEAR - enrollmentYear + 1;
    return level >= 1 && level <= MAX_YEAR_LEVEL ? level : null;
};

const formatYearLevel = (level) => (level ? (YEAR_LABELS[level] ?? `${level}th Year`) : '');

// Error message for a complete (4-digit) batch year, or null if it's valid / still being typed.
const getBatchYearError = (value) => {
    if (!value || String(value).length < 4) return null;
    const year = Number(value);
    if (year > CURRENT_YEAR) return `Batch year cannot be in the future (latest: ${CURRENT_YEAR}).`;
    if (year < MIN_BATCH_YEAR) return `Batch year cannot be earlier than ${MIN_BATCH_YEAR}.`;
    return null;
};

const formatStudentNumber = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    return digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
};

// Stored value is "+639171234567"; this only affects what is displayed.
const formatContactNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (!digits.startsWith('63')) return `+${digits}`;
    const rest = digits.slice(2);
    const groups = [rest.slice(0, 3), rest.slice(3, 6), rest.slice(6)].filter(Boolean);
    return ['+63', ...groups].join(' ');
};

const Hint = ({ children }) => <p className="text-[11px] text-slate-400 mt-1">{children}</p>;

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
const ICON_CHECK = svgIcon('text-emerald-500', 'M5 13l4 4L19 7');

// Icon paths, also reused by the shared <Icon> component
const BAN_PATH = 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636';
const RESTORE_PATH = 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';
const ICON_OFF = svgIcon('text-red-500', BAN_PATH);

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
                : type === 'faculty'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
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
        deactivated: filters.deactivated ?? 0,
    };

    const showingDeactivated = !!Number(current.deactivated);

    // Always holds the latest server-applied filters, so timers never use stale values
    const currentRef = useRef(current);
    currentRef.current = current;

    const [searchTerm, setSearchTerm] = useState(current.q);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [restoringId, setRestoringId] = useState(null);

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
        batch_year: '',
        password: '',
        password_confirmation: '',
    });

    const selectedCourse = courses.find((c) => c.id === Number(data.course_id));
    const availableMajors = selectedCourse?.majors ?? [];

    // Mirrors the server-side year level derivation used by registration.
    const derivedYearLevel = getYearLevel(data.student_number ?? '');
    const studentNumberError = data.student_number.length >= 2 && !derivedYearLevel ? `Student number must start with ${YEAR_CODE_RANGE}.` : null;
    const batchYearError = data.user_type === 'alumni' ? getBatchYearError(data.batch_year) : null;

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
        if (Number(next.deactivated)) params.deactivated = 1;

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

    const toggleDeactivatedView = () => applyFilters({ deactivated: showingDeactivated ? 0 : 1 });

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

    // Stored as "+639171234567" so the server's E.164 regex accepts it, then displayed grouped.
    const handleContactNumberChange = (e) => {
        let digits = e.target.value.replace(/\D/g, '');

        // Local format 09XX... -> international 639XX...
        if (digits.startsWith('0')) digits = `63${digits.slice(1)}`;

        digits = digits.slice(0, 12);
        setData('contact_number', digits ? `+${digits}` : '');
    };

    const handleSave = (e) => {
        e.preventDefault();
        const isEditing = !!data.id;

        // The same guards the registration page applies before posting.
        if (data.user_type === 'student' && !derivedYearLevel) return;
        if (data.user_type === 'alumni' && batchYearError) return;

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

        // year_level is derived server-side from the student number, as in registration.
        if (isEditing) {
            put(`/admin/users/${data.id}`, { onSuccess, preserveScroll: true });
        } else {
            post('/admin/users', { onSuccess, preserveScroll: true });
        }
    };

    const confirmDeactivate = (id) => {
        MySwal.fire({
            title: 'Deactivate User?',
            text: 'The account will be deactivated and can no longer sign in. Their records are kept.',
            iconHtml: ICON_OFF,
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

    const confirmReactivate = (user) => {
        MySwal.fire({
            title: 'Reactivate Account?',
            text: `${user.first_name} ${user.last_name} will be able to sign in again with their existing account.`,
            iconHtml: ICON_OK,
            showCancelButton: true,
            confirmButtonText: 'Yes, Reactivate',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (!result.isConfirmed) return;

            setRestoringId(user.id);
            router.patch(`/admin/users/${user.id}/restore`, {}, {
                preserveScroll: true,
                onFinish: () => setRestoringId(null),
                onSuccess: () => {
                    MySwal.fire({
                        title: 'Reactivated!',
                        text: 'User account is active again.',
                        iconHtml: ICON_CHECK,
                        timer: 2500,
                        showConfirmButton: false,
                    });
                },
                onError: () => {
                    MySwal.fire({ title: 'Could not reactivate', text: 'Something went wrong.', icon: 'error' });
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
            batch_year: user.batch_year || '',
            password: '',
            password_confirmation: '',
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

    const ActionButtons = ({ u }) => {
        if (showingDeactivated) {
            return (
                <button
                    onClick={() => confirmReactivate(u)}
                    disabled={restoringId === u.id}
                    className="inline-flex items-center gap-1.5 text-emerald-700 font-bold px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 text-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Icon path={RESTORE_PATH} className="w-3.5 h-3.5 shrink-0" />
                    {restoringId === u.id ? 'Restoring...' : 'Reactivate'}
                </button>
            );
        }

        return (
            <>
                <button onClick={() => openEditModal(u)} className="text-slate-700 font-bold px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 text-xs transition-colors">
                    Edit
                </button>
                <button
                    onClick={() => confirmDeactivate(u.id)}
                    className="inline-flex items-center gap-1.5 text-red-600 font-bold px-3.5 py-1.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 text-xs transition-colors"
                >
                    <Icon path={BAN_PATH} className="w-3.5 h-3.5 shrink-0" />
                    Deactivate
                </button>
            </>
        );
    };

    const selectCls =
        'bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl px-4 py-3 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-sm cursor-pointer';

    return (
        <AdminLayout>
            <Head title="User Management" />

            <div className="p-4 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
                        User Management
                        {showingDeactivated && <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider">Deactivated</span>}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        {showingDeactivated
                            ? 'Viewing deactivated accounts. Reactivate any of these to restore sign-in access.'
                            : 'Manage all registered students, alumni, and admins.'}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={toggleDeactivatedView}
                        aria-pressed={showingDeactivated}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        {showingDeactivated ? 'Back to Active Users' : 'Deactivated Users'}
                    </button>
                    <button onClick={openAddModal} className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors">
                        + Add User
                    </button>
                </div>
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
                            <option value="faculty">Faculty</option>
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
                                <div className="font-semibold text-slate-600">
                                    {showingDeactivated ? 'No deactivated users' : 'No users match your criteria'}
                                </div>
                                <p className="text-xs mt-1 text-slate-400">
                                    {showingDeactivated
                                        ? 'Accounts you deactivate will appear here and can be reactivated at any time.'
                                        : 'Try adjusting your search filters or clearing the search query.'}
                                </p>
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
                                                {showingDeactivated && u.deactivated_at && (
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Deactivated {u.deactivated_at}</span>
                                                )}
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
                                                        {showingDeactivated && u.deactivated_at && (
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-normal">Deactivated {u.deactivated_at}</div>
                                                        )}
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
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value.toLowerCase().trim())}
                                            className={inputCls}
                                            placeholder={data.user_type === 'student' ? 'username@clsu.edu.ph' : 'name@example.com'}
                                            autoComplete="off"
                                            required
                                        />
                                        {data.user_type === 'student' && <Hint>Please use the official CLSU email address.</Hint>}
                                    </Field>
                                    <Field label="Contact Number" error={errors.contact_number}>
                                        <input
                                            type="tel"
                                            value={formatContactNumber(data.contact_number)}
                                            onChange={handleContactNumberChange}
                                            className={inputCls}
                                            placeholder="+63 917 123 4567"
                                            inputMode="tel"
                                            autoComplete="tel"
                                            maxLength={16}
                                            required
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Account Type" error={errors.user_type}>
                                        <select
                                            value={data.user_type}
                                            onChange={(e) => setData((prev) => ({ ...prev, user_type: e.target.value, student_number: '', batch_year: '', course_id: '', major_id: '' }))}
                                            className={inputCls}
                                        >
                                            <option value="student">Student</option>
                                            <option value="alumni">Alumni</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </Field>

                                    {data.user_type === 'student' && (
                                        <Field label="Student Number" error={errors.student_number || studentNumberError}>
                                            <input
                                                type="text"
                                                value={data.student_number}
                                                onChange={(e) => setData('student_number', formatStudentNumber(e.target.value))}
                                                className={inputCls}
                                                placeholder="26-1234"
                                                inputMode="numeric"
                                                pattern="\d{2}-\d{4}"
                                                title="Format: YY-NNNN"
                                                maxLength={7}
                                                required
                                            />
                                            <Hint>Format YY-NNNN, starting {YEAR_CODE_RANGE}.</Hint>
                                        </Field>
                                    )}
                                    {data.user_type === 'alumni' && (
                                        <Field label="Batch Year" error={errors.batch_year || batchYearError}>
                                            <input
                                                type="text"
                                                value={data.batch_year}
                                                onChange={(e) => setData('batch_year', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                className={inputCls}
                                                placeholder="2024"
                                                inputMode="numeric"
                                                pattern="\d{4}"
                                                title="4-digit year"
                                                maxLength={4}
                                                required
                                            />
                                            <Hint>Cannot be in the future (latest: {CURRENT_YEAR}).</Hint>
                                        </Field>
                                    )}
                                </div>

                                {!['admin', 'faculty'].includes(data.user_type) && (
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
                                                    <input
                                                        type="text"
                                                        value={formatYearLevel(derivedYearLevel)}
                                                        readOnly
                                                        tabIndex={-1}
                                                        placeholder="Automatically determined from the student number"
                                                        className={`${inputCls} bg-slate-100 cursor-not-allowed`}
                                                    />
                                                    <Hint>Derived from the student number, same as registration.</Hint>
                                                </Field>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="border-t border-slate-100 pt-4 mt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                        <Field
                                            label={data.id ? 'Confirm New Password' : 'Confirm Password'}
                                            error={errors.password_confirmation}
                                        >
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className={inputCls}
                                                placeholder={data.id ? 'Only needed if changing the password' : 'Re-enter password'}
                                                autoComplete="new-password"
                                                required={!data.id || !!data.password}
                                            />
                                        </Field>
                                    </div>
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