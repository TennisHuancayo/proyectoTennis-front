"use client";

import { useEffect, useState } from "react";
import { eventService } from "@/services/firebase";
import { TennisEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { generateSlug } from "@/lib/utils";

export default function EventosPage() {
    const [eventos, setEventos] = useState<TennisEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<TennisEvent | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: "",
        image: "",
        eventDate: "",
        location: ""
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        loadEventos();
    }, []);

    const loadEventos = async () => {
        setLoading(true);
        try {
            const data = await eventService.getAll();
            // Sort by published_at or event_date descending
            const sortedData = (data as TennisEvent[]).sort((a, b) =>
                new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
            );
            setEventos(sortedData);
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (evento?: TennisEvent) => {
        if (evento) {
            setEditingEvent(evento);
            setFormData({
                title: evento.title || "",
                description: evento.description || "",
                tags: (evento.tags || []).join(", "),
                image: evento.image || "",
                eventDate: evento.eventDate || "",
                location: evento.location || ""
            });
        } else {
            setEditingEvent(null);
            setFormData({
                title: "",
                description: "",
                tags: "",
                image: "",
                eventDate: "",
                location: ""
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingEvent(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const tagsArray = formData.tags
                .split(",")
                .map(t => t.trim())
                .filter(t => t.length > 0);

            const eventPayload = {
                title: formData.title,
                description: formData.description,
                tags: tagsArray,
                image: formData.image,
                eventDate: formData.eventDate,
                location: formData.location
            };

            if (editingEvent) {
                await eventService.update(editingEvent.id, eventPayload);
            } else {
                const slug = generateSlug(eventPayload.title);
                await eventService.create(eventPayload, slug);
            }

            await loadEventos();
            handleCloseForm();
        } catch (error) {
            console.error("Error saving event:", error);
            alert("Error al guardar el evento.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
            try {
                await eventService.delete(id);
                await loadEventos();
            } catch (error) {
                console.error("Error deleting event:", error);
                alert("Error al eliminar el evento.");
            }
        }
    };

    // Filter by title or tags
    const filteredEventos = eventos.filter(e => {
        const term = searchTerm.toLowerCase();
        const inTitle = e.title?.toLowerCase().includes(term);
        const inTags = e.tags?.some(t => t.toLowerCase().includes(term));
        const inLocation = e.location?.toLowerCase().includes(term);
        return inTitle || inTags || inLocation;
    });

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-romina-navy">Gestión de Eventos</h1>
                <Button
                    className="bg-romina-green text-romina-navy font-bold hover:bg-romina-green/90 transition-colors"
                    onClick={() => handleOpenForm()}
                >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <Search className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar evento por título, ubicación o etiqueta..."
                    className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm sm:text-base">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-600 w-24 hidden sm:table-cell">Imagen</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Título</th>
                            <th className="text-left p-4 font-semibold text-gray-600 hidden md:table-cell">Fecha / Ubicación</th>
                            <th className="text-left p-4 font-semibold text-gray-600 hidden lg:table-cell">Etiquetas</th>
                            <th className="text-right p-4 font-semibold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando eventos...</td></tr>
                        ) : filteredEventos.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No se encontraron eventos.</td></tr>
                        ) : (
                            filteredEventos.map((evento) => (
                                <tr key={evento.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 hidden sm:table-cell">
                                        <div className="w-16 h-12 bg-gray-200 rounded-md overflow-hidden relative">
                                            {evento.image ? (
                                                <div
                                                    className="w-full h-full bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${evento.image})` }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                                    Sin img
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-900 font-medium">
                                        <div className="line-clamp-2">{evento.title}</div>
                                        <div className="md:hidden mt-1 text-xs text-gray-500">
                                            {evento.eventDate && <span>{new Date(evento.eventDate).toLocaleDateString()} </span>}
                                            {evento.location && <span> | {evento.location}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 hidden md:table-cell">
                                        {evento.eventDate && <div className="font-medium text-romina-navy">{new Date(evento.eventDate).toLocaleDateString()}</div>}
                                        {evento.location && <div className="text-xs text-gray-500">{evento.location}</div>}
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {(evento.tags || []).slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-romina-navy/5 text-romina-navy border border-romina-navy/10 uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                            {(evento.tags || []).length > 3 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">
                                                    +{(evento.tags || []).length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 sm:px-3"
                                            onClick={() => handleOpenForm(evento)}
                                        >
                                            <Edit className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Editar</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-1 sm:ml-2 px-2 sm:px-3"
                                            onClick={() => handleDelete(evento.id)}
                                        >
                                            <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Eliminar</span>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Formulario */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
                            <h2 className="text-xl font-bold text-romina-navy">
                                {editingEvent ? "Editar Evento" : "Nuevo Evento"}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={handleCloseForm} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </Button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Título del Evento *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-2.5 border border-gray-200 text-gray-700 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ej. Torneo de Verano 2026"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Fecha del Evento</label>
                                    <input
                                        type="date"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-700"
                                        value={formData.eventDate}
                                        onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Ubicación</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border border-gray-200 text-gray-700 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Cancha Principal / Virtual"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Descripción</label>
                                <textarea
                                    className="w-full p-2.5 border border-gray-200 text-gray-700 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all min-h-[120px] resize-y"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalles del evento..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Url de la Imagen</label>
                                    <input
                                        type="url"
                                        className="w-full p-2.5 border border-gray-200 text-gray-700 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Etiquetas</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border border-gray-200 text-gray-700 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all"
                                        value={formData.tags}
                                        onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="Torneo, Juvenil, (separadas por coma)"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={formLoading} className="px-6">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={formLoading} className="bg-romina-navy text-white hover:bg-romina-navy/90 px-6 font-semibold shadow-md">
                                    {formLoading ? "Guardando..." : "Guardar Evento"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
