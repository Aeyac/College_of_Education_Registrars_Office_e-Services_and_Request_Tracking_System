import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import RequestDocumentModal from '@/Components/RequestDocumentModal';
import StatusHistoryTimeline from '@/Components/StatusHistoryTimeline';
import Swal from 'sweetalert2';
import openNotification from '@/Utils/openNotification';
import useLiveRefresh from '@/hooks/useLiveRefresh';
import sanitizeHtml from '@/Utils/sanitizeHtml';

const DASHBOARD_ONLY = ['stats', 'requests', 'announcements'];

const MySwal = Swal.mixin({
    customClass: {
        popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
        title: 'text-slate-900 font-extrabold text-2xl pt-4',
        htmlContainer: 'text-slate-500 text-sm font-medium',
        confirmButton: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md transition-colors outline-none',
        icon: 'border-0 scale-125 mt-6',
    },
    buttonsStyling: false,
});

const ICON_PATHS = {
    newRequest: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    inquiry: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    faq: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    close: 'M6 18L18 6M6 6l12 12',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 01-18 0 9 9 0 0118 0z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
};

const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('processing')) return 'bg-blue-100 text-blue-700';
    if (s.includes('ready') || s.includes('released')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-yellow-100 text-yellow-700';
};

function Modal({ title, onClose, maxWidth = 'max-w-md', children }) {
    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className={`bg-white w-full ${maxWidth} rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92dvh]`}>
                <div className="px-4 sm:px-6 py-4 flex justify-between items-center border-b border-slate-100 shrink-0 gap-3">
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">{title}</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors shrink-0" aria-label="Close">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS.close} /></svg>
                    </button>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">{children}</div>
            </div>
        </div>
    );
}

