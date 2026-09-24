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
    },
    {
        section: "B. INTERNSHIP/PRACTICE TEACHING CERTIFICATE",
        items: [
            { q: "13. How can I request an Internship or Practice Teaching Certificate?", a: "Submit a request to the CED Registrar's Office together with the information and supporting documents required for verification." },
            { q: "14. What information may be required for an Internship Certificate?", a: "The office may request information such as your complete name, student number, degree program, major, semester and school year of internship, cooperating school, duration of internship, grade level handled, and other information necessary for verification." },
            { q: "15. Why do I need to provide supporting documents when requesting an Internship Certificate?", a: "Supporting documents allow the office to verify the accuracy of the information that will appear in the certification." },
            { q: "16. Can the CED Registrar certify information that cannot be verified from available records?", a: "No. The office can only certify information that can be supported by official or verifiable records." },
            { q: "17. Can I request that specific information be added to my Internship Certificate?", a: "You may request it, but the information can only be included if it is relevant, appropriate, and supported by available records." },
            { q: "18. Can an Internship Certificate be issued immediately?", a: "Processing time depends on the completeness of the submitted information, availability of records, verification requirements, and office workload." },
            { q: "19. How will I know if my Internship Certificate is ready?", a: "If the proposed online system is implemented, the status may be viewed through the system or communicated through the contact information provided by the requester." },
            { q: "20. What possible statuses may appear for my certificate request?", a: "The status may appear as Submitted, For Review, For Compliance, Processing, Ready for Release, Released, Returned, or Cancelled, depending on the progress of the request." },
            { q: "21. What does \"For Compliance\" mean?", a: "It means that additional, corrected, or missing information or documents are needed before the office can continue processing the request." },
            { q: "22. What should I do if there is an error in the certificate issued to me?", a: "Immediately contact the CED Registrar's Office and provide the correct information and supporting document, if necessary, so the matter can be reviewed." }
        ]
    },
    {
        section: "C. CURRICULUM, PREREQUISITES, AND ENROLLMENT CONCERNS",
        items: [
            { q: "23. What curriculum should I follow?", a: "Students should generally follow the curriculum officially applicable to their program and admission or curriculum classification, subject to current university rules and approved curriculum changes." },
            { q: "24. Can I take a subject even if I have not completed its prerequisite?", a: "Generally, prerequisite requirements must first be satisfied before enrolling in the succeeding course unless an approved university policy provides otherwise." },
            { q: "25. What is a prerequisite?", a: "A prerequisite is a course or requirement that must normally be completed before a student may enroll in another specified course." },
            { q: "26. What is a co-requisite?", a: "A co-requisite is a course or requirement that must be taken together with another course or under conditions specified in the approved curriculum." },
            { q: "27. Can prerequisite or co-requisite requirements be waived?", a: "Students should not assume that prerequisites or co-requisites can be waived. Any exception must be supported by applicable university policy and approved by the proper authority." },
            { q: "28. Can I take Internship if I have not completed the required Field Study or prerequisite courses?", a: "Internship eligibility is subject to the prerequisites indicated in the approved curriculum and existing university policies. Students should have their academic records evaluated before enrollment." },
            { q: "29. Can I enroll in a subject that is not included in my curriculum?", a: "No. Students may only enroll in courses included in the study program of the degree they are pursuing." },
            { q: "30. What should I do if the course code or course title in my enrollment is different from my curriculum?", a: "Report the discrepancy immediately to the CED Registrar's Office or your department so the course can be checked against the approved curriculum." },
            { q: "31. Can one course substitute for another course in my curriculum?", a: "Course substitution is not automatic. It requires proper evaluation and approval in accordance with university policies." },
            { q: "32. Can I take two courses at the same time if one is a prerequisite of the other?", a: "Normally, a prerequisite should be completed first. Concurrent enrollment is allowed only when specifically permitted by the approved curriculum or applicable university policy." }
        ]
    },
    {
        section: "D. SHIFTING, TRANSFERRING, AND CHANGE OF PROGRAM",
        items: [
            { q: "33. I want to shift to another program. What should I do?", a: "Students should follow the university's official shifting procedures and obtain the required evaluations and approvals from the concerned college, department, and other authorized offices." },
            { q: "34. If I shift to another program, will all my subjects be credited?", a: "Not necessarily. Crediting depends on the curriculum of the new program, equivalency of courses, grades obtained, and applicable university policies." },
            { q: "35. If I shift to another college but do not secure a slot, can I automatically return to my previous program?", a: "Returning to the previous program is not necessarily automatic. The student should coordinate with the concerned colleges and the proper university offices regarding admission, availability of slots, and applicable policies." },
            { q: "36. Who evaluates the subjects of a shifting student?", a: "Evaluation normally involves the receiving academic unit and the appropriate registrar/admission offices based on the approved curriculum and university policies." }
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