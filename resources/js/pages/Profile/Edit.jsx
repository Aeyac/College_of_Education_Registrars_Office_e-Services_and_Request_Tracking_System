import { Head } from '@inertiajs/react';
import UserLayout from '@/Layouts/UserLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    // Dynamically choose layout based on user role
    const Layout = auth.user.user_type === 'admin' ? AdminLayout : UserLayout;

    return (
        <Layout user={auth.user} userRole={auth.user.user_type}>
            <Head title="Profile Settings" />
            
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h2>
                <p className="text-xs text-slate-500 mt-1">Manage your account information, email address, and security settings.</p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
                <div className="bg-white p-6 sm:p-8 shadow-sm border border-slate-200 rounded-2xl">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="bg-white p-6 sm:p-8 shadow-sm border border-slate-200 rounded-2xl">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="bg-red-50/50 p-6 sm:p-8 shadow-sm border border-red-100 rounded-2xl">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </Layout>
    );
}