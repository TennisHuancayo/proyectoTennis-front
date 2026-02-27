import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="relative py-20 overflow-hidden bg-romina-navy text-white">
            <div className="absolute inset-0 bg-[url('/tennis-court-bg.jpg')] bg-cover bg-center opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-romina-navy via-romina-navy/90 to-transparent" />

            <Container className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Domina la Cancha con <span className="text-romina-green">Romina Cutipa</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 max-w-lg">
                            Academia de tenis de alto rendimiento para todas las edades.
                            Entrena con profesionales y lleva tu juego al siguiente nivel.
                        </p>
                        <div className="pt-4 flex flex-wrap gap-4">
                            <Button size="lg" className="bg-romina-green text-romina-navy font-bold text-lg px-8 hover:bg-romina-green/90">
                                Reserva tu Clase
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-romina-navy text-lg px-8">
                                Ver Paquetes
                            </Button>
                        </div>

                        <div className="pt-8 border-t border-white/10 mt-8">
                            <p className="text-sm font-semibold text-romina-green mb-2">SOBRE ROMINA CUTIPA</p>
                            <p className="text-sm text-white/70">
                                Directora de la academia con más de 15 años de experiencia formando tenistas competitivos en el circuito nacional e internacional.
                            </p>
                        </div>
                    </div>

                    <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl skew-x-1 hover:skew-x-0 transition-transform duration-500">
                        {/* Placeholder for Romina's photo */}
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-white/20">
                            <span className="text-2xl font-bold">Foto de Romina</span>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
