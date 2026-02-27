import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { eventService } from "@/services/firebase";
import { TennisEvent } from "@/types";

export default async function NewsPage() {
    const allEventsData = await eventService.getAll() as TennisEvent[];
    // Sort descending by event date or published date
    const allNews = allEventsData.sort((a, b) =>
        new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
    );

    return (
        <div className="py-20 bg-gray-50 min-h-screen">
            <Container>
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-romina-navy mb-4">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Volver al Inicio
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-romina-navy">Eventos y Torneos</h1>
                    <p className="text-gray-600 mt-2 text-lg">Entérate de todo lo que sucede en RominaCutipaAcademy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allNews.map((item) => (
                        <Link href={`/noticias/${item.id}`} key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-pointer">
                            <div className="aspect-video bg-gray-200 overflow-hidden relative">
                                {item.image ? (
                                    <div
                                        className="absolute inset-0 bg- cover bg-center group-hover:scale-105 transition-transform duration-500"
                                        style={{ backgroundImage: `url(${item.image})` }}
                                    ></div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-gray-100 group-hover:bg-gray-200 transition-colors">
                                        Sin imagen
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-romina-green bg-romina-navy/5 px-2 py-1 rounded-full uppercase tracking-wider">
                                        {item.tags && item.tags.length > 0 ? item.tags[0] : 'Evento'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.eventDate || item.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-romina-navy mb-2 group-hover:text-romina-green transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                                    {item.description}
                                </p>
                                <Button asChild variant="link" className="p-0 h-auto text-romina-navy font-bold hover:text-romina-green self-start">
                                    <span>Leer más &rarr;</span>
                                </Button>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </div>
    );
}
