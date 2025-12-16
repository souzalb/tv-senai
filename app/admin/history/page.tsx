'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { History, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GlassCard from '@/components/ui/GlassCard';
import DateRangePicker from '@/components/ui/DateRangePicker';

export default function QueueHistoryPage() {
    const { tickets, profiles, serviceTypes, fetchData } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    // Filters
    const [dateStart, setDateStart] = useState<Date>(new Date());
    const [dateEnd, setDateEnd] = useState<Date>(new Date());
    const [filterService, setFilterService] = useState<string>('all');
    const [filterAttendant, setFilterAttendant] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        fetchData();
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (!data || data.role !== 'super_admin') {
                router.push('/admin/queue');
            }
        };
        checkRole();
    }, []);

    // Filter Logic
    const filteredTickets = useMemo(() => {
        let filtered = [...tickets];

        // Date Range
        const start = new Date(dateStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateEnd);
        end.setHours(23, 59, 59, 999);

        filtered = filtered.filter(t => {
            const tDate = new Date(t.created_at);
            return tDate >= start && tDate <= end;
        });

        // Dropdowns
        if (filterService !== 'all') {
            filtered = filtered.filter(t => t.service_type_id === filterService);
        }
        if (filterAttendant !== 'all') {
            filtered = filtered.filter(t => t.attendant_user_id === filterAttendant);
        }

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.number.toLowerCase().includes(lowerTerm) ||
                (t.attendant_user_id && profiles.find(p => p.id === t.attendant_user_id)?.name?.toLowerCase().includes(lowerTerm))
            );
        }

        // Sort descending
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [tickets, dateStart, dateEnd, filterService, filterAttendant, searchTerm, profiles]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
    const paginatedTickets = filteredTickets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [dateStart, dateEnd, filterService, filterAttendant, searchTerm]);

    return (
        <div className="p-8 max-w-7xl mx-auto text-white space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400 mb-2">
                        Histórico de Atendimentos
                    </h1>
                    <p className="text-zinc-400">
                        {filteredTickets.length} registros encontrados no período.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-64 h-10"
                        />
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
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
            </div>

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Senha</th>
                                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Serviço</th>
                                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Atendente</th>
                                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Chegada</th>
                                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Chamada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedTickets.map(ticket => {
                                const service = serviceTypes.find(s => s.id === ticket.service_type_id);
                                const attendant = profiles.find(p => p.id === ticket.attendant_user_id);
                                return (
                                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono font-medium text-lg">{ticket.number}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium uppercase
                                                ${ticket.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                                ${ticket.status === 'called' ? 'bg-blue-500/20 text-blue-400' : ''}
                                                ${ticket.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
                                            `}>
                                                {ticket.status === 'waiting' ? 'Aguardando' :
                                                    ticket.status === 'called' ? 'Chamado' : 'Concluído'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-zinc-300 text-sm">
                                            {service ? service.name : '-'}
                                        </td>
                                        <td className="p-4">
                                            {attendant ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-zinc-200">{attendant.name || 'Sem nome'}</span>
                                                    {attendant.desk_info && <span className="text-xs text-zinc-500">{attendant.desk_info}</span>}
                                                </div>
                                            ) : (
                                                <span className="text-zinc-600 italic text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-zinc-400 text-sm">
                                            {new Date(ticket.created_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="p-4 text-zinc-400 text-sm">
                                            {ticket.called_at ? new Date(ticket.called_at).toLocaleString('pt-BR') : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginatedTickets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-zinc-500 italic">
                                        Nenhum registro encontrado para os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                        <div className="text-sm text-zinc-500">
                            Mostrando <span className="text-white font-medium">{paginatedTickets.length}</span> de <span className="text-white font-medium">{filteredTickets.length}</span> resultados
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="flex items-center px-4 py-2 bg-white/5 rounded-lg text-sm text-white font-medium">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
