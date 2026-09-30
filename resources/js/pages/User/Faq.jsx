import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import NewInquiryModal from '@/Components/NewInquiryModal';

const ICONS = {
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    play: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    close: 'M6 18L18 6M6 6l12 12',
};

const quickActions = [
    { key: 'inquiry', title: 'Submit Inquiry', description: 'Ask the registrar a question or request assistance.', icon: ICONS.mail },
    { key: 'tutorial', title: 'Guides & Tutorials', description: 'Watch the walkthrough and learn how the portal works.', icon: ICONS.play },
    { key: 'requests', title: 'Track My Requests', description: 'Check the status and history of your document requests.', icon: ICONS.document, href: '/user/requests' },
];

const processSteps = [
    { number: '01', title: 'Submit your request', desc: 'Choose the document you need and provide all required information and supporting files.' },
    { number: '02', title: 'Evaluation & processing', desc: 'The CED Registrar checks your request. Missing requirements will be returned for compliance.' },
    { number: '03', title: 'Ready for release', desc: 'You will receive an email and in-app notification when your document is ready for pickup.' },
    { number: '04', title: 'Claim your document', desc: 'Present a valid ID when claiming personally. Authorized representatives must bring the required authorization documents.' },
];

const BTN_BASE = 'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2';
const BTN_PRIMARY = `${BTN_BASE} bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-sm`;
const quickCardClass = 'group block w-full min-w-0 text-left p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl transition-all hover:border-yellow-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2';

const Icon = ({ d, className = 'w-5 h-5' }) => (
    <svg aria-hidden="true" focusable="false" className={`${className} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const Eyebrow = ({ children }) => <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-700">{children}</p>;

const QuickCardBody = ({ item }) => (
    <div className="flex items-start gap-4 min-w-0">
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-yellow-50 border border-yellow-100 text-yellow-700 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
            <Icon d={item.icon} className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug break-words">{item.title}</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed break-words">{item.description}</p>
            <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-yellow-700 group-hover:text-yellow-800 transition-colors">
                Open <span aria-hidden="true" className="text-sm transition-transform group-hover:translate-x-0.5">→</span>
            </span>
        </div>
    </div>
);

export default function Faq() {
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    const closeTutorialRef = useRef(null);

    const handleAction = key => {
        if (key === 'inquiry') setIsInquiryModalOpen(true);
        if (key === 'tutorial') setIsTutorialOpen(true);
    };

    useEffect(() => {
        if (!isTutorialOpen) return;
        const onKey = e => e.key === 'Escape' && setIsTutorialOpen(false);
        const previousOverflow = document.body.style.overflow;
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        closeTutorialRef.current?.focus();
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [isTutorialOpen]);

    return (
        <UserLayout>
            <Head title="Help Center" />

            <div className="w-full min-w-0 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 min-w-0">
                    <Eyebrow>CED E-Services</Eyebrow>
                    <h1 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight break-words">Help Center</h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed break-words">Everything you need to request documents and navigate the portal.</p>
                </div>
            </div>

            <div className="w-full min-w-0 overflow-x-hidden">
                <div className="w-full max-w-6xl mx-auto min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
                    <section aria-labelledby="quick-access-title" className="min-w-0">
                        <div className="mb-5">
                            <Eyebrow>Quick Access</Eyebrow>
                            <h2 id="quick-access-title" className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 break-words">What do you need?</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
                            {quickActions.map(item =>
                                item.href ? (
                                    <Link key={item.key} href={item.href} className={quickCardClass}><QuickCardBody item={item} /></Link>
                                ) : (
                                    <button key={item.key} type="button" onClick={() => handleAction(item.key)} className={quickCardClass}><QuickCardBody item={item} /></button>
                                )
                            )}
                        </div>
                    </section>

                    <section aria-labelledby="process-title" className="min-w-0">
                        <div className="mb-5">
                            <Eyebrow>How It Works</Eyebrow>
                            <h2 id="process-title" className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 break-words">Document requesting process</h2>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">Follow these four steps from submission to claiming your document.</p>
                        </div>
                        <ol className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {processSteps.map(step => (
                                <li key={step.number} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div aria-hidden="true" className="w-11 h-11 shrink-0 rounded-xl bg-yellow-400 text-slate-900 flex items-center justify-center text-xs font-black shadow-sm">{step.number}</div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug break-words">
                                                <span className="sr-only">Step {Number(step.number)}: </span>{step.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5 break-words">{step.desc}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 break-words">Still need help?</h2>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed break-words">Send an inquiry directly to the CED Registrar.</p>
                        </div>
                        <button type="button" onClick={() => setIsInquiryModalOpen(true)} className={`${BTN_PRIMARY} w-full sm:w-auto shrink-0`}>Submit an Inquiry</button>
                    </section>
                </div>
            </div>

            {isTutorialOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={e => e.target === e.currentTarget && setIsTutorialOpen(false)}>
                    <div role="dialog" aria-modal="true" aria-labelledby="tutorial-title" className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] min-w-0 animate-in zoom-in-95 duration-200">
                        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 min-w-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-xl flex items-center justify-center shrink-0">
                                    <Icon d={ICONS.play} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tutorial</p>
                                    <h2 id="tutorial-title" className="font-extrabold text-slate-900 text-base sm:text-lg truncate">CED E-Services Guide</h2>
                                </div>
                            </div>
                            <button ref={closeTutorialRef} type="button" onClick={() => setIsTutorialOpen(false)} aria-label="Close tutorial" className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
                                <Icon d={ICONS.close} />
                            </button>
                        </div>

                        <div className="overflow-y-auto overflow-x-hidden min-w-0">
                            <div className="bg-slate-950 p-1.5 sm:p-4">
                                <div className="w-full max-w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-slate-800">
                                    <iframe className="w-full h-full" src="https://www.youtube.com/embed/dxUkqWHF9g0?rel=0" title="CED E-Services Tutorial" frameBorder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                                </div>
                            </div>
                            <div className="p-4 sm:p-6">
                                <h3 className="font-extrabold text-slate-900 text-base break-words">How to use CED E-Services</h3>
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed break-words">
                                    Learn how to register your account, manage your profile, submit inquiries, request documents, and track your requests.
                                </p>
                                <button type="button" onClick={() => setIsTutorialOpen(false)} className={`${BTN_PRIMARY} w-full mt-5`}>Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <NewInquiryModal isOpen={isInquiryModalOpen} onClose={() => setIsInquiryModalOpen(false)} />
        </UserLayout>
    );
}