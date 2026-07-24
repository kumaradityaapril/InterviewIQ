import axios from "axios";

let API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
if (!API_BASE.endsWith("/api") && !API_BASE.endsWith("/api/")) {
    API_BASE = API_BASE.endsWith("/") ? `${API_BASE}api` : `${API_BASE}/api`;
}
const AUTH_URL = `${API_BASE}/auth`;

export async function register({ username, email, password }) {
    try {
        const response = await axios.post(`${AUTH_URL}/register`, {
            username, email, password
        }, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.log(err);
    }
}

export async function login({ email, password }) {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, {
            email, password
        }, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.log(err);
    }
}

export async function logout() {
    try {
        const response = await axios.get(`${AUTH_URL}/logout`, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.log(err);
    }
}

export async function getMe() {
    try {
        const response = await axios.get(`${AUTH_URL}/get-me`, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.log(err);
    }
}

export async function googleLogin(token) {
    try {
        const response = await axios.post(`${AUTH_URL}/google`, { token }, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.error("Google Auth API error:", err);
        throw err;
    }
}

export async function getUserProfile() {
    try {
        const response = await axios.get(`${AUTH_URL}/profile`, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.error("getUserProfile API error:", err);
        throw err;
    }
}

export async function updateUserProfile(data) {
    try {
        const response = await axios.put(`${AUTH_URL}/profile`, data, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.error("updateUserProfile API error:", err);
        throw err;
    }
}