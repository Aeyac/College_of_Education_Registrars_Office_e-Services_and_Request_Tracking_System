import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Chatbox from '@/Components/Chatbox';
import FAQSection from '@/pages/FAQSection';

/* ---------- Icons ---------- */
const PATHS = {
    file: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    upload: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
    tracking: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    message: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
    checkCircle: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    chat: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    megaphone: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    arrow: 'M14 5l7 7m0 0l-7 7m7-7H3',
    check: 'M5 13l4 4L19 7',
    close: 'M6 18L18 6M6 6l12 12',
};

function Icon({ name, className = 'w-5 h-5', strokeWidth = 2 }) {
    const d = PATHS[name];
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}>
            {(Array.isArray(d) ? d : [d]).map((p, i) => (
                <path key={i} strokeLinecap="round" strokeLinejoin="round" d={p} />
            ))}
        </svg>
    );
}

/* ---------- Shared style tokens (one hover rule for everything) ---------- */
const CARD = 'bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm';
const CARD_HOVER = `${CARD} hover:border-yellow-400`;
const ICON_BOX = 'rounded-2xl text-yellow-600 flex items-center justify-center shrink-0';
const BADGE = 'inline-flex items-center px-3 py-1.5 rounded-full text-yellow-700 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4 text-center';
const BTN_PRIMARY = 'bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-full text-center';
const BTN_SECONDARY = 'w-full py-3 px-4 rounded-xl bg-slate-50 text-slate-700 text-sm font-bold hover:bg-yellow-400 hover:text-slate-950 flex items-center justify-center gap-2';
const BTN_CLOSE = 'p-2 bg-white rounded-full text-slate-400 hover:bg-yellow-400 hover:text-slate-950 shadow-sm border border-slate-200 shrink-0';
const SECTION = 'py-16 md:py-24 px-4 sm:px-6 md:px-12 scroll-mt-20';
const SECTION_TITLE = 'text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center break-words';
const RICH_TEXT = 'quill-content overflow-hidden break-words [&_img]:max-w-full [&_img]:h-auto';

/* ---------- Static data (outside the component so it is not rebuilt each render) ---------- */
const HERO_FEATURES = [
    { icon: 'bolt', title: 'Fast Processing', desc: 'Request documents online without queuing up at the office.' },
    { icon: 'checkCircle', title: 'Real-time Tracking', desc: 'Know exactly when your requests are ready for pickup.' },
    { icon: 'chat', title: 'Direct Inquiries', desc: "Chat directly with the Registrar's Office staff for concerns." },
];

const FOUNDATION = [
    {
        title: 'Mission',
        text: 'CLSU shall develop globally competitive, work-ready, socially-responsible and empowered human resources who value life-long learning; and to generate, disseminate, and apply knowledge and technologies for poverty alleviation, environmental protection, and sustainable development.',
    },
    {
        title: 'Vision',
        text: 'CLSU as a world-class National Research University for science and technology in agriculture and allied fields.',
    },
    {
        title: 'Philosophy',
        text: 'The ultimate measure of the effectiveness of Central Luzon State University as an institution of higher learning is its contribution to and impact on the educational, economic, social, cultural, political and moral well-being and environmental consciousness of the peoples it serves.',
    },
];

const GOALS = [
    'Train future educators across all levels of education.',
    'Provide quality teacher education responsive to national needs.',
    'Promote research, instruction, and development.',
    'Disseminate knowledge through extension and networking.',
];

const DEPARTMENTS = [
    { code: 'DEPP', name: 'Education Policy & Practice', head: 'Dr. Jennifer V. Fajanela' },
    { code: 'DECEE', name: 'Early Childhood & Elem.', head: 'Dr. Verjun J. Dilla' },
    { code: 'DLCAED', name: 'Language, Culture & Arts', head: 'Dr. Myla L. Santos' },
    { code: 'DSED', name: 'Science Education', head: 'Dr. Edwin D. Ibañez' },
    { code: 'DTLLSED', name: 'Tech, Livelihood & Skills', head: 'Dr. Ma. Catalina D. Cadiz' },
    { code: 'DSPED', name: 'Sports & Physical Ed.', head: 'Dr. Jennifer T. De Jesus' },
];

