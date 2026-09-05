import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import LegalModal from '@/Components/LegalModal';

import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register({ courses = [] }) {
    const [step, setStep] = useState(1);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [agreedPrivacy, setAgreedPrivacy] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        student_number: '',
        course_id: '',
        major_id: '',
        year_level: '',
        batch_year: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        user_type: '',
        proof: null,
    });

    const safeCourses = Array.isArray(courses) ? courses : [];
    const selectedCourse = safeCourses.find((c) => String(c.id) === String(data.course_id));
    const availableMajors = selectedCourse?.majors ?? [];

    const selectUserType = (value) => {
        setData((prevData) => ({
            ...prevData,
            user_type: value,
            student_number: '',
            course_id: '',
            major_id: '',
            year_level: '',
            batch_year: '',
            proof: null,
        }));
        setStep(2);
    };

    const backToRoleSelect = () => {
        setStep(1);
    };

    const handleCourseChange = (e) => {
        setData((prevData) => ({
            ...prevData,
            course_id: e.target.value,
            major_id: '',
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            forceFormData: true,
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleMainCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        setAgreedTerms(isChecked);
        setAgreedPrivacy(isChecked);
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Create Your Account" />

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
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
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

            <div className="w-full lg:w-1/2 flex flex-col items-center justify-start lg:justify-center p-6 sm:p-12 z-20 bg-white overflow-y-auto">
                <div className="w-full max-w-lg py-4">
                    <div className="flex items-center justify-between mb-8 lg:hidden pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                            <img src="/images/cedlogo.png" alt="Logo" className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow-sm shrink-0" />
                            <span className="font-extrabold text-slate-900 text-xl tracking-tight leading-tight">CED E-Services</span>
                        </div>
                        <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 px-3 py-1.5 rounded-md">
                            Back
                        </Link>
                    </div>

                    {step === 1 && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create Your Account</h1>
                                <p className="text-slate-600 text-sm">First, tell us who you are.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => selectUserType('student')}
                                    className="group text-left p-6 rounded-2xl border-2 border-slate-200 hover:border-yellow-500 hover:bg-yellow-50/50 transition-colors shadow-sm"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-yellow-400 flex items-center justify-center mb-4 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">Student</h3>
                                    <p className="text-slate-500 text-sm">Currently enrolled and requesting CED registrar services.</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => selectUserType('alumni')}
                                    className="group text-left p-6 rounded-2xl border-2 border-slate-200 hover:border-yellow-500 hover:bg-yellow-50/50 transition-colors shadow-sm"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-yellow-400 flex items-center justify-center mb-4 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">Alumni</h3>
                                    <p className="text-slate-500 text-sm">Already graduated and requesting document certificates.</p>
                                </button>
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
                                <Link href={route('login')} className="font-bold text-yellow-700 hover:text-yellow-600 transition-colors">
                                    Log in here
                                </Link>
                            </p>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={backToRoleSelect}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Change role
                                </button>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                                    {data.user_type === 'alumni' ? 'Alumni Registration' : 'Student Registration'}
                                </h1>
                                <p className="text-slate-600 text-sm">Please fill in your information to get started.</p>
                            </div>

                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <InputLabel htmlFor="first_name" value="First Name" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput id="first_name" type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} placeholder="First Name" className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900" required />
                                    <InputError message={errors.first_name} className="mt-1 text-red-600" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="last_name" value="Last Name" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput id="last_name" type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} placeholder="Last Name" className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900" required />
                                    <InputError message={errors.last_name} className="mt-1 text-red-600" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="email" value="Email Address" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder={data.user_type === 'student' ? "username@clsu.edu.ph" : "Enter your email address"} className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900" required />
                                    {data.user_type === 'student' && !errors.email && (
                                        <p className="mt-1 text-xs text-slate-500">Please use your official CLSU email address.</p>
                                    )}
                                    <InputError message={errors.email} className="mt-1 text-red-600" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="contact_number" value="Contact Number" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput id="contact_number" type="text" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} placeholder="e.g. 09171234567" className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900" required />
                                    <InputError message={errors.contact_number} className="mt-1 text-red-600" />
                                </div>

                                {data.user_type === 'student' && (
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="student_number" value="Student Number" className="text-slate-800 font-semibold mb-1.5" />
                                        <TextInput id="student_number" type="text" value={data.student_number} onChange={(e) => setData('student_number', e.target.value)} placeholder="e.g. 21-1234" className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900" required />
                                        <InputError message={errors.student_number} className="mt-1 text-red-600" />
                                    </div>
                                )}

                                <div>
                                    <InputLabel htmlFor="course_id" value="Course" className="text-slate-800 font-semibold mb-1.5" />
                                    <select id="course_id" value={data.course_id} onChange={handleCourseChange} className="w-full px-4 py-2.5 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer" required>
                                        <option value="" disabled>Select course</option>
                                        {safeCourses.map((course) => (
                                            <option key={course.id} value={course.id}>{course.label}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.course_id} className="mt-1 text-red-600" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="major_id" value="Major" className="text-slate-800 font-semibold mb-1.5" />
                                    <select id="major_id" value={data.major_id} onChange={(e) => setData('major_id', e.target.value)} className="w-full px-4 py-2.5 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed" required={availableMajors.length > 0} disabled={availableMajors.length === 0}>
                                        <option value="" disabled>{data.course_id === '' ? 'Select a course first' : availableMajors.length > 0 ? 'Select major' : 'No major for this course'}</option>
                                        {availableMajors.map((major) => (
                                            <option key={major.id} value={major.id}>{major.label}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.major_id} className="mt-1 text-red-600" />
                                </div>

                                <div className="md:col-span-2">
                                    {data.user_type === 'alumni' ? (
                                        <>
                                            <InputLabel htmlFor="batch_year" value="Batch Year (Graduated)" className="text-slate-800 font-semibold mb-1.5" />
                                            <TextInput id="batch_year" type="number" min="1900" max={new Date().getFullYear()} value={data.batch_year} onChange={(e) => setData('batch_year', e.target.value)} placeholder="e.g. 2020" className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900" required />
                                            <InputError message={errors.batch_year} className="mt-1 text-red-600" />
                                        </>
                                    ) : (
                                        <>
                                            <InputLabel htmlFor="year_level" value="Year Level" className="text-slate-800 font-semibold mb-1.5" />
                                            <select id="year_level" value={data.year_level} onChange={(e) => setData('year_level', e.target.value)} className="w-full px-4 py-2.5 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer" required>
                                                <option value="" disabled>Select year level</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                                <option value="5">5th Year</option>
                                                <option value="6">6th Year</option>
                                            </select>
                                            <InputError message={errors.year_level} className="mt-1 text-red-600" />
                                        </>
                                    )}
                                </div>

                                {data.user_type === 'alumni' && (
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="proof" value="Proof of Alumni Status (Diploma/TOR/ID)" className="text-slate-800 font-semibold mb-1.5" />
                                        <input
                                            id="proof"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => setData('proof', e.target.files[0] ?? null)}
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200 cursor-pointer border border-slate-300 rounded-xl bg-white focus:outline-none"
                                            required
                                        />
                                        <p className="mt-1 text-xs text-slate-500">Supported formats: JPG, PNG, PDF (Max 10MB)</p>
                                        <InputError message={errors.proof} className="mt-1 text-red-600" />
                                    </div>
                                )}

                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Create password" className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900" required />
                                    <InputError message={errors.password} className="mt-1 text-red-600" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Confirm password" className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900" required />
                                    <InputError message={errors.password_confirmation} className="mt-1 text-red-600" />
                                </div>

                                {/* Terms Checkbox Syncs with Modal */}
                                <div className="md:col-span-2 flex items-center text-sm mt-1">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="rounded border-slate-300 text-yellow-500 focus:ring-yellow-400 mr-2 cursor-pointer"
                                        required
                                        checked={agreedTerms && agreedPrivacy}
                                        onChange={handleMainCheckboxChange}
                                    />
                                    <label htmlFor="terms" className="text-slate-600 text-xs sm:text-sm">
                                        I agree to the <button type="button" onClick={(e) => { e.preventDefault(); setIsLegalModalOpen(true); }} className="font-bold text-yellow-700 hover:text-yellow-600 transition-colors">Terms of Service</button> and <button type="button" onClick={(e) => { e.preventDefault(); setIsLegalModalOpen(true); }} className="font-bold text-yellow-700 hover:text-yellow-600 transition-colors">Privacy Policy</button>.
                                    </label>
                                </div>

                                <div className="md:col-span-2 mt-2">
                                    <button
                                        disabled={processing}
                                        className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-colors shadow-md shadow-yellow-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
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