function StatCard({ iconPath, iconBg, iconColor, value, label, href }) {
    const Component = href ? Link : 'div';
    return (
        <Component href={href} className="bg-white border border-slate-200 px-4 py-4 sm:px-5 sm:py-5 rounded-2xl shadow-sm flex items-center gap-4 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer min-w-0">
            <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                <svg className={`w-4 h-4 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d={iconPath} /></svg>
            </div>
            <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{value || 0}</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">{label}</p>
            </div>
        </Component>
    );
}

function QuickActionButton({ iconPath, name, onClick }) {
    return (
        <button onClick={onClick} className="flex items-center gap-3 group min-w-0 w-full sm:w-auto outline-none text-left">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center group-hover:border-yellow-400 group-hover:bg-yellow-50 transition-all group-focus-visible:ring-2 ring-yellow-400 shrink-0">
                <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                </svg>
            </div>
            <span className="min-w-0 text-[11px] font-bold leading-tight text-slate-700 sm:whitespace-nowrap group-hover:text-slate-900 transition-colors">
                {name}
            </span>
        </button>
    );
}

function RequestRow({ request, onTrack }) {
    return (
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-yellow-200 transition-all min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICON_PATHS.newRequest} /></svg>
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{request.document_type}</h4>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">#{request.id} • {request.created_at}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className={`hidden sm:inline-block px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(request.status)}`}>{request.status}</span>
                <button onClick={() => onTrack(request)} className="text-yellow-700 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap">Track</button>
            </div>
        </div>
    );
}

export default function UserDashboard({ auth, requests = [], stats, services = [], announcements = [] }) {
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [trackingRequest, setTrackingRequest] = useState(null);

    // Pending/completed counters, the recent-requests list and the announcement
    // strip all change from other actors, and none of them broadcast. Suspended
    // while a modal is open so an in-progress form is never replaced.
    useLiveRefresh({
        only: DASHBOARD_ONLY,
        enabled: !isRequestModalOpen && !isCalendarModalOpen && !trackingRequest,
    });

    const quickActions = [
        { name: 'New Request', iconPath: ICON_PATHS.newRequest, action: () => setIsRequestModalOpen(true) },
        { name: 'Submit Inquiry', iconPath: ICON_PATHS.inquiry, action: () => router.visit('/user/inquiries') },
        { name: 'FAQ / Help', iconPath: ICON_PATHS.faq, action: () => router.visit('/user/faq') },
        { name: 'Academic Calendar', iconPath: ICON_PATHS.calendar, action: () => setIsCalendarModalOpen(true) },
    ];

    return (
        <UserLayout>
            <Head title="Dashboard" />

            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-slate-100 bg-white rounded-t-3xl">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
                <p className="text-xs text-slate-500 mt-0.5">Welcome back, {auth?.user?.first_name || 'Student'}!</p>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <StatCard href="/user/requests?status=pending" iconPath={ICON_PATHS.clock} iconBg="bg-yellow-50" iconColor="text-yellow-600" value={stats?.pending} label="Pending Requests" />
                    <StatCard href="/user/requests?status=completed" iconPath={ICON_PATHS.check} iconBg="bg-emerald-50" iconColor="text-emerald-600" value={stats?.completed} label="Completed Requests" />
                    <StatCard href="/user/inquiries" iconPath={ICON_PATHS.inquiry} iconBg="bg-purple-50" iconColor="text-purple-600" value={stats?.inquiries} label="Open Inquiries" />
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-x-6">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
                        {quickActions.map(action => (
                            <QuickActionButton key={action.name} {...action} onClick={action.action} />
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">

                    {/* Recent Requests */}
                    <div className="lg:col-span-2 min-w-0">
                        <div className="flex justify-between items-center gap-3 mb-3">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Recent Requests</h2>
                            {requests.length > 0 && <Link href="/user/requests" className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 transition-colors shrink-0">View All</Link>}
                        </div>

                        <div className="space-y-2.5">
                            {requests.length > 0 ? requests.map(req => <RequestRow key={req.id} request={req} onTrack={setTrackingRequest} />) : (
                                <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <p className="text-sm font-bold text-slate-700">No requests yet.</p>
                                    <p className="text-xs text-slate-500 mt-1">Submit a new request to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5 min-w-0">

                        {/* Notifications */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latest Notifications</h2>
                            </div>

                            <div className="space-y-2.5">
                                {auth?.notifications?.length > 0 ? auth.notifications.slice(0, 3).map(notif => (
                                    <button
                                        key={notif.id}
                                        type="button"
                                        onClick={() => openNotification(notif)}
                                        className={`w-full text-left p-3.5 bg-white border rounded-2xl shadow-sm flex flex-col gap-1 transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${!notif.read_at ? 'border-amber-200 bg-amber-50 hover:bg-amber-100' : 'border-slate-100 hover:border-yellow-300'}`}
                                    >
                                        <p className={`text-xs ${!notif.read_at ? 'font-bold text-amber-900' : 'text-slate-700'}`}>{notif.data.message}</p>
                                        <span className="text-[10px] text-slate-400">{new Date(notif.created_at).toLocaleString()}</span>
                                    </button>
                                )) : (
                                    <div className="text-center py-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <p className="text-xs text-slate-500">No new notifications.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Announcements */}
                        <div>
                            <div className="flex justify-between items-center gap-3 mb-3">
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Announcements</h2>
                                <Link href="/user/announcements" className="text-[10px] font-bold text-yellow-600 hover:text-yellow-700 transition-colors shrink-0">View All</Link>
                            </div>

                            <div className="space-y-2.5">
                                {announcements?.length > 0 ? announcements.map(ann => (
                                    <div key={ann.id} className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-1 hover:border-yellow-300 hover:shadow-md transition-all cursor-pointer min-w-0 overflow-hidden" onClick={() => router.visit('/user/announcements')}>
                                        <h3 className="font-bold text-sm text-slate-900 truncate">{ann.title}</h3>
                                        <div className="text-xs text-slate-500 line-clamp-2 break-words min-w-0 overflow-hidden [&_p]:inline [&_p]:m-0" dangerouslySetInnerHTML={{ __html: sanitizeHtml(ann.content) }} />
                                        <span className="text-[10px] font-medium text-slate-400 mt-1">{ann.date}</span>
                                    </div>
                                )) : (
                                    <div className="text-center py-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <p className="text-xs text-slate-500">No recent announcements.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {trackingRequest && (
                <Modal title="Track Request" onClose={() => setTrackingRequest(null)}>
                    <div className="p-4 sm:p-6">
                        <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner mb-6">
                            <p className="mb-1 break-words"><strong className="text-slate-700">Document:</strong>{' '}<span className="font-semibold text-slate-900">{trackingRequest.document_type}</span></p>
                            <p><strong className="text-slate-700">Tracking ID:</strong>{' '}<span className="font-semibold text-slate-900">#{trackingRequest.id}</span></p>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 mb-4">Status History & Remarks</h4>

                        <StatusHistoryTimeline history={trackingRequest.status_history} viewerId={auth?.user?.id} />
                    </div>
                </Modal>
            )}

            {isRequestModalOpen && <RequestDocumentModal services={services} onClose={() => setIsRequestModalOpen(false)} />}

            {isCalendarModalOpen && (
                <Modal title="Academic Calendar" onClose={() => setIsCalendarModalOpen(false)} maxWidth="max-w-4xl">
                    <div className="p-4 sm:p-6">
                        <p className="text-sm text-slate-500 mb-6 text-center">Review the official academic calendar for the current school year.</p>
                        <div className="w-full h-[55vh] sm:h-[70vh] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner mb-6 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium z-0">Loading Calendar...</div>
                            <iframe src="/downloads/Academic-Calendar-for-SY-2026-27-Official V6.pdf" title="Academic Calendar" className="w-full h-full relative z-10" />
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <button type="button" onClick={() => setIsCalendarModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors hover:bg-slate-200">Close</button>
                            <a href="/downloads/Academic-Calendar-for-SY-2026-27-Official V6.pdf" download="Academic-Calendar-for-SY-2026-27-Official V6.pdf" className="flex-[2] py-3.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md transition-colors hover:bg-yellow-500 text-sm flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download PDF
                            </a>
                        </div>
                    </div>
                </Modal>
            )}
        </UserLayout>
    );
}