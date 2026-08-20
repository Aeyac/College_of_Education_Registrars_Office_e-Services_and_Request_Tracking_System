import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Log in" />

            {/* Left Side - Image & Branding (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-slate-900/90 z-10"></div>
                <img
                    src="/images/cedbuilding.jpg"
                    alt="CED Building"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                />

                {/* Return Home Link (Desktop) */}
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
                    <h2 className="text-4xl font-extrabold text-white mb-4">Welcome Back!</h2>
                    <p className="text-slate-300 text-lg max-w-md">
                        Access your CED E-Services account to manage your appointments, requests, and documents.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 z-20 bg-white">
                <div className="w-full max-w-md">

                    {/* Header bar on Mobile */}
                    <div className="flex items-center justify-between mb-6 lg:hidden pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                            <img src="/images/cedlogo.png" alt="Logo" className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow-sm shrink-0" />
                            <span className="font-extrabold text-slate-900 text-xl tracking-tight leading-tight">CED E-Services</span>
                        </div>
                        <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 px-3 py-1.5 rounded-md">
                            Back
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Log In</h1>
                        <p className="text-slate-600 text-sm">Please enter your details to sign in.</p>
                    </div>

                    {status && (
                        <div className="mb-6 text-sm font-medium text-emerald-800 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200/80">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-slate-800 font-semibold mb-1.5" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm px-4 py-3 text-slate-900"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2 text-red-600" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-slate-800 font-semibold mb-1.5" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm px-4 py-3 text-slate-900"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2 text-red-600" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="text-yellow-500 focus:ring-yellow-400 rounded border-slate-300"
                                />
                                <span className="ms-2 text-sm text-slate-600 font-medium">Remember me</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-semibold text-yellow-700 hover:text-yellow-600 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button
                            disabled={processing}
                            className="mt-2 w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-colors shadow-md shadow-yellow-500/20 disabled:opacity-70"
                        >
                            Log In
                        </button>

                        <p className="text-center text-sm text-slate-600 mt-4">
                            Don't have an account?{' '}
                            <Link href={route('register')} className="font-bold text-yellow-700 hover:text-yellow-600 transition-colors">
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}