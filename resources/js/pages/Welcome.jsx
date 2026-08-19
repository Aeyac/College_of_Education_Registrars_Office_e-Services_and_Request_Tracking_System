import { Head, Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function Welcome({ auth }) {
    const services = [
        { title: "Appointment Consultations", desc: "Calendar with video call an appointment on video calendar.", icon: "📅" },
        { title: "Form Requests & Submissions", desc: "Form requests opened appointments, constraints, and submissions.", icon: "📝" },
        { title: "Student Portal Access", desc: "Dashboard with user access online your accounts.", icon: "💻" },
        { title: "Document Requests", desc: "Certificate, Transcript and certificate document requests.", icon: "📄" },
        { title: "Academic Calendar", desc: "Calendar portal to share your academic schedule.", icon: "🗓️" },
    ];

    const benefits = [
        { title: "24/7 Access", desc: "Access appointments and documents anytime.", icon: "⏰" },
        { title: "Convenience", desc: "Convenience in online appointment scheduling.", icon: "🖥️" },
        { title: "Effortless Process", desc: "Provides hassle-free appointment and submission processes.", icon: "✅" },
        { title: "Stay Connected", desc: "Stay connected online via your portal seamlessly.", icon: "📱" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-yellow-300 selection:text-slate-900">
            <Head title="Welcome - CED E-Services" />

            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-12 md:pt-16 pb-20 px-6 md:px-12 w-full overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-orange-50">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
                        <div className="w-full md:w-1/2 flex flex-col gap-6 items-start">
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
                                WELCOME TO <br /> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-300">
                                    CED E-SERVICES
                                </span>
                            </h1>
                            <p className="text-slate-600 text-lg md:text-xl max-w-md font-medium leading-relaxed">
                                Your Digital Hub for Online Appointments, Form Requests, and College Resources.
                            </p>
                            <Link href={route('register')} className="mt-4 px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 font-bold rounded-full transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(234,179,8,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(234,179,8,0.6)] hover:-translate-y-1">
                                GET STARTED
                            </Link>
                        </div>
                        <div className="w-full md:w-1/2 relative flex justify-center mt-12 md:mt-0">
                            {/* Decorative Glow Elements */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300 to-orange-200 rounded-full blur-[80px] opacity-40"></div>
                            <div className="relative w-full max-w-lg aspect-video bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl overflow-hidden shadow-2xl shadow-yellow-900/10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="/images/cedbuilding.jpg"
                                    alt="CED Building"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key E-Services Section */}
                <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-2 h-8 bg-yellow-400 rounded-full"></div>
                        <h2 className="text-3xl font-bold text-slate-900">Key E-Services</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {services.map((service, index) => (
                            <div key={index} className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-xl hover:shadow-yellow-900/5 transition-all duration-300 hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-50 text-3xl rounded-2xl flex items-center justify-center mb-5 text-yellow-600 group-hover:scale-110 transition-transform duration-300">
                                    {service.icon}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-3 leading-snug">{service.title}</h3>
                                <p className="text-sm text-slate-500 mb-6 flex-grow">{service.desc}</p>
                                <button className="px-5 py-2 bg-slate-50 text-slate-700 text-sm font-semibold rounded-full group-hover:bg-yellow-400 group-hover:text-slate-900 transition-colors w-full mt-auto">
                                    Learn More
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-200/60">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-2 h-8 bg-yellow-400 rounded-full"></div>
                        <h2 className="text-3xl font-bold text-slate-900">Benefits</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start hover:shadow-lg hover:shadow-yellow-900/5 transition-all duration-300">
                                <div className="w-12 h-12 bg-yellow-400/20 text-2xl rounded-xl flex items-center justify-center mb-4">
                                    {benefit.icon}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2 text-lg">{benefit.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}