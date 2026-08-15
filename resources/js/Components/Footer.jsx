import { Link } from '@inertiajs/react';

export default function Footer() {
    return (
        <footer className="bg-[#1e3a5f] text-white py-12 px-6 md:px-12 w-full mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* University Section */}
                <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-lg mb-2">University</h4>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Home</Link>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Central Luzon State University</Link>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Course Study</Link>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">CLSU</Link>
                </div>

                {/* Community Links */}
                <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-lg mb-2">Community Links</h4>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Home</Link>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Contact</Link>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Privacy Policy</Link>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm transition-colors">Terms of Policy</Link>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-lg mb-2">Contact</h4>
                    <span className="text-gray-300 text-sm">+1 234 567 8789</span>
                    <span className="text-gray-300 text-sm">+1 234 567 3308</span>
                    <span className="text-gray-300 text-sm">info@socialalex.com</span>
                </div>

                {/* Social Media */}
                <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-lg mb-2">Social Media</h4>
                    <div className="flex gap-4">
                        {/* Placeholder icons using simple circles for now */}
                        <a href="#" className="w-8 h-8 rounded-full bg-white text-[#1e3a5f] flex items-center justify-center hover:bg-blue-200 transition-colors">
                            <span className="font-bold text-xs">f</span>
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-white text-[#1e3a5f] flex items-center justify-center hover:bg-blue-200 transition-colors">
                            <span className="font-bold text-xs">X</span>
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-white text-[#1e3a5f] flex items-center justify-center hover:bg-blue-200 transition-colors">
                            <span className="font-bold text-xs">in</span>
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-white text-[#1e3a5f] flex items-center justify-center hover:bg-blue-200 transition-colors">
                            <span className="font-bold text-xs">ig</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-600 flex flex-col md:flex-row justify-between text-xs text-gray-400">
                <p>College of Education, CLSU</p>
                <p>College of Education, CLSU</p>
            </div>
        </footer>
    );
}