"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Paquetes", href: "/#paquetes" },
    { name: "Reserva", href: "/#reserva" },
    { name: "Noticias", href: "/noticias" },
    { name: "Contacto", href: "/#contacto" },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-romina-navy/95 backdrop-blur supports-[backdrop-filter]:bg-romina-navy/60">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-white">
                                Romina<span className="text-romina-green">Cutipa</span>Academy
                            </span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-white/80 hover:text-romina-green transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Button className="bg-romina-green text-romina-navy font-bold hover:bg-romina-green/90">
                            Inscríbete Ahora
                        </Button>
                    </nav>

                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </Container>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-white/10 bg-romina-navy p-4">
                    <nav className="flex flex-col gap-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-base font-medium text-white/80 hover:text-romina-green"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Button className="w-full bg-romina-green text-romina-navy font-bold">
                            Inscríbete Ahora
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
}
