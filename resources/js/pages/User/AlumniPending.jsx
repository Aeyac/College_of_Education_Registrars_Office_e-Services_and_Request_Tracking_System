import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
export default function AlumniPending({ submittedAt, proofFileName }) {
    const handleLogout = () => {
        router.post(route('logout'));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Head title="Verification Pending" />

            <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="border border-neutral-200 rounded-2xl p-8 sm:p-10 text-center">
                        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5" />
                                <circle cx="12" cy="12" r="9" strokeLinecap="round" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                            Your account is under review
                        </h1>

                        <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                            An admin needs to confirm your alumni proof before you can access your
                            dashboard. This usually takes a short while — you don't need to do
                            anything else right now.
                        </p>

                        <div className="bg-neutral-50 rounded-xl p-4 text-left mb-8">
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-neutral-500">Proof submitted</dt>
                                    <dd className="text-neutral-900 font-medium truncate max-w-[60%]" title={proofFileName}>
                                        {proofFileName ?? 'Uploaded'}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-neutral-500">Submitted on</dt>
                                    <dd className="text-neutral-900 font-medium">{submittedAt}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-neutral-500">Status</dt>
                                    <dd>
                                        <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            Pending
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <p className="text-xs text-neutral-400 mb-6">
                            Need to check something or submitted the wrong file? Reach out through
                            an inquiry once you're verified, or contact the registrar's office
                            directly.
                        </p>

                        <button
                            onClick={handleLogout}
                            className="w-full py-3 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 transition-colors"
                        >
                            Log out
                        </button>
                    </div>

                    <p className="text-center text-xs text-neutral-400 mt-6">
                        CLSU Alumni Verification &middot; WRCIMS
                    </p>
                </div>
            </div>
        </>
    );
}