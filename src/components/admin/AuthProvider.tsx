"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { settingsService } from "@/services/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    authError: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser?.email) {
                try {
                    // Check if this user is in the Firestore "admins" collection
                    // Bypass for the main owner account to prevent lockout
                    const isOwner = firebaseUser.email === "carlosrgchr@hotmail.com";
                    const isAllowed = isOwner || await settingsService.checkIfAdminExists(firebaseUser.email);

                    if (isAllowed) {
                        setUser(firebaseUser);
                        setAuthError(null);
                    } else {
                        // User exists in Firebase Auth but NOT in our Firestore admins collection
                        await signOut(auth);
                        setUser(null);
                        setAuthError("Tu cuenta no tiene permisos de administrador.");
                    }
                } catch (error) {
                    console.error("Error verifying admin permissions:", error);
                    await signOut(auth);
                    setUser(null);
                    setAuthError("Error al verificar permisos.");
                }
            } else {
                setUser(null);
                setAuthError(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Route Guard Logic
    useEffect(() => {
        if (!loading) {
            const isAdminRoute = pathname.startsWith('/admin');
            const isLoginRoute = pathname === '/admin/login';

            if (isAdminRoute && !isLoginRoute && !user) {
                // If user is not authenticated and trying to access an admin route (except login), redirect to login
                router.push('/admin/login');
            }
            if (isLoginRoute && user) {
                // If user is actually authenticated and trying to access the login page, redirect to dashboard
                router.push('/admin/dashboard');
            }
        }
    }, [user, loading, pathname, router]);

    const logout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    // Prevent rendering protected content while verifying authentication state to prevent flickering
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-romina-navy border-t-romina-green rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout, authError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
