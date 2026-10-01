import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import ChatModal from '@/Components/ChatModal';
import NewInquiryModal from '@/Components/NewInquiryModal';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';
import useHighlightRow from '@/hooks/useHighlightRow';
import useLiveRefresh from '@/hooks/useLiveRefresh';

const INQUIRIES_ONLY = ['inquiries'];

export default function MyInquiries({ inquiries = [] }) {
    useHighlightRow('inquiry-row');
    // Works with a plain array or a Laravel paginator object.
    const allRows = Array.isArray(inquiries) ? inquiries : (inquiries?.data ?? []);

    const [selectedInquiryId, setSelectedInquiryId] = useState(null);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Registrar replies and status changes arrive from the other side without a
    // broadcast event. ChatModal polls the same prop every 4s while a thread is
    // open, so this list poll stands down then to avoid a duplicate request.
    useLiveRefresh({ only: INQUIRIES_ONLY, enabled: !selectedInquiryId });

    const selectedInquiry = allRows.find((i) => i.id === selectedInquiryId);
    const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all';

    const rows = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return allRows.filter((inq) => {
            const matchesSearch = !term || inq.subject?.toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [allRows, searchTerm, statusFilter]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
    };

    const openThread = (inq) => {
        setSelectedInquiryId(inq.id);
        if (!inq.is_read) {
            router.put(`/user/inquiries/${inq.id}/read`, {}, { preserveScroll: true, preserveState: true });
        }
    };

    const toggleReadStatus = (inq) => {
        const action = inq.is_read ? 'unread' : 'read';
        router.put(`/user/inquiries/${inq.id}/${action}`, {}, { preserveScroll: true, preserveState: true });
    };

    const deleteThread = (id) => {
        Swal.fire({
            title: 'Delete Thread?',
            text: 'This will permanently remove the entire conversation.',
            iconHtml: '<svg class="w-12 h-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
                title: 'text-slate-900 font-extrabold text-2xl pt-4',
                htmlContainer: 'text-slate-500 text-sm font-medium',
                confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md outline-none',
                cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl px-8 py-3.5 mx-2 outline-none',
                icon: 'border-0 scale-125 mt-6',
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/user/inquiries/${id}`, { preserveScroll: true });
            }
        });
    };

    return (
        <UserLayout>
            <Head title="My Inquiries" />
            <div className="p-4 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">My Inquiries</h2>
                    <p className="text-xs text-slate-500 mt-1">Message the CED Registrar's Office directly.</p>
                </div>
                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors text-sm"
                >
                    + New Inquiry
                </button>
            </div>

            <div className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search inquiries"
                        placeholder="Search by subject..."
                        className="w-full sm:flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter by status"
                        className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-8 py-3 focus:ring-yellow-400 outline-none shadow-sm cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {rows.length > 0 ? (
                        <ul className="p-3 sm:p-4 space-y-3">
                            {rows.map((inq) => (
                                <li
                                    key={inq.id}
                                    id={`inquiry-row-${inq.id}`}
                                    className={`p-4 sm:p-5 transition-colors rounded-xl border border-slate-200 border-l-4 shadow-sm ${!inq.is_read
                                        ? 'bg-blue-50/50 border-l-blue-500'
                                        : 'bg-white border-l-slate-200 hover:bg-slate-50/80'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div className="min-w-0">
                                            <div className={`text-sm break-words ${!inq.is_read ? 'font-black' : 'font-bold'} text-slate-900`}>
                                                {inq.subject}
                                            </div>
                                            <div className="text-[11px] font-medium text-slate-400 mt-0.5">Updated on {inq.date}</div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                            <span
                                                className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${inq.status === 'resolved'
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                    : inq.status === 'closed'
                                                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                                                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                    }`}
                                            >
                                                {inq.status}
                                            </span>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleReadStatus(inq)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title={inq.is_read ? 'Mark as Unread' : 'Mark as Read'}
                                                >
                                                    {inq.is_read ? (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => deleteThread(inq.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Thread"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => openThread(inq)}
                                                className="w-full sm:w-auto text-slate-700 font-bold px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200 text-xs"
                                            >
                                                Open Thread
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="py-16 px-6 flex flex-col items-center justify-center text-slate-400">
                            <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-sm font-bold text-slate-800">
                                {hasActiveFilters ? 'No inquiries found' : 'No active inquiries'}
                            </span>
                            {hasActiveFilters ? (
                                <button onClick={clearFilters} className="mt-3 text-xs font-bold text-yellow-700 hover:underline">
                                    clear all filters
                                </button>
                            ) : (
                                <span className="text-xs text-slate-500 mt-1">Need help? Send us a message.</span>
                            )}
                        </div>
                    )}

                    {inquiries?.links && (
                        <Pagination
                            links={inquiries.links}
                            from={inquiries.from}
                            to={inquiries.to}
                            total={inquiries.total}
                            noun="inquiries"
                        />
                    )}
                </div>
            </div>

            <ChatModal
                inquiry={selectedInquiry}
                onClose={() => setSelectedInquiryId(null)}
                basePath="/user/inquiries"
            />

            <NewInquiryModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onSuccess={() => router.reload({ only: ['inquiries'], preserveScroll: true })}
            />
        </UserLayout>
    );
}