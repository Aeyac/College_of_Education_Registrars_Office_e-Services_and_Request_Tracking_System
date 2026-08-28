import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Nilipat natin sa labas para ma-access ng scroll spy
const navLinks = [
    { href: '#home', label: 'Home' }, 
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' }, 
    { href: '#courses', label: 'Courses' },
    { href: '#announcement', label: 'Announcements' }, 
    { href: '#faq', label: 'FAQ' },
];

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('#home');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            // Scroll Spy Logic: I-track kung aling section ang kasalukuyang tinitingnan
            const scrollPosition = window.scrollY + 150; // offset para sa fixed header

            for (const link of navLinks) {
                const section = document.querySelector(link.href);
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;

                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        setActiveSection(link.href);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        // I-trigger agad on mount para ma-set ang initial active section
        handleScroll();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e, href) => {
        e.preventDefault();
        setIsOpen(false);
        setActiveSection(href); // I-set agad ang kulay bago pa mag-scroll

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
        <header className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5 lg:py-6'}`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-12">
                
                {/* Brand / Logo */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-sm overflow-hidden">
                        <img src="/images/cedlogo.png" alt="CED Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-black text-slate-900 text-lg sm:text-xl tracking-tight whitespace-nowrap">
                        CED E-Services
                    </span>
                </div>

                {/* Desktop Navigation (Floating Pill style with Active State) */}
                <nav className="hidden lg:flex items-center gap-2 xl:gap-6 bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200/60 shadow-sm">
                    {navLinks.map((l) => (
                        <a 
                            key={l.href} 
                            href={l.href} 
                            onClick={(e) => handleNavClick(e, l.href)} 
                            className={`px-3 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${
                                activeSection === l.href 
                                    ? 'text-yellow-600 bg-yellow-50' 
                                    : 'text-slate-600 hover:text-yellow-600 hover:bg-yellow-50'
                            }`}
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>

                {/* Desktop Buttons */}
                <div className="hidden lg:flex items-center gap-3 shrink-0">
                    <Link href={route('login')} className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">Login</Link>
                    <Link href={route('register')} className="px-5 py-2.5 text-sm font-bold bg-yellow-400 text-slate-900 rounded-full hover:bg-yellow-500 transition-all shadow-md">Register</Link>
                </div>

                {/* Mobile Hamburger Button */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`lg:hidden relative z-50 w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm outline-none ${isOpen ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                    aria-label="Toggle Menu"
                >
                    <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7h16M4 12h16M4 17h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Blurred Backdrop */}
                    <div className="lg:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
                    
                    {/* Floating Glassmorphic Mobile Menu Card */}
                    <div className="lg:hidden absolute top-[75px] left-4 right-4 bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl flex flex-col p-6 z-50 border border-slate-100 animate-in slide-in-from-top-4 fade-in duration-200">
                        <div className="flex flex-col gap-1.5">
                            {navLinks.map((l) => (
                                <a 
                                    key={l.href} 
                                    href={l.href} 
                                    onClick={(e) => handleNavClick(e, l.href)} 
                                    className={`px-4 py-3 text-sm font-bold rounded-2xl transition-all ${
                                        activeSection === l.href 
                                            ? 'text-yellow-600 bg-yellow-50' 
                                            : 'text-slate-700 hover:text-yellow-600 hover:bg-yellow-50'
                                    }`}
                                >
                                    {l.label}
                                </a>
                            ))}
                        </div>
                        
                        <div className="h-px bg-slate-100 my-4" />
                        
                        <div className="flex flex-col gap-3">
                            <Link href={route('login')} onClick={() => setIsOpen(false)} className="w-full text-center px-6 py-3.5 bg-slate-50 text-slate-800 font-bold rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200 text-sm">
                                Login to Portal
                            </Link>
                            <Link href={route('register')} onClick={() => setIsOpen(false)} className="w-full text-center px-6 py-3.5 bg-yellow-400 text-slate-900 font-bold rounded-2xl hover:bg-yellow-500 transition-colors shadow-md shadow-yellow-500/20 text-sm">
                                Register Account
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}