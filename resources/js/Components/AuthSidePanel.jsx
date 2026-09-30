import { Link } from '@inertiajs/react';

const ARROW_LEFT = ['M10 19l-7-7m0 0l7-7m-7 7h18'];

function Icon({ paths, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {paths.map((d) => <path key={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />)}
        </svg>
    );
}

export default function AuthSidePanel({ title, highlight, description, label = 'Welcome Back' }) {
    return (
        <div className="hidden lg:flex lg:w-1/2 lg:h-screen lg:sticky lg:top-0 relative flex-col overflow-hidden bg-white border-r border-slate-200">
            <img src="/images/cedbuilding.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.10] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/100 via-transparent to-slate-950/10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-transparent to-transparent pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between px-10 py-8">
                <Link href="/" className="group flex items-center gap-2.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                    <Icon paths={ARROW_LEFT} className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center px-12 xl:px-16 pb-12">
                <div className="flex items-center gap-4 mb-6">
                    <img src="/images/cedlogo.png" alt="College of Education Logo" className="w-16 h-16 object-contain shrink-0" />
                    <div className="h-10 w-px bg-slate-200"></div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">College of Education</p>
                        <p className="text-xs text-slate-500 mt-0.5">Registrar e-Services Portal</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-7 h-[3px] rounded-full bg-yellow-400"></span>
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
                    </div>

                    <h2 className="text-4xl xl:text-5xl font-extrabold text-slate-950 leading-[1.08] tracking-tight max-w-lg">
                        {title}
                        {highlight && (
                            <>
                                <br />
                                <span className="text-yellow-500">{highlight}</span>
                            </>
                        )}
                    </h2>

                    <p className="mt-6 text-[15px] leading-7 text-slate-500 max-w-md">{description}</p>
                </div>

                <div className="mt-9 flex items-center gap-5">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
                            <Icon paths={['M5 12l4 4L19 6']} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">Secure</span>
                    </div>

                    <div className="w-px h-4 bg-slate-200"></div>

                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
                            <Icon paths={['M12 8v4l3 2', 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z']} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">Convenient</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 px-12 xl:px-16 pb-8">
                <div className="flex items-center justify-between border-t border-slate-200/70 pt-5">
                    <p className="text-[11px] font-medium tracking-wide text-slate-500">Central Luzon State University</p>
                </div>
            </div>
        </div>
    );
}