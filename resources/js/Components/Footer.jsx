import { Link } from '@inertiajs/react';

export default function Footer() {
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
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Privacy Policy</Link>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Terms of Service</Link>
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
                        <a href='mailto:your.email@gmail.com'>info@cedservices.com</a>
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
        </footer>
    );
}