import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const packages = [
    {
        name: "Paquete Básico",
        hours: "12 Horas",
        classes: "8 clases de 1.5h",
        price: 350,
        popular: false,
    },
    {
        name: "Paquete Intermedio",
        hours: "18 Horas",
        classes: "12 clases de 1.5h",
        price: 500,
        popular: true,
    },
    {
        name: "Paquete Avanzado",
        hours: "24 Horas",
        classes: "16 clases de 1.5h",
        price: 625,
        popular: false,
    },
];

const features = ["Entrada al club", "Alquiler de Cancha", "Raqueta y Pelotas", "Coaching A1"];

export function Pricing() {
    return (
        <section id="paquetes" className="py-20 bg-gray-50">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-romina-navy mb-4">Elige tu Paquete</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Planes flexibles diseñados para mejorar tu rendimiento en cada sesión.
                        Todos los paquetes incluyen el equipamiento necesario.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.name}
                            className={`relative rounded-2xl p-8 bg-white border ${pkg.popular ? 'border-romina-green ring-4 ring-romina-green/20' : 'border-gray-200'} shadow-lg flex flex-col`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-romina-green text-romina-navy font-bold px-4 py-1 rounded-full text-sm">
                                    Más Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{pkg.classes}</p>
                                <div className="mt-6 flex items-baseline">
                                    <span className="text-4xl font-extrabold text-romina-navy">S/{pkg.price}</span>
                                    <span className="ml-1 text-gray-500">/mes</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {features.map((feature) => (
                                    <li key={feature} className="flex items-center text-gray-600">
                                        <Check className="h-5 w-5 text-romina-green mr-3 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button className={`w-full font-bold text-lg py-6 ${pkg.popular ? 'bg-romina-green text-romina-navy hover:bg-romina-green/90' : 'bg-romina-navy text-white hover:bg-romina-navy/90'}`}>
                                Elegir {pkg.hours}
                            </Button>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
