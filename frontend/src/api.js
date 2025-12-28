import axios from 'axios';

// Prefer env-provided API URL; fall back to local dev
const envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL;
const API_BASE_URL = (envApiUrl || 'http://localhost:8000/api/v1').replace(/\/$/, '');

console.log('[API Config] Base URL:', API_BASE_URL);
console.log('[API Config] VITE_API_URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000, // 120 seconds timeout for URL-based AI processing (web search takes longer)
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies for Neon Auth session
});

// Note: Authentication is handled by Neon Auth
// These are just API methods for the backend

export const analyzeImage = async (imageFile, { productUrls = [] } = {}) => {
    console.log('[API] analyzeImage called with:', { hasImage: !!imageFile, urlCount: productUrls.length });
    
    // Use JSON for URL-only requests, FormData when image is present
    if (!imageFile && productUrls.length > 0) {
        // URL-only: use JSON payload
        console.log('[API] Sending URL-only request with JSON payload to:', API_BASE_URL);
        console.log('[API] Product URLs:', productUrls);
        try {
            const response = await api.post('/analyze/', {
                product_urls: productUrls
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('[API] URL-only response received:', response.status);
            return response.data;
        } catch (error) {
            console.error("[API] URL-only request error:", error);
            if (error.code === 'ECONNABORTED') {
                throw new Error('URL analysis is taking longer than expected. The AI is performing web searches and deep analysis. Please try again or use a direct product image for faster results.');
            }
            if (error.response) {
                const msg = error.response.data?.error || error.response.data?.message || 'Server error';
                throw new Error(msg);
            }
            if (error.request) {
                throw new Error('Cannot connect to server. Make sure the backend is running.');
            }
            throw error;
        }
    }
    
    // Image-based or combined: use FormData
    console.log('[API] Sending FormData request with image');
    const formData = new FormData();
    if (imageFile) {
        formData.append('image', imageFile);
    }
    if (Array.isArray(productUrls) && productUrls.length > 0) {
        formData.append('product_urls', JSON.stringify(productUrls));
    }

    try {
        const response = await api.post('/analyze/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('[API] FormData response received:', response.status);
        return response.data;
    } catch (error) {
        console.error("[API] FormData request error:", error);

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

export const demoLogin = async () => {
    try {
        const response = await api.post('/auth/demo-login/');
        return response.data;
    } catch (error) {
        console.error('[API] demoLogin error:', error);
        if (error.response) {
            const msg = error.response.data?.error || error.response.data?.message || 'Demo login failed';
            throw new Error(msg);
        }
        throw new Error('Demo login failed: cannot contact server');
    }
};

export const chatAboutProduct = async ({ message, reportContext }) => {
    try {
        const response = await api.post('/chat/', {
            message,
            report_context: reportContext,
        });
        return response.data;
    } catch (error) {
        console.error("Chat API Error:", error);
        const msg = error.response?.data?.error || error.response?.data?.message || 'Chat failed';
        throw new Error(msg);
    }
};

export default api;
