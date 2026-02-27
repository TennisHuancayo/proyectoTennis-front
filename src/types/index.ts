export type PackageType = '12h' | '18h' | '24h';

export interface Package {
    id: string;
    name: string;
    price: number;
    time: number; // in hours
    description: string;
}

export interface ClassGroup {
    id: string;
    name: string;
    description: string;
    maxStudents: number;
}

export interface Student {
    id: string;
    name: string;
    last_name: string;
    age: number;
    status: boolean;
    packageId?: string;
    classId?: string;
    classesRemaining?: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'justified';

export interface Attendance {
    id: string;
    studentId: string;
    classId: string;
    date: string; // ISO Date
    status: AttendanceStatus;
}

export interface NewsItem {
    id: string;
    title: string;
    category: string;
    excerpt: string;
    content: string;
    imageUrl?: string;
    publishedAt: string;
}

export interface TennisEvent {
    id: string;
    title: string;
    description: string;
    tags: string[];
    image?: string;
    published_at: string;
    last_modification: string;
    // Propuestos
    eventDate?: string;
    location?: string;
}

export interface AdminUser {
    id: string; // Document ID (could be the email itself for uniqueness)
    email: string;
    role?: string;
    createdAt?: string;
}

export interface GlobalConfig {
    classHourValue: number;
    whatsapp: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    termsAndConditions: string;
}
