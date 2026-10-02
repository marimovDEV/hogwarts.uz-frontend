// Mock Data
import { LearningState } from "./services/learningService";
import { Profession } from "./services/professionService";
import { HeroConfig, StatsConfig, Winner, FeaturedOlympiad, FeaturedCourse, Testimonial, Mentor, ProfessionCMS } from "./services/homepageService";

// --- AUTH & USERS ---
const MOCK_USER_STUDENT = {
    id: 1,
    first_name: "Demo",
    last_name: "Student",
    username: "student",
    balance: 500000,
    role: "student",
    avatar: "https://github.com/shadcn.png",
    is_superuser: false,
    language: "uz"
};

const MOCK_USER_TEACHER = {
    id: 2,
    first_name: "Demo",
    last_name: "Teacher",
    username: "teacher",
    balance: 1000000,
    role: "TEACHER",
    avatar: "https://github.com/shadcn.png",
    is_superuser: false,
    language: "ru"
};

const MOCK_USER_ADMIN = {
    id: 3,
    first_name: "Demo",
    last_name: "Admin",
    username: "admin",
    balance: 9999999,
    role: "ADMIN",
    avatar: "https://github.com/shadcn.png",
    is_superuser: true,
    language: "uz"
};

// --- CMS DATA ---

const MOCK_HERO: HeroConfig[] = [
    {
        id: 1,
        title_uz: "Hogwords Olimpiada 2024 – Ilm bilan cho‘qqilarni zabt eting",
        title_ru: "Hogwords Olympiad 2024 – Conquer peaks with knowledge",
        subtitle_uz: "Respublikadagi eng nufuzli fan olimpiadalarida ishtirok eting",
        subtitle_ru: "Participate in the most prestigious subject olympiads in the Republic",
        button_text_uz: "Olimpiadaga Qatnashish",
        button_text_ru: "Participate",
        button_link: "/olympiads",
        background_image: null,
        is_active: true
    },
    {
        id: 2,
        title_uz: "Yangi IT kurslarimiz ochildi!",
        title_ru: "New IT courses launched!",
        subtitle_uz: "Dasturlashni professionallardan o'rganing",
        subtitle_ru: "Learn programming from professionals",
        button_text_uz: "Kursni tanlash",
        button_text_ru: "Choose course",
        button_link: "/courses",
        background_image: null,
        is_active: true
    }
];

const MOCK_STATS_CONFIG: StatsConfig = {
    id: 1,
    students_count: 12500,
    olympiads_count: 45,
    courses_count: 120,
    teachers_count: 55,
    auto_calculate: false
};

const MOCK_WINNERS: Winner[] = [
    {
        id: 1,
        subject_id: 1,
        subject_name: "Matematika",
        stage: "REPUBLIC",
        student_name: "Azizov Sardor",
        region: "Toshkent sh.",
        score: 98,
        position: 1,
        image: "https://github.com/shadcn.png",
        is_featured: true
    },
    {
        id: 2,
        subject_id: 2,
        subject_name: "Fizika",
        stage: "REGION",
        student_name: "Karimova Malika",
        region: "Samarqand",
        score: 95,
        position: 2,
        image: "https://github.com/shadcn.png",
        is_featured: false
    }
];

const MOCK_UPCOMING_OLYMPIADS: FeaturedOlympiad[] = [
    {
        id: 1,
        title: "Kuzgi Matematika Olimpiadasi",
        date: "2024-10-25",
        price: 50000,
        participants_limit: 200,
        start_time: "10:00",
        is_last_chance: true
    },
    {
        id: 2,
        title: "Informatika: Algoritmlar",
        date: "2024-11-01",
        price: 0,
        participants_limit: 500,
        start_time: "14:00",
        is_last_chance: false
    }
];

