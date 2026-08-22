import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function Welcome({ auth, announcements = [] }) {
    // State for accordions
    const [openFaq, setOpenFaq] = useState(null);
    const [openCourse, setOpenCourse] = useState(null);

    // Services based strictly on the CED Registrar's Office functions
    const services = [
        {
            title: "Request for Internship Certificate",
            desc: "Initiate your request for an official internship certificate through our streamlined digital portal.",
            icon: (
                <svg className="w-7 h-7 stroke-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            title: "Submission of Requirements",
            desc: "Upload and submit all necessary supporting documents for your internship certificate securely.",
            icon: (
                <svg className="w-7 h-7 stroke-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            )
        },
        {
            title: "Status Tracking",
            desc: "Monitor the real-time processing status of your internship certificate request.",
            icon: (
                <svg className="w-7 h-7 stroke-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            )
        },
        {
            title: "Registrar Inquiries",
            desc: "Send direct inquiries regarding internship certificates to the CED Registrar's Office.",
            icon: (
                <svg className="w-7 h-7 stroke-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            )
        },
        {
            title: "Claiming Schedule",
            desc: "View availability and set your schedule for claiming or releasing approved documents.",
            icon: (
                <svg className="w-7 h-7 stroke-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
    ];

    const courses = [
        {
            title: "Bachelor of Culture and Arts Education",
            majors: []
        },
        {
            title: "Bachelor of Early Childhood Education",
            majors: []
        },
        {
            title: "Bachelor of Elementary Education",
            majors: []
        },
        {
            title: "Bachelor of Physical Education",
            majors: []
        },
        {
            title: "Bachelor of Secondary Education",
            majors: ["English", "Filipino", "Mathematics", "Science", "Social Studies", "Values Education"]
        },
        {
            title: "Bachelor of Technology and Livelihood Education",
            majors: ["Agri-Fisheries and Arts", "Home Economics", "Industrial Arts"]
        }
    ];

    const faqs = [
        {
            q: "How do I request an internship certificate?",
            a: "You can request an internship certificate by navigating to the 'Request for Internship Certificate' section in our E-Services portal, filling out the required details, and attaching necessary documents."
        },
        {
            q: "What details are needed for the certificate?",
            a: "You will need to provide your full name, student number, program/major, year level/batch, contact info, internship school/agency, semester/school year of internship, and preferred claiming date."
        },
        {
            q: "How long is the processing time?",
            a: "Standard processing time for an internship certificate is 3-5 working days upon submission of complete requirements, depending on the volume of requests."
        },
        {
            q: "How can I check the status of my request?",
            a: "You can monitor the real-time status of your request (e.g., Submitted, Processing, Ready for Release) through your personalized student dashboard under 'Status Tracking'."
        },
        {
            q: "What should I do if my information is incorrect?",
            a: "If you notice an error in your submitted request, please use the 'Registrar Inquiries' feature immediately to inform the staff before the certificate is processed."
        },
        {
            q: "When and where can I claim the certificate?",
            a: "Once your status is updated to 'Ready for Release', you will receive a notification regarding your claiming schedule. Certificates are claimed at the CED Registrar's Office."
        },
        {
            q: "Who may claim the certificate on my behalf?",
            a: "If you cannot claim the document personally, your authorized representative must present an authorization letter, a photocopy of your valid ID, and their own valid ID."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-yellow-300 selection:text-slate-900 scroll-smooth">
            <Head title="Welcome - CED E-Services" />
            <Header />
            <main className="flex-grow pt-20">
                {/* Hero Section */}
                <section id="home" className="relative pt-12 md:pt-16 pb-20 px-6 md:px-12 w-full overflow-hidden bg-gradient-to-br from-amber-50/60 via-white to-yellow-50/40 border-b border-slate-100 scroll-mt-24">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
                        <div className="w-full md:w-1/2 flex flex-col gap-6 items-start">
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-none md:leading-tight">
                                WELCOME TO <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 block mt-2 md:inline">
                                    CED E-SERVICES
                                </span>
                            </h1>
                            <p className="text-slate-600 text-lg md:text-xl max-w-md font-normal leading-relaxed">
                                Your digital hub for online appointments, official document requests, and college academic resources.
                            </p>
                            <Link
                                href={route('register')}
                                className="mt-2 px-12 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-full transition-colors shadow-md shadow-yellow-500/20"
                            >
                                GET STARTED
                            </Link>
                        </div>
                        <div className="w-full md:w-1/2 relative flex justify-center mt-6 md:mt-0">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-300 to-amber-200 rounded-2xl blur-xl opacity-30"></div>
                            <div className="relative w-full max-w-lg aspect-video bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xl">
                                <div className="relative w-full h-full rounded-xl overflow-hidden">
                                    <img
                                        src="/images/cedbuilding.jpg"
                                        alt="College of Education Building"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/20 font-medium">
                                        College of Education
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-20 px-6 md:px-12 bg-white border-b border-slate-200/60 scroll-mt-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-12 justify-center">
                            <div className="w-2 h-7 bg-green-700 rounded-full"></div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">About College of Education</h2>
                            <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 shadow-sm">
                                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Mission
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    To develop highly competent, morally upright, and globally competitive educators who are committed to the pursuit of excellence in teaching, research, and community service.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 shadow-sm">
                                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Vision
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    A premier center of excellence in teacher education, producing innovative and transformative educational leaders for sustainable development.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 shadow-sm">
                                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Philosophy
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Education is a lifelong process of holistic development. We believe in nurturing minds that are critically aware, socially responsible, and culturally rooted.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <div className="bg-green-50/50 p-8 rounded-2xl border border-green-100 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Mission of Elementary Education</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    To equip future elementary teachers with foundational pedagogical skills, deep subject matter knowledge, and the empathy needed to lay strong educational groundwork for children.
                                </p>
                            </div>
                            <div className="bg-yellow-50/50 p-8 rounded-2xl border border-yellow-100 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Mission of Secondary Education</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    To prepare secondary educators who master their disciplines, integrating innovative teaching strategies to guide adolescents towards academic achievement and personal growth.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* E-Services Section */}
                <section id="services" className="py-20 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
                    <div className="flex flex-col items-center mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">E-Services & Requests</h2>
                            <div className="w-2 h-7 bg-green-700 rounded-full"></div>
                        </div>
                        <p className="text-slate-500 mt-3 text-center max-w-2xl">
                            The CED Registrar's Office provides an automated request and tracking system strictly dedicated to internship certificates and related requirements.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-start transition-shadow hover:shadow-md hover:border-yellow-300">
                                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                                    {service.icon}
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug">{service.title}</h3>
                                <p className="text-sm text-slate-600 mb-6 leading-relaxed flex-grow">{service.desc}</p>
                                <Link
                                    href={route('login')}
                                    className="px-5 py-2.5 bg-slate-100 text-slate-800 text-sm font-semibold rounded-lg text-center hover:bg-yellow-400 hover:text-slate-950 transition-colors w-full mt-auto"
                                >
                                    Access Service
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Courses Offered Section */}
                <section id="courses" className="py-20 px-6 md:px-12 bg-white max-w-4xl mx-auto scroll-mt-20">
                    <div className="flex flex-col items-center mb-10">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Courses Offered</h2>
                        <p className="text-slate-500 text-center text-sm">Explore the undergraduate degree programs available at the College of Education.</p>
                    </div>
                    <div className="space-y-4">
                        {courses.map((course, index) => {
                            const hasMajors = course.majors.length > 0;
                            const isOpen = openCourse === index;
                            return (
                                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                                    {hasMajors ? (
                                        <button
                                            className="w-full px-6 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none"
                                            onClick={() => setOpenCourse(isOpen ? null : index)}
                                        >
                                            <span className="font-semibold text-slate-800 text-left">{course.title}</span>
                                            <svg
                                                className={`w-5 h-5 text-slate-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <div className="w-full px-6 py-4 flex justify-between items-center bg-slate-50">
                                            <span className="font-semibold text-slate-800 text-left">{course.title}</span>
                                        </div>
                                    )}
                                    {hasMajors && (
                                        <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out bg-white ${isOpen ? 'max-h-96 py-5 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Majors</span>
                                            <ul className="space-y-3 ml-2">
                                                {course.majors.map((major, i) => (
                                                    <li key={i} className="text-sm text-slate-600 flex items-center gap-3">
                                                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                        {major}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Announcement Section */}
                <section id="announcement" className="py-20 px-6 md:px-12 bg-slate-50 border-t border-slate-200/60 scroll-mt-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registrar Announcements</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {announcements.length > 0 ? (
                                announcements.map((announcement) => (
                                    <div key={announcement.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-600 group-hover:bg-yellow-400 transition-colors"></div>
                                        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-2">{announcement.date}</span>
                                        <h3 className="font-bold text-slate-900 text-lg mb-3 leading-snug">{announcement.title}</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-3">{announcement.content}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">No active announcements at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-20 px-6 md:px-12 bg-white max-w-4xl mx-auto scroll-mt-20 mb-14">
                    <div className="flex flex-col items-center mb-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
                        </div>
                        <p className="text-slate-500 text-center text-sm">Everything you need to know about internship certificate processing.</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                                <button
                                    className="w-full px-6 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <span className="font-semibold text-slate-800 text-left">{faq.q}</span>
                                    <svg
                                        className={`w-5 h-5 text-slate-500 transform transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                                    <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}