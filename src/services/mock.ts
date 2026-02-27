import { Student, Attendance, Package, PackageType, NewsItem } from "@/types";

// Mock Data
export const PACKAGES: Record<string, Package> = {
    '12h': { id: '12h', name: 'Paquete Básico (12h)', time: 12, price: 350, description: "" },
    '18h': { id: '18h', name: 'Paquete Intermedio (18h)', time: 18, price: 500, description: "" },
    '24h': { id: '24h', name: 'Paquete Avanzado (24h)', time: 24, price: 625, description: "" },
};

let students: Student[] = [
    {
        id: '1',
        name: 'Juan',
        last_name: 'Perez',
        age: 12,
        packageId: '12h',
        status: true,
    },
    {
        id: '2',
        name: 'Maria',
        last_name: 'Gomez',
        age: 15,
        packageId: '18h',
        status: true,
    },
];

let attendanceRecords: Attendance[] = [];

let newsItems: NewsItem[] = [
    {
        id: '1', // Or string literal 'gran-torneo-apertura-2026'
        category: "Torneos",
        title: 'Gran Torneo Apertura 2026: Inscripciones Abiertas',
        excerpt: 'Prepárate para demostrar tu nivel en nuestro primer torneo del año. Premios en efectivo y trofeos para todas las categorías.',
        content: `
            <p>¡El momento ha llegado! El <strong>Gran Torneo Apertura 2026</strong> abre oficialmente sus inscripciones, invitando a todos los entusiastas del tenis a participar en uno de los eventos más esperados de la temporada.</p>
            <p>Este año, el torneo promete ser más grande y emocionante que nunca, con múltiples categorías para asegurar que jugadores de todos los niveles puedan competir y disfrutar de una experiencia inolvidable. Desde principiantes hasta avanzados, todos tienen un lugar en nuestras canchas.</p>
            <h3>Detalles del Torneo</h3>
            <ul>
                <li><strong>Fecha de inicio:</strong> 15 de Marzo, 2026</li>
                <li><strong>Categorías:</strong> Infantil, Juvenil, Adultos (Amateur y Avanzado)</li>
                <li><strong>Premios:</strong> Trofeos, artículos deportivos y premios en efectivo para las categorías principales.</li>
            </ul>
            <p>No pierdas la oportunidad de medirte contra los mejores, mejorar tu nivel y vivir la verdadera pasión del tenis. ¡Las plazas son limitadas!</p>
        `,
        publishedAt: '2026-02-18T10:00:00.000Z',
        imageUrl: '/images/news/torneo.png'
    },
    {
        id: '2',
        category: "Clases",
        title: "Nuevos horarios de verano para niños",
        excerpt: "Ampliamos nuestros horarios para las vacaciones escolares. ¡Inscribe a tus hijos en el mejor programa de tenis!",
        content: `
            <p>Las vacaciones escolares ya están aquí, y en <strong>RominaCutipaAcademy</strong> queremos que los más pequeños aprovechen su tiempo libre de la mejor manera: ¡jugando tenis!</p>
            <p>Anunciamos la apertura de nuestros <strong>nuevos horarios de verano para niños</strong>, diseñados específicamente para adaptarse a la disponibilidad de las familias durante esta temporada. Nuestro programa no solo se enfoca en enseñar las técnicas fundamentales del tenis, sino también en fomentar valores como la disciplina, el compañerismo y el amor por el deporte.</p>
            <h3>Horarios Disponibles</h3>
            <ul>
                <li><strong>Turno Mañana:</strong> Martes y Jueves, 09:00 AM - 11:00 AM</li>
                <li><strong>Turno Tarde:</strong> Lunes, Miércoles y Viernes, 04:00 PM - 06:00 PM</li>
            </ul>
            <p>Asegura un verano activo y divertido para tus hijos. ¡Te esperamos en la cancha!</p>
        `,
        publishedAt: '2026-02-15T14:30:00.000Z',
        imageUrl: "/images/news/kids.png"
    },
    {
        id: '3',
        category: "Academia",
        title: "Romina Cutipa recibe reconocimiento nacional",
        excerpt: "Nuestra directora fue galardonada por su trayectoria y aporte al tenis nacional en la última ceremonia de la federación.",
        content: `
            <p>Nos llena de inmenso orgullo anunciar que nuestra fundadora y directora, <strong>Romina Cutipa</strong>, ha sido galardonada con un importante reconocimiento a nivel nacional por la Federación de Tenis.</p>
            <p>Este premio destaca su inalcanzable trayectoria, su dedicación incondicional a la enseñanza y su valioso aporte al crecimiento del tenis en el país. A lo largo de los años, Romina ha formado a cientos de jóvenes talentos, guiándolos no solo como deportistas, sino como personas íntegras.</p>
            <p>"Este reconocimiento no es solo mío, es de cada uno de los estudiantes, entrenadores y familias que forman parte de la academia. Seguiremos trabajando con la misma pasión de siempre", expresó Romina durante la ceremonia.</p>
            <p>¡Felicidades, Romina, por este merecido logro!</p>
        `,
        publishedAt: '2026-02-10T18:15:00.000Z',
        imageUrl: "/images/news/award.png"
    },
    {
        id: '4',
        category: "Tips",
        title: "Mejora tu saque con estos 5 consejos",
        excerpt: "Descubre los secretos técnicos para potenciar tu servicio y ganar más puntos gratis en tus partidos.",
        content: `
            <p>El saque es uno de los golpes más importantes en el tenis y, a menudo, el más difícil de dominar. Un buen servicio puede darte la ventaja inmediata en cualquier punto. Aquí te dejamos <strong>5 consejos fundamentales</strong> para mejorar tu saque:</p>
            <ol>
                <li><strong>Lanzamiento constante (Toss):</strong> La clave de un buen saque está en el lanzamiento de la pelota. Practica lanzarla siempre a la misma altura y ligeramente adelante de ti.</li>
                <li><strong>Flexión de rodillas:</strong> Utiliza el poder de tus piernas. Flexionar las rodillas te permitirá generar más impulso y potencia hacia arriba.</li>
                <li><strong>Empuñadura continental:</strong> Asegúrate de usar la empuñadura correcta. La empuñadura continental (como agarrar un martillo) te dará más versatilidad para aplicar distintos tipos de efecto (plano, slice o kick).</li>
                <li><strong>Impacto en el punto más alto:</strong> Intenta golpear la pelota con el brazo completamente extendido para maximizar la fuerza y el ángulo sobre la red.</li>
                <li><strong>Aceleración de la muñeca (Pronación):</strong> Un movimiento rápido y fluido de la muñeca justo al momento del impacto añadirá la velocidad extra que necesitas.</li>
            </ol>
            <p>Recuerda, la práctica hace al maestro. Pide a uno de nuestros entrenadores que revise tu técnica en tu próxima clase.</p>
        `,
        publishedAt: '2026-02-05T09:00:00.000Z',
        imageUrl: "/images/news/serve.png"
    }
];

