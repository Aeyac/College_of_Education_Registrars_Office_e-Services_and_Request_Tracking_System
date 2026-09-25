import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Chatbox from '@/Components/Chatbox';
import FAQSection from '@/pages/FAQSection';

export default function Welcome({ auth, announcements = [] }) {
    // State for accordions
    const [openCourse, setOpenCourse] = useState(null);
    
    // State for Announcement Modal
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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
            acronym: "BCAEd",
            desc: "Prepares educators who are equipped to teach culture and arts, preserving cultural heritage and fostering artistic expression.",
            icon: (
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            majors: []
        },
        {
            title: "Bachelor of Early Childhood Education",
            acronym: "BECEd",
            desc: "Designed to prepare educators with the foundational knowledge and skills for teaching young children, focusing on developmental and pedagogical principles.",
            icon: (
                <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            majors: []
        },
        {
            title: "Bachelor of Elementary Education",
            acronym: "BEEd",
            desc: "Equips future elementary teachers with foundational pedagogical skills, deep subject matter knowledge, and the empathy needed to lay strong educational groundwork for children.",
            icon: (
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            majors: []
        },
        {
            title: "Bachelor of Physical Education",
            acronym: "BPEd",
            desc: "Prepares educators to teach physical education, promoting physical fitness, wellness, and healthy lifestyles through movement and sports.",
            icon: (
                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
            ),
            majors: []
        },
        {
            title: "Bachelor of Secondary Education",
            acronym: "BSEd",
            desc: "Prepares secondary educators who master their disciplines, integrating innovative teaching strategies to guide adolescents towards academic achievement and personal growth.",
            icon: (
                <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            majors: ["English", "Filipino", "Mathematics", "Science", "Social Studies", "Values Education"]
        },
        {
            title: "Bachelor of Technology and Livelihood Education",
            acronym: "BTLEd",
            desc: "Focuses on equipping educators with skills in technical-vocational tracks, preparing students for practical life skills and technical careers.",
            icon: (
                <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            majors: ["Agri-Fisheries and Arts", "Home Economics", "Industrial Arts"]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-yellow-300 selection:text-slate-900 scroll-smooth">
            <Head title="Welcome | CED E-Services" />
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

                {/* About CLSU Section */}
                <section id="about-clsu" className="py-20 px-6 md:px-12 bg-slate-50 border-b border-slate-200/60 scroll-mt-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col items-center mb-16">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight text-center">Central Luzon State University</h2>
                                <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                            </div>
                            <p className="text-slate-500 text-center mt-3 text-sm md:text-base">Excellentia, Virtus, et Ministerium</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-800">
                            {/* Mission */}
                            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-400/5 transition-all duration-300 shadow-sm group">
                                <div className="w-14 h-14 bg-amber-50 group-hover:bg-yellow-100 rounded-xl flex items-center justify-center mb-6 border border-amber-100 group-hover:border-yellow-300 transition-colors">
                                    <svg className="w-7 h-7 text-amber-500 group-hover:text-yellow-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="font-black text-slate-900 mb-4 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <span className="w-4 h-1 bg-yellow-400 rounded-full"></span>
                                    Mission
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                    CLSU shall develop globally competitive, work-ready, socially-responsible and empowered human resources who value life-long learning; and to generate, disseminate, and apply knowledge and technologies for poverty alleviation, environmental protection, and sustainable development.
                                </p>
                            </div>

                            {/* Vision */}
                            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-400/5 transition-all duration-300 shadow-sm md:-translate-y-4 group">
                                <div className="w-14 h-14 bg-amber-50 group-hover:bg-yellow-100 rounded-xl flex items-center justify-center mb-6 border border-amber-100 group-hover:border-yellow-300 transition-colors">
                                    <svg className="w-7 h-7 text-amber-500 group-hover:text-yellow-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <h3 className="font-black text-slate-900 mb-4 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <span className="w-4 h-1 bg-yellow-400 rounded-full"></span>
                                    Vision
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                    CLSU as a world-class National Research University for science and technology in agriculture and allied fields.
                                </p>
                            </div>

                            {/* Philosophy */}
                            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-400/5 transition-all duration-300 shadow-sm group">
                                <div className="w-14 h-14 bg-amber-50 group-hover:bg-yellow-100 rounded-xl flex items-center justify-center mb-6 border border-amber-100 group-hover:border-yellow-300 transition-colors">
                                    <svg className="w-7 h-7 text-amber-500 group-hover:text-yellow-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="font-black text-slate-900 mb-4 uppercase tracking-widest text-sm flex items-center gap-2">
                                    <span className="w-4 h-1 bg-yellow-400 rounded-full"></span>
                                    Philosophy
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                    The ultimate measure of the effectiveness of Central Luzon State University as an institution of higher learning is its contribution to and impact on the educational, economic, social, cultural, political and moral well-being and environmental consciousness of the peoples it serves.
                                </p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                                <h3 className="text-2xl font-black text-green-800 mb-4">A Center of Excellence</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    Since 1950, the College of Education (CED) has been a leading institution in training highly qualified educators and professionals. Officially established in 1964, it has since expanded its programs to meet the evolving needs of the Philippine education system.
                                </p>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Today, CED is proudly recognized as a <strong>Center of Excellence (COE)</strong> in Teacher Education, continuing to uphold academic excellence, research, and community engagement.
                                </p>
                                <div className="mt-6 pt-6 border-t border-slate-200/60">
                                    <p className="text-sm text-slate-700"><strong>Dean:</strong> Dr. Florante P. Ibarra</p>
                                    <p className="text-sm text-slate-700 mt-1"><strong>Registrar:</strong> Dr. Abegail V. Dela Fuente</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 shadow-sm">
                                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Goals of the College
                                </h3>
                                <ul className="space-y-3 text-slate-600 text-sm">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <span>Train future educators across all levels of education.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <span>Provide quality teacher education responsive to national needs.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <span>Promote research, instruction, and development.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></div>
                                        <span>Disseminate knowledge through extension and networking.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <div className="bg-green-50/50 p-8 rounded-2xl border border-green-100 shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Academic Departments & Heads
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                                        <span className="text-xs font-black text-green-700 tracking-wider">DEPP</span>
                                        <p className="text-[11px] text-slate-500 font-medium mb-2 uppercase leading-tight">Education Policy & Practice</p>
                                        <p className="text-sm font-bold text-slate-800">Dr. Jennifer V. Fajanela</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                                        <span className="text-xs font-black text-green-700 tracking-wider">DECEE</span>
                                        <p className="text-[11px] text-slate-500 font-medium mb-2 uppercase leading-tight">Early Childhood & Elem.</p>
                                        <p className="text-sm font-bold text-slate-800">Dr. Verjun J. Dilla</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                                        <span className="text-xs font-black text-green-700 tracking-wider">DLCAED</span>
                                        <p className="text-[11px] text-slate-500 font-medium mb-2 uppercase leading-tight">Language, Culture & Arts</p>
                                        <p className="text-sm font-bold text-slate-800">Dr. Myla L. Santos</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                                        <span className="text-xs font-black text-green-700 tracking-wider">DSED</span>
                                        <p className="text-[11px] text-slate-500 font-medium mb-2 uppercase leading-tight">Science Education</p>
                                        <p className="text-sm font-bold text-slate-800">Dr. Edwin D. Ibañez</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                                        <span className="text-xs font-black text-green-700 tracking-wider">DTLLSED</span>
                                        <p className="text-[11px] text-slate-500 font-medium mb-2 uppercase leading-tight">Tech, Livelihood & Life Skills</p>
                                        <p className="text-sm font-bold text-slate-800">Dr. Ma. Catalina D. Cadiz</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                                        <span className="text-xs font-black text-green-700 tracking-wider">DSPED</span>
                                        <p className="text-[11px] text-slate-500 font-medium mb-2 uppercase leading-tight">Sports & Physical Ed.</p>
                                        <p className="text-sm font-bold text-slate-800">Dr. Jennifer T. De Jesus</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-yellow-50/50 p-8 rounded-2xl border border-yellow-100 shadow-sm flex flex-col justify-center">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">CLSU Laboratory for Teaching and Learning (CLTL)</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    CED houses the CLTL which serves as the premier venue for teaching practice, research, and innovation in education. It includes:
                                </p>
                                <ul className="space-y-2 text-slate-600 text-sm font-medium">
                                    <li>• Agricultural Science and Technology School (CLTL-ASTS)</li>
                                    <li>• University Science High School (CLTL-USHS)</li>
                                </ul>
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
                <section id="courses" className="py-20 px-6 md:px-12 bg-slate-50 border-t border-slate-200/60 scroll-mt-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col items-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 text-center">Academic Programs</h2>
                            <p className="text-slate-500 text-center text-sm md:text-base max-w-2xl">Discover our comprehensive degree programs designed to mold the next generation of educators, leaders, and innovators.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                            {courses.map((course, index) => {
                                const hasMajors = course.majors.length > 0;
                                const isOpen = openCourse === index;

                                return (
                                    <div key={index} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-yellow-400 shadow-lg ring-4 ring-yellow-400/10' : 'border-slate-200 shadow-sm hover:border-yellow-300 hover:shadow-md'}`}>
                                        <button
                                            className="w-full p-6 flex items-start gap-4 text-left focus:outline-none group"
                                            onClick={() => setOpenCourse(isOpen ? null : index)}
                                        >
                                            <div className={`p-3 rounded-xl shrink-0 transition-colors ${isOpen ? 'bg-yellow-100' : 'bg-slate-50 group-hover:bg-yellow-50'}`}>
                                                {course.icon}
                                            </div>
                                            <div className="flex-grow pt-1">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="text-xs font-bold text-yellow-600 tracking-widest uppercase">{course.acronym}</span>
                                                    <svg
                                                        className={`w-5 h-5 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-yellow-600' : 'group-hover:text-yellow-500'}`}
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-bold text-slate-900 leading-snug">{course.title}</h3>
                                            </div>
                                        </button>

                                        <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}>
                                            <div className="pt-4 border-t border-slate-100">
                                                <p className="text-sm text-slate-600 leading-relaxed mb-4">{course.desc}</p>
                                                
                                                {hasMajors && (
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                            Available Majors
                                                        </span>
                                                        <ul className="space-y-2">
                                                            {course.majors.map((major, i) => (
                                                                <li key={i} className="text-sm text-slate-700 flex items-center gap-2 font-medium">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"></div>
                                                                    {major}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                                    <div key={announcement.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col h-full">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-600 group-hover:bg-yellow-400 transition-colors"></div>
                                        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block mb-2">{announcement.date}</span>
                                        <h3 className="font-bold text-slate-900 text-lg mb-3 leading-snug">{announcement.title}</h3>
                                        <div className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 quill-content overflow-hidden" dangerouslySetInnerHTML={{ __html: announcement.content || '' }} />
                                        
                                        <div className="mt-auto pt-2 border-t border-slate-50">
                                            <button 
                                                onClick={() => setSelectedAnnouncement(announcement)}
                                                className="text-sm font-bold text-yellow-600 hover:text-yellow-700 transition-colors flex items-center gap-1"
                                            >
                                                Read Full Announcement
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
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
                <FAQSection />
            </main>

            <Footer />

            {/* AI CHATBOT */}
            <Chatbox />

            {/* ANNOUNCEMENT MODAL */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Announcement</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">{selectedAnnouncement.date}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAnnouncement(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 sm:p-8 space-y-4 text-sm text-slate-600 custom-scrollbar flex-1 bg-white">
                            <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{selectedAnnouncement.title}</h4>
                            <div className="leading-relaxed text-slate-700 text-base quill-content overflow-hidden" dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content || '' }} />
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                            <button 
                                onClick={() => setSelectedAnnouncement(null)} 
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-md text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}