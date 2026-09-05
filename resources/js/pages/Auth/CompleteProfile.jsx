import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';

export default function CompleteProfile({ courses = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        user_type: 'student',
        student_number: '',
        course_id: '',
        major_id: '',
        year_level: '',
        batch_year: '',
        password: '',
        password_confirmation: '',
    });

    const safeCourses = Array.isArray(courses) ? courses : [];
    const selectedCourse = safeCourses.find((c) => String(c.id) === String(data.course_id));
    const availableMajors = selectedCourse?.majors ?? [];

    const handleCourseChange = (e) => {
        setData((prevData) => ({
            ...prevData,
            course_id: e.target.value,
            major_id: '', // Reset major when course changes
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.complete.store'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans selection:bg-yellow-300 selection:text-slate-900 p-6">
            <Head title="Complete Profile" />
            
            <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Almost there!</h1>
                    <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                        Your Google account has been linked. Provide your academic details and set your account password to finish setup.
                    </p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5">
                    
                    {/* Role Selection */}
                    <div>
                        <InputLabel value="I am a:" className="text-slate-800 font-semibold mb-1.5" />
                        <select 
                            value={data.user_type} 
                            onChange={e => setData('user_type', e.target.value)}
                            className="w-full px-4 py-3 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer"
                        >
                            <option value="student">Current Student</option>
                            <option value="alumni">Alumni / Graduate</option>
                        </select>
                    </div>

                    {/* Conditional Fields based on Role */}
                    {data.user_type === 'student' && (
                        <div>
                            <InputLabel value="Student Number" className="text-slate-800 font-semibold mb-1.5" />
                            <TextInput 
                                value={data.student_number} 
                                onChange={e => setData('student_number', e.target.value)} 
                                className="block w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm px-4 py-3 text-slate-900"
                                placeholder="e.g. 21-1234"
                                required 
                            />
                            <InputError message={errors.student_number} className="mt-2 text-red-600 text-xs" />
                        </div>
                    )}

                    {/* Course */}
                    <div>
                        <InputLabel value="Course" className="text-slate-800 font-semibold mb-1.5" />
                        <select 
                            value={data.course_id} 
                            onChange={handleCourseChange} 
                            className="w-full px-4 py-3 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select your course</option>
                            {safeCourses.map(course => <option key={course.id} value={course.id}>{course.label}</option>)}
                        </select>
                        <InputError message={errors.course_id} className="mt-2 text-red-600 text-xs" />
                    </div>

                    {/* Major */}
                    <div>
                        <InputLabel value="Major" className="text-slate-800 font-semibold mb-1.5" />
                        <select 
                            value={data.major_id} 
                            onChange={e => setData('major_id', e.target.value)} 
                            className="w-full px-4 py-3 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
                            required={availableMajors.length > 0} 
                            disabled={availableMajors.length === 0}
                        >
                            <option value="" disabled>{data.course_id === '' ? 'Select a course first' : availableMajors.length > 0 ? 'Select major' : 'No major for this course'}</option>
                            {availableMajors.map(major => <option key={major.id} value={major.id}>{major.label}</option>)}
                        </select>
                        <InputError message={errors.major_id} className="mt-2 text-red-600 text-xs" />
                    </div>

                    {/* Final Conditional Select */}
                    {data.user_type === 'alumni' ? (
                        <div>
                            <InputLabel value="Batch Year (Graduated)" className="text-slate-800 font-semibold mb-1.5" />
                            <TextInput 
                                type="number"
                                min="1900" max={new Date().getFullYear()}
                                value={data.batch_year} 
                                onChange={e => setData('batch_year', e.target.value)} 
                                className="block w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm px-4 py-3 text-slate-900"
                                placeholder="e.g. 2020"
                                required 
                            />
                            <InputError message={errors.batch_year} className="mt-2 text-red-600 text-xs" />
                        </div>
                    ) : (
                        <div>
                            <InputLabel value="Year Level" className="text-slate-800 font-semibold mb-1.5" />
                            <select 
                                value={data.year_level} 
                                onChange={e => setData('year_level', e.target.value)} 
                                className="w-full px-4 py-3 border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm text-sm text-slate-900 bg-white cursor-pointer"
                                required
                            >
                                <option value="" disabled>Select year level</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                                <option value="5">5th Year</option>
                                <option value="6">6th Year</option>
                            </select>
                            <InputError message={errors.year_level} className="mt-2 text-red-600 text-xs" />
                        </div>
                    )}

                    {/* Password Fields */}
                    <div>
                        <InputLabel value="Password" className="text-slate-800 font-semibold mb-1.5" />
                        <TextInput 
                            type="password"
                            value={data.password} 
                            onChange={e => setData('password', e.target.value)} 
                            className="block w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm px-4 py-3 text-slate-900"
                            placeholder="••••••••"
                            required 
                        />
                        <InputError message={errors.password} className="mt-2 text-red-600 text-xs" />
                    </div>

                    <div>
                        <InputLabel value="Confirm Password" className="text-slate-800 font-semibold mb-1.5" />
                        <TextInput 
                            type="password"
                            value={data.password_confirmation} 
                            onChange={e => setData('password_confirmation', e.target.value)} 
                            className="block w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm px-4 py-3 text-slate-900"
                            placeholder="••••••••"
                            required 
                        />
                        <InputError message={errors.password_confirmation} className="mt-2 text-red-600 text-xs" />
                    </div>

                    <button 
                        disabled={processing} 
                        className="mt-4 w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-colors shadow-md shadow-yellow-500/20 disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        Save & Continue
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                    
                    <div className="text-center mt-4">
                        <Link href={route('logout')} method="post" as="button" className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                            Cancel & Logout
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}