// Services
export const studentService = {
    getAll: async (): Promise<Student[]> => {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...students];
    },

    create: async (data: Omit<Student, 'id'>): Promise<Student> => {
        const newStudent: Student = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            status: true,
        };
        students.push(newStudent);
        return newStudent;
    },

    update: async (id: string, data: Partial<Student>): Promise<Student | null> => {
        const start = students.findIndex(s => s.id === id);
        if (start === -1) return null;
        students[start] = { ...students[start], ...data };
        return students[start];
    },

    delete: async (id: string): Promise<boolean> => {
        students = students.filter(s => s.id !== id);
        return true;
    }
};

export const attendanceService = {
    markAttendance: async (studentId: string, status: 'present' | 'absent' | 'justified'): Promise<Attendance> => {
        const record: Attendance = {
            id: Math.random().toString(36).substr(2, 9),
            studentId,
            date: new Date().toISOString(),
            status
        };
        attendanceRecords.push(record);

        return record;
    },

    getByStudent: async (studentId: string): Promise<Attendance[]> => {
        return attendanceRecords.filter(a => a.studentId === studentId);
    }
};

export const newsService = {
    getAll: async (): Promise<NewsItem[]> => {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return [...newsItems];
    },

    getById: async (id: string): Promise<NewsItem | null> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return newsItems.find(n => n.id === id) || null;
    }
};
