import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { eventService } from "@/services/firebase";
import { notFound } from "next/navigation";
import { TennisEvent } from "@/types";

interface NewsDetailPageProps {
    params: {
        id: string;
    }
}

// Next.js 15+ async params
export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
    const { id } = await params;
    const newsItemData = await eventService.getById(id);

    if (!newsItemData) {
        notFound();
    }

    const newsItem = newsItemData as TennisEvent;

    const formattedDate = new Date(newsItem.eventDate || newsItem.published_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <article className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="relative w-full h-[50vh] min-h-[400px] bg-romina-navy">
                {newsItem.image && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: `url(${newsItem.image})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-900/40 to-transparent" />

                <Container className="h-full relative flex items-end pb-12">
                    <div className="max-w-4xl text-white">
                        <Link href="/noticias" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white mb-6 backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Eventos
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <span className="inline-flex items-center text-sm font-bold bg-romina-green text-romina-navy px-3 py-1 rounded-full uppercase tracking-wider">
                                <Tag className="w-3 h-3 mr-1.5" />
                                {newsItem.tags && newsItem.tags.length > 0 ? newsItem.tags[0] : 'Evento'}
                            </span>
                            <span className="inline-flex items-center text-sm text-gray-200">
                                <Calendar className="w-4 h-4 mr-1.5" />
                                {formattedDate}
                            </span>
                            {newsItem.location && (
                                <span className="inline-flex items-center text-sm text-gray-200">
                                    <span className="w-4 h-4 mr-1.5 inline-block bg-current" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 50% 100%, 0% 38%)' }} />
                                    {newsItem.location}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            {newsItem.title}
                        </h1>
                    </div>
                </Container>
            </div>

            {/* Content Section */}
            <Container className="mt-[-2rem] relative z-10">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 max-w-4xl mx-auto">
                    <div className="prose prose-lg prose-blue max-w-none text-gray-700">
                        {/* the description can act as both excerpt and content */}
                        <p className="lead text-xl text-gray-500 font-medium mb-8 whitespace-pre-line">
                            {newsItem.description}
                        </p>
                    </div>
                </div>
            </Container>
        </article>
    );
}
