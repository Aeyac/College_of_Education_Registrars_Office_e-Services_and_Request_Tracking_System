import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import NewInquiryModal from '@/Components/NewInquiryModal';

export default function Faq({ userRole, faqs = [], search = '' }) {
    const [openFaq, setOpenFaq] = useState(null);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(search);
    const isFirstRun = useRef(true);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('user.faq'), { search: searchValue }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchValue]);

    const handleSearch = (event) => {
        setSearchValue(event.target.value);
    };

    const quickActions = [
        {
            title: 'Browse FAQs',
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            action: () => document.getElementById('faq-list')?.scrollIntoView({ behavior: 'smooth' })
        },
        {
            title: 'Submit Inquiry',
            icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            action: () => setIsInquiryModalOpen(true)
        },
        {
            title: 'Guides & Tutorials',
            icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            action: () => setIsTutorialOpen(true)
        }
    ];

    return (
        <UserLayout userRole={userRole}>
            <Head title="FAQ / Help Center" />

            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">FAQ / Help Center</h2>
                <p className="text-xs text-slate-500 mt-1">Find answers, guides, and support resources.</p>
            </div>

            <div className="p-6 sm:p-8">
                <div className="relative mb-8">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={handleSearch}
                        placeholder="Search for help..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-colors shadow-sm"
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                    {quickActions.map((item, i) => (
                        <button
                            key={i}
                            onClick={item.action}
                            className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-yellow-400 hover:bg-yellow-50 hover:shadow-md transition-all group outline-none"
                        >
                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-2 group-hover:bg-white group-hover:border-yellow-200 transition-colors">
                                <svg className="w-5 h-5 text-slate-500 group-hover:text-yellow-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                </svg>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 text-center">{item.title}</span>
                        </button>
                    ))}
                </div>

                <h3 id="faq-list" className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 scroll-mt-32">Frequently Asked Questions</h3>

                <div className="space-y-3">
                    {faqs.length > 0 ? (
                        faqs.map((faq, index) => (
                            <div key={faq.id ?? index} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                                <button className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors outline-none" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                    <span className="font-bold text-sm text-slate-800 text-left flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 shrink-0 font-black">{index + 1}</span>
                                        {faq.question}
                                    </span>
                                    <svg className={`w-4 h-4 text-slate-400 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {openFaq === index && (
                                    <div className="px-5 pb-4 pl-14 text-sm text-slate-600 leading-relaxed bg-slate-50/50 pt-2 border-t border-slate-100">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                            <p>No FAQs match your search.</p>
                            <button
                                onClick={() => setIsInquiryModalOpen(true)}
                                className="mt-3 inline-flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 font-bold text-sm underline underline-offset-2 transition-colors"
                            >
                                Submit an Inquiry instead
                            </button>
                        </div>
                    )}
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
                                {   /* Video Tutorial */}
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