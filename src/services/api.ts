import axios from "axios";

export const getBaseUrl = () => {
    return "https://api.hogwords.uz";
};

export const getImageUrl = (path: string | null | undefined, name?: string) => {
    if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&size=600&background=FACC15&color=0B0F1A`;
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
        return path;
    }

    let cleanPath = path;

    // Fix common path issues
    if (cleanPath.startsWith('.')) {
        cleanPath = cleanPath.substring(cleanPath.indexOf('/'));
    }

    // If it starts with common upload directories but NOT /media/, prepend /media/
    if ((cleanPath.startsWith('courses/') || cleanPath.startsWith('avatars/') || cleanPath.startsWith('olympiads/')) && !cleanPath.startsWith('/media/')) {
        cleanPath = '/media/' + cleanPath;
    }

    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }

    // Ensure we don't have duplicate /media/media/
    if (cleanPath.startsWith('/media/media/')) {
        cleanPath = cleanPath.substring(6);
    }

    return `${getBaseUrl()}${cleanPath}`;
};

export const API_URL = `${getBaseUrl()}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If token is invalid or expired (401/403), clear it and redirect
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Avoid infinite redirect if already on login page
            const path = window.location.pathname;
            if (path.includes('/auth/login') || path.includes('/teacher/login') || path.includes('/admin/login')) {
                return Promise.reject(error);
            }

            // Role-based redirect logic
            if (path.startsWith('/teacher/admin')) {
                window.location.href = '/admin/login';
            } else if (path.startsWith('/teacher')) {
                window.location.href = '/teacher/login';
            } else if (path.startsWith('/admin')) {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export default api;
