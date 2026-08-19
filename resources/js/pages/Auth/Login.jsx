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
    }); //[cite: 5]

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    }; //[cite: 5]

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
                <div className="relative z-20 flex flex-col items-center text-center px-12">
                    <img src="/images/cedlogo.png" alt="Logo" className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-6 shadow-2xl" />
                    <h2 className="text-4xl font-extrabold text-white mb-4">Welcome Back!</h2>
                    <p className="text-slate-300 text-lg max-w-md">Access your CED E-Services account to manage your appointments, requests, and documents.</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 shadow-[0_0_40px_rgba(0,0,0,0.05)] z-20 bg-white lg:rounded-l-3xl">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <img src="/images/cedlogo.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-yellow-400" />
                        <span className="font-bold text-slate-900 text-xl tracking-tight">CED E-Services</span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Log In</h1>
                    <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                            {status}
                        </div>
                    )} {/*[cite: 5] */}

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-slate-700 font-semibold mb-1" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full border-slate-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl shadow-sm px-4 py-3"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2 text-red-500" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-slate-700 font-semibold mb-1" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full border-slate-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl shadow-sm px-4 py-3"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2 text-red-500" />
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <label className="flex items-center cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="text-yellow-500 focus:ring-yellow-400 rounded border-slate-300"
                                />
                                <span className="ms-2 text-sm text-slate-600 font-medium">Remember me</span>
                            </label> {/*[cite: 5] */}

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-semibold text-yellow-600 hover:text-yellow-500 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            )} {/*[cite: 5] */}
                        </div>

                        <button 
                            disabled={processing}
                            className="mt-4 w-full py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-yellow-400/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70"
                        >
                            Log in to Account
                        </button>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Don't have an account?{' '}
                            <Link href={route('register')} className="font-bold text-yellow-600 hover:text-yellow-500 transition-colors">
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}