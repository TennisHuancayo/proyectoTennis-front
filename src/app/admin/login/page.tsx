"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { useAuth } from "@/components/admin/AuthProvider";

export default function LoginPage() {
    const router = useRouter();
    const { authError } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Si AuthProvider nos redirige aquí y manda un authError (ej. falta de permisos), mostrarlo
    useEffect(() => {
        if (authError) {
            setError(authError);
        }
    }, [authError]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin/dashboard");
        } catch (err: any) {
            console.error("Login error:", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
            } else {
                setError("Error al iniciar sesión: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-romina-navy">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-romina-navy">
                        Romina<span className="text-romina-green">Admin</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Acceso Administrativo</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                        <div className="relative">
                            <input
                                type="email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romina-green outline-none text-gray-700"
                                placeholder="admin@romina.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <input
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-romina-green outline-none text-gray-700"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button disabled={loading} className="w-full bg-romina-navy text-white hover:bg-romina-navy/90 py-6 text-lg">
                        {loading ? "Cargando..." : <><Lock className="mr-2 h-5 w-5" /> Iniciar Sesión</>}
                    </Button>
                </form>
            </div>
        </div>
    );
}
