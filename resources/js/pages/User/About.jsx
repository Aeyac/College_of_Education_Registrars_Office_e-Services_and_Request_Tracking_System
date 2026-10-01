import InfoPageLayout from '@/Components/InfoPageLayout';

const FEATURES = [
    {
        title: 'Document Requests',
        description: 'Request Internship Certificates, Copy of COPC, and other academic records effortlessly.',
        path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
        title: 'Real-Time Tracking',
        description: 'Monitor the status of your requests from the moment of submission to its release.',
        path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    },
    {
        title: 'Faculty Schedules',
        description: 'View up-to-date consultation hours to properly coordinate with your professors.',
        path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
        title: 'Alumni Verification',
        description: 'A dedicated portal for graduates to secure necessary documents for employment.',
        path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
];

const TEAM = [
    { name: 'Jay-ar S. De Guzman', role: 'Scrum Master | Frontend & Backend Developer', lead: true },
    { name: 'Mel Joseph T. Velasco', role: 'Frontend & Backend Developer' },
    { name: 'Aaron A. Castro', role: 'Lead Full-Stack Developer' },
    { name: 'Reazel Keith D. Herbas', role: 'Frontend Developer' },
    { name: 'Dan Loyd S. Francia', role: 'Frontend Developer' },
    { name: 'Sheryn Mae P. De Vera', role: 'Documentator & Frontend Developer' },
    { name: 'Jayveelyn C. Vicente', role: 'Quality Assurance (QA)' },
];

export default function About() {
    return (
        <InfoPageLayout
            title="About CED E-Services"
            description="Learn more about our mission and digital platform."
        >

            {/* Mission Statement */}
            <div className="mb-14">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-700 mb-1">Our Purpose</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Our Mission</h3>
                <p className="text-slate-600 leading-relaxed max-w-4xl text-sm sm:text-base">
                    We aim to streamline the process of requesting vital academic documents, scheduling faculty consultations, and tracking the progress of your submissions. By digitizing these core processes, we eliminate long queues, reduce paperwork, and empower you to manage your academic journey from anywhere, at any time.
                </p>
            </div>

            {/* Features Section */}
            <div className="mb-14">
                <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-yellow-700 mb-1">Services</p>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">What We Offer</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {FEATURES.map((feature) => (
                        <div
                            key={feature.title}
                            className="group block w-full min-w-0 text-left p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl transition-all duration-200 hover:border-yellow-300 hover:shadow-md cursor-default"
                        >
                            <div className="flex items-start gap-4 min-w-0">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-yellow-50 border border-yellow-100 text-yellow-700 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                                    <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={feature.path} />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug break-words">{feature.title}</h3>
                                    <p className="mt-1 text-xs text-slate-600 leading-relaxed break-words">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Section */}
            <div className="mb-14">
                <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-yellow-700 mb-1">Contributors</p>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Meet the Development Team</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
                        The CED E-Services Portal was conceptualized, designed, and brought to life by a dedicated team of IT professionals driven to modernize academic transactions.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TEAM.map((member) => {
                        const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                        return (
                            <div
                                key={member.name}
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all duration-200 group flex flex-col justify-between"
                            >
                                <div>
                                    <h4 className="text-slate-900 text-sm font-extrabold group-hover:text-yellow-700 transition-colors">
                                        {member.name}
                                    </h4>
                                    <p className="text-xs text-yellow-800 font-bold mt-1">
                                        {member.role}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100">
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                        BS Information Technology
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                                        Software Systems & Web Applications Engineering
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Commitment Banner */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400" />
                <h4 className="font-extrabold text-yellow-950 text-base sm:text-lg mb-2 tracking-tight">Commitment to Excellence</h4>
                <p className="text-yellow-900 text-xs sm:text-sm leading-relaxed font-medium">
                    The CED Registrar's Office remains committed to providing transparent, prompt, and secure services tailored to the needs of our future educators and esteemed alumni.
                </p>
            </div>
        </InfoPageLayout>
    );
}