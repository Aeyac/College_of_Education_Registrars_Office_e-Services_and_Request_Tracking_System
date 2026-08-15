import { Head, Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function Welcome({ auth }) {
    const services = [
        { title: "Appointment Consultations", desc: "Calendar with video call an appointment on video calendar.", icon: "📅" },
        { title: "Form Requests & Submissions", desc: "Form requests opened appointments, constraints, and submissions.", icon: "📝" },
        { title: "Student Portal Access", desc: "Dashboard with user access access online your accounts.", icon: "💻" },
        { title: "Document Requests", desc: "Certificate, Transcript and certificate document requests.", icon: "📄" },
        { title: "Academic Calendar", desc: "Calendar calendar allene portal to share your b-snier calendar.", icon: "🗓️" },
    ];

    const benefits = [
        { title: "24/7 Access", desc: "Access appointments and documents anytime.", icon: "⏰" },
        { title: "Convenience", desc: "Convenience in online appointment scheduling.", icon: "🖥️" },
        { title: "Effortless Process", desc: "Provides hassle-free appointment and submission processes.", icon: "✅" },
        { title: "Stay Connected", desc: "Stay connected online via your portal seamlessly.", icon: "📱" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Head title="Welcome - CED E-Services" />
            
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-[#f0f8ff] pt-8 pb-16 px-6 md:px-12 w-full overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/2 flex flex-col gap-6 items-start z-10">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1e3a5f] leading-tight">
                                WELCOME TO <br /> CED E-SERVICES
                            </h1>
                            <p className="text-gray-700 text-lg md:text-xl max-w-md">
                                Your Digital Hub for Online Appointments, Form Requests, and College Resources
                            </p>
                            <Link href={route('register')} className="mt-4 px-8 py-3 bg-[#4285f4] hover:bg-blue-600 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg">
                                GET STARTED
                            </Link>
                        </div>
                        <div className="w-full md:w-1/2 relative flex justify-center mt-8 md:mt-0">
                            {/* Decorative Elements */}
                            <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                            {/* Placeholder for the vector illustration in the image */}
                            <div className="relative w-full max-w-lg aspect-video bg-white/40 backdrop-blur-sm border border-white rounded-2xl shadow-sm flex items-center justify-center p-8">
                                <p className="text-slate-400 font-medium">[Vector Illustration Placeholder]</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key E-Services Section */}
                <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">Key E-Services</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 bg-blue-50 text-3xl rounded-xl flex items-center justify-center mb-4 text-blue-600">
                                    {service.icon}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2 leading-snug">{service.title}</h3>
                                <p className="text-xs text-gray-500 mb-6 flex-grow">{service.desc}</p>
                                <button className="px-5 py-1.5 bg-[#1e3a5f] text-white text-sm font-medium rounded-full hover:bg-slate-700 transition-colors w-full mt-auto">
                                    Learn More
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">Benefits</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 bg-blue-50 text-3xl rounded-xl flex items-center justify-center mb-4">
                                    {benefit.icon}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2">{benefit.title}</h3>
                                <p className="text-xs text-gray-500">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* News Feed Section / Announcement */}
                <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-100 mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">News Feed</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Feed Item 1 */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                            <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-800">College of Education, University Announcements</h4>
                                <span className="text-xs text-gray-400">3 hours ago</span>
                            </div>
                        </div>
                        {/* Feed Item 2 */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-xl flex-shrink-0"></div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-800">College of Education University Update</h4>
                                <span className="text-xs text-gray-400">3 days ago</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}