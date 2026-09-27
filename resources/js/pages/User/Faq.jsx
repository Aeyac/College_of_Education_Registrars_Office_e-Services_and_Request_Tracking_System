import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import NewInquiryModal from '@/Components/NewInquiryModal';

export default function Faq({ userRole }) {
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

    const quickActions = [
        {
            title: 'Submit Inquiry',
            icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            action: () => setIsInquiryModalOpen(true)
        },
        {
            title: 'Guides & Tutorials',
            icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            action: () => setIsTutorialOpen(true)
        },
        {
            title: 'Track My Requests',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            action: () => router.get('/user/requests')
        }
    ];

    const processSteps = [
        {
            title: '1. Submit Your Request',
            desc: 'Navigate to "New Request" in your dashboard. Select your desired document type and upload all required compliance files (e.g., clearance, valid ID).',
            bg: 'bg-sky-50',
            border: 'border-sky-100',
            iconText: 'text-sky-600',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        },
        {
            title: '2. Evaluation & Processing',
            desc: 'The CED Registrar will verify your uploaded documents. If there are missing requirements, your request will be returned for compliance. Otherwise, it will proceed to processing.',
            bg: 'bg-yellow-50',
            border: 'border-yellow-100',
            iconText: 'text-yellow-600',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        },
        {
            title: '3. Ready for Release',
            desc: 'You will receive an email and an in-app notification once your document is successfully printed, signed, and ready for pickup at the Registrar\'s Office.',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconText: 'text-emerald-600',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        },
        {
            title: '4. Claiming your Document',
            desc: 'Visit the CED Registrar. If you are claiming it yourself, present a Valid ID. If an authorized person is claiming it for you, they must provide an Authorization Letter and a copy of their Valid ID.',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            iconText: 'text-indigo-600',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        }
    ];

    return (
        <UserLayout userRole={userRole}>
            <Head title="Help Center" />

            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Help Center</h2>
                <p className="text-xs text-slate-500 mt-1">Learn how to request documents, navigate the system, and find support resources.</p>
            </div>

            <div className="p-6 sm:p-8 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    {quickActions.map((item, i) => (
                        <button
                            key={i}
                            onClick={item.action}
                            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-3xl hover:border-yellow-400 hover:bg-yellow-50 hover:shadow-lg hover:-translate-y-1 transition-all group outline-none cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white group-hover:border-yellow-200 transition-colors shadow-sm group-hover:shadow-md">
                                <svg className="w-6 h-6 text-slate-400 group-hover:text-yellow-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                </svg>
                            </div>
                            <span className="text-[13px] font-black text-slate-700 text-center tracking-wide">{item.title}</span>
                        </button>
                    ))}
                </div>

                <div className="mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Document Requesting Process</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {processSteps.map((step, idx) => (
                        <div key={idx} className={`p-6 sm:p-8 rounded-[2rem] border ${step.border} ${step.bg} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white opacity-40 rounded-full transform group-hover:scale-150 transition-transform duration-700 ease-out" />
                            
                            <div className="relative z-10">
                                <div className={`w-14 h-14 bg-white rounded-2xl border ${step.border} shadow-sm flex items-center justify-center mb-6 ${step.iconText}`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {step.icon}
                                    </svg>
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-3">{step.title}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Tutorial Video Modal --- */}
            {isTutorialOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-lg">System Tutorial Video</h3>
                            </div>
                            <button onClick={() => setIsTutorialOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-slate-950 p-2 sm:p-4 custom-scrollbar">
                            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/dxUkqWHF9g0?list=RDdxUkqWHF9g0"
                                    title="CED E-Services Tutorial"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                            <h4 className="font-bold text-slate-900 text-base mb-1">How to use CED E-Services</h4>
                            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                                Watch this quick guide to learn how to properly register your account, modify your profile settings, submit an inquiry for an appointment, and track your requested documents.
                            </p>
                            <button
                                onClick={() => setIsTutorialOpen(false)}
                                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-yellow-500/20 text-sm"
                            >
                                Got it, Close Tutorial
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <NewInquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
            />

        </UserLayout>
    );
}
