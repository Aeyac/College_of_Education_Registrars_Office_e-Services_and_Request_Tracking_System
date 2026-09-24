import { useState } from 'react';

const faqSections = [
    {
        section: "A. ABOUT THE CED REGISTRAR'S OFFICE",
        items: [
            { q: "1. What is the College of Education Registrar's Office?", a: "The CED Registrar's Office assists the College of Education in academic records coordination, curriculum-related concerns, student academic inquiries, verification of academic requirements, and other college-level registrar functions within its authorized scope." },
            { q: "2. Is the CED Registrar's Office the same as the Office of Admissions?", a: "No. The CED Registrar's Office is a college-level office. The Office of Admissions handles official university academic records and documents that are under its authority." },
            { q: "3. What certificates can I request from the CED Registrar's Office?", a: "The CED Registrar's Office may facilitate Internship/Practice Teaching Certificates and related certifications that are within the records and authority of the College of Education." },
            { q: "4. Can I request my Transcript of Records (TOR) from the CED Registrar's Office?", a: "No. Requests for official Transcript of Records should be processed through the Office of Admissions." },
            { q: "5. Can I request a Certificate of Enrollment from the CED Registrar's Office?", a: "No. Official enrollment certifications are processed by the appropriate university office, particularly the Office of Admissions." },
            { q: "6. Can I request a Certificate of Grades from the CED Registrar's Office?", a: "Official academic record certifications are not issued by the CED Registrar's Office. Students should coordinate with the Office of Admissions or the appropriate authorized office." },
            { q: "7. Can I request authentication of my TOR, diploma, or other official academic documents from the CED Registrar's Office?", a: "No. Authentication or certification of official university academic records should be requested from the office officially responsible for those records." },
            { q: "8. Can I request my diploma from the CED Registrar's Office?", a: "No. Diploma-related concerns should be coordinated with the Office of Admissions or the appropriate university office." },
            { q: "9. Does the CED Registrar's Office accept payments?", a: "No. There are no payment transactions in the CED Registrar's Office. Any required university payment must be made only through the officially designated university payment channels." },
            { q: "10. Should I send proof of payment to the CED Registrar's Office?", a: "No, unless specifically requested for a transaction coordinated with another authorized university office. The CED Registrar's Office does not collect or process payments." },
            { q: "11. Can I ask the CED Registrar's Office about my academic concerns?", a: "Yes. Students may inquire about College of Education academic policies, curriculum concerns, prerequisites, academic load, internship-related requirements, and other matters within the scope of the college. If the concern belongs to another office, the student will be referred accordingly." },
            { q: "12. Can another person process a transaction for me?", a: "This depends on the nature of the transaction and university policy. Authorization and valid identification may be required for transactions involving personal or academic information." }
        ]
    }
]; //[cite: 1]

export default function FAQSection() {
    // State for which section is open (Default to 0 so the first section is open, or null to close all)
    const [openSection, setOpenSection] = useState(0); 
    // State for which specific FAQ is open
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <section id="faq" className="py-20 px-6 md:px-12 bg-slate-50 max-w-4xl mx-auto scroll-mt-20 mb-14 rounded-3xl">
            <div className="flex flex-col items-center mb-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
                </div>
                <p className="text-slate-500 text-center text-sm">Comprehensive guide on academic policies, enrollment, and records.</p>
            </div>

            <div className="space-y-4">
                {faqSections.map((section, sIndex) => {
                    const isSectionOpen = openSection === sIndex;
                    
                    return (
                        <div key={sIndex} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                            {/* SECTION DROPDOWN BUTTON */}
                            <button
                                className="w-full px-6 py-5 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors focus:outline-none"
                                onClick={() => setOpenSection(isSectionOpen ? null : sIndex)}
                            >
                                <span className="font-extrabold text-green-800 text-left text-base sm:text-lg pr-4">
                                    {section.section}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSectionOpen ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                                    <svg
                                        className={`w-5 h-5 transform transition-transform duration-300 ${isSectionOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* SECTION CONTENT (FAQS) */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/50 ${isSectionOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 sm:p-6 space-y-3 border-t border-slate-100">
                                    {section.items.map((faq, fIndex) => {
                                        const faqId = `${sIndex}-${fIndex}`;
                                        const isFaqOpen = openFaq === faqId;
                                        
                                        return (
                                            <div key={fIndex} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <button
                                                    className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors focus:outline-none"
                                                    onClick={() => setOpenFaq(isFaqOpen ? null : faqId)}
                                                >
                                                    <span className="font-semibold text-slate-800 text-sm text-left pr-4 leading-snug">{faq.q}</span>
                                                    <svg
                                                        className={`w-4 h-4 text-slate-400 shrink-0 transform transition-transform duration-200 ${isFaqOpen ? 'rotate-180 text-yellow-600' : ''}`}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
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