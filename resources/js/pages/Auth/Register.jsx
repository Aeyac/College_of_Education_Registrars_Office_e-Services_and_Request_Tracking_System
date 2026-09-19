import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import LegalModal from '@/Components/LegalModal';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';


const MAX_YEAR_LEVEL = 6; // irregular students can stay up to 6 years
const ACADEMIC_YEAR_START_MONTH = 6; // June (1 = January ... 12 = December)
const MIN_BATCH_YEAR = 1900;

const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();

// Jan–May still belongs to the academic year that started last June.
const ACADEMIC_YEAR =
    TODAY.getMonth() + 1 >= ACADEMIC_YEAR_START_MONTH ? CURRENT_YEAR : CURRENT_YEAR - 1;

const MIN_YEAR = ACADEMIC_YEAR - (MAX_YEAR_LEVEL - 1);

const toYearCode = (year) => String(year % 100).padStart(2, '0');
const YEAR_CODE_RANGE = `${toYearCode(MIN_YEAR)}–${toYearCode(ACADEMIC_YEAR)}`;

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year' };

// "26-1234" -> 1 (Dec 2026 – May 2027), 2 (from June 2027). Null if out of range. 
const getYearLevel = (studentNumber) => {
    if (studentNumber.length < 2) return null;

    const enrollmentYear = 2000 + Number(studentNumber.slice(0, 2));
    const level = ACADEMIC_YEAR - enrollmentYear + 1;

    return level >= 1 && level <= MAX_YEAR_LEVEL ? level : null;
};

const formatYearLevel = (level) => (level ? (YEAR_LABELS[level] ?? `${level}th Year`) : '');

