'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { History, Search, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GlassCard from '@/components/ui/GlassCard';

export default function QueueHistoryPage() {
    const { tickets, profiles, serviceTypes, fetchData } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchData();

        // Security Check
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (!data || data.role !== 'super_admin') {
                router.push('/admin/queue'); // Redirect unauthorized users
            }
        };
        checkRole();
    }, []);

    // Filter tickets to only completed or called (All history)
    // Actually, user wants "Histórico de atendimento".
    const historyTickets = tickets
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const filteredTickets = historyTickets.filter(t =>
        t.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.attendant_user_id && profiles.find(p => p.id === t.attendant_user_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 max-w-7xl mx-auto text-white">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                        Histórico de Atendimentos
                    </h1>
                    <p className="text-zinc-400">Registro completo de senhas chamadas.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Buscar senha ou atendente..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
                        />
                    </div>
                </div>
            </header>

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
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
                            {filteredTickets.map(ticket => {
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
                                                {ticket.status}
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
                                            {new Date(ticket.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-zinc-400 text-sm">
                                            {ticket.called_at ? new Date(ticket.called_at).toLocaleString() : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-zinc-500 italic">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