const SCHOOLS = [
    { code: 'ASTS', name: 'Agricultural Science & Technology School' },
    { code: 'USHS', name: 'University Science High School' },
];

const LEADERS = [
    { icon: 'user', role: 'Dean', name: 'Dr. Florante P. Ibarra' },
    { icon: 'users', role: 'Registrar', name: 'Dr. Abegail V. Dela Fuente' },
];

// Services based strictly on the CED Registrar's Office functions
const SERVICES = [
    { title: 'Request for Internship Certificate', icon: 'file', desc: 'Initiate your request for an official internship certificate through our streamlined digital portal.' },
    { title: 'Submission of Requirements', icon: 'upload', desc: 'Upload and submit all necessary supporting documents for your requested certificate securely.' },
    { title: 'Status Tracking', icon: 'tracking', desc: 'Monitor the real-time processing status of your certificate request.' },
    { title: 'Registrar Inquiries', icon: 'message', desc: "Send direct inquiries regarding certificates to the CED Registrar's Office." },
    { title: 'Claiming Schedule', icon: 'calendar', desc: 'View availability and set your schedule for claiming or releasing approved documents.' },
];

const COURSES = [
    {
        title: 'Bachelor of Culture and Arts Education',
        acronym: 'BCAEd',
        desc: 'Prepares educators who are equipped to teach culture and arts, preserving cultural heritage and fostering artistic expression.',
        majors: [],
    },
    {
        title: 'Bachelor of Early Childhood Education',
        acronym: 'BECEd',
        desc: 'Designed to prepare educators with the foundational knowledge and skills for teaching young children, focusing on developmental and pedagogical principles.',
        majors: [],
    },
    {
        title: 'Bachelor of Elementary Education',
        acronym: 'BEEd',
        desc: 'Equips future elementary teachers with foundational pedagogical skills, deep subject matter knowledge, and the empathy needed to lay strong educational groundwork for children.',
        majors: [],
    },
    {
        title: 'Bachelor of Physical Education',
        acronym: 'BPEd',
        desc: 'Prepares educators to teach physical education, promoting physical fitness, wellness, and healthy lifestyles through movement and sports.',
        majors: [],
    },
    {
        title: 'Bachelor of Secondary Education',
        acronym: 'BSEd',
        desc: 'Prepares secondary educators who master their disciplines, integrating innovative teaching strategies to guide adolescents towards academic achievement and personal growth.',
        majors: ['English', 'Filipino', 'Mathematics', 'Science', 'Social Studies', 'Values Education'],
    },
    {
        title: 'Bachelor of Technology and Livelihood Education',
        acronym: 'BTLEd',
        desc: 'Focuses on equipping educators with skills in technical-vocational tracks, preparing students for practical life skills and technical careers.',
        majors: ['Agri-Fisheries and Arts', 'Home Economics', 'Industrial Arts'],
    },
];

/* ---------- Small reusable pieces ---------- */
function SectionHeader({ badge, title, subtitle }) {
    return (
        <div className="flex flex-col items-center mb-10 md:mb-16">
            
            {badge && <div className={BADGE}>{badge}</div>}
            <h2 className={SECTION_TITLE}>{title}</h2>
            {subtitle && <p className="text-slate-500 mt-3 sm:mt-4 text-center max-w-2xl text-base sm:text-lg">{subtitle}</p>}
        </div>
    );
}

function CardTitle({ children, className = 'text-xl' }) {
    return (
        <h3 className={`font-black text-slate-900 mb-5 flex items-center gap-3 ${className}`}>
            <span className="w-6 h-1.5 bg-yellow-400 rounded-full shrink-0"></span>
            <span className="min-w-0 break-words">{children}</span>
        </h3>
    );
}

