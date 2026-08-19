import InputError from '@/Components/InputError';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    // Note: Added fields to match your design reference. 
    // Make sure your backend Controller is updated to accept these new fields!
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        student_id: '',
        email: '',
        password: '',
        password_confirmation: '',
        course: '',
        year_level: '',
        status: '',
    }); //[cite: 4]

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }; //[cite: 4]

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Create Your Account" />

            <Header />

            <main className="flex-grow py-12 px-6 max-w-7xl mx-auto w-full flex items-center justify-center">
                <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-start justify-between">
                    
                    {/* Left Column - Information & Illustration */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-6 order-2 lg:order-1 pt-6 lg:sticky lg:top-32">
                        <div className="flex items-start gap-4">
                            <Link href={route('login')} className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-yellow-400 transition-colors shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            </Link>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2">Create Your Account</h1>
                                <p className="text-slate-600 font-medium">Join CED Registrar e-Services Portal</p>
                            </div>
                        </div>

                        {/* Illustration Placeholder matching your sketch */}
                        <div className="w-full h-64 lg:h-96 rounded-3xl bg-slate-200/50 border-2 border-slate-200 overflow-hidden relative mt-4 flex items-center justify-center">
                            <img src="/images/cedbuilding.jpg" alt="CED Illustration" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply" />
                            {/* Placeholder for the vector girl in your image */}
                            <div className="z-10 bg-white/80 backdrop-blur p-4 rounded-xl shadow-sm border border-white font-bold text-slate-700">
                                👩‍💻 Student Picture Here
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Floating Form Card */}
                    <div className="w-full lg:w-7/12 order-1 lg:order-2">
                        <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative w-full">
                            
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                
                                {/* First Name & Last Name */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">First Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                                        <input type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} placeholder="Enter your first name" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm bg-slate-50 focus:bg-white transition-colors" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Last Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                                        <input type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} placeholder="Enter your last name" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm bg-slate-50 focus:bg-white transition-colors" required />
                                    </div>
                                </div>

                                {/* Student ID (Full Width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Student Number / ID</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">🎓</div>
                                        <input type="text" value={data.student_id} onChange={(e) => setData('student_id', e.target.value)} placeholder="Enter your student number/ id" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm bg-slate-50 focus:bg-white transition-colors" required />
                                    </div>
                                </div>

                                {/* Email Address (Full Width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div>
                                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="Enter your email address" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm bg-slate-50 focus:bg-white transition-colors" required />
                                    </div>
                                    <InputError message={errors.email} className="mt-1 text-red-500 text-xs" />
                                </div>

                                {/* Password & Confirm Password */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
                                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Create a password" className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm bg-slate-50 focus:bg-white transition-colors" required />
                                        <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1 text-red-500 text-xs" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
                                        <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Confirm your password" className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm bg-slate-50 focus:bg-white transition-colors" required />
                                    </div>
                                </div>

                                {/* Course & Year Level */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Course</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">📖</div>
                                        <select value={data.course} onChange={(e) => setData('course', e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm bg-slate-50 focus:bg-white appearance-none cursor-pointer" required>
                                            <option value="" disabled>Select your course</option>
                                            <option value="bse">Bachelor of Secondary Education</option>
                                            <option value="bee">Bachelor of Elementary Education</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Year Level</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">📊</div>
                                        <select value={data.year_level} onChange={(e) => setData('year_level', e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm bg-slate-50 focus:bg-white appearance-none cursor-pointer" required>
                                            <option value="" disabled>Select your year level</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Status (Full Width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg></div>
                                        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm bg-slate-50 focus:bg-white appearance-none cursor-pointer" required>
                                            <option value="" disabled>Select your status</option>
                                            <option value="regular">Regular Student</option>
                                            <option value="irregular">Irregular Student</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Terms & Submit */}
                                <div className="md:col-span-2 flex items-center text-sm mt-2">
                                    <input type="checkbox" className="rounded border-slate-300 text-yellow-500 focus:ring-yellow-500 mr-2" required />
                                    <span className="text-slate-600">I agree to the <a href="#" className="font-bold text-yellow-600">Terms of Service</a> and <a href="#" className="font-bold text-yellow-600">Privacy Policy</a>.</span>
                                </div>

                                <div className="md:col-span-2">
                                    <button disabled={processing} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/20 mt-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                                        Register
                                    </button>
                                </div>
                            </form>

                            <p className="text-center text-sm text-slate-500 mt-6">
                                Already have an account? <Link href={route('login')} className="font-bold text-yellow-600 hover:text-yellow-700">Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}