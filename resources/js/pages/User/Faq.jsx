import { Head } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';

export default function Faq({ userRole }) {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        { q: "How do I request a document?", a: "Navigate to the 'My Requests' tab and click '+ Submit New Request'. Select your document type, format, and provide a valid reason." },
        { q: "How long does it take to process my request?", a: "Standard processing takes 3-5 working days. You can track the status in your dashboard." },
        { q: "Where can I view the status of my request?", a: "Your active requests are pinned to your Dashboard, and the full history is available under 'My Requests'." },
        { q: "How do I upload my Alumni verification?", a: "Click the 'Upload' button on the yellow banner in your Dashboard to submit your Diploma or TOR." },
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
                    <input type="text" placeholder="Search for help..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none" />
                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                    {[
                        { title: 'Browse FAQs', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                        { title: 'Submit Inquiry', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                        { title: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { title: 'Guides & Tutorials', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
                    ].map((item, i) => (
                        <button key={i} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-yellow-400 hover:shadow-md transition-all group">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-yellow-50">
                                <svg className="w-5 h-5 text-slate-500 group-hover:text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/></svg>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 text-center">{item.title}</span>
                        </button>
                    ))}
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Frequently Asked Questions</h3>
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                            <button className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors outline-none" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                <span className="font-bold text-sm text-slate-800 text-left flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 shrink-0">{index + 1}</span>
                                    {faq.q}
                                </span>
                                <svg className={`w-4 h-4 text-slate-400 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {openFaq === index && (
                                <div className="px-5 pb-4 pl-14 text-sm text-slate-600 leading-relaxed bg-slate-50/50 pt-2 border-t border-slate-100">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </UserLayout>
    );
}