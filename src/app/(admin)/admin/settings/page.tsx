"use client";

import { useEffect, useState } from "react";
import { settingsService } from "@/services/firebase";
import { AdminUser, GlobalConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2, Save, Plus, ShieldCheck, Settings } from "lucide-react";

export default function SettingsPage() {
    // State for Admins
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [loadingAdmins, setLoadingAdmins] = useState(true);

    // State for Global Config
    const [config, setConfig] = useState<GlobalConfig>({
        classHourValue: 1.5,
        whatsapp: "",
        facebook: "",
        instagram: "",
        tiktok: "",
        youtube: "",
        termsAndConditions: ""
    });
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [savingConfig, setSavingConfig] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoadingAdmins(true);
        setLoadingConfig(true);
        try {
            const [adminsData, configData] = await Promise.all([
                settingsService.getAdmins(),
                settingsService.getGlobalConfig()
            ]);

            // Auto-inject the owner if list is totally empty
            if (adminsData.length === 0) {
                const initialEmail = "carlosrgchr@hotmail.com";
                await settingsService.addAdmin(initialEmail);
                adminsData.push({ id: 'temp-id', email: initialEmail });
            }

            setAdmins(adminsData);
            setConfig(configData);
        } catch (error) {
            console.error("Error loading settings data:", error);
        } finally {
            setLoadingAdmins(false);
            setLoadingConfig(false);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
            alert("Ingresa un correo válido.");
            return;
        }

        try {
            await settingsService.addAdmin(newAdminEmail.trim().toLowerCase());
            setNewAdminEmail("");
            loadData(); // refresh list
        } catch (error: any) {
            alert(error.message || "Error al añadir el administrador.");
        }
    };

    const handleRemoveAdmin = async (id: string, email: string) => {
        if (confirm(`¿Estás seguro de quitar a ${email} como administrador? Ya no podrá acceder al sistema.`)) {
            try {
                await settingsService.removeAdmin(id);
                loadData();
            } catch (error) {
                console.error(error);
                alert("Error al eliminar administrador.");
            }
        }
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingConfig(true);
        try {
            await settingsService.updateGlobalConfig({
                ...config,
                classHourValue: Number(config.classHourValue) // ensure it's a number
            });
            alert("Configuración global guardada correctamente.");
        } catch (error) {
            console.error("Error saving config:", error);
            alert("Hubo un problema al guardar la configuración.");
        } finally {
            setSavingConfig(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-romina-navy flex items-center">
                    <Settings className="mr-3 h-8 w-8" /> Configuración de la Academia
                </h1>
                <p className="text-gray-600 mt-2">
                    Gestiona los accesos al sistema y las variables globales de la plataforma.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ADMINS SECTION */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg text-green-700">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Accesos Administrativos</h2>
                            <p className="text-sm text-gray-500">Correos autorizados para iniciar sesión</p>
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <form onSubmit={handleAddAdmin} className="flex gap-2 mb-6">
                            <input
                                type="email"
                                placeholder="nuevo@correo.com"
                                className="flex-1 p-2 border border-gray-300 rounded-lg outline-none focus:border-romina-navy"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                            />
                            <Button type="submit" className="bg-romina-navy text-white hover:bg-romina-navy/90">
                                <Plus className="h-4 w-4 mr-1" /> Añadir
                            </Button>
                        </form>

                        <div className="border border-gray-100 rounded-lg overflow-hidden flex-1">
                            {loadingAdmins ? (
                                <div className="p-8 text-center text-gray-500">Cargando administradores...</div>
                            ) : admins.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No hay administradores registrados (!Peligro de bloqueo!)</div>
                            ) : (
                                <ul className="divide-y divide-gray-100 h-full max-h-80 overflow-y-auto">
                                    {admins.map(admin => (
                                        <li key={admin.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <div>
                                                <p className="font-medium text-gray-900">{admin.email}</p>
                                                <p className="text-xs text-gray-400">ID: {admin.id}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <p className="text-xs text-orange-600 mt-4 bg-orange-50 p-3 rounded border border-orange-100">
                            <strong>Advertencia:</strong> Si eliminas tu propio correo, se cerrará tu sesión inmediatamente y perderás el acceso.
                        </p>
                    </div>
                </div>

                {/* GLOBAL CONFIG SECTION */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                            <Settings className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Parámetros de la Academia</h2>
                            <p className="text-sm text-gray-500">Variables usadas en el sistema y sitio web</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveConfig} className="p-6 space-y-6">
                        {loadingConfig ? (
                            <div className="py-12 text-center text-gray-500">Cargando variables...</div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descuento de horas por Clase Asistida
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">Este es el valor que se restará del saldo de cada estudiante cuando se le marque "Asistió".</p>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-romina-navy"
                                        value={config.classHourValue}
                                        onChange={(e) => setConfig({ ...config, classHourValue: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook (URL)</label>
                                        <input
                                            type="url"
                                            placeholder="https://facebook.com/academia"
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-romina-navy text-sm"
                                            value={config.facebook}
                                            onChange={(e) => setConfig({ ...config, facebook: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram (URL)</label>
                                        <input
                                            type="url"
                                            placeholder="https://instagram.com/academia"
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-romina-navy text-sm"
                                            value={config.instagram}
                                            onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">TikTok (URL)</label>
                                        <input
                                            type="url"
                                            placeholder="https://tiktok.com/@academia"
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-romina-navy text-sm"
                                            value={config.tiktok || ""}
                                            onChange={(e) => setConfig({ ...config, tiktok: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube (URL)</label>
                                        <input
                                            type="url"
                                            placeholder="https://youtube.com/@academia"
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-romina-navy text-sm"
                                            value={config.youtube || ""}
                                            onChange={(e) => setConfig({ ...config, youtube: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp (Número sin el signo + o espacios)</label>
                                        <p className="text-xs text-gray-500 mb-2">Ejemplo para Perú: <strong>51</strong>987654321</p>
                                        <input
                                            type="text"
                                            placeholder="51..."
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-romina-navy text-sm"
                                            value={config.whatsapp}
                                            onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Términos y Condiciones / Políticas</label>
                                    <textarea
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-romina-navy text-sm"
                                        placeholder="Escribe aquí las políticas de cancelación, consideraciones del vestuario, etc."
                                        value={config.termsAndConditions}
                                        onChange={(e) => setConfig({ ...config, termsAndConditions: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={savingConfig}
                                        className="bg-romina-green text-romina-navy hover:bg-romina-green/90 font-bold px-8"
                                    >
                                        {savingConfig ? "Guardando..." : <><Save className="mr-2 h-4 w-4" /> Guardar Todos los Cambios</>}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
