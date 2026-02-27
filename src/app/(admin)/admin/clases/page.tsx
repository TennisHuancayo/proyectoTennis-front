"use client";

import { useEffect, useState } from "react";
import { classService, studentService, attendanceService, settingsService } from "@/services/firebase";
import { ClassGroup, Student, Attendance, GlobalConfig } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, X, Users as UsersIcon, CheckSquare } from "lucide-react";

export default function ClassesPage() {
    const [classes, setClasses] = useState<ClassGroup[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        description: "",
        maxStudents: ""
    });
    const [formLoading, setFormLoading] = useState(false);

    const [isManageOpen, setIsManageOpen] = useState(false);
    const [manageClass, setManageClass] = useState<ClassGroup | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [manageLoading, setManageLoading] = useState(false);

    // Attendance state
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [attendanceClass, setAttendanceClass] = useState<ClassGroup | null>(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent' | 'justified'>>({});
    const [attendanceStep, setAttendanceStep] = useState<'form' | 'confirm'>('form');
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Global Config
    const [globalConfig, setGlobalConfig] = useState<GlobalConfig | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [classesData, studentsData, configData] = await Promise.all([
                classService.getAll(),
                studentService.getAll(),
                settingsService.getGlobalConfig()
            ]);
            setClasses(classesData);
            setStudents(studentsData);
            setGlobalConfig(configData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (cls?: ClassGroup) => {
        if (cls) {
            setEditingClass(cls);
            setFormData({
                id: cls.id || "",
                name: cls.name || "",
                description: cls.description || "",
                maxStudents: cls.maxStudents?.toString() || ""
            });
        } else {
            setEditingClass(null);
            setFormData({
                id: "",
                name: "",
                description: "",
                maxStudents: ""
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingClass(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const classPayload = {
                name: formData.name,
                description: formData.description,
                maxStudents: parseInt(formData.maxStudents, 10) || 0
            };

            if (editingClass) {
                await classService.update(editingClass.id, classPayload);
            } else {
                const customId = formData.id.trim() !== "" ? formData.id.trim() : undefined;
                await classService.create(classPayload, customId);
            }

            await loadData();
            handleCloseForm();
        } catch (error) {
            console.error("Error saving class:", error);
            alert("Error al guardar la clase.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta clase? Los alumnos asignados a esta clase se quedarán sin clase.")) {
            try {
                // Find students in this class and unassign them
                const studentsInClass = students.filter(s => s.classId === id);
                await Promise.all(studentsInClass.map(s =>
                    studentService.update(s.id, { classId: "" })
                ));

                await classService.delete(id);
                await loadData();
            } catch (error) {
                console.error("Error deleting class:", error);
                alert("Error al eliminar la clase.");
            }
        }
    };

    // Manage Students functions
    const handleOpenManage = (cls: ClassGroup) => {
        setManageClass(cls);
        // Pre-select students currently in this class
        const currentStudentIds = students.filter(s => s.classId === cls.id).map(s => s.id);
        setSelectedStudentIds(new Set(currentStudentIds));
        setIsManageOpen(true);
    };

    const handleCloseManage = () => {
        setIsManageOpen(false);
        setManageClass(null);
        setSelectedStudentIds(new Set());
    };

    const handleToggleStudent = (studentId: string) => {
        const newSelected = new Set(selectedStudentIds);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            // Check max limits
            if (manageClass && newSelected.size >= manageClass.maxStudents) {
                alert(`No puedes agregar más alumnos. El límite de la clase es ${manageClass.maxStudents}.`);
                return;
            }
            newSelected.add(studentId);
        }
        setSelectedStudentIds(newSelected);
    };

    const handleSaveManage = async () => {
        if (!manageClass) return;
        setManageLoading(true);

        try {
            const originalStudentIds = new Set(students.filter(s => s.classId === manageClass.id).map(s => s.id));

            const updates = [];

            // Find students to ADD to the class
            for (const id of Array.from(selectedStudentIds)) {
                if (!originalStudentIds.has(id)) {
                    updates.push(studentService.update(id, { classId: manageClass.id }));
                }
            }

            // Find students to REMOVE from the class
            for (const id of Array.from(originalStudentIds)) {
                if (!selectedStudentIds.has(id)) {
                    updates.push(studentService.update(id, { classId: "" })); // unassign
                }
            }

            await Promise.all(updates);
            await loadData();
            handleCloseManage();
        } catch (error) {
            console.error("Error managing students:", error);
            alert("Error al actualizar los alumnos de la clase.");
        } finally {
            setManageLoading(false);
        }
    };

    // Attendance functions
    const handleOpenAttendance = (cls: ClassGroup) => {
        setAttendanceClass(cls);
        const enrolled = students.filter(s => s.classId === cls.id);
        const initialRecords: Record<string, 'present' | 'absent' | 'justified'> = {};
        enrolled.forEach(s => {
            initialRecords[s.id] = 'present'; // Default
        });
        setAttendanceRecords(initialRecords);
        setAttendanceDate(new Date().toISOString().split('T')[0]);
        setAttendanceStep('form');
        setIsAttendanceOpen(true);
    };

    const handleCloseAttendance = () => {
        setIsAttendanceOpen(false);
        setAttendanceClass(null);
        setAttendanceStep('form');
    };

    const handleSaveAttendance = async () => {
        if (!attendanceClass) return;
        setAttendanceLoading(true);

        try {
            const recordsToSave: Omit<Attendance, 'id'>[] = Object.keys(attendanceRecords).map(studentId => ({
                studentId,
                classId: attendanceClass.id,
                date: new Date(attendanceDate).toISOString(),
                status: attendanceRecords[studentId]
            }));

            const hoursToDeduct = globalConfig?.classHourValue || 1.5;
            await attendanceService.saveBatch(recordsToSave, hoursToDeduct);

            // Reload to update student classesRemaining instantly
            await loadData();
            handleCloseAttendance();
            alert("Asistencia registrada exitosamente. Se han actualizado los saldos de horas.");
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert("Hubo un error al registrar la asistencia.");
        } finally {
            setAttendanceLoading(false);
        }
    };

    const filteredClasses = classes.filter(c =>
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-romina-navy">Gestión de Clases (Grupos)</h1>
                <Button
                    className="bg-romina-green text-romina-navy font-bold hover:bg-romina-green/90 transition-colors"
                    onClick={() => handleOpenForm()}
                >
                    <Plus className="mr-2 h-4 w-4" /> Nueva Clase
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <Search className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar clase por ID o nombre..."
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
                            <th className="text-center p-4 font-semibold text-gray-600">Ocupación / Cupo</th>
                            <th className="text-right p-4 font-semibold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Cargando clases...</td></tr>
                        ) : filteredClasses.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No se encontraron clases.</td></tr>
                        ) : (
                            filteredClasses.map((cls) => {
                                const enrolledCount = students.filter(s => s.classId === cls.id).length;
                                const isFull = enrolledCount >= cls.maxStudents;

                                return (
                                    <tr key={cls.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-500 font-mono text-xs">{cls.id}</td>
                                        <td className="p-4 text-gray-900 font-medium">
                                            {cls.name}
                                            {cls.description && <p className="text-xs text-gray-500 font-normal mt-0.5">{cls.description}</p>}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {enrolledCount} / {cls.maxStudents}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-green-700 border-green-700 hover:bg-green-700 hover:text-white px-3"
                                                onClick={() => handleOpenAttendance(cls)}
                                            >
                                                <CheckSquare className="h-4 w-4 mr-1" />
                                                Pasar Asistencia
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-romina-navy border-romina-navy hover:bg-romina-navy hover:text-white px-3"
                                                onClick={() => handleOpenManage(cls)}
                                            >
                                                <UsersIcon className="h-4 w-4 mr-1" />
                                                Alumnos
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2"
                                                onClick={() => handleOpenForm(cls)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2"
                                                onClick={() => handleDelete(cls.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Formulario CRUD */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
                            <h2 className="text-xl font-bold text-romina-navy">
                                {editingClass ? "Editar Clase" : "Nueva Clase"}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={handleCloseForm} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </Button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">ID Personalizado {editingClass && '(No editable)'}</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800 bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        placeholder="Ej. CLA-001 (Opcional)"
                                        disabled={!!editingClass}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Déjalo en blanco para auto-generar.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Límite de Cupos *</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                        value={formData.maxStudents}
                                        onChange={e => setFormData({ ...formData, maxStudents: e.target.value })}
                                        placeholder="Ej. 10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Nombre de la Clase *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Grupo Infantil (Tarde)"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Descripción (Horarios u otros) Opcional</label>
                                <textarea
                                    className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800 min-h-[80px] resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Lunes y Miércoles 4:00 PM"
                                />
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={formLoading} className="px-6 text-gray-600">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={formLoading} className="bg-romina-navy text-white hover:bg-romina-navy/90 px-6 font-semibold shadow-md">
                                    {formLoading ? "Guardando..." : "Guardar Clase"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Administrar Alumnos en la Clase */}
            {isManageOpen && manageClass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseManage} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-romina-navy">Alumnos: {manageClass.name}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Cupos ocupados: <span className="font-bold text-romina-navy">{selectedStudentIds.size}</span> / {manageClass.maxStudents}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleCloseManage} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </Button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            {students.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No hay alumnos registrados en el sistema.</p>
                            ) : (
                                <div className="space-y-2">
                                    {students.map(student => {
                                        const isSelected = selectedStudentIds.has(student.id);
                                        const isInAnotherClass = student.classId && student.classId !== manageClass.id;
                                        const otherClassName = isInAnotherClass ? classes.find(c => c.id === student.classId)?.name || 'Otra clase' : null;

                                        return (
                                            <div
                                                key={student.id}
                                                className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer select-none ${isSelected
                                                    ? 'border-romina-navy bg-blue-50/50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleToggleStudent(student.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => { }} // handled by div click
                                                    className="w-5 h-5 text-romina-navy rounded border-gray-300 focus:ring-romina-navy pointer-events-none mr-4"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{student.name} {student.last_name}</p>
                                                    <p className="text-xs text-gray-500">ID: {student.id}</p>
                                                </div>
                                                {isInAnotherClass && !isSelected && (
                                                    <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                        Actualmente en: {otherClassName}
                                                    </div>
                                                )}
                                                {isSelected && (
                                                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                                                        Asignado
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <Button type="button" variant="ghost" onClick={handleCloseManage} disabled={manageLoading} className="px-6 text-gray-600">
                                Cancelar
                            </Button>
                            <Button type="button" onClick={handleSaveManage} disabled={manageLoading} className="bg-romina-navy text-white hover:bg-romina-navy/90 px-6 font-semibold shadow-md">
                                {manageLoading ? "Guardando..." : "Guardar Asignaciones"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Asistencia */}
            {isAttendanceOpen && attendanceClass && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseAttendance} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-romina-navy">
                                    {attendanceStep === 'form' ? 'Pasar Asistencia' : 'Confirmar Asistencia'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Clase: <span className="font-semibold text-romina-navy">{attendanceClass.name}</span>
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleCloseAttendance} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </Button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {attendanceStep === 'form' ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <label className="text-sm font-semibold text-gray-700">Fecha de la clase:</label>
                                        <input
                                            type="date"
                                            value={attendanceDate}
                                            onChange={e => setAttendanceDate(e.target.value)}
                                            className="p-2 border border-gray-300 rounded outline-none focus:border-romina-navy text-sm font-medium"
                                        />
                                    </div>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="p-3 text-left w-1/3 font-semibold text-gray-700">Alumno</th>
                                                    <th className="p-3 text-center font-semibold text-gray-700">Asistió</th>
                                                    <th className="p-3 text-center font-semibold text-gray-700">No Asistió</th>
                                                    <th className="p-3 text-center font-semibold text-gray-700">Justificada</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.filter(s => s.classId === attendanceClass.id).length === 0 ? (
                                                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay alumnos en esta clase.</td></tr>
                                                ) : (
                                                    students.filter(s => s.classId === attendanceClass.id).map(student => (
                                                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                            <td className="p-3 font-medium text-gray-900">
                                                                {student.name} {student.last_name}
                                                                <span className="block text-xs text-gray-400 font-normal">Saldo actual: {student.classesRemaining || 0} hrs</span>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="radio"
                                                                    name={`att-${student.id}`}
                                                                    checked={attendanceRecords[student.id] === 'present'}
                                                                    onChange={() => setAttendanceRecords({ ...attendanceRecords, [student.id]: 'present' })}
                                                                    className="w-5 h-5 text-green-600 focus:ring-green-600"
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="radio"
                                                                    name={`att-${student.id}`}
                                                                    checked={attendanceRecords[student.id] === 'absent'}
                                                                    onChange={() => setAttendanceRecords({ ...attendanceRecords, [student.id]: 'absent' })}
                                                                    className="w-5 h-5 text-red-600 focus:ring-red-600"
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="radio"
                                                                    name={`att-${student.id}`}
                                                                    checked={attendanceRecords[student.id] === 'justified'}
                                                                    onChange={() => setAttendanceRecords({ ...attendanceRecords, [student.id]: 'justified' })}
                                                                    className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-800">
                                        <h3 className="font-bold mb-2 flex items-center">
                                            Atención: Se realizarán los siguientes cambios
                                        </h3>
                                        <p className="text-sm">
                                            Revisa el resumen antes de enviar. Al confirmar, <strong>se descontarán automáticamente 1.5 horas</strong> del saldo de los alumnos marcados como "Asistió". Los ausentes o justificados no sufrirán descuento de horas.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                                            <p className="text-3xl font-bold text-green-600">{Object.values(attendanceRecords).filter(r => r === 'present').length}</p>
                                            <p className="text-sm font-medium text-green-800 mt-1">Presentes</p>
                                        </div>
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                                            <p className="text-3xl font-bold text-red-600">{Object.values(attendanceRecords).filter(r => r === 'absent').length}</p>
                                            <p className="text-sm font-medium text-red-800 mt-1">Ausentes</p>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                                            <p className="text-3xl font-bold text-orange-600">{Object.values(attendanceRecords).filter(r => r === 'justified').length}</p>
                                            <p className="text-sm font-medium text-orange-800 mt-1">Justificados</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            {attendanceStep === 'form' ? (
                                <>
                                    <Button type="button" variant="ghost" onClick={handleCloseAttendance} className="px-6 text-gray-600">
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setAttendanceStep('confirm')}
                                        className="bg-romina-navy text-white hover:bg-romina-navy/90 px-6 font-semibold"
                                        disabled={Object.keys(attendanceRecords).length === 0}
                                    >
                                        Revisar y Continuar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button type="button" variant="ghost" onClick={() => setAttendanceStep('form')} disabled={attendanceLoading} className="px-6 text-gray-600">
                                        Volver a Editar
                                    </Button>
                                    <Button type="button" onClick={handleSaveAttendance} disabled={attendanceLoading} className="bg-green-600 text-white hover:bg-green-700 px-6 font-semibold">
                                        {attendanceLoading ? "Guardando..." : "Confirmar Envío"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
