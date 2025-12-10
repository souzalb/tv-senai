import Sidebar from '@/components/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-black text-zinc-100">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
