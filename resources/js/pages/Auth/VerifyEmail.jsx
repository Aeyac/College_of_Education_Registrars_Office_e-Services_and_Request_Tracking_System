import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function VerifyOtp({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.verify.otp'));
    };

    const resend = (e) => {
        e.preventDefault();
        post(route('verification.send.otp'));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 font-sans p-6">
            <Head title="Email Verification - CED E-Services" />
            
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-6 shadow-inner">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Enter Security Code</h1>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    We have sent a <strong>6-digit OTP</strong> to your email address. Enter it below to complete your registration.
                </p>

                {status && (
                    <div className="mb-6 font-medium text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-5">
                    <div>
                        <TextInput
                            type="text"
                            value={data.otp}
                            onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full text-center text-3xl tracking-[0.4em] font-bold border-slate-300 focus:border-yellow-500 focus:ring-yellow-500 rounded-xl shadow-sm py-3 placeholder:tracking-normal placeholder:text-slate-300"
                            placeholder="••••••"
                            required
                            autoFocus
                        />
                        <InputError message={errors.otp} className="mt-2 text-red-600 text-sm font-medium" />
                    </div>

                    <button 
                        disabled={processing} 
                        className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                        Verify & Continue
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-2">
                    <p className="text-xs text-slate-500">
                        You have a maximum of 3 attempts to verify the code.
                    </p>
                    <p className="text-sm text-slate-600">
                        Didn't receive the code?{' '}
                        <button onClick={resend} disabled={processing} className="font-bold text-yellow-600 hover:text-yellow-700 underline transition-colors">
                            Resend Code
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}