function AnnouncementModal({ open, onClose, icon, title, date, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
            <div
                className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] max-h-[90dvh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center gap-3 border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-1 min-w-0">
                        <div className="w-10 h-10 text-yellow-600 flex items-center justify-center shrink-0">
                            <Icon name={icon} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight truncate">{title}</h3>
                            <p className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold mt-0.5 truncate">{date}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className={BTN_CLOSE} aria-label="Close">
                        <Icon name="close" strokeWidth={2.5} />
                    </button>
                </div>
                <div className="overflow-y-auto p-4 sm:p-8 space-y-4 text-sm text-slate-600 custom-scrollbar flex-1 bg-white">{children}</div>
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3.5 bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-950 font-bold rounded-xl text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------- Page ---------- */
export default function Welcome({ announcements = [], faqs = [] }) {
    const [openCourse, setOpenCourse] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-yellow-300 selection:text-slate-900 scroll-smooth overflow-x-hidden">
            <Head title="Welcome | CED E-Services" />
            <Header />

            <main className="flex-grow pt-20">
                {/* Hero Section */}
                <section id="home" className="relative min-h-[85vh] md:min-h-screen flex items-center pt-12 sm:pt-16 md:pt-24 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 w-full overflow-hidden border-b border-slate-200 scroll-mt-24">
                    <div className="absolute inset-0 z-0 pointer-events-none bg-white">
                        <img
                            src="/images/cedbuilding.png"
                            alt="CED Building Background"
                            className="absolute inset-0 w-full h-full object-cover object-bottom md:object-[center_75%]"
                        />
                        {/* Mobile fade */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/70 to-white md:hidden z-10"></div>
                        {/* Desktop fade */}
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-10 md:w-3/4"></div>
                    </div>

                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10 w-full">
                        {/* Left: text */}
                        <div className="w-full md:w-1/2 flex flex-col gap-5 sm:gap-6 items-center md:items-start text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-yellow-600 text-xs font-bold tracking-wider shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                COLLEGE OF EDUCATION
                            </div>
                            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
                                WELCOME TO <br className="hidden md:block" />
                                <span className="text-yellow-500 block mt-1 sm:mt-2 md:inline">CED E-SERVICES</span>
                            </h1>
                            <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-md font-normal leading-relaxed">
                                Your digital hub for online appointments, official document requests, and college academic resources.
                            </p>
                            <Link href={route('register')} className={`mt-2 sm:mt-4 px-10 sm:px-12 py-3.5 w-full sm:w-auto shadow-sm ${BTN_PRIMARY}`}>
                                GET STARTED
                            </Link>
                        </div>

                        {/* Right: feature card */}
                        <div className="w-full md:w-1/2 flex justify-center">
                            <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg">
                                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-5 sm:mb-6 text-left">Why use CED E-Services?</h3>
                                <ul className="space-y-5 text-left">
                                    {HERO_FEATURES.map((f) => (
                                        <li key={f.title} className="flex items-start gap-4">
                                            <div className={`w-10 h-10 !rounded-full ${ICON_BOX}`}>
                                                <Icon name={f.icon} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 text-sm">{f.title}</h4>
                                                <p className="text-slate-700 font-medium text-xs mt-1">{f.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About CLSU Section */}
                <section id="about-clsu" className={`${SECTION} bg-slate-50`}>
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col items-center mb-10 md:mb-16">
                            <div className={BADGE}>Our Foundation</div>
                            <h2 className={SECTION_TITLE}>Central Luzon State University</h2>
                            <p className="text-slate-500 text-center mt-3 sm:mt-4 text-base sm:text-lg font-medium italic tracking-wide">"Excellent service to humanity is our commitment."</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            {FOUNDATION.map((item) => (
                                <div key={item.title} className={`${CARD_HOVER} p-6 sm:p-8 md:p-10`}>
                                    <CardTitle className="text-xl tracking-wide">{item.title}</CardTitle>
                                    <p className="text-slate-600 text-base leading-relaxed font-medium">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About CED Section */}
                <section id="about" className={`${SECTION} bg-white`}>
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader badge="Our College" title="About College of Education" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                            {/* Center of Excellence */}
                            <div className={`${CARD} bg-slate-50 p-6 sm:p-8 md:p-10 flex flex-col justify-center`}>
                                <CardTitle className="text-2xl sm:text-3xl">A Center of Excellence</CardTitle>
                                <p className="text-slate-600 text-base leading-relaxed mb-4 font-medium">
                                    Since 1950, the College of Education (CED) has been a leading institution in training highly qualified educators and professionals. Officially established in 1964, it has since expanded its programs to meet the evolving needs of the Philippine education system.
                                </p>
                                <p className="text-slate-600 text-base leading-relaxed font-medium">
                                    Today, CED is proudly recognized as a <strong className="text-slate-900">Center of Excellence (COE)</strong> in Teacher Education, continuing to uphold academic excellence, research, and community engagement.
                                </p>
                                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 sm:gap-6">
                                    {LEADERS.map((p) => (
                                        <div key={p.role} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 min-w-0">
                                            <div className={`w-10 h-10 !rounded-full ${ICON_BOX}`}>
                                                <Icon name={p.icon} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-yellow-600 uppercase tracking-widest font-black mb-0.5">{p.role}</p>
                                                <p className="text-sm font-bold text-slate-800 break-words">{p.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Goals */}
                            <div className={`${CARD} p-6 sm:p-8 md:p-10 flex flex-col justify-center`}>
                                <CardTitle className="text-xl sm:text-2xl mb-6 sm:mb-8">Goals of the College</CardTitle>
                                <ul className="space-y-5 sm:space-y-6 text-slate-600 text-base font-medium">
                                    {GOALS.map((goal) => (
                                        <li key={goal} className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                                                <Icon name="check" className="w-4 h-4 text-slate-950" strokeWidth={3} />
                                            </div>
                                            <span className="pt-1">{goal}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            {/* Departments */}
                            <div className={`${CARD} p-6 sm:p-8 md:p-10 flex flex-col justify-center`}>
                                <CardTitle className="text-lg sm:text-xl mb-6">Academic Departments & Heads</CardTitle>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                    {DEPARTMENTS.map((d) => (
                                        <div key={d.code} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-yellow-400">
                                            <span className="text-xs font-black text-yellow-600 tracking-wider">{d.code}</span>
                                            <p className="text-[11px] text-slate-500 font-medium mb-1.5 uppercase leading-tight">{d.name}</p>
                                            <p className="text-sm font-bold text-slate-900">{d.head}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CLTL */}
                            <div className={`${CARD} p-6 sm:p-8 md:p-10 flex flex-col justify-center`}>
                                <CardTitle className="text-lg sm:text-xl mb-6">CLSU Laboratory for Teaching and Learning (CLTL)</CardTitle>
                                <p className="text-slate-600 text-base leading-relaxed mb-6 font-medium">
                                    CED houses the CLTL which serves as the premier venue for teaching practice, research, and innovation in education. It includes two specialized schools:
                                </p>
                                <ul className="space-y-4">
                                    {SCHOOLS.map((s) => (
                                        <li key={s.code} className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-yellow-400">
                                            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 text-yellow-600 flex items-center justify-center shrink-0">
                                                <span className="font-black text-xs">{s.code}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 min-w-0">{s.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* E-Services Section */}
                <section id="services" className={`${SECTION} bg-slate-50`}>
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader
                            badge="Core Features"
                            title="E-Services & Requests"
                            subtitle="The CED Registrar's Office provides an automated request and tracking system strictly dedicated to internship certificates and related requirements."
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {SERVICES.map((service) => (
                                <div key={service.title} className={`${CARD_HOVER} p-6 sm:p-8 flex flex-col items-start`}>
                                    <div className="flex items-center gap-2 mb-4 sm:mb-5 w-full">
                                        <div className={`w-9 h-9 !rounded-full ${ICON_BOX}`}>
                                            <Icon name={service.icon} className="w-5 h-5" strokeWidth={1.7} />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg sm:text-xl leading-snug min-w-0 break-words">
                                            {service.title}
                                        </h3>
                                    </div>
                                    <p className="text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed flex-grow">{service.desc}</p>
                                    <Link href={route('login')} className={`${BTN_SECONDARY} mt-auto`}>
                                        Access Service
                                        <Icon name="arrow" className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Academic Programs Section */}
                <section id="courses" className={`${SECTION} bg-white`}>
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader
                            title="Academic Programs"
                            subtitle="Discover our comprehensive degree programs designed to mold the next generation of educators, leaders, and innovators."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                            {COURSES.map((course, index) => {
                                const isOpen = openCourse === index;
                                return (
                                    <div
                                        key={course.acronym}
                                        className={`${CARD} hover:border-yellow-400 overflow-hidden ${isOpen ? '!border-yellow-400' : ''}`}
                                    >
                                        <button
                                            type="button"
                                            className="w-full p-6 sm:p-8 text-left focus:outline-none"
                                            aria-expanded={isOpen}
                                            onClick={() => setOpenCourse(isOpen ? null : index)}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className="text-xs font-black text-yellow-700 tracking-widest uppercase bg-yellow-50 px-2.5 py-1 rounded-md">
                                                    {course.acronym}
                                                </span>
                                                <span className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center text-lg font-bold leading-none shrink-0">
                                                    {isOpen ? '−' : '+'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-base sm:text-lg leading-snug text-slate-900">{course.title}</h3>
                                        </button>

                                        {isOpen && (
                                            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                                                <div className="pt-5 sm:pt-6 border-t border-slate-100">
                                                    <p className="text-base text-slate-600 leading-relaxed font-medium">{course.desc}</p>

                                                    {course.majors.length > 0 && (
                                                        <div className="bg-slate-50 p-4 sm:p-5 mt-5 sm:mt-6 rounded-2xl border border-slate-200">
                                                            <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Available Majors</span>
                                                            <ul className="space-y-2.5">
                                                                {course.majors.map((major) => (
                                                                    <li key={major} className="text-sm text-slate-700 flex items-center gap-3 font-semibold">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"></span>
                                                                        {major}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Announcement Section */}
                <section id="announcement" className={`${SECTION} bg-slate-50`}>
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader badge="Latest Updates" title="Registrar Announcements" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {announcements.length > 0 ? (
                                announcements.map((a) => (
                                    <div key={a.id} className={`${CARD_HOVER} overflow-hidden flex flex-col h-full`}>
                                        <div className="p-6 sm:p-8 flex flex-col h-full">
                                            <div className="flex items-center gap-2 mb-4 text-slate-400">
                                                <Icon name="calendar" className="w-4 h-4 text-yellow-700" />
                                                <span className="text-[11px] font-bold text-yellow-700 tracking-widest uppercase">{a.date}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-lg sm:text-xl mb-4 leading-snug line-clamp-2 break-words">{a.title}</h3>
                                            <div className={`text-slate-600 leading-relaxed line-clamp-3 mb-6 relative flex-grow ${RICH_TEXT}`}>
                                                <div dangerouslySetInnerHTML={{ __html: a.content || '' }} />
                                                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent"></div>
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-slate-100">
                                                <button type="button" onClick={() => setSelectedAnnouncement(a)} className={BTN_SECONDARY}>
                                                    Read Full Announcement
                                                    <Icon name="arrow" className="w-4 h-4" strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={`col-span-full flex flex-col items-center justify-center text-center px-4 py-14 sm:py-20 ${CARD}`}>
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                                        <Icon name="megaphone" className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">No active announcements</h3>
                                    <p className="text-sm text-slate-500 font-medium">Please check back later for updates from the Registrar's Office.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <FAQSection faqs={faqs} />
            </main>

            <Footer />

            {/* AI CHATBOT */}
            <Chatbox />

            {/* ANNOUNCEMENT MODAL */}
            <AnnouncementModal
                open={!!selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
                icon="megaphone"
                title="Announcement"
                date={selectedAnnouncement?.date}
            >
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-words">{selectedAnnouncement?.title}</h4>
                <div
                    className={`leading-relaxed text-slate-700 text-base ${RICH_TEXT}`}
                    dangerouslySetInnerHTML={{ __html: selectedAnnouncement?.content || '' }}
                />
            </AnnouncementModal>
        </div>
    );
}