const MOCK_FEATURED_COURSES: FeaturedCourse[] = [
    {
        id: 1,
        course_id: 3,
        title: "Web Dasturlash (Frontend)",
        price: 300000,
        level: "Mukammal",
        duration: "20 soat",
        thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80",
        is_featured: true,
        order: 1
    },
    {
        id: 2,
        course_id: 1,
        title: "Python Asoslari",
        price: 0,
        level: "Boshlang'ich",
        duration: "4 soat",
        thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80",
        is_featured: true,
        order: 2
    }
];

const MOCK_CMS_PROFESSIONS: ProfessionCMS[] = [
    {
        id: 1,
        name_uz: "Frontend Dasturchi",
        name_ru: "Frontend Developer",
        salary: "$400 - $2000",
        courses_count: 5,
        roadmap_link: "/professions/1",
        icon: "layout"
    },
    {
        id: 2,
        name_uz: "Backend Dasturchi",
        name_ru: "Backend Developer",
        salary: "$500 - $3000",
        courses_count: 4,
        roadmap_link: "/professions/backend",
        icon: "server"
    }
];

const MOCK_TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: "Javohir",
        profession: "Software Engineer",
        text_uz: "Bu platforma orqali men o'z karyeramni boshladim. Tavsiya qilaman!",
        text_ru: "I started my career through this platform. Highly recommended!",
        image: "https://github.com/shadcn.png",
        rating: 5,
        is_active: true,
        is_highlighted: true
    },
    {
        id: 2,
        name: "Madina",
        profession: "Student",
        text_uz: "Olimpiada savollari juda sifatli tuzilgan.",
        text_ru: "Olympiad questions are very high quality.",
        image: "https://github.com/shadcn.png",
        rating: 4,
        is_active: true,
        is_highlighted: false
    }
];

const MOCK_MENTORS: Mentor[] = [
    {
        id: 1,
        name: "Alisher Uzoqov",
        position: "Senior Python Developer",
        company: "Google",
        experience: "10 yil",
        bio_uz: "Google kompaniyasida 5 yillik tajribaga ega mutaxassis.",
        bio_ru: "Specialist with 5 years of experience at Google.",
        social_links: { telegram: "@alisher", linkedin: "linkedin.com/in/alisher" },
        image: "https://github.com/shadcn.png"
    }
];

const MOCK_GAMIFICATION_DASHBOARD = {
    streak: 5,
    xp_today: 150,
    daily_goal: 500,
    total_xp: 2450,
    level: 4,
    next_level_xp: 3000,
    rank: 12,
    total_students: 1500,
    badges: [
        { id: 1, name: "Early Bird", image: "https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=100&q=80", earned_at: "2024-01-10" },
        { id: 2, name: "Fast Learner", image: "https://images.unsplash.com/photo-1599305090598-fe179d501c27?w=100&q=80", earned_at: "2024-01-15" }
    ],
    leaderboard: [
        { id: 1, username: "student1", xp: 5000, rank: 1, avatar: null },
        { id: 2, username: "student2", xp: 4800, rank: 2, avatar: null },
        { id: 3, username: "student3", xp: 4500, rank: 3, avatar: null }
    ]
};

// --- LEGACY MOCK DATA (Courses, Olympiads, etc.) ---
const MOCK_COURSES_LEGACY = [
    // ... Same as before but kept for Course Detail pages
    {
        id: 1,
        title: "Python Asoslari",
        subject: "Informatika",
        level: "Boshlang'ich",
        lessons_count: 12,
        price: 0,
        is_enrolled: false
    },
    {
        id: 3,
        title: "Web Dasturlash (Frontend)",
        subject: "Informatika",
        level: "Mukammal",
        lessons_count: 45,
        price: 300000,
        is_enrolled: true,
        enrollment: { id: 101, progress: 35, current_lesson: 5 }
    }
];

const MOCK_OLYMPIADS_LEGACY = [
    {
        id: 1,
        title: "Kuzgi Matematika Olimpiadasi",
        status: "UPCOMING",
        participants_count: 120
    }
];

