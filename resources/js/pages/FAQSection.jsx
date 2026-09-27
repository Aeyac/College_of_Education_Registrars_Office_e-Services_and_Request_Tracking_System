import { useState, useMemo } from 'react';

export default function FAQSection({ faqs = [] }) {
    const [openSection, setOpenSection] = useState(0);
    const [openFaq, setOpenFaq] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');

    const faqSections = useMemo(() => {
        const grouped = [];
        const indexByCategory = {};

        const filtered = faqs.filter(faq => 
            (faq.question || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
            (faq.answer || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.forEach((faq) => {
            const category = faq.category || 'General';
            if (!(category in indexByCategory)) {
                indexByCategory[category] = grouped.length;
                grouped.push({ section: category, items: [] });
            }
            grouped[indexByCategory[category]].items.push({ id: faq.id, q: faq.question, a: faq.answer });
        });

        // Automatically open the first section if searching
        if (searchQuery && grouped.length > 0) {
            setOpenSection(0);
        } else if (!searchQuery && openSection === null) {
            setOpenSection(0);
        }

        return grouped;
    }, [faqs, searchQuery]);

    return (
        <section id="faq" className="pt-10 pb-20 px-6 md:px-12 bg-slate-50 max-w-4xl mx-auto scroll-mt-20 mb-14 rounded-3xl">
            <div className="flex flex-col items-center mb-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
                </div>
                <p className="text-slate-500 text-center text-sm mb-6">Comprehensive guide on academic policies, enrollment, and records.</p>
                
                <div className="relative w-full max-w-lg">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for an answer..."
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-shadow shadow-sm focus:shadow-md"
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="space-y-4">
                {faqSections.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                        No FAQs found matching "{searchQuery}".
                    </div>
                ) : faqSections.map((section, sIndex) => {
                    const isSectionOpen = openSection === sIndex;

                    return (
                        <div key={section.section} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <button
                                className="w-full px-6 py-5 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors focus:outline-none"
                                onClick={() => setOpenSection(isSectionOpen ? null : sIndex)}
                            >
                                <span className="font-extrabold text-left text-base sm:text-lg pr-4">
                                    {section.section}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSectionOpen ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <svg className={`w-5 h-5 transform transition-transform duration-300 ${isSectionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/50 ${isSectionOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 sm:p-6 space-y-3 border-t border-slate-100">
                                    {section.items.map((faq) => {
                                        const isFaqOpen = openFaq === faq.id;

                                        return (
                                            <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <button
                                                    className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors focus:outline-none"
                                                    onClick={() => setOpenFaq(isFaqOpen ? null : faq.id)}
                                                >
                                                    <span className="font-semibold text-slate-800 text-sm text-left pr-4 leading-snug">{faq.q}</span>
                                                    <svg className={`w-4 h-4 text-slate-400 shrink-0 transform transition-transform duration-200 ${isFaqOpen ? 'rotate-180 text-yellow-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                <div className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${isFaqOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                                                    <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">{faq.a}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}