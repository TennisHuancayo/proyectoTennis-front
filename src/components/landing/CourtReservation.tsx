import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function CourtReservation() {
    return (
        <section id="reserva" className="py-20 bg-romina-navy text-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-romina-green/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <Container className="relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    ¿Listo para jugar? <span className="text-romina-green">Reserva tu cancha</span>
                </h2>
                <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                    Contamos con canchas de arcilla de primer nivel. Consulta disponibilidad y horarios directamente con nosotros.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg px-8 py-6 h-auto"
                        asChild
                    >
                        <a
                            href="https://wa.me/51999999999?text=Hola%20Romina,%20quisiera%20reservar%20una%20cancha."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <MessageCircle className="mr-2 h-6 w-6" />
                            Reservar por WhatsApp
                        </a>
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
                        asChild
                    >
                        <a href="#paquetes">Ver Paquetes de Clases</a>
                    </Button>
                </div>
            </Container>
        </section>
    );
}
