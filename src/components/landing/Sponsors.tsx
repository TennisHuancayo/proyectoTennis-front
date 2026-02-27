import { Container } from "@/components/ui/container";

export function Sponsors() {
    const sponsors = [
        { name: "Brand 1", logo: "B1" },
        { name: "Brand 2", logo: "B2" },
        { name: "Brand 3", logo: "B3" },
        { name: "Brand 4", logo: "B4" },
        { name: "Brand 5", logo: "B5" },
    ];

    return (
        <section className="bg-white py-10 border-y border-gray-100">
            <Container>
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                    Nuestros Aliados
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder for logos */}
                    {sponsors.map((brand, i) => (
                        <div key={i} className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-400">
                            {brand.name}
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
