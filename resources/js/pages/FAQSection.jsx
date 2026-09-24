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
    },
    {
        section: "E. CROSS-ENROLLMENT AND PETITIONED COURSES",
        items: [
            { q: "37. Can I cross-enroll a subject in another institution?", a: "Cross-enrollment may be allowed only under conditions established by the university and with prior approval from the proper authorities." },
            { q: "38. Can I cross-enroll first and ask for approval afterward?", a: "Students should secure the required approval before cross-enrolling. Subjects taken without proper authorization may encounter problems in crediting." },
            { q: "39. Can students request the opening of a petitioned class?", a: "Students may submit a request subject to university policies, minimum requirements, availability of faculty, facilities, academic scheduling, and approval by the proper authorities." },
            { q: "40. Does submitting a petition guarantee that the class will be opened?", a: "No. A petition is a request and remains subject to evaluation and approval." }
        ]
    },
    {
        section: "F. ACADEMIC LOAD, OVERLOAD, AND COURSE SCHEDULING",
        items: [
            { q: "41. How many units may I enroll in?", a: "During a regular semester, students should follow the academic load prescribed in their approved curriculum or study program. During the mid-term, a student may enroll in a maximum of nine (9) units. A graduating student may be allowed a higher mid-term load, but it must not exceed twelve (12) units." },
            { q: "42. Can I request an overload?", a: "Yes, subject to University rules and approval. A student may be allowed an overload of not more than six (6) units provided that the student has a GPA of not lower than 2.25 in all courses taken. A senior student may be allowed an extra load of not more than six (6) units of courses specified in the degree program, regardless of GPA. University and college scholars may likewise carry an extra load of not more than six (6) units. Students who are scholastically delinquent are not allowed to carry an overload. Requests for overload must be made using the prescribed form issued by the Office of Admissions." },
            { q: "43. Can a graduating student automatically take an overload?", a: "A graduating student may be permitted to carry an extra load of not more than nine (9) units, subject to the University's prescribed overload procedure and applicable academic policies." },
            { q: "44. What should I do if two required subjects have conflicting schedules?", a: "Immediately consult your academic adviser, department, and/or the CED Registrar's Office. Students should not independently choose arrangements that are inconsistent with official schedules and enrollment policies." }
        ]
    },
    {
        section: "G. INC, COMPLETION, AND GRADES",
        items: [
            { q: "45. What does INC mean?", a: "INC means Incomplete and may be given under circumstances allowed by university academic policies when a student has not completed certain course requirements." },
            { q: "46. How do I complete an INC?", a: "The student must comply with the required academic work and follow the university's official completion procedure within the period prescribed by university policy." },
            { q: "47. Can I complete an INC anytime?", a: "No. An INC must be completed within the period allowed by university rules. Students are encouraged to process completion requirements as early as possible." },
            { q: "48. What happens if my INC has already lapsed?", a: "Once the prescribed completion period has expired, the case will be handled according to the applicable university policy. The CED Registrar's Office may assist in verifying the academic situation, but the student must comply with official university procedures." },
            { q: "49. Can the College Registrar change my grade?", a: "No. The College Registrar does not independently change grades. Grade changes or corrections must follow official university procedures and must originate from or be supported by the authorized faculty member and approving authorities." },
            { q: "50. What should I do if I believe my grade was encoded incorrectly?", a: "Contact your instructor or department first. Any correction must follow the official grade correction process." }
        ]
    },
    {
        section: "H. LEAVE OF ABSENCE, READMISSION, AND REACTIVATION",
        items: [
            { q: "51. What is a Leave of Absence (LOA)?", a: "A Leave of Absence is an officially approved temporary interruption of a student's studies subject to university policies and procedures." },
            { q: "52. Can I simply stop attending classes without filing a Leave of Absence?", a: "No. Students who need to temporarily discontinue their studies should follow the official university procedure to avoid academic and enrollment complications." },
            { q: "53. I previously went on Leave of Absence. How can I return?", a: "Students returning from LOA should follow the university's readmission or reactivation procedure and coordinate with the appropriate offices before enrollment." },
            { q: "54. Can I process an INC while on LOA?", a: "This depends on the status of the INC, the applicable completion period, and existing university policies. The student should have the record evaluated before proceeding." },
            { q: "55. What is readmission?", a: "Readmission refers to the formal process required for a student who has stopped studying or whose enrollment status requires approval before returning to the university." }
        ]
    },
    {
        section: "I. ADDING, DROPPING, AND CHANGING SUBJECTS",
        items: [
            { q: "56. Can I add or change a subject after enrollment?", a: "Adding or changing courses may only be done within the official period and following the prescribed university procedures." },
            { q: "57. Can I drop a subject anytime?", a: "No. Dropping of courses is subject to university deadlines, procedures, and academic policies." },
            { q: "58. What happens if I stop attending a class without officially dropping it?", a: "Failure to officially process the dropping of a course may have academic consequences based on university policy." }
        ]
    },
    {
        section: "J. GRADUATION AND ACADEMIC EVALUATION",
        items: [
            { q: "59. Who determines if I am already qualified to graduate?", a: "Graduation eligibility is determined through official academic evaluation based on completion of curriculum requirements and university graduation policies." },
            { q: "60. Can the CED Registrar's Office help check my remaining subjects?", a: "Yes. The office may assist in reviewing curriculum requirements and identifying possible academic deficiencies, subject to verification against official university records." },
            { q: "61. Does having no remaining classes automatically mean I am cleared for graduation?", a: "Not necessarily. Graduation may also require completion of other academic, administrative, and institutional requirements." },
            { q: "62. Where should I process official graduation documents?", a: "Official graduation-related records and documents should be processed through the offices designated by the university." },
            { q: "63. Where can I ask about Latin honors or other academic distinctions?", a: "Eligibility for academic honors is determined according to the current university academic policies and Student Handbook. Students may inquire with the CED Registrar's Office for guidance, but final evaluation follows official university procedures." }
        ]
    },
    {
        section: "K. STUDENT RECORDS AND DATA PRIVACY",
        items: [
            { q: "64. Can the CED Registrar's Office give my academic information to another person?", a: "Student information is protected and should only be disclosed in accordance with university policies, the Data Privacy Act, and appropriate authorization." },
            { q: "65. Can my parent or guardian request my academic information?", a: "Access to student information is subject to applicable privacy rules, university policies, and appropriate authorization." },
            { q: "66. Why am I required to provide identification for some requests?", a: "Identity verification helps protect academic records and personal information from unauthorized access." },
            { q: "67. Can I submit another student's request using my account?", a: "No. Users should only submit requests using their own account unless they are formally authorized to act on behalf of another person." },
            { q: "68. What should I do if my personal information in the system is incorrect?", a: "Report the error immediately. Changes involving official university records may require supporting documents and processing through the office authorized to maintain the official record." }
        ]
    },
    {
        section: "L. REFERRALS TO OTHER OFFICES",
        items: [
            { q: "69. What if my concern is not handled by the CED Registrar's Office?", a: "The office will provide guidance and, when appropriate, refer you to the university office responsible for the transaction." },
            { q: "70. Where should I request my TOR, Diploma, Certificate of Enrollment, or other official academic records?", a: "These should be coordinated with the Office of Admissions or the appropriate university office responsible for official student records." },
            { q: "71. Where should I inquire about payments, assessment, or refunds?", a: "The CED Registrar's Office does not process payments. Financial concerns should be directed to the appropriate university accounting, cashier, or finance office." },
            { q: "72. Can the CED Registrar's Office fill out external verification forms from foreign institutions or credential evaluators?", a: "The office may provide a standard certification for information it is authorized and able to verify. External forms requiring official university records may need to be processed by the Office of Admissions or another authorized university office." },
            { q: "73. What should I do if I am unsure which office handles my concern?", a: "You may submit an inquiry through the CED Registrar system. The office can identify whether the concern falls within its authority or direct you to the appropriate university office." }
        ]
    }
]; //[cite: 1]

export default function FAQSection() {
    // State for which section is open (Default to 0 so the first section is open, or null to close all)
    const [openSection, setOpenSection] = useState(0); 
    // State for which specific FAQ is open
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <section id="faq" className="pt-10 pb-20 px-6 md:px-12 bg-slate-50 max-w-4xl mx-auto scroll-mt-20 mb-14 rounded-3xl">
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
                                <span className="font-extrabold text-left text-base sm:text-lg pr-4">
                                    {section.section}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSectionOpen ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500'}`}>
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