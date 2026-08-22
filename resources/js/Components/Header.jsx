import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '#home', label: 'Home' }, 
        { href: '#about', label: 'About' },
        { href: '#services', label: 'Services' }, 
        { href: '#courses', label: 'Courses' },
        { href: '#announcement', label: 'Announcements' }, 
        { href: '#faq', label: 'FAQ' },
    ];

    const handleNavClick = (e, href) => {
        e.preventDefault();
        setIsOpen(false);

        const targetElement = document.querySelector(href);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            window.history.pushState(null, '', href);
        }
    };

    return (
        <header className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 px-4 sm:px-6 lg:px-12 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-slate-50 py-4 lg:py-5'}`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <img src="/images/cedlogo.png" alt="CED Logo" className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-yellow-400 shadow-sm" />
                    <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight whitespace-nowrap">CED E-Services</span>
                </div>

                <nav className="hidden lg:flex items-center gap-5 xl:gap-8 text-sm font-semibold text-slate-600">
                    {navLinks.map((l) => (
                        <a 
                            key={l.href} 
                            href={l.href} 
                            onClick={(e) => handleNavClick(e, l.href)} 
                            className="hover:text-yellow-500 transition-colors whitespace-nowrap"
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-2 xl:gap-4 text-sm font-bold shrink-0">
                    <Link href={route('login')} className="px-4 xl:px-6 py-2.5 text-slate-700 hover:text-yellow-600 transition-colors">Login</Link>
                    <Link href={route('register')} className="px-5 xl:px-6 py-2.5 bg-yellow-400 text-slate-900 rounded-full hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg whitespace-nowrap">Register</Link>
                </div>

                <button className="lg:hidden text-slate-800 p-2 focus:outline-none" aria-label="Toggle navigation menu" onClick={() => setIsOpen(!isOpen)}>
                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 top-[60px] bg-black/20 backdrop-blur-xs z-40" onClick={() => setIsOpen(false)} />
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl py-6 px-6 flex flex-col gap-4 text-base font-semibold text-slate-700 z-50 border-t border-slate-100 max-h-[calc(100vh-80px)] overflow-y-auto">
                        {navLinks.map((l) => (
                            <a 
                                key={l.href} 
                                href={l.href} 
                                onClick={(e) => handleNavClick(e, l.href)} 
                                className="hover:text-yellow-500 py-1 transition-colors"
                            >
                                {l.label}
                            </a>
                        ))}
                        <div className="h-px bg-slate-100 my-1" />
                        <div className="flex flex-col gap-3 pt-1">
                            <Link href={route('login')} onClick={() => setIsOpen(false)} className="text-center px-6 py-3 bg-slate-100 text-slate-800 rounded-full hover:bg-slate-200 transition-colors">Login</Link>
                            <Link href={route('register')} onClick={() => setIsOpen(false)} className="text-center px-6 py-3 bg-yellow-400 text-slate-900 rounded-full hover:bg-yellow-500 transition-colors shadow-sm">Register</Link>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}