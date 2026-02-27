import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDoc,
    writeBatch,
    setDoc
} from "firebase/firestore";
import { Student, Attendance, Package, ClassGroup, AdminUser, GlobalConfig } from "@/types";

export const studentService = {
    getAll: async (): Promise<Student[]> => {
        const querySnapshot = await getDocs(collection(db, "students"));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));
    },

    create: async (data: Omit<Student, 'id'>, customId?: string): Promise<Student> => {
        if (customId) {
            const docRef = doc(db, "students", customId);
            await setDoc(docRef, data);
            return { ...data, id: customId } as Student;
        } else {
            const docRef = await addDoc(collection(db, "students"), data);
            return { ...data, id: docRef.id } as Student;
        }
    },

    createBatch: async (students: (Omit<Student, 'id'> & { id?: string })[]): Promise<void> => {
        // Firestore batches can hold up to 500 operations
        const chunks = [];
        for (let i = 0; i < students.length; i += 500) {
            chunks.push(students.slice(i, i + 500));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(db);
            for (const student of chunk) {
                const { id, ...studentData } = student;
                const docRef = id ? doc(db, "students", id) : doc(collection(db, "students"));
                batch.set(docRef, studentData);
            }
            await batch.commit();
        }
    },

    update: async (id: string, data: Partial<Student>): Promise<Student | null> => {
        const studentRef = doc(db, "students", id);
        await updateDoc(studentRef, data);
        return { id, ...(data as any) } as Student;
    },

    delete: async (id: string): Promise<boolean> => {
        await deleteDoc(doc(db, "students", id));
        return true;
    }
};

export const attendanceService = {
    markAttendance: async (studentId: string, status: 'present' | 'absent' | 'justified'): Promise<Attendance> => {
        // Keep the old method for signature compatibility, though it might not be used now.
        const recordData: Omit<Attendance, 'id'> = {
            studentId,
            classId: 'legacy',
            date: new Date().toISOString(),
            status
        };

        const docRef = await addDoc(collection(db, "attendances"), recordData);
        return { ...recordData, id: docRef.id } as Attendance;
    },

    saveBatch: async (records: Omit<Attendance, 'id'>[], hoursToDeduct: number = 1.5): Promise<void> => {
        const batch = writeBatch(db);

        // Fetch students involved to get their current classesRemaining
        const studentIds = records.map(r => r.studentId);
        // Ensure unique IDs
        const uniqueStudentIds = Array.from(new Set(studentIds));

        // Read all involved students first (Transactions/Batches best practice, though simple batch works here if we do reads prior)
        const studentDocs = await Promise.all(
            uniqueStudentIds.map(id => getDoc(doc(db, "students", id)))
        );

        const studentMap = new Map<string, Student>();
        studentDocs.forEach(docSnap => {
            if (docSnap.exists()) {
                studentMap.set(docSnap.id, { ...docSnap.data(), id: docSnap.id } as Student);
            }
        });

        // Add each attendance record to batch
        for (const record of records) {
            const newDocRef = doc(collection(db, "attendances")); // auto ID
            batch.set(newDocRef, record);

            if (record.status === 'present') {
                const student = studentMap.get(record.studentId);
                if (student) {
                    const currentBalance = student.classesRemaining || 0;
                    const newBalance = Math.max(0, currentBalance - hoursToDeduct);
                    const studentRef = doc(db, "students", student.id);
                    batch.update(studentRef, { classesRemaining: newBalance });
                    // Update the local map in case the same student appears twice (unlikely in one batch, but safe)
                    student.classesRemaining = newBalance;
                }
            }
        }

        // Commit all changes atomically
        await batch.commit();
    },

    getByStudent: async (studentId: string): Promise<Attendance[]> => {
        const q = query(collection(db, "attendances"), where("studentId", "==", studentId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Attendance));
    },

    getAll: async (): Promise<Attendance[]> => {
        const querySnapshot = await getDocs(collection(db, "attendances"));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Attendance));
    }
};

