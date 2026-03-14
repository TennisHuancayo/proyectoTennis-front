"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CalendarCheck, BarChart3, Settings, LogOut, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/admin/AuthProvider";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Alumnos", href: "/admin/students", icon: Users },
    { name: "Paquetes", href: "/admin/paquetes", icon: Users },
    { name: "Clases", href: "/admin/clases", icon: Users },
    { name: "Asistencia", href: "/admin/attendance", icon: CalendarCheck },
    { name: "Eventos", href: "/admin/eventos", icon: Newspaper },
    { name: "Configuración", href: "/admin/settings", icon: Settings },
    { name: "Sponsors", href: "/admin/sponsors", icon: Users },
    { name: "Ventas", href: "/admin/sales", icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="flex h-screen w-64 flex-col fixed inset-y-0 z-50 bg-romina-navy border-r border-white/10">
            <div className="flex h-16 items-center px-6 border-b border-white/10">
                <span className="text-xl font-bold text-white">
                    Romina<span className="text-romina-green">Admin</span>
                </span>
            </div>

            <div className="flex-1 flex flex-col gap-1 p-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-romina-green text-romina-navy"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
