import InputError from '@/Components/InputError';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    // Exact form state and submission logic from your source
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    }); //[cite: 8]

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    }; //[cite: 8]

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Forgot Password" />
            
            <Header />

            <main className="flex-grow flex items-center justify-center py-12 px-6 max-w-7xl mx-auto w-full">
                <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">
                    
                    {/* Left Column - Information & Illustration */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6 order-2 lg:order-1">
                        <div className="flex items-start gap-4">
                            <Link href={route('login')} className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-yellow-400 transition-colors shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            </Link>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-2">
                                    Forgot Your <br/> 
                                    <span className="text-yellow-600">Password?</span>
                                </h1>
                                <p className="text-slate-600 text-lg">
                                    Don't worry, it happens to the best of us. We'll help you get back into your CED e-Services Portal.
                                </p>
                            </div>
                        </div>

                        {/* Illustration Placeholder */}
                        <div className="w-full h-48 sm:h-64 rounded-3xl bg-slate-200/50 border-2 border-slate-200 overflow-hidden relative mt-4">
                             <img src="/images/cedbuilding.jpg" alt="CED Building" className="w-full h-full object-cover opacity-60 mix-blend-multiply" />
                             {/* Floating Mail Icon Overlay */}
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-yellow-500">
                                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Right Column - Floating Form Card */}
                    <div className="w-full lg:w-[45%] order-1 lg:order-2">
                        <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative w-full max-w-md mx-auto">
                            
                            <div className="flex flex-col items-center mb-6 text-center">
                                <div className="w-14 h-14 bg-slate-50 border-2 border-slate-100 text-yellow-500 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Reset via Email</h2>
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                    No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
                                </p> {/*[cite: 8] */}
                            </div>

                            {status && (
                                <div className="mb-6 p-4 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl text-center">
                                    {status}
                                </div>
                            )} {/*[cite: 8] */}

                            <form onSubmit={submit} className="flex flex-col gap-5">
                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter your registered email"
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm transition-colors bg-slate-50 focus:bg-white"
                                            isFocused={true}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-2 text-red-500 text-xs" />
                                </div>

                                <button disabled={processing} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/20 mt-2 disabled:opacity-75">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                                    Email Password Reset Link
                                </button>
                            </form>

                            <p className="text-center text-sm text-slate-500 mt-8">
                                Remember your password? <Link href={route('login')} className="font-bold text-yellow-600 hover:text-yellow-700">Back to Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}