export const eventService = {
    getAll: async (): Promise<any[]> => {
        const querySnapshot = await getDocs(collection(db, "events"));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    },

    getById: async (id: string): Promise<any | null> => {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { ...docSnap.data(), id: docSnap.id };
        }
        return null;
    },

    create: async (data: any, customId?: string): Promise<any> => {
        const newEventData = {
            ...data,
            published_at: new Date().toISOString(),
            last_modification: new Date().toISOString(),
        };
        if (customId) {
            const docRef = doc(db, "events", customId);
            await setDoc(docRef, newEventData);
            return { ...newEventData, id: customId };
        } else {
            const docRef = await addDoc(collection(db, "events"), newEventData);
            return { ...newEventData, id: docRef.id };
        }
    },

    update: async (id: string, data: any): Promise<any> => {
        const eventRef = doc(db, "events", id);
        const updateData = {
            ...data,
            last_modification: new Date().toISOString()
        };
        await updateDoc(eventRef, updateData);
        return { id, ...updateData };
    },

    delete: async (id: string): Promise<boolean> => {
        await deleteDoc(doc(db, "events", id));
        return true;
    }
};

export const packageService = {
    getAll: async (): Promise<Package[]> => {
        const querySnapshot = await getDocs(collection(db, "packages"));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Package));
    },

    create: async (data: Omit<Package, 'id'>, customId?: string): Promise<Package> => {
        if (customId) {
            const docRef = doc(db, "packages", customId);
            await setDoc(docRef, data);
            return { ...data, id: customId } as Package;
        } else {
            const docRef = await addDoc(collection(db, "packages"), data);
            return { ...data, id: docRef.id } as Package;
        }
    },

    update: async (id: string, data: Partial<Package>): Promise<Package | null> => {
        const packageRef = doc(db, "packages", id);
        await updateDoc(packageRef, data);
        return { id, ...(data as any) } as Package;
    },

    delete: async (id: string): Promise<boolean> => {
        await deleteDoc(doc(db, "packages", id));
        return true;
    }
};

export const classService = {
    getAll: async (): Promise<ClassGroup[]> => {
        const querySnapshot = await getDocs(collection(db, "classes"));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClassGroup));
    },

    create: async (data: Omit<ClassGroup, 'id'>, customId?: string): Promise<ClassGroup> => {
        if (customId) {
            const docRef = doc(db, "classes", customId);
            await setDoc(docRef, data);
            return { ...data, id: customId } as ClassGroup;
        } else {
            const docRef = await addDoc(collection(db, "classes"), data);
            return { ...data, id: docRef.id } as ClassGroup;
        }
    },

    update: async (id: string, data: Partial<ClassGroup>): Promise<ClassGroup | null> => {
        const classRef = doc(db, "classes", id);
        await updateDoc(classRef, data);
        return { id, ...(data as any) } as ClassGroup;
    },

    delete: async (id: string): Promise<boolean> => {
        await deleteDoc(doc(db, "classes", id));
        return true;
    }
};

export const settingsService = {
    // Admins
    getAdmins: async (): Promise<AdminUser[]> => {
        const querySnapshot = await getDocs(collection(db, "admins"));
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AdminUser));
    },

    addAdmin: async (email: string): Promise<AdminUser> => {
        // Quick check if exists
        const q = query(collection(db, "admins"), where("email", "==", email));
        const snap = await getDocs(q);
        if (!snap.empty) {
            throw new Error("El administrador ya existe");
        }

        const data = { email, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "admins"), data);
        return { id: docRef.id, ...data };
    },

    removeAdmin: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, "admins", id));
    },

    checkIfAdminExists: async (email: string): Promise<boolean> => {
        const q = query(collection(db, "admins"), where("email", "==", email));
        const snap = await getDocs(q);
        return !snap.empty;
    },

    // Global Config
    getGlobalConfig: async (): Promise<GlobalConfig> => {
        const docRef = doc(db, "settings", "global_config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as GlobalConfig;
        } else {
            // Document doesn't exist yet, return defaults
            return {
                classHourValue: 1.5,
                whatsapp: "",
                facebook: "",
                instagram: "",
                tiktok: "",
                youtube: "",
                termsAndConditions: ""
            };
        }
    },

    updateGlobalConfig: async (data: Partial<GlobalConfig>): Promise<void> => {
        const docRef = doc(db, "settings", "global_config");
        // Use setDoc with merge to create if it doesn't exist, or update if it does
        await setDoc(docRef, data, { merge: true });
    }
};
