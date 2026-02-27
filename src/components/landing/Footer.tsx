import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Facebook, Instagram, Youtube, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-romina-navy border-t border-white/10 py-12 text-white">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-2xl font-bold text-white block mb-4">
                            Romina<span className="text-romina-green">Cutipa</span>Academy
                        </span>
                        <p className="text-white/60 max-w-sm">
                            Formando campeones dentro y fuera de la cancha. La mejor academia de tenis con metodología profesional y personalizada.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4 text-romina-green">Enlaces Rápidos</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-white/60 hover:text-white">Inicio</Link></li>
                            <li><Link href="#paquetes" className="text-white/60 hover:text-white">Paquetes</Link></li>
                            <li><Link href="#noticias" className="text-white/60 hover:text-white">Noticias</Link></li>
                            <li><Link href="/admin/login" className="text-white/60 hover:text-white">Admin</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4 text-romina-green">Contacto</h3>
                        <div className="flex gap-4">
                            <a href="#" className="text-white/60 hover:text-romina-green"><Facebook /></a>
                            <a href="#" className="text-white/60 hover:text-romina-green"><Instagram /></a>
                            <a href="#" className="text-white/60 hover:text-romina-green"><Youtube /></a>
                            <a href="#" className="text-white/60 hover:text-romina-green"><Phone /></a>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
                    © {new Date().getFullYear()} RominaCutipaAcademy. Todos los derechos reservados.
                </div>
            </Container>
        </footer>
    );
}
