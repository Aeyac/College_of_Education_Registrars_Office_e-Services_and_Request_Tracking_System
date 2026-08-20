import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const [step, setStep] = useState(1); // 1 = choose role, 2 = fill form

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        student_id: '',
        email: '',
        password: '',
        password_confirmation: '',
        course: '',
        major: '',
        year_level: '',
        user_type: '',
    });

    // Courses and Majors Data mapping based on Welcome.jsx
    const coursesData = [
        { title: "Bachelor of Culture and Arts Education", majors: [] },
        { title: "Bachelor of Early Childhood Education", majors: [] },
        { title: "Bachelor of Elementary Education", majors: [] },
        { title: "Bachelor of Physical Education", majors: [] },
        { title: "Bachelor of Secondary Education", majors: ["English", "Filipino", "Mathematics", "Science", "Social Studies", "Values Education"] },
        { title: "Bachelor of Technology and Livelihood Education", majors: ["Agri-Fisheries and Arts", "Home Economics", "Industrial Arts"] }
    ];

    // Find the currently selected course object to determine available majors
    const selectedCourseObj = coursesData.find(c => c.title === data.course);
    const availableMajors = selectedCourseObj ? selectedCourseObj.majors : [];

    const selectUserType = (value) => {
        setData((prevData) => ({
            ...prevData,
            user_type: value,
            student_id: '',
            year_level: '',
        }));
        setStep(2);
    };

    const backToRoleSelect = () => {
        setStep(1);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Create Your Account" />

            {/* Left Side - Image & Branding (Hidden on Mobile) */}
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

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-start lg:justify-center p-6 sm:p-12 z-20 bg-white overflow-y-auto">
                <div className="w-full max-w-lg py-4">

                    {/* Header bar on Mobile */}
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

                            <p className="text-center text-sm text-slate-600 mt-6">
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

                                {/* First Name & Last Name */}
                                <div>
                                    <InputLabel htmlFor="first_name" value="First Name" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput
                                        id="first_name"
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="First Name"
                                        className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900"
                                        required
                                    />
                                    <InputError message={errors.first_name} className="mt-1 text-red-600" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="last_name" value="Last Name" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput
                                        id="last_name"
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="Last Name"
                                        className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900"
                                        required
                                    />
                                    <InputError message={errors.last_name} className="mt-1 text-red-600" />
                                </div>

                                {/* Email Address */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="email" value="Email Address" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email address"
                                        className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-1 text-red-600" />
                                </div>

                                {/* Student-only: Student ID */}
                                {data.user_type === 'student' && (
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="student_id" value="Student Number / ID" className="text-slate-800 font-semibold mb-1.5" />
                                        <TextInput
                                            id="student_id"
                                            type="text"
                                            value={data.student_id}
                                            onChange={(e) => setData('student_id', e.target.value)}
                                            placeholder="Enter your student number / ID"
                                            className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900"
                                            required
                                        />
                                        <InputError message={errors.student_id} className="mt-1 text-red-600" />
                                    </div>
                                )}

                                {/* Dynamic Course Selection */}
                                <div>
                                    <InputLabel htmlFor="course" value="Course" className="text-slate-800 font-semibold mb-1.5" />
                                    <select
                                        id="course"
                                        value={data.course}
                                        onChange={(e) => {
                                            // Reset major to empty string when course changes
                                            setData(prevData => ({
                                                ...prevData,
                                                course: e.target.value,
                                                major: ''
                                            }));
                                        }}
                                        className="w-full px-4 py-2.5 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer"
                                        required
                                    >
                                        <option value="" disabled>Select course</option>
                                        {coursesData.map((course, index) => (
                                            <option key={index} value={course.title}>{course.title}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.course} className="mt-1 text-red-600" />
                                </div>

                                {/* Dynamic Major Selection */}
                                <div>
                                    <InputLabel htmlFor="major" value="Major" className="text-slate-800 font-semibold mb-1.5" />
                                    <select
                                        id="major"
                                        value={data.major}
                                        onChange={(e) => setData('major', e.target.value)}
                                        className="w-full px-4 py-2.5 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                        required={availableMajors.length > 0}
                                        disabled={availableMajors.length === 0}
                                    >
                                        <option value="" disabled>
                                            {data.course === '' 
                                                ? "Select a course first" 
                                                : availableMajors.length > 0 
                                                    ? "Select major" 
                                                    : "No major for this course"}
                                        </option>
                                        {availableMajors.map((majorOption, index) => (
                                            <option key={index} value={majorOption}>{majorOption}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.major} className="mt-1 text-red-600" />
                                </div>

                                {/* Year Level (student) / Batch Year (alumni) */}
                                <div className="md:col-span-2">
                                    <InputLabel
                                        htmlFor="year_level"
                                        value={data.user_type === 'alumni' ? 'Batch Year (Graduated)' : 'Year Level'}
                                        className="text-slate-800 font-semibold mb-1.5"
                                    />
                                    {data.user_type === 'alumni' ? (
                                        <TextInput
                                            id="year_level"
                                            type="number"
                                            min="1900"
                                            max="2099"
                                            value={data.year_level}
                                            onChange={(e) => setData('year_level', e.target.value)}
                                            placeholder="e.g. 2026"
                                            className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900"
                                            required
                                        />
                                    ) : (
                                        <select
                                            id="year_level"
                                            value={data.year_level}
                                            onChange={(e) => setData('year_level', e.target.value)}
                                            className="w-full px-4 py-2.5 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>Select year level</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    )}
                                    <InputError message={errors.year_level} className="mt-1 text-red-600" />
                                </div>

                                {/* Password & Confirm Password */}
                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Create password"
                                        className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900"
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-1 text-red-600" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-slate-800 font-semibold mb-1.5" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm password"
                                        className="w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-2.5 text-sm text-slate-900"
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-1 text-red-600" />
                                </div>

                                {/* Terms & Conditions */}
                                <div className="md:col-span-2 flex items-center text-sm mt-1">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="rounded border-slate-300 text-yellow-500 focus:ring-yellow-400 mr-2"
                                        required
                                    />
                                    <label htmlFor="terms" className="text-slate-600 text-xs sm:text-sm">
                                        I agree to the <a href="#" className="font-bold text-yellow-700 hover:text-yellow-600">Terms of Service</a> and <a href="#" className="font-bold text-yellow-700 hover:text-yellow-600">Privacy Policy</a>.
                                    </label>
                                </div>

                                {/* Submit Button */}
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
        </div>
    );
}