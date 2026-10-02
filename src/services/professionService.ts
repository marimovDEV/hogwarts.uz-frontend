import api from "@/services/api";

export interface ProfessionSubject {
    subject_id: number;
    name: string;
    icon: string;
    importance: number; // 1-5
    order: number;
}

export interface ProfessionRoadmapStep {
    id: number;
    title: string;
    description: string;
    step_type: 'COURSE' | 'OLYMPIAD' | 'PRACTICE' | 'OTHER';
    step_type_display: string;
    order: number;
}

export interface Profession {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    is_active: boolean;
    order: number;
    required_subjects: ProfessionSubject[];
    roadmap_steps: ProfessionRoadmapStep[];
}

export const professionService = {
    getAll: async (): Promise<Profession[]> => {
        const response = await api.get('/professions/');
        // Handle DRF pagination (results array) or direct array
        if (response.data.results) {
            return response.data.results;
        }
        return response.data;
    },

    getById: async (id: number): Promise<Profession> => {
        const response = await api.get(`/professions/${id}/`);
        return response.data;
    }
};
