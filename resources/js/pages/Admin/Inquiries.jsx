import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ChatModal from '@/Components/ChatModal';
import Swal from 'sweetalert2';

export default function ManageInquiries({ inquiries = [] }) {
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId);

    const MySwal = Swal.mixin({
        customClass: {
            popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4',
            title: 'text-slate-900 font-extrabold text-2xl pt-4',
            htmlContainer: 'text-slate-500 text-sm font-medium',
            confirmButton: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl px-8 py-3.5 mx-2 shadow-md outline-none',
        },
        buttonsStyling: false,
    });

    const filteredInquiries = useMemo(() => {
        return inquiries.filter((inq) => {
            const matchesSearch =
                inq.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inq.subject.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [inquiries, searchTerm, statusFilter]);

    const handleResolve = (inquiryId) => {
        router.put(`/admin/inquiries/${inquiryId}/status`, { status: 'resolved' }, {
            preserveScroll: true,
            onSuccess: () => {
                MySwal.fire({ title: 'Resolved!', text: 'Thread has been closed.', icon: 'success', timer: 2000, showConfirmButton: false });
                setSelectedInquiryId(null);
            },
        });
    };

    const openThread = (inq) => {
        setSelectedInquiryId(inq.id);
        if (!inq.is_read) {
            router.put(`/admin/inquiries/${inq.id}/read`, {}, { preserveScroll: true, preserveState: true });
        }
    };

    const toggleReadStatus = (inq) => {
        const action = inq.is_read ? 'unread' : 'read';
        router.put(`/admin/inquiries/${inq.id}/${action}`, {}, { preserveScroll: true, preserveState: true });
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
                router.delete(`/admin/inquiries/${id}`, { preserveScroll: true });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Student Inquiries" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Inquiries</h2>
                    <p className="text-xs text-slate-500 mt-1">Review and reply to messages from students and alumni.</p>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search student or subject..."
                        className="w-full sm:flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all shadow-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-8 py-3 focus:ring-yellow-400 outline-none shadow-sm cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredInquiries.length > 0 ? (
                                    filteredInquiries.map((inq) => (
                                        <tr
                                            key={inq.id}
                                            className={`transition-colors ${!inq.is_read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                                                }`}
                                        >
                                            <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{inq.date}</td>
                                            <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">
                                                <div className={`font-semibold ${!inq.is_read ? 'text-slate-900 font-bold' : 'text-slate-900'}`}>{inq.student_name}</div>
                                                <div className="text-xs text-slate-400">{inq.email}</div>
                                            </td>
                                            <td className={`py-4 px-6 text-sm whitespace-nowrap ${!inq.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-900'}`}>
                                                {inq.subject}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span
                                                    className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${inq.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                        }`}
                                                >
                                                    {inq.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap flex items-center justify-end gap-1">
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
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-2"
                                                    title="Delete Thread"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => openThread(inq)}
                                                    className="text-slate-700 font-bold px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200 text-xs"
                                                >
                                                    View Thread
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500 text-sm">
                                            No inquiries found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ChatModal
                inquiry={selectedInquiry}
                onClose={() => setSelectedInquiryId(null)}
                onResolve={handleResolve}
                basePath="/admin/inquiries"
            />
        </AdminLayout>
    );
}