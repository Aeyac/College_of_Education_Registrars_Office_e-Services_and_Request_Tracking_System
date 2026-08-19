import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-[#f0f8ff] py-4 px-6 md:px-12 w-full top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        {/* Placeholder for Logos */}
                        <img src="/images/cedlogo.png" alt="CED Logo" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <Link href="#" className="hover:text-blue-600 transition-colors">Services</Link>
                    <Link href="#" className="hover:text-blue-600 transition-colors">E-Services</Link>
                    <Link href="#" className="hover:text-blue-600 transition-colors">About</Link>
                    <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
                    <Link href="#" className="hover:text-blue-600 transition-colors">Announcements</Link>
                </nav>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                    <Link href={route('login')} className="px-6 py-2 bg-[#1e3a5f] text-white rounded-full hover:bg-slate-800 transition-all shadow-sm">
                        Login
                    </Link>
                    <Link href={route('register')} className="px-6 py-2 border border-blue-400 text-blue-600 rounded-full hover:bg-blue-50 transition-all">
                        Register
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-gray-700 focus:outline-none" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg py-4 px-6 flex flex-col gap-4 text-sm font-medium text-gray-700 z-50">
                    <Link href="/" className="hover:text-blue-600">Home</Link>
                    <Link href="#" className="hover:text-blue-600">Services</Link>
                    <Link href="#" className="hover:text-blue-600">E-Services</Link>
                    <Link href="#" className="hover:text-blue-600">About</Link>
                    <Link href="#" className="hover:text-blue-600">Contact</Link>
                    <Link href="#" className="hover:text-blue-600">Announcements</Link>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <Link href={route('login')} className="text-center px-6 py-2 bg-[#1e3a5f] text-white rounded-full">Login</Link>
                    <Link href={route('register')} className="text-center px-6 py-2 border border-blue-400 text-blue-600 rounded-full">Register</Link>
                </div>
            )}
        </header>
    );
}