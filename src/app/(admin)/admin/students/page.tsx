"use client";

import { useEffect, useState, useRef } from "react";
import { studentService, packageService, classService } from "@/services/firebase";
import { Student, Package, ClassGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, X, CheckCircle2, XCircle, Upload } from "lucide-react";
import Papa from "papaparse";

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [availablePackages, setAvailablePackages] = useState<Package[]>([]);
    const [availableClasses, setAvailableClasses] = useState<ClassGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        last_name: "",
        age: "",
        status: true,
        packageId: "",
        classId: ""
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [studentsData, packagesData, classesData] = await Promise.all([
                studentService.getAll(),
                packageService.getAll(),
                classService.getAll()
            ]);
            setStudents(studentsData);
            setAvailablePackages(packagesData);
            setAvailableClasses(classesData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const newStudents: (Omit<Student, 'id'> & { id?: string })[] = results.data.map((row: any) => {
                        // Support multiple column names
                        const id = row.id || row.ID || row.identificador || undefined;
                        const name = row.name || row.Nombre || row.nombre || "";
                        const last_name = row.last_name || row.Apellido || row.apellido || "";
                        const ageStr = row.age || row.Edad || row.edad || "0";
                        const statusStr = (row.status || row.Estado || row.estado || "").toLowerCase();

                        const status = ["activo", "true", "sí", "si", "yes", "1"].includes(statusStr);

                        return {
                            ...(id ? { id: id.toString() } : {}),
                            name,
                            last_name,
                            age: parseInt(ageStr, 10) || 0,
                            status
                        };
                    }).filter(s => s.name || s.last_name); // Keep only valid rows

                    if (newStudents.length > 0) {
                        await studentService.createBatch(newStudents);
                        alert(`Se han importado ${newStudents.length} alumnos correctamente.`);
                        await loadData();
                    } else {
                        alert("No se encontraron alumnos válidos en el archivo.");
                    }
                } catch (error) {
                    console.error("Error importing students:", error);
                    alert("Ocurrió un error al importar los alumnos.");
                } finally {
                    setIsUploading(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                alert("Ocurrió un error al leer el archivo CSV.");
                setIsUploading(false);
            }
        });
    };

    const handleOpenForm = (student?: Student) => {
        if (student) {
            setEditingStudent(student);
            setFormData({
                id: student.id || "",
                name: student.name || "",
                last_name: student.last_name || "",
                age: student.age ? student.age.toString() : "",
                status: student.status ?? true,
                packageId: student.packageId || "",
                classId: student.classId || ""
            });
        } else {
            setEditingStudent(null);
            setFormData({
                id: "",
                name: "",
                last_name: "",
                age: "",
                status: true,
                packageId: "",
                classId: ""
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingStudent(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const studentPayload = {
                name: formData.name,
                last_name: formData.last_name,
                age: parseInt(formData.age, 10) || 0,
                status: formData.status,
                ...(formData.packageId ? { packageId: formData.packageId } : { packageId: "" }),
                ...(formData.classId ? { classId: formData.classId } : { classId: "" })
            };

            // If creating a new student and a package is selected, initialize classesRemaining
            let initialClassesRemaining = 0;
            if (!editingStudent && formData.packageId) {
                const pkg = availablePackages.find(p => p.id === formData.packageId);
                if (pkg) {
                    initialClassesRemaining = pkg.time;
                }
            }
            if (!editingStudent) {
                (studentPayload as any).classesRemaining = initialClassesRemaining;
            }

            if (editingStudent) {
                await studentService.update(editingStudent.id, studentPayload);
            } else {
                const customId = formData.id.trim() !== "" ? formData.id.trim() : undefined;
                await studentService.create(studentPayload, customId);
            }

            await loadData();
            handleCloseForm();
        } catch (error) {
            console.error("Error saving student:", error);
            alert("Error al guardar el alumno.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este alumno?")) {
            try {
                await studentService.delete(id);
                await loadData();
            } catch (error) {
                console.error("Error deleting student:", error);
                alert("Error al eliminar el alumno.");
            }
        }
    };

    const filteredStudents = students.filter(s =>
        (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.last_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-romina-navy">Gestión de Alumnos</h1>
                <div className="flex gap-3">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        className="text-romina-navy border-gray-300 font-semibold"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? "Importando..." : <><Upload className="mr-2 h-4 w-4" /> Importar CSV</>}
                    </Button>
                    <Button
                        className="bg-romina-green text-romina-navy font-bold hover:bg-romina-green/90 transition-colors"
                        onClick={() => handleOpenForm()}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Alumno
                    </Button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <Search className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar alumno por nombre o apellido..."
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
                            <th className="text-left p-4 font-semibold text-gray-600">Nombre Completo</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Paquete</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Clase</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Estado de Pago</th>
                            <th className="text-right p-4 font-semibold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando alumnos...</td></tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No se encontraron alumnos.</td></tr>
                        ) : (
                            filteredStudents.map((student) => {
                                const packageDetails = availablePackages.find(p => p.id === student.packageId);
                                const classDetails = availableClasses.find(c => c.id === student.classId);
                                return (
                                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-500 font-mono text-xs">{student.id}</td>
                                        <td className="p-4 text-gray-900 font-medium h-16">{student.name} {student.last_name}</td>
                                        <td className="p-4 text-gray-600 h-16">{packageDetails ? packageDetails.name : 'Sin paquete'}</td>
                                        <td className="p-4 text-gray-600 h-16">{classDetails ? classDetails.name : 'Sin clase'}</td>
                                        <td className="p-4 h-16">
                                            {student.status ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircle className="w-3.5 h-3.5 mr-1" /> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap h-16">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 sm:px-3"
                                                onClick={() => handleOpenForm(student)}
                                            >
                                                <Edit className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Editar</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-1 sm:ml-2 px-2 sm:px-3"
                                                onClick={() => handleDelete(student.id)}
                                            >
                                                <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Eliminar</span>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
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
                                {editingStudent ? "Editar Alumno" : "Nuevo Alumno"}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={handleCloseForm} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                                <X className="h-5 w-5 text-gray-500" />
                            </Button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">ID Personalizado {editingStudent && '(No editable)'}</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800 bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        placeholder="Ej. ALU-001 (Opcional)"
                                        disabled={!!editingStudent}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Nombre *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej. Juan"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Apellido *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        placeholder="Ej. Pérez"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Edad *</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        max="100"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                        placeholder="Ej. 18"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Paquete de Clases</label>
                                    <select
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                        value={formData.packageId}
                                        onChange={e => setFormData({ ...formData, packageId: e.target.value })}
                                    >
                                        <option value="">Ninguno</option>
                                        {availablePackages.map(pkg => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.name} (${pkg.price})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Clase (Grupo)</label>
                                    <select
                                        className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-romina-navy focus:ring-1 focus:ring-romina-navy transition-all text-gray-800"
                                        value={formData.classId}
                                        onChange={e => setFormData({ ...formData, classId: e.target.value })}
                                    >
                                        <option value="">Ninguna</option>
                                        {availableClasses.map(cls => {
                                            const enrolled = students.filter(s => s.classId === cls.id && s.id !== editingStudent?.id).length;
                                            const isFull = enrolled >= cls.maxStudents;
                                            return (
                                                <option key={cls.id} value={cls.id} disabled={isFull}>
                                                    {cls.name} {isFull ? '(Lleno)' : `(${enrolled}/${cls.maxStudents})`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2 flex flex-col justify-center">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Estado de Pago</label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.checked })}
                                        />
                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-romina-navy/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-romina-navy"></div>
                                        <span className="ms-3 text-sm font-medium text-gray-700">
                                            {formData.status ? 'Pagando Activo' : 'Inactivo / Deuda'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={formLoading} className="px-6 text-gray-600">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={formLoading} className="bg-romina-navy text-white hover:bg-romina-navy/90 px-6 font-semibold shadow-md">
                                    {formLoading ? "Guardando..." : "Guardar Alumno"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
