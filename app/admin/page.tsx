'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import {
    Monitor, ListVideo, Zap, Radio,
    Users, TrendingUp, Clock, Calendar,
    BarChart3, CheckCircle, User
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';

import DateRangePicker from '@/components/ui/DateRangePicker';

export default function AdminDashboard() {
    const { tvs, playlists, tickets, serviceTypes, profiles, fetchData } = useStore();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Filters - now storing as Date objects for easier handling with the picker
    const [dateStart, setDateStart] = useState<Date>(new Date());
    const [dateEnd, setDateEnd] = useState<Date>(new Date());
    const [filterService, setFilterService] = useState<string>('all');
    const [filterAttendant, setFilterAttendant] = useState<string>('all');

    useEffect(() => {
        const init = async () => {
            await fetchData();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setUser(data);
            }
            setLoading(false);
        };
        init();
    }, [fetchData]);

    // Metrics Calculation
    const metrics = useMemo(() => {
        if (!user) return null;

        let filteredTickets = [...tickets];

        // 1. Role Filter
        if (user.role !== 'super_admin') {
            filteredTickets = filteredTickets.filter(t => t.attendant_user_id === user.id);
        } else if (filterAttendant !== 'all') {
            filteredTickets = filteredTickets.filter(t => t.attendant_user_id === filterAttendant);
        }

        // 2. Service Filter
        if (filterService !== 'all') {
            filteredTickets = filteredTickets.filter(t => t.service_type_id === filterService);
        }

        // 3. Date Range Filter
        // Ensure accurate start/end of day boundaries
        const start = new Date(dateStart);
        start.setHours(0, 0, 0, 0);

        const end = new Date(dateEnd);
        end.setHours(23, 59, 59, 999);

        filteredTickets = filteredTickets.filter(t => {
            const ticketDate = new Date(t.created_at);
            return ticketDate >= start && ticketDate <= end;
        });

        const completedTickets = filteredTickets.filter(t => t.status === 'completed');
        const calledTickets = filteredTickets.filter(t => t.status === 'called');

        // Avg Wait Time (Global)
        let totalWaitTime = 0;
        let waitTimeCount = 0;

        // Peak Hours Distribution (0-23h)
        const hourlyCounts = new Array(24).fill(0);

        filteredTickets.forEach(t => {
            // Wait Time
            if (t.called_at && t.created_at) {
                const waitMs = new Date(t.called_at).getTime() - new Date(t.created_at).getTime();
                if (waitMs > 0) {
                    totalWaitTime += waitMs;
                    waitTimeCount++;
                }
            }

            // Hourly Dist
            const hour = new Date(t.created_at).getHours();
            hourlyCounts[hour]++;
        });

        const avgWaitMinutes = waitTimeCount > 0 ? Math.round((totalWaitTime / waitTimeCount) / 60000) : 0;

        // Efficiency: (Completed + Called) / Total Created * 100
        // How many tickets created in this period were actually attended to?
        const attendedCount = completedTickets.length + calledTickets.length;
        const totalCreated = filteredTickets.length;
        const efficiency = totalCreated > 0 ? Math.round((attendedCount / totalCreated) * 100) : 0;

        // Service Distribution (within filtered set) WITH Wait Time
        const serviceStats = serviceTypes.map(st => {
            const ticketsForService = completedTickets.filter(t => t.service_type_id === st.id);
            const count = ticketsForService.length;

            // Wait time for this service
            let svcWaitTotal = 0;
            let svcWaitCount = 0;
            ticketsForService.forEach(t => {
                if (t.called_at && t.created_at) {
                    svcWaitTotal += (new Date(t.called_at).getTime() - new Date(t.created_at).getTime());
                    svcWaitCount++;
                }
            });
            const avgWait = svcWaitCount > 0 ? Math.round((svcWaitTotal / svcWaitCount) / 60000) : 0;

            return { name: st.name, count, avgWait };
        }).sort((a, b) => b.count - a.count);

        // Attendant Stats (for Leaderboard)
        const attendantStats = profiles
            .filter(p => p.role === 'attendant' || p.role === 'super_admin')
            .map(p => {
                const count = filteredTickets.filter(t => t.attendant_user_id === p.id && t.status === 'completed').length;
                return { name: p.name || p.email, count, role: p.role };
            })
            .sort((a, b) => b.count - a.count);

        // Find Peak Hour
        let peakHourCount = 0;
        let peakHourIndex = 0;
        hourlyCounts.forEach((count, idx) => {
            if (count > peakHourCount) {
                peakHourCount = count;
                peakHourIndex = idx;
            }
        });

        return {
            totalAllTime: filteredTickets.filter(t => t.status !== 'waiting').length,
            currentlyServing: calledTickets.length,
            avgWaitTime: avgWaitMinutes,
            efficiency,
            serviceStats,
            attendantStats,
            hourlyCounts,
            maxHourly: Math.max(...hourlyCounts, 1), // Avoid div by zero
            peakHourCount,
            peakHourIndex
        };
    }, [tickets, user, serviceTypes, profiles, dateStart, dateEnd, filterService, filterAttendant]);

    if (loading) {
        return <div className="p-8 text-zinc-400">Loading details...</div>;
    }

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-2">
                        {user.role === 'super_admin' ? 'Visão Geral' : 'Meu Painel'}
                    </h2>
                    <p className="text-zinc-400">
                        Bem-vindo de volta, <span className="text-white font-medium">{user.name || 'Usuário'}</span>.
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md relative z-50">

                    <DateRangePicker
                        startDate={dateStart}
                        endDate={dateEnd}
                        onChange={(start, end) => {
                            setDateStart(start);
                            setDateEnd(end);
                        }}
                    />

                    <div className="w-px h-8 bg-white/10 mx-2 hidden md:block" />

                    <select
                        value={filterService}
                        onChange={(e) => setFilterService(e.target.value)}
                        className="bg-zinc-900 border border-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 h-10"
                    >
                        <option value="all">Todos Serviços</option>
                        {serviceTypes.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    {user.role === 'super_admin' && (
                        <select
                            value={filterAttendant}
                            onChange={(e) => setFilterAttendant(e.target.value)}
                            className="bg-zinc-900 border border-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 h-10"
                        >
                            <option value="all">Todos Atendentes</option>
                            {profiles.filter(p => p.role !== 'viewer').map(p => (
                                <option key={p.id} value={p.id}>{p.name || p.email}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatCard
                    title="Atendimentos"
                    value={metrics?.totalAllTime || 0}
                    subtitle="No período selecionado"
                    icon={CheckCircle}
                    color="blue"
                />
                <StatCard
                    title="Tempo Médio"
                    value={`${metrics?.avgWaitTime || 0} min`}
                    subtitle="Espera na fila"
                    icon={Clock}
                    color="yellow"
                />
                <StatCard
                    title="Em Andamento"
                    value={metrics?.currentlyServing || 0}
                    subtitle="Agora"
                    icon={TrendingUp}
                    color="purple"
                />
                <StatCard
                    title="Taxa de Atendimento"
                    value={`${metrics?.efficiency || 0}%`}
                    subtitle="Do total de senhas"
                    icon={Zap}
                    color={metrics?.efficiency && metrics.efficiency > 80 ? "green" : "red"}
                />
            </motion.div>

            {/* Hourly Distribution (Peak Hours) */}
            <GlassCard>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Horários de Pico</h3>
                            <p className="text-xs text-zinc-500">Distribuição de movimentação por hora</p>
                        </div>
                    </div>
                    {/* Summary of Peak */}
                    {metrics && metrics.peakHourCount > 0 && (
                        <div className="text-right">
                            <div className="text-xs text-zinc-400">Horário de Maior Movimento</div>
                            <div className="text-lg font-bold text-white">
                                {metrics.peakHourIndex}h <span className="text-sm font-normal text-zinc-500">({metrics.peakHourCount} senhas)</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-40 flex items-end gap-1.5 pt-4">
                    {metrics?.hourlyCounts.map((count, i) => {
                        const intensity = count / (metrics.maxHourly || 1);
                        const isPeak = i === metrics.peakHourIndex && count > 0;
                        const isCurrentHour = new Date().getHours() === i && new Date().toDateString() === new Date().toDateString(); // Simple check, ideally check selected date range

                        // Determine Color
                        let barColor = "bg-white/5";
                        if (intensity > 0.7) barColor = "bg-red-500";
                        else if (intensity > 0.4) barColor = "bg-orange-500";
                        else if (intensity > 0) barColor = "bg-blue-500";

                        // Gradient definition for inline styles if we want gradients, 
                        // but solid colors with opacity logic or classes might be cleaner for tailwind.
                        // Let's use specific classes for gradients.
                        let gradientClass = "from-white/10 to-white/5"; // Default
                        if (intensity > 0.7) gradientClass = "from-red-500 to-orange-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
                        else if (intensity > 0.4) gradientClass = "from-orange-500 to-yellow-600";
                        else if (intensity > 0) gradientClass = "from-blue-500 to-cyan-500";

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                                {/* Tooltip */}
                                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-all duration-200 pointer-events-none z-20 ${count > 0 ? 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0' : 'opacity-0'}`}>
                                    <div className="bg-zinc-900 border border-white/10 text-white text-[10px] px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap flex flex-col items-center">
                                        <span className="font-bold text-sm">{count}</span>
                                        <span className="text-zinc-400">senhas às {i}h</span>
                                    </div>
                                    {/* Arrow */}
                                    <div className="w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                                </div>

                                {/* Bar */}
                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: `${Math.max((count / (metrics.maxHourly || 1)) * 100, 2)}%`,
                                        opacity: count > 0 ? 1 : 0.3
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className={`w-full rounded-t-sm relative overflow-hidden bg-gradient-to-t ${gradientClass} ${isCurrentHour ? 'ring-1 ring-white/50' : ''}`}
                                >
                                    {/* Shine effect for high traffic */}
                                    {intensity > 0.7 && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-pulse" />
                                    )}
                                </motion.div>

                                {/* Label */}
                                <span className={`text-[10px] h-4 transition-colors ${isPeak ? 'text-white font-bold' : 'text-zinc-600'} ${isCurrentHour ? 'text-blue-400 font-bold' : ''}`}>
                                    {i % 3 === 0 || isPeak ? `${i}h` : ''}
                                </span>

                                {/* Current Hour Indicator Dot */}
                                {isCurrentHour && (
                                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Service Distribution Chart */}
                <div className="lg:col-span-2">
                    <GlassCard className="h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <BarChart3 size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                Distribuição de Serviços & Tempo de Espera
                            </h3>
                        </div>
                        <div className="space-y-6">
                            {metrics?.serviceStats.map((stat, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <div className="text-sm text-white font-medium">{stat.name}</div>
                                            <div className="text-xs text-zinc-500 flex items-center gap-2">
                                                <Clock size={10} />
                                                Espera média: <span className="text-zinc-300">{stat.avgWait} min</span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-zinc-400">{stat.count} <span className="text-[10px] font-normal">atendimentos</span></span>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stat.count / (metrics.totalAllTime || 1)) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full relative"
                                        >
                                            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                                        </motion.div>
                                    </div>
                                </div>
                            ))}
                            {metrics?.serviceStats.every(s => s.count === 0) && (
                                <p className="text-zinc-500 text-center py-8">Nenhum dado neste período.</p>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Team Leaderboard (Admin) or User Details (Attendant) */}
                <div>
                    <GlassCard className="h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Users size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {user.role === 'super_admin' ? 'Ranking (Período)' : 'Meus Detalhes'}
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {user.role === 'super_admin' ? (
                                metrics?.attendantStats.map((att, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                                {att.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium text-sm">{att.name}</div>
                                                <div className="text-xs text-zinc-500 capitalize">{att.role}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-bold">{att.count}</div>
                                            <div className="text-[10px] text-zinc-500">ATENDIMENTOS</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-xl border-4 border-white/10">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <h4 className="text-xl font-bold text-white">{user.name}</h4>
                                    <p className="text-zinc-400 text-sm mb-6">{user.email}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                            <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Função</div>
                                            <div className="text-white font-medium capitalize">{user.role}</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                            <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Mesa</div>
                                            <div className="text-white font-medium">{user.desk_info || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Original Infrastructure Stats (For Admins Only or Pushed down) */}
            {user.role === 'super_admin' && (
                <div className="pt-8 border-t border-white/10">
                    <h3 className="text-lg font-semibold text-zinc-400 mb-6 flex items-center gap-2">
                        <Monitor size={18} />
                        Infraestrutura Digital
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <InfraStat label="Displays" value={tvs.length} />
                        <InfraStat label="Playlists" value={playlists.length} />
                        <InfraStat label="Active Screens" value={tvs.filter(tv => tv.assignedPlaylistId !== null).length} />
                        <InfraStat label="System Status" value="Online" color="text-green-400" />
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
    const colors: any = {
        blue: "from-blue-500 to-cyan-500",
        purple: "from-purple-500 to-pink-500",
        green: "from-emerald-500 to-teal-500",
        yellow: "from-orange-500 to-yellow-500"
    };

    const bgGlow: any = {
        blue: "bg-blue-500/10 text-blue-400",
        purple: "bg-purple-500/10 text-purple-400",
        green: "bg-emerald-500/10 text-emerald-400",
        yellow: "bg-orange-500/10 text-orange-400"
    };

    return (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <GlassCard className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
                        <h3 className="text-4xl font-bold text-white tracking-tight">{value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${bgGlow[color]} backdrop-blur-md`}>
                        <Icon size={24} />
                    </div>
                </div>
                <p className="text-sm text-zinc-500 relative z-10">{subtitle}</p>
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${colors[color]} rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity`} />
            </GlassCard>
        </motion.div>
    );
}

function InfraStat({ label, value, color = "text-white" }: any) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
            <span className="text-zinc-500 text-sm">{label}</span>
            <span className={`font-mono font-bold ${color}`}>{value}</span>
        </div>
    );
}
