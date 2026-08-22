// resources/js/Components/LegalModal.jsx
import React from 'react';

export default function LegalModal({
    isOpen,
    onClose,
    agreedTerms,
    setAgreedTerms,
    agreedPrivacy,
    setAgreedPrivacy,
    showCheckboxes = true
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">Terms & Privacy Policy</h3>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 shadow-sm border border-slate-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Scrollable Document Content */}
                <div className="overflow-y-auto p-6 sm:p-8 space-y-10 text-sm text-slate-600 custom-scrollbar flex-1 bg-white">
                    
                    {/* Terms of Service Section */}
                    <section>
                        <h4 className="text-xl font-black text-slate-900 mb-1">Terms and Conditions for CED E-Services</h4>
                        <p className="mb-6 leading-relaxed text-slate-700">By accessing or using the CED E-Services platform, you agree to comply with and be bound by the following Terms and Conditions.</p>

                        <div className="space-y-6">
                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">1. Services Provided</h5>
                                <p className="mb-2">CED E-Services provides an online system allowing users to:</p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600 marker:text-yellow-500">
                                    <li>Submit official requests for documents.</li>
                                    <li>Schedule appointments or meetings with designated representatives.</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">2. User Responsibilities</h5>
                                <p className="mb-2">By submitting any request or scheduling an appointment, you agree that:</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-yellow-500">
                                    <li><strong className="text-slate-700">Accuracy:</strong> All information, identifiers, and supporting details you provide are accurate, truthful, and complete.</li>
                                    <li><strong className="text-slate-700">Identity Verification:</strong> You are requesting documents or appointments only for yourself or as an authorized representative. Providing fraudulent or misleading information may result in cancellation of requests and reporting to relevant authorities.</li>
                                    <li><strong className="text-slate-700">Account Security:</strong> You are responsible for keeping any registration reference numbers or login credentials confidential.</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">3. Document Requests & Processing</h5>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-yellow-500">
                                    <li>Processing times for requested documents may vary depending on availability, administrative verification, or peak schedules.</li>
                                    <li>Submitting a request does not guarantee immediate document release if prerequisites, clearance, or fees (if applicable) are not met.</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">4. Meeting Scheduling & Attendance</h5>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-yellow-500">
                                    <li>Scheduled appointments are subject to administrative availability and confirmation.</li>
                                    <li>Users are expected to arrive on time for scheduled meetings. Missed appointments may require rescheduling through the system.</li>
                                    <li>CED E-Services reserves the right to reschedule or cancel appointments due to unexpected operational changes.</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">5. Prohibited Activities</h5>
                                <p className="mb-2">Users must not:</p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600 marker:text-yellow-500">
                                    <li>Use the site to submit false, malicious, or spam requests.</li>
                                    <li>Attempt to gain unauthorized access to site infrastructure, databases, or other users' data.</li>
                                    <li>Interfere with the proper operation of the registration service.</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">6. Limitation of Liability</h5>
                                <p className="leading-relaxed">CED E-Services is provided on an "as is" and "as available" basis. We are not liable for delays, temporary downtime, or service disruptions caused by technical failures, incomplete user information, or external events beyond our control.</p>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">7. Changes to Terms</h5>
                                <p className="leading-relaxed">We reserve the right to update or modify these Terms and Conditions at any time. Continued use of the platform after updates constitutes acceptance of the modified terms.</p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-slate-200 border-dashed" />

                    {/* Privacy Policy Section */}
                    <section>
                        <h4 className="text-xl font-black text-slate-900 mb-1">Privacy Policy for CED E-Services</h4>
                        <p className="mb-6 leading-relaxed text-slate-700">CED E-Services ("we," "our," or "us") operates the website and online services for processing document requests and scheduling meetings. This Privacy Policy outlines how we collect, use, and protect your information when you access or use our platform.</p>

                        <div className="space-y-6">
                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">1. Information We Collect</h5>
                                <p className="mb-2">We collect personal information that you directly provide when submitting requests or scheduling appointments:</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-yellow-500">
                                    <li><strong className="text-slate-700">Contact Information:</strong> Full name, email address, phone number, and physical mailing address (if physical document delivery is required).</li>
                                    <li><strong className="text-slate-700">Identification Details:</strong> Student, employee, or reference numbers necessary to verify your record for document issuance.</li>
                                    <li><strong className="text-slate-700">Appointment Details:</strong> Date, time, reason for meeting, and any supporting notes submitted during registration.</li>
                                    <li><strong className="text-slate-700">Technical Data:</strong> IP address, browser type, and standard server log data collected automatically when accessing the site.</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">2. How We Use Your Information</h5>
                                <p className="mb-2">Your data is used strictly for administrative and operational purposes, including:</p>
                                <ul className="list-disc pl-5 space-y-1 text-slate-600 marker:text-yellow-500">
                                    <li>Processing, issuing, and verifying your requested official documents.</li>
                                    <li>Confirming, rescheduling, or managing your requested meeting slots.</li>
                                    <li>Sending system notifications, status updates, and administrative reminders.</li>
                                    <li>Maintaining system security and preventing unauthorized access.</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">3. Sharing and Disclosure</h5>
                                <p className="mb-2">We do not sell, rent, or trade your personal information. We may share data under the following conditions:</p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-yellow-500">
                                    <li><strong className="text-slate-700">Authorized Staff:</strong> Internal administrators and officials responsible for fulfilling document requests or attending meetings.</li>
                                    <li><strong className="text-slate-700">Legal Requirements:</strong> When required by applicable laws, regulations, or lawful court orders.</li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">4. Data Security & Retention</h5>
                                <p className="leading-relaxed">We implement security measures designed to safeguard your personal records against unauthorized disclosure, alteration, or access. Your data is retained only for as long as necessary to fulfill document requests, record-keeping requirements, or legal compliance.</p>
                            </div>

                            <div>
                                <h5 className="font-bold text-slate-900 mb-2">5. Your Rights</h5>
                                <p className="leading-relaxed">Depending on applicable local regulations, you have the right to request access to, correction of, or deletion of your personal data maintained on our platform, subject to identity verification and valid record-keeping obligations.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Checkboxes (For Registration) */}
                {showCheckboxes && (
                    <div className="p-6 sm:p-8 border-t border-slate-100 bg-white shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                        <div className="flex flex-col gap-3 mb-6">
                            <label className="flex items-center cursor-pointer group p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                <input
                                    type="checkbox"
                                    checked={agreedTerms}
                                    onChange={(e) => setAgreedTerms(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-yellow-500 focus:ring-yellow-400 transition-colors cursor-pointer"
                                />
                                <span className="ml-3 font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">I have read and agree to the Terms of Service.</span>
                            </label>
                            <label className="flex items-center cursor-pointer group p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                <input
                                    type="checkbox"
                                    checked={agreedPrivacy}
                                    onChange={(e) => setAgreedPrivacy(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-yellow-500 focus:ring-yellow-400 transition-colors cursor-pointer"
                                />
                                <span className="ml-3 font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">I have read and agree to the Privacy Policy.</span>
                            </label>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-yellow-500/20 text-sm uppercase tracking-wide"
                        >
                            Confirm Selections & Close
                        </button>
                    </div>
                )}
                
                {/* Footer Simple (For Login) */}
                {!showCheckboxes && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-md text-sm"
                        >
                            Close Document
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}