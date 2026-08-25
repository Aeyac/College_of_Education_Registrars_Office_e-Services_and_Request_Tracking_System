import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            profile_picture: null,
            _method: 'patch', // Important: Spoof patch for file uploads in Laravel
        });

    const submit = (e) => {
        e.preventDefault();
        // Use post instead of patch to allow file upload processing via Inertia
        post(route('profile.update'), {
            forceFormData: true, 
            preserveScroll: true
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information, email address, and profile picture.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                
                {/* Profile Picture Upload */}
                <div>
                    <InputLabel value="Profile Picture" />
                    <div className="mt-2 flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-100 flex-shrink-0">
                            {user.profile_picture ? (
                                <img src={`/storage/${user.profile_picture}`} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-slate-100 text-2xl">
                                    {(user.first_name || 'U').charAt(0)}
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setData('profile_picture', e.target.files[0])} 
                            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 rounded-full cursor-pointer w-full" 
                        />
                    </div>
                    <InputError className="mt-2" message={errors.profile_picture} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <TextInput
                            id="first_name"
                            className="mt-1 block w-full"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                            isFocused
                            autoComplete="given-name"
                        />
                        <InputError className="mt-2" message={errors.first_name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            id="last_name"
                            className="mt-1 block w-full"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            required
                            autoComplete="family-name"
                        />
                        <InputError className="mt-2" message={errors.last_name} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className="bg-slate-900 hover:bg-slate-800">Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 font-bold">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}