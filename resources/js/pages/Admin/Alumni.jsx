import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AlumniVerifications({ alumni = [], courses = [] }) {
    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
console.log(alumni)
    const handleVerify = (status) => {
        router.put(`/admin/alumni/${selectedAlumni.id}`, { status: status }, { 
            onSuccess: () => setSelectedAlumni(null),
            preserveScroll: true 
        });
    };

    const getStatusStyle = (status) => {
        const s = status.toLowerCase();
        if (s.includes('verified')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (s.includes('rejected')) return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const processedAlumni = useMemo(() => {
        return alumni
            .filter((a) => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = 
                    !searchTerm || 
                    a.name.toLowerCase().includes(searchLower) || 
                    a.major.toLowerCase().includes(searchLower);
                
                const matchesCourse = courseFilter === 'all' || a.course === courseFilter;
                const matchesStatus = statusFilter === 'all' || a.status.toLowerCase() === statusFilter.toLowerCase();
                
                return matchesSearch && matchesCourse && matchesStatus;
            })
            .sort((a, b) => {
                let aVal = a[sortField] || '';
                let bVal = b[sortField] || '';
                const comp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
                return sortDirection === 'asc' ? comp : -comp;
            });
    }, [alumni, searchTerm, courseFilter, statusFilter, sortField, sortDirection]);

    return (
        <AdminLayout>
            <Head title="Alumni Verifications" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-20 rounded-t-3xl">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Alumni Verifications</h2>
                <p className="text-xs text-slate-500 mt-1">Verify identity proofs for system access.</p>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-col lg:flex-row gap-3 justify-between">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search name, Alumni ID, major..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:ring-yellow-400 outline-none shadow-sm" 
                    />
                    <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm shadow-sm outline-none">
                        <option value="all">All Courses</option>
                        {courses.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm shadow-sm outline-none">
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-slate-50 border-b border-slate-100 select-none">
                                <tr>
                                    <th onClick={() => handleSort('alumni_id')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100">Alumni ID</th>
                                    <th onClick={() => handleSort('name')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100">Name</th>
                                    <th onClick={() => handleSort('course')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100">Course & Major</th>
                                    <th onClick={() => handleSort('batch')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100">Batch</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Proof</th>
                                    <th onClick={() => handleSort('status')} className="py-4 px-6 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100">Status</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {processedAlumni.length > 0 ? processedAlumni.map((alum) => (
                                    <tr key={alum.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{alum.id}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-700 whitespace-nowrap">{alum.name}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                                            <span className="font-medium text-slate-800 block truncate max-w-[200px]">{alum.course}</span>
                                            {alum.major !== 'N/A' && <span className="block text-[10px] uppercase font-bold text-slate-400 mt-0.5">{alum.major}</span>}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{alum.batch}</td>
                                        <td className="py-4 px-6 text-sm whitespace-nowrap">
                                            {/* Fix applied: Direct URL viewing */}
                                            <a href={alum.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                                                View Proof
                                            </a>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap"><span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(alum.status)}`}>{alum.status}</span></td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <button onClick={() => setSelectedAlumni(alum)} className="text-slate-700 font-bold px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors">Action</button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="7" className="py-12 text-center text-slate-500 text-sm">No verifications found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedAlumni && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-lg mb-2">Verify {selectedAlumni.name}</h3>
                        <p className="text-sm text-slate-500 mb-6">Review the uploaded proof to grant access to certificate requests.</p>
                        
                        <a href={selectedAlumni.proof_url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-3 bg-slate-50 text-blue-700 font-bold rounded-xl text-sm mb-6 w-full border border-slate-200 truncate shadow-sm hover:bg-slate-100">
                            {selectedAlumni.proof}
                        </a>
                        
                        <div className="flex gap-3">
                            <button onClick={() => handleVerify('rejected')} className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold rounded-xl text-sm transition-colors">Reject</button>
                            <button onClick={() => handleVerify('verified')} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-md transition-colors">Approve</button>
                        </div>
                        <button onClick={() => setSelectedAlumni(null)} className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel & Close</button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}