import InfoPageLayout from '@/Components/InfoPageLayout';

const FEATURES = [
    {
        title: 'Document Requests',
        description: 'Request Internship Certificates, Copy of COBC, and other academic records effortlessly.',
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

export default function About({ userRole }) {
    return (
        <InfoPageLayout
            title="About CED E-Services"
            description="Learn more about our mission and digital platform."
            userRole={userRole}
        >
            <p className="text-lg text-slate-700 mb-10 leading-relaxed">
                Welcome to the <strong className="text-slate-900">College of Education (CED) E-Services Portal</strong>.
                Our platform is designed to provide students and alumni with a seamless, efficient, and digital-first
                approach to academic and registrar services.
            </p>

            <h3 className="text-xl font-extrabold text-slate-900 mb-4">Our Mission</h3>
            <p className="text-slate-600 mb-12 leading-relaxed">
                We aim to streamline the process of requesting vital academic documents, scheduling faculty
                consultations, and tracking the progress of your submissions. By digitizing these core processes,
                we eliminate long queues, reduce paperwork, and empower you to manage your academic journey from
                anywhere, at any time.
            </p>

            <h3 className="text-xl font-extrabold text-slate-900 mb-6">What We Offer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {FEATURES.map((feature) => (
                    <div key={feature.title} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 mb-5">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={feature.path} />
                            </svg>
                        </div>
                        <strong className="block text-slate-900 text-base mb-2 font-bold">{feature.title}</strong>
                        <span className="text-sm text-slate-500 leading-relaxed block">{feature.description}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mt-12 mb-6">Meet the Development Team</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
                The CED E-Services Portal was conceptualized, designed, and brought to life by a dedicated team of
                aspiring IT professionals. Driven by the goal to modernize academic transactions, this system stands
                as a testament to their collaboration and technical expertise.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {TEAM.map((member) => (
                    <div key={member.name} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <strong className="block text-slate-900 text-lg">{member.name}</strong>
                        <span className={`text-sm font-semibold mt-1 block ${member.lead ? 'text-yellow-600' : 'text-slate-500'}`}>
                            {member.role}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                <h4 className="font-extrabold text-yellow-800 text-lg mb-2 mt-0">Commitment to Excellence</h4>
                <p className="text-yellow-700 text-sm leading-relaxed m-0">
                    The CED Registrar's Office remains committed to providing transparent, prompt, and secure services
                    tailored to the needs of our future educators and esteemed alumni.
                </p>
            </div>
        </InfoPageLayout>
    );
}