const MOCK_LEARNING_STATE: LearningState = {
    enrollment: { id: 101, progress: 10, current_lesson: 1, updated_at: new Date().toISOString() },
    modules: [{
        id: 1, title: "Kirish", description: "Kursga kirish", order: 1,
        lessons: [{ id: 1, title: "Kurs haqida", description: "Intro", video_url: "", video_type: "youtube", video_duration: 300, pdf_url: null, order: 1, is_free: true, is_locked: false, progress: { is_video_watched: true, is_completed: true, practice_score: null, test_score: null }, practice: null, test: null }]
    }]
};

// Override window.fetch
const originalFetch = window.fetch;

console.log("🛠️ MOCK API INITIALIZED - CMS Enabled");

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    console.log(`📡 MockAPI: ${method} ${url}`);

    const jsonResponse = (data: any, status = 200) => {
        return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
    };

    await new Promise(r => setTimeout(r, 300));

    try {
        // --- CMS ENDPOINTS ---
        if (url.includes('/api/homepage/hero/')) return jsonResponse(MOCK_HERO);
        if (url.includes('/api/homepage/stats/')) return jsonResponse(MOCK_STATS_CONFIG);
        if (url.includes('/api/homepage/winners/')) return jsonResponse(MOCK_WINNERS);
        if (url.includes('/api/homepage/upcoming-olympiads/')) return jsonResponse(MOCK_UPCOMING_OLYMPIADS);
        if (url.includes('/api/homepage/featured-courses/')) return jsonResponse(MOCK_FEATURED_COURSES);
        if (url.includes('/api/homepage/professions/')) return jsonResponse(MOCK_CMS_PROFESSIONS);
        if (url.includes('/api/homepage/testimonials/')) return jsonResponse(MOCK_TESTIMONIALS);
        if (url.includes('/api/homepage/mentors/')) return jsonResponse(MOCK_MENTORS);
        if (url.includes('/api/gamification/dashboard/')) return jsonResponse(MOCK_GAMIFICATION_DASHBOARD);
        if (url.includes('/api/notifications/unread_count/')) return jsonResponse({ count: 3 });

        // --- AUTH ---
        if (url.includes('/api/auth/login/')) {
            const body = init?.body ? JSON.parse(init.body as string) : {};
            let user = MOCK_USER_STUDENT;
            if (body.phone) user = MOCK_USER_TEACHER;
            else if (body.username && body.username.includes('admin')) user = MOCK_USER_ADMIN;
            return jsonResponse({ success: true, token: "mock-jwt", user });
        }
        if (url.includes('/api/auth/me/') || url.includes('/api/auth/profile/')) return jsonResponse(MOCK_USER_STUDENT);

        // --- COURSES & LEARNING ---
        if (url.includes('/learning_state/')) return jsonResponse(MOCK_LEARNING_STATE);
        if (url.includes('/api/courses/') && !url.includes('featured')) {
            if (method === 'GET') {
                // return list or detail
                const idMatch = url.match(/\/courses\/(\d+)\/$/);
                if (idMatch) return jsonResponse(MOCK_COURSES_LEGACY.find(c => c.id == parseInt(idMatch[1])) || { detail: "Not found" }, idMatch ? 200 : 404);
                return jsonResponse({ results: MOCK_COURSES_LEGACY });
            }
        }

        // Fallback
        if (!url.includes('/api/')) return originalFetch(input, init);

        console.warn(`⚠️ Unhandled Mock: ${url}`);
        return jsonResponse({ detail: "Mock endpoint not found" }, 404);

    } catch (e) {
        console.error("Mock Error", e);
        return jsonResponse({ detail: "Error" }, 500);
    }
};

import api from './services/api';
api.defaults.adapter = async (config) => {
    const url = config.baseURL ? config.baseURL + config.url : config.url;
    const init: RequestInit = {
        method: config.method?.toUpperCase(),
        headers: config.headers as any,
        body: config.data,
    };
    const response = await window.fetch(url!, init);
    const data = await response.json().catch(() => ({}));
    return { data, status: response.status, statusText: response.statusText, headers: Object.fromEntries(response.headers.entries()), config, request: {} };
};
