import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function Footer() {
    // MODAL STATE & SCROLL LOCK LOGIC
    const [openModal, setOpenModal] = useState(null);

    useEffect(() => {
        if (openModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [openModal]);

    const closeModal = () => setOpenModal(null);

    return (
        <footer className="bg-slate-900 text-slate-400 py-12 px-6 md:px-12 w-full mt-auto ">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                {/* Brand & Info Section */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-extrabold text-white text-xl tracking-wide">
                        CED <span className="text-yellow-400">E-SERVICES</span>
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-400">
                        Central Luzon State University<br />
                        College of Education E-Services Portal
                    </p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col gap-2.5">
                    <h4 className="font-bold text-white text-base mb-1">Quick Links</h4>
                    <Link href="https://oad.clsu.edu.ph/home" className="hover:text-yellow-400 text-sm transition-colors w-fit">Central Luzon State University</Link>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Academic Services</Link>
                    
                    {/* MODAL TRIGGERS (Maintained your exact classes, just added text-left outline-none) */}
                    <button onClick={() => setOpenModal('about')} className="hover:text-yellow-400 text-sm transition-colors w-fit text-left outline-none">
                        About CED E-Services
                    </button>
                    <button onClick={() => setOpenModal('privacy')} className="hover:text-yellow-400 text-sm transition-colors w-fit text-left outline-none">
                        Privacy Policy
                    </button>
                    <button onClick={() => setOpenModal('terms')} className="hover:text-yellow-400 text-sm transition-colors w-fit text-left outline-none">
                        Terms of Service
                    </button>
                </div>

                {/* Contact Information */}
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-white text-base mb-1">Contact Us</h4>
                    <div className="text-sm flex items-center gap-2.5 text-slate-300">
                        <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href="tel:+1234567890">Call Us: +63 (234) 567-8901</a>

                    </div>
                    <div className="text-sm flex items-center gap-2.5 text-slate-300">
                        <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href='mailto:info@cedservices.com'>info@cedservices.com</a>
                    </div>
                </div>

                {/* Social Media */}
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-white text-base mb-1">Connect With Us</h4>
                    <div className="flex gap-3">
                        {/* Facebook */}
                        <a href="#" className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-yellow-400 hover:text-slate-900 transition-colors" aria-label="Facebook">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                            </svg>
                        </a>
                        {/* X / Twitter */}
                        <a href="#" className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-yellow-400 hover:text-slate-900 transition-colors" aria-label="Twitter">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        {/* LinkedIn */}
                        <a href="#" className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-yellow-400 hover:text-slate-900 transition-colors" aria-label="LinkedIn">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                            </svg>
                        </a>
                    </div>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 text-left text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} College of Education, Central Luzon State University. All rights reserved.</p>
            </div>

            {/* ========================================================= */}
            {/* UNIFIED MODAL COMPONENT */}
            {/* ========================================================= */}
            {openModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 sm:p-6 overflow-hidden text-left cursor-default">
                    <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <h3 className="font-extrabold text-slate-900 text-base tracking-tight m-0">
                                {openModal === 'about' && 'About CED E-Services'}
                                {openModal === 'privacy' && 'Privacy Policy'}
                                {openModal === 'terms' && 'Terms of Service'}
                            </h3>
                            <button onClick={closeModal} className="p-1.5 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200 transition-colors outline-none m-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        {/* Modal Body / Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-white text-slate-600 text-sm">
                            
                            {/* ABOUT CONTENT */}
                            {openModal === 'about' && (
                                <div className="leading-relaxed">
                                    <p className="text-base text-slate-800 font-medium mb-6">
                                        Welcome to the <strong className="text-slate-900 font-black">College of Education (CED) E-Services Portal</strong>. Our platform is designed to provide students and alumni with a seamless, efficient, and digital-first approach to academic and registrar services.
                                    </p>
                                    
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Our Mission</h3>
                                    <p className="mb-6 text-slate-600">We aim to streamline the process of requesting vital academic documents, scheduling faculty consultations, and tracking the progress of your submissions. By digitizing these core processes, we eliminate long queues, reduce paperwork, and empower you to manage your academic journey from anywhere, at any time.</p>

                                    <h3 className="text-lg font-black text-slate-900 mb-4">What We Offer</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <strong className="block text-slate-900 text-sm mb-1">Document Requests</strong>
                                            <span className="text-xs text-slate-600">Request Internship Certificates, Copy of COBC, and other academic records effortlessly.</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <strong className="block text-slate-900 text-sm mb-1">Real-Time Tracking</strong>
                                            <span className="text-xs text-slate-600">Monitor the status of your requests from the moment of submission to its release.</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <strong className="block text-slate-900 text-sm mb-1">Faculty Schedules</strong>
                                            <span className="text-xs text-slate-600">View up-to-date consultation hours to properly coordinate with your professors.</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <strong className="block text-slate-900 text-sm mb-1">Alumni Verification</strong>
                                            <span className="text-xs text-slate-600">A dedicated portal for graduates to secure necessary documents for employment.</span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 mb-3">Meet the Development Team</h3>
                                    <p className="mb-4 text-slate-600 text-xs">The CED E-Services Portal was conceptualized, designed, and brought to life by a dedicated team of aspiring IT professionals. Driven by the goal to modernize academic transactions, this system stands as a testament to their collaboration and technical expertise.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-yellow-400 transition-colors">
                                            <strong className="block text-slate-900 text-sm">JAY-AR S. DE GUZMAN</strong>
                                            <span className="text-[10px] text-slate-800 font-bold mt-0.5 block uppercase tracking-wide">Scrum Master | Full-Stack Developer</span>
                                            <span className="text-[8px] text-slate-500 font-bold mt-0.3 block uppercase tracking-wide">BS Information Technology <br /> Major in Systems Development</span>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-yellow-400 transition-colors">
                                            <strong className="block text-slate-900 text-sm">MEL JOSEPH T. VELASCO</strong>
                                            <span className="text-[10px] text-slate-800 font-bold mt-0.5 block uppercase tracking-wide">Full-Stack Developer</span>
                                            <span className="text-[8px] text-slate-500 font-bold mt-0.3 block uppercase tracking-wide">BS Information Technology <br /> Major in Systems Development</span>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-yellow-400 transition-colors">
                                            <strong className="block text-slate-900 text-sm">AARON A. CASTRO</strong>
                                            <span className="text-[10px] text-slate-800 font-bold mt-0.5 block uppercase tracking-wide">Full-Stack Developer</span>
                                            <span className="text-[8px] text-slate-500 font-bold mt-0.3 block uppercase tracking-wide">BS Information Technology <br /> Major in Systems Development</span>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-yellow-400 transition-colors">
                                            <strong className="block text-slate-900 text-sm">REAZEL KEITH D. HERBAS</strong>
                                            <span className="text-[10px] text-slate-800 font-bold mt-0.5 block uppercase tracking-wide">UI/UX Designer</span>
                                            <span className="text-[8px] text-slate-500 font-bold mt-0.3 block uppercase tracking-wide">BS Information Technology <br /> Major in Systems Development</span>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-yellow-400 transition-colors">
                                            <strong className="block text-slate-900 text-sm">DAN LOYD S. FRANCIA</strong>
                                            <span className="text-[10px] text-slate-800 font-bold mt-0.5 block uppercase tracking-wide">UI/UX Designer</span>
                                            <span className="text-[8px] text-slate-500 font-bold mt-0.3 block uppercase tracking-wide">BS Information Technology <br /> Major in Systems Development</span>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-yellow-400 transition-colors">
                                            <strong className="block text-slate-900 text-sm">SHERYN MAE P. DE VERA</strong>
                                            <span className="text-[10px] text-slate-800 font-bold mt-0.5 block uppercase tracking-wide">Documentator & UI/UX Designer</span>
                                            <span className="text-[8px] text-slate-500 font-bold mt-0.3 block uppercase tracking-wide">BS Information Technology <br /> Major in Systems Development</span>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-yellow-400 transition-colors">
                                            <strong className="block text-slate-900 text-sm">JAYVEELYN C. VICENTE</strong>
                                            <span className="text-[10px] text-slate-800 font-bold mt-0.5 block uppercase tracking-wide">Quality Assurance (QA)</span>
                                            <span className="text-[8px] text-slate-500 font-bold mt-0.3 block uppercase tracking-wide">BS Information Technology <br /> Major in Systems Development</span>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                        <h4 className="font-black text-yellow-800 text-sm mb-1">Commitment to Excellence</h4>
                                        <p className="text-yellow-700 text-xs">The CED Registrar's Office remains committed to providing transparent, prompt, and secure services tailored to the needs of our future educators and esteemed alumni.</p>
                                    </div>
                                </div>
                            )}

                            {/* PRIVACY POLICY CONTENT */}
                            {openModal === 'privacy' && (
                                <div className="leading-relaxed space-y-6">
                                    <p className="text-base text-slate-800 font-medium">
                                        CED E-Services ("we," "our," or "us") operates the website and online services for processing document requests and scheduling meetings. This Privacy Policy outlines how we collect, use, and protect your information.
                                    </p>
                                    
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">1. Information We Collect</h3>
                                        <p className="mb-2">We collect personal information that you directly provide when submitting requests or scheduling appointments:</p>
                                        <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                            <li><strong className="text-slate-800">Contact Information:</strong> Full name, email address, phone number, and physical mailing address (if physical document delivery is required).</li>
                                            <li><strong className="text-slate-800">Identification Details:</strong> Student, employee, or reference numbers necessary to verify your record for document issuance.</li>
                                            <li><strong className="text-slate-800">Appointment Details:</strong> Date, time, reason for meeting, and any supporting notes submitted during registration.</li>
                                            <li><strong className="text-slate-800">Technical Data:</strong> IP address, browser type, and standard server log data collected automatically when accessing the site.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">2. How We Use Your Information</h3>
                                        <p className="mb-2">Your data is used strictly for administrative and operational purposes, including:</p>
                                        <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                            <li>Processing, issuing, and verifying your requested official documents.</li>
                                            <li>Confirming, rescheduling, or managing your requested meeting slots.</li>
                                            <li>Sending system notifications, status updates, and administrative reminders.</li>
                                            <li>Maintaining system security and preventing unauthorized access.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">3. Sharing and Disclosure</h3>
                                        <p className="mb-2">We do not sell, rent, or trade your personal information. We may share data under the following conditions:</p>
                                        <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                            <li><strong className="text-slate-800">Authorized Staff:</strong> Internal administrators and officials responsible for fulfilling document requests or attending meetings.</li>
                                            <li><strong className="text-slate-800">Legal Requirements:</strong> When required by applicable laws, regulations, or lawful court orders.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">4. Data Security & Retention</h3>
                                        <p className="text-sm">We implement security measures designed to safeguard your personal records against unauthorized disclosure, alteration, or access. Your data is retained only for as long as necessary to fulfill document requests, record-keeping requirements, or legal compliance.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">5. Your Rights</h3>
                                        <p className="text-sm">Depending on applicable local regulations, you have the right to request access to, correction of, or deletion of your personal data maintained on our platform, subject to identity verification and valid record-keeping obligations.</p>
                                    </div>
                                </div>
                            )}

                            {/* TERMS OF SERVICE CONTENT */}
                            {openModal === 'terms' && (
                                <div className="leading-relaxed space-y-6">
                                    <p className="text-base text-slate-800 font-medium">
                                        By accessing or using the CED E-Services platform, you agree to comply with and be bound by the following Terms and Conditions.
                                    </p>
                                    
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">1. Services Provided</h3>
                                        <p className="mb-2">CED E-Services provides an online system allowing users to:</p>
                                        <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                            <li>Submit official requests for documents.</li>
                                            <li>Schedule appointments or meetings with designated representatives.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">2. User Responsibilities</h3>
                                        <p className="mb-2">By submitting any request or scheduling an appointment, you agree that:</p>
                                        <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                            <li><strong className="text-slate-800">Accuracy:</strong> All information, identifiers, and supporting details you provide are accurate, truthful, and complete.</li>
                                            <li><strong className="text-slate-800">Identity Verification:</strong> You are requesting documents or appointments only for yourself or as an authorized representative. Providing fraudulent or misleading information may result in cancellation of requests and reporting to relevant authorities.</li>
                                            <li><strong className="text-slate-800">Account Security:</strong> You are responsible for keeping any registration reference numbers or login credentials confidential.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">3. Document Requests & Processing</h3>
                                        <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                            <li>Processing times for requested documents may vary depending on availability, administrative verification, or peak schedules.</li>
                                            <li>Submitting a request does not guarantee immediate document release if prerequisites, clearance, or fees (if applicable) are not met.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">4. Meeting Scheduling & Attendance</h3>
                                        <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                            <li>Scheduled appointments are subject to administrative availability and confirmation.</li>
                                            <li>Users are expected to arrive on time for scheduled meetings. Missed appointments may require rescheduling through the system.</li>
                                            <li>CED E-Services reserves the right to reschedule or cancel appointments due to unexpected operational changes.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">5. Prohibited Activities</h3>
                                        <p className="mb-2">Users must not:</p>
                                        <ul className="list-disc pl-5 space-y-1.5 text-sm">
                                            <li>Use the site to submit false, malicious, or spam requests.</li>
                                            <li>Attempt to gain unauthorized access to site infrastructure, databases, or other users' data.</li>
                                            <li>Interfere with the proper operation of the registration service.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">6. Limitation of Liability</h3>
                                        <p className="text-sm">CED E-Services is provided on an "as is" and "as available" basis. We are not liable for delays, temporary downtime, or service disruptions caused by technical failures, incomplete user information, or external events beyond our control.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 mb-2">7. Changes to Terms</h3>
                                        <p className="text-sm">We reserve the right to update or modify these Terms and Conditions at any time. Continued use of the platform after updates constitutes acceptance of the modified terms.</p>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                            <button 
                                onClick={closeModal} 
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-md text-sm outline-none m-0"
                            >
                                Close Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
}