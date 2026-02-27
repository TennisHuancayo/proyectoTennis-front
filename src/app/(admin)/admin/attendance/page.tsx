"use client";

import { useEffect, useState } from "react";
import { studentService, attendanceService, classService } from "@/services/firebase";
import { Student, Attendance, ClassGroup } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AttendanceEnriched extends Attendance {
    studentName: string;
    className: string;
}

export default function AttendancePage() {
    const [history, setHistory] = useState<AttendanceEnriched[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const [attendancesData, studentsData, classesData] = await Promise.all([
                attendanceService.getAll(),
                studentService.getAll(),
                classService.getAll()
            ]);

            const enriched: AttendanceEnriched[] = attendancesData.map(record => {
                const student = studentsData.find(s => s.id === record.studentId);
                const cls = classesData.find(c => c.id === record.classId);

                return {
                    ...record,
                    studentName: student ? `${student.name} ${student.last_name}` : 'Alumno Desconocido',
                    className: cls ? cls.name : (record.classId === 'legacy' ? 'Sin Clase Asignada (Legacy)' : 'Clase Desconocida')
                };
            });

            // Ordenar por fecha, más recientes primero
            enriched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setHistory(enriched);
        } catch (error) {
            console.error("Error cargando el historial de asistencias:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'present': return <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full font-semibold text-xs border border-green-200">Asistió</span>;
            case 'absent': return <span className="text-red-700 bg-red-100 px-3 py-1 rounded-full font-semibold text-xs border border-red-200">Ausente</span>;
            case 'justified': return <span className="text-orange-700 bg-orange-100 px-3 py-1 rounded-full font-semibold text-xs border border-orange-200">Justificada</span>;
            default: return <span className="text-gray-700 bg-gray-100 px-3 py-1 rounded-full font-semibold text-xs whitespace-nowrap">Desconocido</span>;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-romina-navy">Historial de Asistencia</h1>
            <p className="text-gray-600">Registro histórico de todas las asistencias tomadas por clase.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm sm:text-base">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-600">Fecha</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Clase</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Alumno</th>
                            <th className="text-center p-4 font-semibold text-gray-600">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Cargando historial...</td></tr>
                        ) : history.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Aún no hay registros de asistencia.</td></tr>
                        ) : (
                            history.map((record) => (
                                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-900 font-medium">
                                        {format(new Date(record.date), "dd 'de' MMMM, yyyy", { locale: es })}
                                    </td>
                                    <td className="p-4 text-gray-700">
                                        {record.className}
                                    </td>
                                    <td className="p-4 text-gray-900">
                                        {record.studentName}
                                    </td>
                                    <td className="p-4 text-center">
                                        {getStatusStyles(record.status)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
