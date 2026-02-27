"use client";

import { useEffect, useState } from "react";
import { packageService } from "@/services/firebase";
import { Package } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        price: "",
        time: "",
        description: ""
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        setLoading(true);
        try {
            const data = await packageService.getAll();
            setPackages(data);
        } catch (error) {
            console.error("Error loading packages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (pkg?: Package) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData({
                id: pkg.id || "",
                name: pkg.name || "",
                price: pkg.price?.toString() || "",
                time: pkg.time?.toString() || "",
                description: pkg.description || ""
            });
        } else {
            setEditingPackage(null);
            setFormData({
                id: "",
                name: "",
                price: "",
                time: "",
                description: ""
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPackage(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const packagePayload = {
                name: formData.name,
                price: parseFloat(formData.price) || 0,
                time: parseInt(formData.time, 10) || 0,
                description: formData.description
            };

            if (editingPackage) {
                // If editing, only update the fields (can't change ID easily)
                await packageService.update(editingPackage.id, packagePayload);
            } else {
                // If creating, pass custom ID if provided
                const customId = formData.id.trim() !== "" ? formData.id.trim() : undefined;
                await packageService.create(packagePayload, customId);
            }

            await loadPackages();
            handleCloseForm();
        } catch (error) {
            console.error("Error saving package:", error);
            alert("Error al guardar el paquete.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este paquete? Todos los alumnos asignados a este paquete podrían quedar sin referencia.")) {
            try {
                await packageService.delete(id);
                await loadPackages();
            } catch (error) {
                console.error("Error deleting package:", error);
                alert("Error al eliminar el paquete.");
            }
        }
    };

    const filteredPackages = packages.filter(p =>
        (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-romina-navy">Gestión de Paquetes</h1>
                <Button
                    className="bg-romina-green text-romina-navy font-bold hover:bg-romina-green/90 transition-colors"
                    onClick={() => handleOpenForm()}
                >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Paquete
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <Search className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar paquete por ID o nombre..."
                    className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm sm:text-base">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-600">ID</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Nombre</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Precio ($)</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Tiempo (Hrs)</th>
                            <th className="text-right p-4 font-semibold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando paquetes...</td></tr>
                        ) : filteredPackages.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No se encontraron paquetes.</td></tr>
                        ) : (
                            filteredPackages.map((pkg) => (
                                <tr key={pkg.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500 font-mono text-xs">{pkg.id}</td>
                                    <td className="p-4 text-gray-900 font-medium">{pkg.name}</td>
                                    <td className="p-4 text-gray-600">${pkg.price}</td>
                                    <td className="p-4 text-gray-600">{pkg.time}h</td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 sm:px-3"
                                            onClick={() => handleOpenForm(pkg)}
                                        >
                                            <Edit className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Editar</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-1 sm:ml-2 px-2 sm:px-3"
                                            onClick={() => handleDelete(pkg.id)}
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
                            <h2 className="text-xl font-bold text-romina-navy">
                                {editingPackage ? "Editar Paquete" : "Nuevo Paquete"}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={handleCloseForm} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </Button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">ID Personalizado {editingPackage && '(No editable)'}</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800 bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        placeholder="Ej. basico-10h (Opcional)"
                                        disabled={!!editingPackage}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Déjalo en blanco para auto-generar.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Nombre *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej. Plan Intensivo"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Precio ($) *</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="Ej. 100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Tiempo (Horas) *</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        placeholder="Ej. 12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Descripción (Opcional)</label>
                                <textarea
                                    className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800 min-h-[80px] resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Este paquete incluye..."
                                />
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={formLoading} className="px-6 text-gray-600">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={formLoading} className="bg-romina-navy text-white hover:bg-romina-navy/90 px-6 font-semibold shadow-md">
                                    {formLoading ? "Guardando..." : "Guardar Paquete"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
