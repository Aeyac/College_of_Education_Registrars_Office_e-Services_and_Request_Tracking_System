import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Add scroll listener for glass effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-slate-50 py-5'} px-6 md:px-12`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <img src="/images/cedlogo.png" alt="CED Logo" className="w-11 h-11 rounded-full object-cover border-2 border-yellow-400 shadow-sm" />
                    <span className="font-bold text-slate-900 text-lg tracking-tight hidden sm:block">CED E-Services</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                    <Link href="/" className="hover:text-yellow-500 transition-colors">Home</Link>
                    <Link href="#" className="hover:text-yellow-500 transition-colors">Services</Link>
                    <Link href="#" className="hover:text-yellow-500 transition-colors">E-Services</Link>
                    <Link href="#" className="hover:text-yellow-500 transition-colors">About</Link>
                    <Link href="#" className="hover:text-yellow-500 transition-colors">Contact</Link>
                </nav>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4 text-sm font-bold">
                    <Link href={route('login')} className="px-6 py-2.5 text-slate-700 hover:text-yellow-600 transition-colors">
                        Login
                    </Link>
                    <Link href={route('register')} className="px-6 py-2.5 bg-yellow-400 text-slate-900 rounded-full hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg">
                        Register
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-slate-800 p-2 focus:outline-none" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-[100%] left-0 w-full bg-white shadow-xl py-6 px-6 flex flex-col gap-5 text-base font-semibold text-slate-700 z-50 border-t border-slate-100">
                    <Link href="/" className="hover:text-yellow-500">Home</Link>
                    <Link href="#" className="hover:text-yellow-500">Services</Link>
                    <Link href="#" className="hover:text-yellow-500">E-Services</Link>
                    <Link href="#" className="hover:text-yellow-500">About</Link>
                    <Link href="#" className="hover:text-yellow-500">Contact</Link>
                    <div className="h-px bg-slate-100 my-2"></div>
                    <Link href={route('login')} className="text-center px-6 py-3 bg-slate-100 text-slate-800 rounded-full">Login</Link>
                    <Link href={route('register')} className="text-center px-6 py-3 bg-yellow-400 text-slate-900 rounded-full">Register</Link>
                </div>
            )}
        </header>
    );
}