import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-300 py-16 px-6 md:px-12 w-full mt-auto border-t-[6px] border-yellow-400">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* University Section */}
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-white text-xl mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span> University
                    </h4>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Home</Link>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Central Luzon State University</Link>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Course Study</Link>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">CLSU</Link>
                </div>

                {/* Community Links */}
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-white text-xl mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Community
                    </h4>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Home</Link>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Contact</Link>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Privacy Policy</Link>
                    <Link href="#" className="hover:text-yellow-400 text-sm transition-colors w-fit">Terms of Policy</Link>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-white text-xl mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Contact
                    </h4>
                    <span className="text-sm flex items-center gap-2"><span className="text-yellow-400">📞</span> +1 234 567 8789</span>
                    <span className="text-sm flex items-center gap-2"><span className="text-yellow-400">📞</span> +1 234 567 3308</span>
                    <span className="text-sm flex items-center gap-2"><span className="text-yellow-400">✉️</span> info@cedservices.com</span>
                </div>

                {/* Social Media */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-bold text-white text-xl mb-2">Follow Us</h4>
                    <div className="flex gap-4">
                        {['f', 'X', 'in', 'ig'].map((icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-yellow-400 hover:text-slate-900 transition-all duration-300 hover:-translate-y-1">
                                <span className="font-bold text-sm">{icon}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
                <p>&copy; {new Date().getFullYear()} College of Education, CLSU. All rights reserved.</p>
                <div className="flex gap-4">
                    <Link href="#" className="hover:text-yellow-400 transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-yellow-400 transition-colors">Terms</Link>
                </div>
            </div>
        </footer>
    );
}