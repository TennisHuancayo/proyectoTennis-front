import { Container } from "@/components/ui/container";
import Link from "next/link";
import { eventService } from "@/services/firebase";
import { TennisEvent } from "@/types";

export async function News() {
    const allEventsData = await eventService.getAll() as TennisEvent[];
    const latestEvents = allEventsData.sort((a, b) =>
        new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
    );

    // take only the latest 3 for the landing page
    const recentNews = latestEvents.slice(0, 3);

    return (
        <section id="noticias" className="py-20 bg-white">
            <Container>
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-bold text-romina-navy">Eventos y Torneos</h2>
                    <Link href="/noticias" className="text-romina-green font-bold hover:underline">Ver todos</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentNews.map((item) => (
                        <Link key={item.id} href={`/noticias/${item.id}`} className="group cursor-pointer block">
                            <div className="aspect-video bg-gray-200 rounded-xl mb-4 overflow-hidden relative">
                                {item.image ? (
                                    <div
                                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                        style={{ backgroundImage: `url(${item.image})` }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-gray-500">
                                        Sin imagen
                                    </div>
                                )}
                            </div>
                            <span className="text-sm text-romina-green font-bold uppercase tracking-wider">
                                {item.tags && item.tags.length > 0 ? item.tags[0] : 'Evento'}
                            </span>
                            <h3 className="text-xl font-bold text-romina-navy mt-2 group-hover:text-romina-green transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-gray-500 mt-2 line-clamp-2">
                                {item.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
}
