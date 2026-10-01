import InputError from '@/Components/InputError';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-yellow-300 selection:text-slate-900 scroll-smooth">
            <Head title="Forgot Password | CED E-Services" />
            
            <Header />

            <main className="flex-grow">
                {/* Hero Section for Auth */}
                <section className="relative min-h-[95vh] md:min-h-screen flex items-center pt-32 pb-20 px-6 md:px-12 w-full overflow-hidden border-b border-slate-200">
                    {/* Background Layer (Same as Welcome) */}
                    <div className="absolute inset-0 z-0 pointer-events-none bg-slate-50">
                        {/* Image Container */}
                        <div className="absolute top-0 left-0 w-full h-full">
                            <img
                                src="/images/cedbuilding.png"
                                alt="CED Building Background"
                                className="w-full h-full object-cover object-bottom md:object-[center_75%]"
                            />
                            {/* Mobile Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/95 via-slate-50/70 to-slate-50 md:hidden z-10"></div>
                        </div>
                        {/* Desktop Gradient */}
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent z-10 md:w-3/4"></div>
                        <div className="absolute inset-0 bg-slate-900/5 md:bg-transparent z-10"></div>
                    </div>

                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10 w-full h-full">
                        
                        {/* Left Side: Text */}
                        <div className="w-full md:w-1/2 flex flex-col gap-6 items-center md:items-start text-center md:text-left pt-10 md:pt-0">
                            <Link href={route('login')} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white text-xs font-bold tracking-wider mb-2 shadow-sm transition-all group">
                                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                BACK TO LOGIN
                            </Link>
                            
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-none md:leading-tight">
                                FORGOT <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 block mt-2 md:inline">
                                    PASSWORD?
                                </span>
                            </h1>
                            <p className="text-slate-600 text-lg md:text-xl max-w-md font-normal leading-relaxed">
                                Don't worry, it happens to the best of us. We'll help you get back into your CED e-Services Portal.
                            </p>
                        </div>

                        {/* Right Side: Glass Form Card */}
                        <div className="w-full md:w-1/2 relative flex justify-center mt-6 md:mt-0 pb-10 md:pb-0">
                            <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl bg-white/80 md:bg-white/60 backdrop-blur-xl border border-white/80 md:border-white p-8 lg:p-10 xl:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transition-shadow duration-300">
                                
                                <div className="flex flex-col items-center mb-6 text-center">
                                    <div className="w-14 h-14 bg-slate-50/80 border-2 border-white text-yellow-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                    </div>
                                    <h3 className="text-xl lg:text-2xl xl:text-3xl font-extrabold text-slate-900 mb-2 drop-shadow-sm">Reset via Email</h3>
                                    <p className="text-sm lg:text-base text-slate-700 leading-relaxed font-medium">
                                        Just let us know your email address and we will email you a password reset link.
                                    </p>
                                </div>

                                {status && (
                                    <div className="mb-6 p-4 text-sm font-medium text-green-700 bg-green-50/80 border border-green-200 rounded-xl text-center backdrop-blur-sm">
                                        {status}
                                    </div>
                                )}

                                <form onSubmit={submit} className="flex flex-col gap-5">
                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5 drop-shadow-sm">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 z-10">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter your registered email"
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/50 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 text-sm transition-colors bg-white/60 focus:bg-white backdrop-blur-sm shadow-sm relative z-0"
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.email} className="mt-2 text-red-500 text-xs font-bold bg-white/50 px-2 py-1 rounded inline-block" />
                                    </div>

                                    <button disabled={processing} className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20 mt-2 disabled:opacity-75 hover:-translate-y-0.5">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        Send Password Reset Link
                                    </button>
                                </form>

                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}