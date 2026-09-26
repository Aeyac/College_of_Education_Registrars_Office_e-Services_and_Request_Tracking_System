import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardOverview({ stats, monthlyProcessed = [], statusDistribution = [] }) {
    const totalRequests = statusDistribution.reduce((acc, curr) => acc + curr.value, 0);

    const StatCard = ({ href, title, value, icon, colorClass, bgClass, borderClass }) => (
        <Link href={href} className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-lg transition-all cursor-pointer hover:border-slate-200 relative overflow-hidden group h-[140px]`}>
            <div className={`absolute -right-4 -top-4 w-28 h-28 rounded-full ${bgClass} opacity-40 group-hover:scale-110 transition-transform duration-500`} />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">{title}</p>
            <div className="flex justify-between items-end relative z-10 mt-auto">
                <h3 className="text-4xl font-black text-slate-800">{value || 0}</h3>
                <div className={`w-12 h-12 ${bgClass} ${borderClass} border rounded-2xl flex items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </Link>
    );

    return (
        <AdminLayout>
            <Head title="Admin Overview" />
            
            <div className="p-6 sm:p-8 space-y-10 bg-[#f8fafc] min-h-screen">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Real-time system analytics and performance.</p>
                    </div>
                </div>

                {/* Section 1: Charts (At the top) */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Bar Chart: Monthly Released Certificates */}
                    <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 sm:p-8 flex flex-col min-h-[350px] sm:h-[420px] xl:h-[460px]">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 sm:mb-8 uppercase tracking-widest">Monthly Released Certificates</h3>
                        <div className="flex-1 w-full h-full relative">
                            {monthlyProcessed.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyProcessed} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={15} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                        <RechartsTooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -5px rgb(0 0 0 / 0.1)', padding: '14px 20px' }}
                                            itemStyle={{ fontWeight: 800, color: '#0f172a', fontSize: '16px' }}
                                            labelStyle={{ color: '#64748b', fontWeight: 700, marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase' }}
                                        />
                                        <Bar dataKey="count" name="Released" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1000} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <span className="text-sm font-semibold">No data available yet</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pie Chart: Request Status Distribution */}
                    <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 sm:p-8 flex flex-col min-h-[380px] sm:h-[420px] xl:h-[460px]">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Request Status</h3>
                            <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                                Total: {totalRequests}
                            </div>
                        </div>
                        <div className="flex-1 w-full h-full relative flex items-center justify-center">
                            {statusDistribution.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusDistribution}
                                                cx="50%" cy="45%" outerRadius="75%" paddingAngle={2} dataKey="value" stroke="none"
                                            >
                                                {statusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 4px 6px ${entry.color}40)` }} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '10px 16px' }} 
                                                itemStyle={{ fontWeight: 800, fontSize: '15px' }} 
                                                labelStyle={{ display: 'none' }} 
                                            />
                                            <Legend verticalAlign="bottom" height={60} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginTop: '10px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                                    <span className="text-sm font-semibold">No requests yet</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 2: Request Metrics (Below Charts) */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 ml-1">Document Pipeline</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        <StatCard
                            href="/admin/requests?status=submitted" title="New Requests" value={stats?.new_requests}
                            bgClass="bg-sky-50" borderClass="border-sky-100"
                            icon={<svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                        />
                        <StatCard
                            href="/admin/requests" title="Pending Action" value={stats?.pending}
                            bgClass="bg-yellow-50" borderClass="border-yellow-100"
                            icon={<svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatCard
                            href="/admin/requests?status=for_compliance" title="For Compliance" value={stats?.for_compliance}
                            bgClass="bg-amber-50" borderClass="border-amber-100"
                            icon={<svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        />
                        <StatCard
                            href="/admin/requests?status=processing" title="Processing" value={stats?.processing}
                            bgClass="bg-indigo-50" borderClass="border-indigo-100"
                            icon={<svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                        />
                        <StatCard
                            href="/admin/requests?status=ready_for_release" title="Ready for Release" value={stats?.ready_for_release}
                            bgClass="bg-emerald-50" borderClass="border-emerald-100"
                            icon={<svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        />
                        <StatCard
                            href="/admin/requests?status=released" title="Released" value={stats?.released}
                            bgClass="bg-teal-50" borderClass="border-teal-100"
                            icon={<svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                    </div>
                </div>

                {/* Section 3: Other Metrics */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 ml-1">Platform Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            href="/admin/inquiries" title="Unanswered Inquiries" value={stats?.inquiries}
                            bgClass="bg-purple-50" borderClass="border-purple-100"
                            icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        />
                        <StatCard
                            href="/admin/alumni" title="Pending Alumni" value={stats?.alumni}
                            bgClass="bg-blue-50" borderClass="border-blue-100"
                            icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                        />
                        <StatCard
                            href="/admin/users" title="Registered Users" value={stats?.users}
                            bgClass="bg-slate-100" borderClass="border-slate-200"
                            icon={<svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                        />
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}