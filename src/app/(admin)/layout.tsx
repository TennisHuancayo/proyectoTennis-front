"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { AuthProvider } from "@/components/admin/AuthProvider";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLogin = pathname === '/admin/login';

    return (
        <AuthProvider>
            <div className={`min-h-screen bg-gray-50 text-gray-900 ${isLogin ? '' : 'flex'}`}>
                {!isLogin && <Sidebar />}
                <main className={isLogin ? "w-full" : "flex-1 pl-64"}>
                    <div className={isLogin ? "" : "container py-6 px-8"}>
                        {children}
                    </div>
                </main>
            </div>
        </AuthProvider>
    );
}
