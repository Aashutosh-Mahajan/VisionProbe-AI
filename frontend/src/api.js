import axios from 'axios';

// Use Vite-style var first, then CRA-style for compatibility
const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.REACT_APP_API_URL ||
    'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 seconds timeout for AI processing
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh: refreshToken
                    });
                    
                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                } catch (err) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = '/auth';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

// Auth APIs
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register/', userData);
        if (response.data.status === 'success') {
            const { user, tokens } = response.data.data;
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            localStorage.setItem('user', JSON.stringify(user));
            return response.data;
        }
        throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
        console.error("Registration Error:", error);
        throw error.response?.data || error;
    }
};

export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login/', credentials);
        if (response.data.status === 'success') {
            const { user, tokens } = response.data.data;
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            localStorage.setItem('user', JSON.stringify(user));
            return response.data;
        }
        throw new Error(response.data.message || 'Login failed');
    } catch (error) {
        console.error("Login Error:", error);
        throw error.response?.data || error;
    }
};

export const demoLogin = async () => {
    try {
        const response = await api.post('/auth/demo-login/');
        if (response.data.status === 'success') {
            const { user, tokens } = response.data.data;
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            localStorage.setItem('user', JSON.stringify(user));
            return response.data;
        }
        throw new Error(response.data.message || 'Demo login failed');
    } catch (error) {
        console.error("Demo Login Error:", error);
        throw error.response?.data || error;
    }
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};

export const getProfile = async () => {
    try {
        const response = await api.get('/auth/profile/');
        return response.data;
    } catch (error) {
        console.error("Profile Error:", error);
        throw error.response?.data || error;
    }
};

export const updateProfile = async (userData) => {
    try {
        const response = await api.put('/auth/profile/', userData);
        if (response.data.status === 'success') {
            localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        return response.data;
    } catch (error) {
        console.error("Update Profile Error:", error);
        throw error.response?.data || error;
    }
};

export const analyzeImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await api.post('/analyze/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("API Error:", error);

        // Enhanced error handling
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. The AI is taking too long to process.');
        }
        if (error.response) {
            // Server responded with error
            const msg = error.response.data?.error || error.response.data?.message || 'Server error';
            throw new Error(msg);
        }
        if (error.request) {
            // No response received
            throw new Error('Cannot connect to server. Make sure the backend is running.');
        }
        throw error;
    }
};

export const checkHealth = async () => {
    try {
        const response = await api.get('/health/');
        return response.data;
    } catch (error) {
        return { status: 'error', message: 'Backend not reachable' };
    }
};

export default api;
