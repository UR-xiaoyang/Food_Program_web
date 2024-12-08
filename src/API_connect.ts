import axios from 'axios';

let apiBaseUrl: string | undefined;

// Function to load config.json dynamically
const loadConfig = async (): Promise<void> => {
    if (!apiBaseUrl) {
        try {
            const response = await fetch('/config.json');
            const config = await response.json();
            apiBaseUrl = config.BASE_URL; // Set the BASE_URL from the config file
        } catch (error) {
            console.error('Failed to load config.json:', error);
        }
    }
};

/**
 * Retrieve a specific cookie value by name
 * @param name Cookie name
 * @returns Value of the cookie or undefined
 */
const getCookie = (name: string): string | undefined => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : undefined;
};

// Create axios instance
export const api = axios.create({
    timeout: 100000, // Timeout duration
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    async (config) => {
        if (!apiBaseUrl) {
            await loadConfig(); // Ensure config is loaded
        }
        config.baseURL = apiBaseUrl; // Set the base URL dynamically

        // Optionally set Authorization header if a token exists
        const token = getCookie('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Fetch a message stream with streaming response
 * @param endpoint API endpoint (e.g., '/user/glm')
 * @param params Query parameters
 * @returns ReadableStreamDefaultReader<Uint8Array>
 */
export const sendMessageStream = async (
    endpoint: string,
    params: Record<string, any>
): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
    if (!apiBaseUrl) {
        await loadConfig(); // Ensure config is loaded
    }

    const url = new URL(apiBaseUrl + endpoint);

    // Append query parameters
    Object.keys(params).forEach((key) => url.searchParams.append(key, String(params[key])));

    // Retrieve token from cookies
    const token = getCookie('token');

    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        // Uncomment the body if required
        // body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();

    if (!reader) {
        throw new Error('ReadableStream not supported in this browser.');
    }

    return reader;
};
