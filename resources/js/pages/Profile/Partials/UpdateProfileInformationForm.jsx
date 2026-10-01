import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Dialog, Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Fragment, useEffect, useRef, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);

    // Local preview URL for a newly-selected (not yet saved) image.
    const [preview, setPreview] = useState(null);
    // Whether the lightbox (click-to-view) modal is open.
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const initialValues = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        profile_picture: null,
        _method: 'patch', // Important: Spoof patch for file uploads in Laravel
    };

    const { data, setData, post, errors, processing, recentlySuccessful, reset, isDirty } =
        useForm(initialValues);

    // Build/revoke an object URL whenever a new file is selected.
    useEffect(() => {
        if (!data.profile_picture || !(data.profile_picture instanceof File)) {
            return;
        }

        const objectUrl = URL.createObjectURL(data.profile_picture);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [data.profile_picture]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_picture', file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        // Use post instead of patch to allow file upload processing via Inertia
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // The saved image now comes back through the shared `user` prop,
                // so drop the local preview and clear the file input.
                setPreview(null);
                setData('profile_picture', null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleCancel = () => {
        reset();
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // What the avatar (and lightbox) should currently show: the pending
    // preview if there is one, otherwise the saved picture.
    const currentImageSrc = preview
        ? preview
        : user.profile_picture
        ? `/storage/${user.profile_picture}`
        : null;

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
                        <button
                            type="button"
                            onClick={() => currentImageSrc && setIsViewerOpen(true)}
                            disabled={!currentImageSrc}
                            className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-100 flex-shrink-0 disabled:cursor-default"
                            title={currentImageSrc ? 'Click to view' : undefined}
                        >
                            {currentImageSrc ? (
                                <img
                                    src={currentImageSrc}
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-slate-100 text-2xl">
                                    {(user.first_name || 'U').charAt(0)}
                                </div>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 rounded-full cursor-pointer w-full"
                        />
                    </div>
                    {preview && (
                        <p className="mt-2 text-xs text-slate-500">
                            New picture selected. It won't be saved until you click Save.
                        </p>
                    )}
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

                    <SecondaryButton
                        type="button"
                        onClick={handleCancel}
                        disabled={processing || !isDirty}
                    >
                        Cancel
                    </SecondaryButton>

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

            {/* Lightbox: click-to-view the current/preview profile picture */}
            <Transition show={isViewerOpen} as={Fragment}>
                <Dialog onClose={() => setIsViewerOpen(false)} className="relative z-50">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="max-w-lg w-full">
                                {currentImageSrc && (
                                    <img
                                        src={currentImageSrc}
                                        alt="Profile picture"
                                        className="w-full h-auto rounded-lg shadow-xl"
                                    />
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </section>
    );
}