import api from "./api";

type ProfilePayload = Record<string, unknown>;

const authService = {
    getMe: async () => {
        const response = await api.get("/auth/me/");
        return response.data.user;
    },
    updateProfile: async (data: ProfilePayload) => {
        const response = await api.patch("/auth/profile/", data);
        return response.data;
    },
    changePassword: async (data: ProfilePayload) => {
        const response = await api.post("/auth/change-password/", data);
        return response.data;
    }
};

export default authService;