// Error message for a complete (4-digit) batch year, or null if it's valid / still being typed. 
const getBatchYearError = (value) => {
    if (value.length < 4) return null;

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

const inputClass =
    'w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900';
const selectClass = `${inputClass} px-4 bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed`;
const linkButtonClass = 'font-bold text-yellow-700 hover:text-yellow-600 transition-colors';

const ROLES = [
    {
        value: 'student',
        title: 'Student',
        description: 'Currently enrolled and requesting CED registrar services.',
        icon: [
            'M12 14l9-5-9-5-9 5 9 5z',
            'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
        ],
    },
    {
        value: 'alumni',
        title: 'Alumni',
        description: 'Already graduated and requesting document certificates.',
        icon: ['M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],
    },
];


function Icon({ paths, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {paths.map((d) => (
                <path key={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
            ))}
        </svg>
    );
}

const ARROW_LEFT = ['M10 19l-7-7m0 0l7-7m-7 7h18'];

function Field({ id, label, error, hint, className = '', children }) {
    return (
        <div className={className}>
            <InputLabel htmlFor={id} value={label} className="text-slate-800 font-semibold mb-1.5" />
            {children}
            {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            <InputError message={error} className="mt-1 text-red-600" />
        </div>
    );
}


export default function Register({ courses = [] }) {
    const [step, setStep] = useState(1);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [agreedPrivacy, setAgreedPrivacy] = useState(false);

    // NOTE: year_level is intentionally NOT part of the form. It's derived from
    // the student number (here for display, and again on the server for saving).
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        student_number: '',
        course_id: '',
        major_id: '',
        batch_year: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        user_type: '',
        proof: null,
    });

    const isStudent = data.user_type === 'student';
    const isAlumni = data.user_type === 'alumni';

    const availableMajors = useMemo(
        () => courses.find((c) => String(c.id) === data.course_id)?.majors ?? [],
        [courses, data.course_id],
    );

    const yearLevel = useMemo(() => getYearLevel(data.student_number), [data.student_number]);

    const studentNumberError =
        data.student_number.length >= 2 && !yearLevel
            ? `Student number must start with ${YEAR_CODE_RANGE}.`
            : null;

    const batchYearError = useMemo(() => getBatchYearError(data.batch_year), [data.batch_year]);

    const agreed = agreedTerms && agreedPrivacy;

    const selectUserType = (value) => {
        setData((prev) => ({
            ...prev,
            user_type: value,
            student_number: '',
            course_id: '',
            major_id: '',
            batch_year: '',
            proof: null,
        }));
        clearErrors();
        setStep(2);
    };

    const handleCourseChange = (e) => {
        setData((prev) => ({ ...prev, course_id: e.target.value, major_id: '' }));
    };

    const handleStudentNumberChange = (e) => {
        setData('student_number', formatStudentNumber(e.target.value));
    };

    const handleBatchYearChange = (e) => {
        setData('batch_year', e.target.value.replace(/\D/g, '').slice(0, 4));
    };

    const handleContactNumberChange = (e) => {
        let digits = e.target.value.replace(/\D/g, '');

        // Local format 09XX... -> international 639XX...
        if (digits.startsWith('0')) digits = `63${digits.slice(1)}`;

        digits = digits.slice(0, 12);
        setData('contact_number', digits ? `+${digits}` : '');
    };

    const handleAgreeChange = (e) => {
        setAgreedTerms(e.target.checked);
        setAgreedPrivacy(e.target.checked);
    };

    const openLegalModal = (e) => {
        e.preventDefault();
        setIsLegalModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();

        // The error messages are already shown under the fields.
        if (isStudent && !yearLevel) return;
        if (isAlumni && batchYearError) return;

        post(route('register'), {
            forceFormData: true,
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Create Your Account" />

            {/* Left panel (desktop) */}
            <div className="hidden lg:flex lg:w-1/2 lg:h-screen lg:sticky lg:top-0 bg-slate-950 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-slate-900/90 z-10"></div>
                <img
                    src="/images/cedbuilding.jpg"
                    alt="CED Building"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
                />
                <Link
                    href="/"
                    className="absolute top-8 left-8 z-20 flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-yellow-400 transition-colors"
                >
                    <Icon paths={ARROW_LEFT} className="w-4 h-4" />
                    Back to Home
                </Link>
                <div className="relative z-20 flex flex-col items-center text-center px-12 max-w-lg">
                    <img
                        src="/images/cedlogo.png"
                        alt="College of Education Logo"
                        className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-6 shadow-2xl"
                    />
                    <h2 className="text-4xl font-extrabold text-white mb-4">Join Us Today!</h2>
                    <p className="text-slate-300 text-lg max-w-md">
                        Create your account to access the CED Registrar e-Services Portal and streamline your academic requests.
                    </p>
                </div>
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-start lg:justify-center p-6 sm:p-12 z-20 bg-white overflow-y-auto">
                <div className="w-full max-w-lg py-4">
                    {/* Mobile header */}
                    <div className="flex items-center justify-between mb-8 lg:hidden pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                            <img src="/images/cedlogo.png" alt="Logo" className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow-sm shrink-0" />
                            <span className="font-extrabold text-slate-900 text-xl tracking-tight leading-tight">CED E-Services</span>
                        </div>
                        <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 px-3 py-1.5 rounded-md">
                            Back
                        </Link>
                    </div>

                    {/* Step 1: role select */}
                    {step === 1 && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create Your Account</h1>
                                <p className="text-slate-600 text-sm">First, tell us who you are.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ROLES.map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => selectUserType(role.value)}
                                        className="group text-left p-6 rounded-2xl border-2 border-slate-200 hover:border-yellow-500 hover:bg-yellow-50/50 transition-colors shadow-sm"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-yellow-400 flex items-center justify-center mb-4 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors">
                                            <Icon paths={role.icon} className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">{role.title}</h3>
                                        <p className="text-slate-500 text-sm">{role.description}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center my-6">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="px-3 text-xs text-slate-400 font-bold uppercase tracking-wider">Or</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>

                            <a
                                href={route('google.redirect')}
                                className="w-full py-3.5 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-3 mb-6"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </a>

                            <p className="text-center text-sm text-slate-600">
                                Already have an account?{' '}
                                <Link href={route('login')} className={linkButtonClass}>
                                    Log in here
                                </Link>
                            </p>
                        </>
                    )}

                    {/* Step 2: details */}
                    {step === 2 && (
                        <>
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3 transition-colors"
                                >
                                    <Icon paths={ARROW_LEFT} className="w-3.5 h-3.5" />
                                    Change role
                                </button>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                                    {isAlumni ? 'Alumni Registration' : 'Student Registration'}
                                </h1>
                                <p className="text-slate-600 text-sm">Please fill in your information to get started.</p>
                            </div>

                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field id="first_name" label="First Name" error={errors.first_name}>
                                    <TextInput id="first_name" type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} placeholder="First Name" className={inputClass} required />
                                </Field>

                                <Field id="last_name" label="Last Name" error={errors.last_name}>
                                    <TextInput id="last_name" type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} placeholder="Last Name" className={inputClass} required />
                                </Field>

                                <Field
                                    id="email"
                                    label="Email Address"
                                    className="md:col-span-2"
                                    error={errors.email}
                                    hint={isStudent ? 'Please use your official CLSU email address.' : null}
                                >
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={isStudent ? 'username@clsu.edu.ph' : 'Enter your email address'}
                                        className={inputClass}
                                        autoComplete="email"
                                        required
                                    />
                                </Field>

                                <Field id="contact_number" label="Contact Number" className="md:col-span-2" error={errors.contact_number}>
                                    <TextInput
                                        id="contact_number"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        value={formatContactNumber(data.contact_number)}
                                        onChange={handleContactNumberChange}
                                        placeholder="+63 917 123 4567"
                                        maxLength={16}
                                        className={inputClass}
                                        required
                                    />
                                </Field>

                                {isStudent && (
                                    <Field
                                        id="student_number"
                                        label="Student Number"
                                        className="md:col-span-2"
                                        error={errors.student_number || studentNumberError}
                                        hint={`Valid year prefixes: ${YEAR_CODE_RANGE}`}
                                    >
                                        <TextInput
                                            id="student_number"
                                            type="text"
                                            inputMode="numeric"
                                            value={data.student_number}
                                            onChange={handleStudentNumberChange}
                                            placeholder={`e.g. ${toYearCode(ACADEMIC_YEAR)}-1234`}
                                            maxLength={7}
                                            pattern="\d{2}-\d{4}"
                                            title="Format: YY-NNNN"
                                            className={inputClass}
                                            required
                                        />
                                    </Field>
                                )}

                                <Field id="course_id" label="Course" error={errors.course_id}>
                                    <select id="course_id" value={data.course_id} onChange={handleCourseChange} className={selectClass} required>
                                        <option value="" disabled>Select course</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>{course.label}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field id="major_id" label="Major" error={errors.major_id}>
                                    <select
                                        id="major_id"
                                        value={data.major_id}
                                        onChange={(e) => setData('major_id', e.target.value)}
                                        className={selectClass}
                                        required={availableMajors.length > 0}
                                        disabled={availableMajors.length === 0}
                                    >
                                        <option value="" disabled>
                                            {data.course_id === ''
                                                ? 'Select a course first'
                                                : availableMajors.length > 0
                                                    ? 'Select major'
                                                    : 'No major for this course'}
                                        </option>
                                        {availableMajors.map((major) => (
                                            <option key={major.id} value={major.id}>{major.label}</option>
                                        ))}
                                    </select>
                                </Field>

                                {isAlumni ? (
                                    <Field
                                        id="batch_year"
                                        label="Batch Year (Graduated)"
                                        className="md:col-span-2"
                                        error={errors.batch_year || batchYearError}
                                        hint={`Year you graduated (up to ${CURRENT_YEAR}).`}
                                    >
                                        <TextInput
                                            id="batch_year"
                                            type="text"
                                            inputMode="numeric"
                                            value={data.batch_year}
                                            onChange={handleBatchYearChange}
                                            placeholder="e.g. 2020"
                                            maxLength={4}
                                            pattern="\d{4}"
                                            title="Enter a 4-digit year"
                                            className={inputClass}
                                            required
                                        />
                                    </Field>
                                ) : (
                                    <Field id="year_level" label="Year Level" className="md:col-span-2">
                                        <TextInput
                                            id="year_level"
                                            type="text"
                                            value={formatYearLevel(yearLevel)}
                                            placeholder="Automatically determined from your student number"
                                            className={`${inputClass} bg-slate-100`}
                                            readOnly
                                            tabIndex={-1}
                                        />
                                    </Field>
                                )}

                                {isAlumni && (
                                    <Field
                                        id="proof"
                                        label="Proof of Alumni Status (Diploma/TOR/ID)"
                                        className="md:col-span-2"
                                        error={errors.proof}
                                        hint="Supported formats: JPG, PNG, PDF (Max 10MB)"
                                    >
                                        <input
                                            id="proof"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => setData('proof', e.target.files[0] ?? null)}
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200 cursor-pointer border border-slate-300 rounded-xl bg-white focus:outline-none"
                                            required
                                        />
                                    </Field>
                                )}

                                <Field id="password" label="Password" error={errors.password}>
                                    <TextInput id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Create password" className={inputClass} autoComplete="new-password" required />
                                </Field>

                                <Field id="password_confirmation" label="Confirm Password" error={errors.password_confirmation}>
                                    <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Confirm password" className={inputClass} autoComplete="new-password" required />
                                </Field>

                                {/* Terms checkbox (synced with the legal modal) */}
                                <div className="md:col-span-2 flex items-center text-sm mt-1">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="rounded border-slate-300 text-yellow-500 focus:ring-yellow-400 mr-2 cursor-pointer"
                                        checked={agreed}
                                        onChange={handleAgreeChange}
                                        required
                                    />
                                    <label htmlFor="terms" className="text-slate-600 text-xs sm:text-sm">
                                        I agree to the{' '}
                                        <button type="button" onClick={openLegalModal} className={linkButtonClass}>Terms of Service</button>
                                        {' '}and{' '}
                                        <button type="button" onClick={openLegalModal} className={linkButtonClass}>Privacy Policy</button>.
                                    </label>
                                </div>

                                <div className="md:col-span-2 mt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-colors shadow-md shadow-yellow-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        <Icon paths={['M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z']} />
                                        Register Account
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <LegalModal
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
                agreedTerms={agreedTerms}
                setAgreedTerms={setAgreedTerms}
                agreedPrivacy={agreedPrivacy}
                setAgreedPrivacy={setAgreedPrivacy}
            />
        </div>
    );
}