import api from "./api";

export interface LessonProgress {
    is_video_watched: boolean;
    practice_score: number | null;
    test_score: number | null;
    is_completed: boolean;
}

export interface Practice {
    id: number;
    type: 'CODE' | 'MATH' | 'TEXT' | 'UPLOAD';
    problem_text: string;
    points: number;
}

export interface Question {
    id: number;
    text: string;
    options: string[];
    points: number;
}

export interface LessonTest {
    id: number;
    min_pass_score: number;
    max_attempts: number;
    questions: Question[];
}

export interface Lesson {
    id: number;
    title: string;
    description: string;
    video_url: string;
    youtube_id?: string;
    video_type: string;
    video_duration: number;
    pdf_url: string | null;
    order: number;
    is_free: boolean;
    progress: LessonProgress | null;
    is_locked: boolean;
    practice: Practice | null;
    test: LessonTest | null;
}

export interface Module {
    id: number;
    title: string;
    description: string;
    order: number;
    lessons: Lesson[];
}

export interface LearningState {
    enrollment: any;
    modules: Module[];
}

const learningService = {
    getLearningState: async (courseId: string | number): Promise<LearningState> => {
        const response = await api.get(`/courses/${courseId}/learning_state/`);
        return response.data;
    },

    completeVideo: async (lessonId: number, position: number) => {
        const response = await api.post(`/lessons/${lessonId}/complete_video/`, { position });
        return response.data;
    },

    submitPractice: async (lessonId: number, answer: string) => {
        const response = await api.post(`/lessons/${lessonId}/submit_practice/`, { answer });
        return response.data;
    },

    submitTest: async (lessonId: number, answers: Record<string | number, any>) => {
        const response = await api.post(`/lessons/${lessonId}/submit_test/`, { answers });
        return response.data;
    },

    setCurrentLesson: async (courseId: string | number, lessonId: number) => {
        const response = await api.post(`/courses/${courseId}/set_current_lesson/`, { lesson_id: lessonId });
        return response.data;
    },
};

export default learningService;
