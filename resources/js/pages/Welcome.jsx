import { Head, Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function Welcome({ auth }) {
    const services = [
        {
            title: "Appointment Consultations",
            desc: "Schedule online and in-person video consultations directly with college faculty.",
            icon: (
                <svg className="w-7 h-7 stroke-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            )
        },
        {
            title: "Form Requests & Submissions",
            desc: "Submit academic requests, clearance forms, and administrative applications.",
            icon: (
                <svg className="w-7 h-7 stroke-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            )
        },
        {
            title: "Student Portal Access",
            desc: "View your student records, account status, and personalized dashboard.",
            icon: (
                <svg className="w-7 h-7 stroke-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
            )
        },
        {
            title: "Document Requests",
            desc: "Request official certificates, transcripts, and evaluation documents online.",
            icon: (
                <svg className="w-7 h-7 stroke-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            title: "Academic Calendar",
            desc: "Stay updated with important college schedules, deadlines, and term dates.",
            icon: (
                <svg className="w-7 h-7 stroke-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
    ];

    const benefits = [
        {
            title: "24/7 Access",
            desc: "Submit requests and check statuses anytime, anywhere at your convenience.",
            icon: (
                <svg className="w-6 h-6 stroke-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            )
        },
        {
            title: "Convenience",
            desc: "Eliminate long queues by managing appointments digitally.",
            icon: (
                <svg className="w-6 h-6 stroke-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
            )
        },
        {
            title: "Effortless Process",
            desc: "Streamlined submission workflows for faster service turnaround.",
            icon: (
                <svg className="w-6 h-6 stroke-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "Stay Connected",
            desc: "Receive real-time notifications and direct updates on your submissions.",
            icon: (
                <svg className="w-6 h-6 stroke-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
                </svg>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Welcome - CED E-Services" />

            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-12 md:pt-16 pb-20 px-6 md:px-12 w-full overflow-hidden bg-gradient-to-br from-amber-50/60 via-white to-yellow-50/40 border-b border-slate-100">
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
                            {/* Decorative Glow Elements & Frame */}
                            <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-300 to-amber-200 rounded-2xl blur-xl opacity-30"></div>
                            <div className="relative w-full max-w-lg aspect-video bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xl">
                                <div className="relative w-full h-full rounded-xl overflow-hidden">
                                    <img
                                        src="/images/cedbuilding.jpg"
                                        alt="College of Education Building"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay Badge */}
                                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/20 font-medium">
                                        College of Education
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key E-Services Section */}
                <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Key E-Services</h2>
                    </div>

                    {/* Balanced Grid: 3-cols on medium, 3-cols on large with centered wrapping */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-start transition-shadow hover:shadow-md">
                                <div className="w-14 h-14 bg-yellow-100/70 rounded-xl flex items-center justify-center mb-6">
                                    {service.icon}
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug">{service.title}</h3>
                                <p className="text-sm text-slate-600 mb-6 leading-relaxed flex-grow">{service.desc}</p>
                                <button className="px-5 py-2.5 bg-slate-100 text-slate-800 text-sm font-semibold rounded-lg hover:bg-yellow-400 hover:text-slate-950 transition-colors w-full mt-auto">
                                    Learn More
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Benefits Section with Contrast Background */}
                <section className="pt-20 pb-32 px-6 md:px-12 bg-slate-100/70 border-t border-slate-200/60">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-2 h-7 bg-yellow-400 rounded-full"></div>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Why Use E-Services</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col items-start">
                                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-4">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-2">{benefit.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{benefit.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}