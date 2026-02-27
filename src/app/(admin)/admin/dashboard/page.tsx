"use client";

import { useEffect, useState } from "react";
import { studentService, packageService } from "@/services/firebase";
import { Student, Package } from "@/types";
import { Container } from "@/components/ui/container";
import { Users, DollarSign, Activity } from "lucide-react";

export default function DashboardPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [packages, setPackages] = useState<Record<string, Package>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            studentService.getAll(),
            packageService.getAll()
        ]).then(([studentsData, packagesData]) => {
            setStudents(studentsData);

            // Create a lookup map for packages
            const pkgMap: Record<string, Package> = {};
            packagesData.forEach(p => {
                pkgMap[p.id] = p;
            });
            setPackages(pkgMap);

            setLoading(false);
        });
    }, []);

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status).length;

    const estimatedRevenue = students.reduce((acc, curr) => {
        if (curr.packageId && packages[curr.packageId]) {
            return acc + packages[curr.packageId].price;
        }
        return acc;
    }, 0);

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-romina-navy">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric Card 1 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Alumnos</p>
                        <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                    </div>
                </div>

                {/* Metric Card 2 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <DollarSign className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Ingresos Estimados (Mes)</p>
                        <p className="text-2xl font-bold text-gray-900">S/ {estimatedRevenue}</p>
                    </div>
                </div>

                {/* Metric Card 3 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Activity className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Alumnos Activos</p>
                        <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Quick Actions Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
                    <h2 className="text-lg font-bold text-romina-navy mb-4">Alumnos Recientes</h2>
                    <div className="space-y-4">
                        {students.slice(0, 5).map(student => (
                            <div key={student.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">{student.name} {student.last_name}</p>
                                    <p className="text-xs text-gray-500">{student.packageId && packages[student.packageId] ? packages[student.packageId].name : 'Sin paquete'}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!student.status ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {student.status ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
