// resources/js/pages/User/StaticPage.jsx
import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';

export default function StaticPage({ title, description, content, userRole }) {
    return (
        <UserLayout userRole={userRole}>
            <Head title={title} />
            
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center shrink-0">
                        <img src="/images/cedlogo.png" alt="CED" className="w-8 h-8 rounded-full" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
                        <p className="text-xs text-slate-500 mt-1">{description}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full">
                {/* REMOVED 'prose' classes here so our custom CSS grids work perfectly */}
                <div className="bg-white border border-slate-100 p-6 sm:p-10 rounded-[2rem] shadow-sm w-full">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </UserLayout>
    );
}